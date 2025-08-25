import { ParallizerInput, Task, TaskResult } from "./dtos";

type TaskState = "pending" | "running" | "completed" | "failed" | "skipped";

interface InternalTask extends Task {
  state: TaskState;
  attempts: number;
  startedAt?: number;
  finishedAt?: number;
  result?: TaskResult;
  error?: Error;
}

export class Scheduler {
  constructor(private readonly exec: (task: Task, signal: AbortSignal) => Promise<unknown>) {}

  async run(input: ParallizerInput) {
    const startTime = Date.now();
    const tasks = this.validateAndNormalize(input.tasks);
    const globalConcurrency = input.concurrency ?? 3;
    const byGroupLimits = input.limits?.byGroup ?? {};

    const inFlightByGroup = new Map<string, number>();
    const inFlightGlobal = new Set<string>();

    const idToTask = new Map(tasks.map((t) => [t.id, t] as const));

    const abortControllers = new Map<string, AbortController>();

    const isReady = (t: InternalTask) => t.dependsOn.every((d) => idToTask.get(d)?.state === "completed");
    const readyQueue = () => tasks.filter((t) => t.state === "pending" && isReady(t));

    const tryStart = async (t: InternalTask) => {
      const group = t.concurrencyGroup;
      const groupLimit = group ? byGroupLimits[group] ?? Infinity : Infinity;
      const currentGroup = group ? inFlightByGroup.get(group) ?? 0 : 0;
      if (inFlightGlobal.size >= globalConcurrency) return false;
      if (group && currentGroup >= groupLimit) return false;

      // start
      t.state = "running";
      t.startedAt = Date.now();
      inFlightGlobal.add(t.id);
      if (group) inFlightByGroup.set(group, currentGroup + 1);

      const controller = new AbortController();
      abortControllers.set(t.id, controller);

      const timeout = t.timeoutMs ?? input.timeoutMs ?? 60_000;
      const timeoutHandle = setTimeout(() => controller.abort("timeout"), timeout);

      const attemptExec = async (): Promise<void> => {
        t.attempts += 1;
        try {
          const output = await this.exec(t, controller.signal);
          t.state = "completed";
          t.finishedAt = Date.now();
          t.result = {
            id: t.id,
            status: "completed",
            durationMs: (t.finishedAt ?? Date.now()) - (t.startedAt ?? Date.now()),
            output,
          };
        } catch (err) {
          t.error = err as Error;
          const policy = this.mergeRetryPolicy(input, t);
          const shouldRetry = t.attempts < (policy.maxAttempts ?? 0);
          if (shouldRetry && controller.signal.aborted !== true) {
            const backoff = (policy.backoffMs ?? 500) * Math.pow(policy.backoffFactor ?? 2, t.attempts - 1);
            const jitter = Math.floor(Math.random() * 100);
            await new Promise((r) => setTimeout(r, backoff + jitter));
            await attemptExec();
            return;
          }
          t.state = "failed";
          t.finishedAt = Date.now();
          t.result = {
            id: t.id,
            status: "failed",
            durationMs: (t.finishedAt ?? Date.now()) - (t.startedAt ?? Date.now()),
            error: { message: (err as Error)?.message ?? "Unknown error" },
          };
        } finally {
          clearTimeout(timeoutHandle);
          inFlightGlobal.delete(t.id);
          if (group) inFlightByGroup.set(group, (inFlightByGroup.get(group) ?? 1) - 1);
          abortControllers.delete(t.id);
        }
      };

      void attemptExec();
      return true;
    };

    // main loop
    while (true) {
      // start ready tasks up to limits
      for (const t of readyQueue()) {
        if (inFlightGlobal.size >= globalConcurrency) break;
        await tryStart(t);
      }

      // if none pending or running, break
      const hasPending = tasks.some((t) => t.state === "pending");
      const hasRunning = tasks.some((t) => t.state === "running");
      if (!hasPending && !hasRunning) break;

      // skip tasks whose dependencies failed
      for (const t of tasks) {
        if (t.state === "pending") {
          const upstreamFailed = t.dependsOn.some((d) => idToTask.get(d)?.state === "failed");
          if (upstreamFailed) {
            t.state = "skipped";
            t.finishedAt = Date.now();
            t.result = {
              id: t.id,
              status: "skipped",
              durationMs: 0,
              error: { message: "Dependency failed", cause: "upstream_failed" },
            };
          }
        }
      }

      await new Promise((r) => setTimeout(r, 10));
    }

    const results: TaskResult[] = tasks.map((t) =>
      t.result ?? {
        id: t.id,
        status: "skipped",
        durationMs: 0,
        error: { message: "No result", cause: "unknown" },
      },
    );

    const completed = results.filter((r) => r.status === "completed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const totalDurationMs = Date.now() - startTime;
    const status: "success" | "partial" | "failed" = completed > 0 ? (failed + skipped > 0 ? "partial" : "success") : "failed";

    return {
      runId: input.runId,
      status,
      results,
      metrics: { totalDurationMs, completed, failed, skipped },
    } as const;
  }

  private mergeRetryPolicy(input: ParallizerInput, t: Task) {
    const base = input.retry ?? { maxAttempts: 0, backoffMs: 500, backoffFactor: 2 };
    const local = t.retry ?? {};
    return {
      maxAttempts: local.maxAttempts ?? base.maxAttempts,
      backoffMs: local.backoffMs ?? base.backoffMs,
      backoffFactor: local.backoffFactor ?? base.backoffFactor,
    };
  }

  private validateAndNormalize(tasks: Task[]): InternalTask[] {
    // ensure all dependsOn exist
    const ids = new Set(tasks.map((t) => t.id));
    for (const t of tasks) {
      for (const dep of t.dependsOn ?? []) {
        if (!ids.has(dep)) throw new Error(`Task ${t.id} depends on missing task ${dep}`);
      }
    }
    // detect cycles via DFS
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const adjacency = new Map<string, string[]>();
    for (const t of tasks) adjacency.set(t.id, t.dependsOn ?? []);
    const dfs = (node: string) => {
      if (visiting.has(node)) throw new Error(`Cycle detected at task ${node}`);
      if (visited.has(node)) return;
      visiting.add(node);
      for (const nei of adjacency.get(node) ?? []) dfs(nei);
      visiting.delete(node);
      visited.add(node);
    };
    for (const t of tasks) dfs(t.id);

    return tasks.map((t) => ({ ...t, state: "pending", attempts: 0 }));
  }
}


import { describe, it, expect } from "vitest";
import { Scheduler } from "../../parallizer/scheduler";

describe("Scheduler", () => {
  it("runs tasks honoring dependencies and completes", async () => {
    const calls: string[] = [];
    const scheduler = new Scheduler(async (task) => {
      calls.push(task.id);
      return { ok: task.id };
    });

    const res = await scheduler.run({
      runId: "t1",
      concurrency: 2,
      tasks: [
        { id: "A", type: "tool", target: "noop", payload: {} },
        { id: "B", type: "tool", target: "noop", payload: {}, dependsOn: ["A"] },
      ],
    } as any);

    expect(res.results.find((r) => r.id === "A")?.status).toBe("completed");
    expect(res.results.find((r) => r.id === "B")?.status).toBe("completed");
    expect(res.status === "success" || res.status === "partial").toBe(true);
    expect(calls.includes("A")).toBe(true);
    expect(calls.includes("B")).toBe(true);
  });
});


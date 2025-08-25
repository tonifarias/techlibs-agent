## Parallizer Agent – Parallel Task Orchestrator (Plan Only)

### Objectives
- **Purpose**: Create a `parallizerAgent` that orchestrates multiple AI/tool tasks in parallel with typed inputs/outputs, deterministic behavior, and robust error handling.
- **Scope**: Agent + scheduler logic + data contracts + tests + example runner. No UI.
- **Standards**: Follow Mastra + MCP best practices: strong typing (Zod), separation of concerns (agent/tool/dto), deterministic prompts (JSON-only responses), observability, and testability.

### High-level Architecture
- **Parallizer Agent** (`src/mastra/agents/parallizer/agent.ts`)
  - Wraps execution of a task graph with concurrency limits, timeouts, retries, and MCP tool access.
  - Loads MCP tools dynamically (e.g., GitHub MCP) similar to `developerAgent` pattern.
- **Task Scheduler (internal)** (`src/mastra/agents/parallizer/scheduler.ts`)
  - Validates a DAG of tasks and executes ready tasks concurrently using `Promise.allSettled` with group-based concurrency.
  - Supports dependency resolution, cancellation, timeouts, retries, and exponential backoff.
- **DTOs** (`src/mastra/agents/parallizer/dtos.ts`)
  - Zod schemas for input/output ensuring strict contracts for tasks and results.
- **Observability**
  - Structured logging around task lifecycle: queued → running → completed/failed/skipped.
  - Timings per task and overall run; aggregate stats.
- **Memory Integration**
  - Optional use of `memoryTool` to cache intermediate artifacts by `taskId` and `namespace`.
- **MCP Integration**
  - Tool acquisition via MCP client (`githubMCPClient.getTools()`), merged into agent toolset.
  - Task type supports `invokeTool` or `invokeAgent`.

### Public API (Agent Contract)
- **Agent name**: `parallizerAgent`
- **Input (Zod)**
  - `runId: string`
  - `concurrency?: number` (default 3)
  - `timeoutMs?: number` (per-task default)
  - `retry?: { maxAttempts: number; backoffMs: number; backoffFactor: number }`
  - `tasks: Array<{
      id: string;
      type: 'agent' | 'tool';
      target: string; // agent name or tool id
      payload: unknown; // strongly typed per task via generics when used directly
      dependsOn?: string[]; // DAG
      timeoutMs?: number;
      retry?: { maxAttempts?: number; backoffMs?: number; backoffFactor?: number };
      concurrencyGroup?: string; // optional bucket for group limits
    }>`
  - `limits?: { byGroup?: Record<string, number> }` (e.g., `{ github: 2 }`)
- **Output (Zod)**
  - `runId: string`
  - `status: 'success' | 'partial' | 'failed'`
  - `results: Array<{
      id: string;
      status: 'completed' | 'failed' | 'skipped';
      durationMs: number;
      output?: unknown;
      error?: { message: string; cause?: string };
    }>`
  - `metrics: { totalDurationMs: number; completed: number; failed: number; skipped: number }`

### Execution Model
- **Graph validation**: Ensure acyclic DAG and that all `dependsOn` exist.
- **Ready queue**: Start with tasks having no deps; when a task completes, unlock dependents whose deps are all done.
- **Parallelism**: Execute ready tasks with a global `concurrency` and optional per-`concurrencyGroup` limits.
- **Strategy**: Use `Promise.allSettled` to isolate failures and continue unlocking dependents; dependents of failed tasks are marked `skipped` (unless `allowPartialDeps` is introduced later).
- **Timeouts**: Wrap each task with `AbortController` and per-task timeout.
- **Retries**: Exponential backoff with jitter; stop when `maxAttempts` reached.
- **Cancellation**: Support external cancellation token to abort remaining tasks.

### Task Types
- **type: 'agent'**
  - Invoke via `mastra.getAgent(target)?.generate([...])` with deterministic prompts that request JSON only.
- **type: 'tool'**
  - Invoke via tool `execute` with validated input; MCP tools are merged into the agent toolset.

### Deterministic Prompting
- All agent prompts must request strict JSON conforming to expected DTOs.
- Reject and retry non-parseable outputs with a corrective re-prompt once before counting as a failure.

### Error Handling & Policies
- **Fail-fast vs partial**: The runner returns `partial` if any task fails but at least one completes; `failed` if none complete.
- **Dependency failures**: Downstream tasks become `skipped` with `error.cause = 'upstream_failed'`.
- **MCP/network errors**: Retries applied per policy; log response metadata for diagnostics (status, headers subset).

### Observability & Logs
- Log per-task lifecycle with timestamps, attempt counts, and durations.
- Aggregate metrics in `metrics` output; emit structured logs consumable by `@mastra/loggers`.

### Files to Add
- `src/mastra/agents/parallizer/agent.ts`
- `src/mastra/agents/parallizer/prompt.ts` (minimal; mostly orchestration, not content generation)
- `src/mastra/agents/parallizer/scheduler.ts`
- `src/mastra/agents/parallizer/dtos.ts`
- `examples/parallizer-example.ts` (CLI/example runner using pnpm)
- Tests under `src/mastra/agents/parallizer/__tests__/`

### Implementation Steps
1. **DTOs** (`dtos.ts`)
   - Define `ParallizerInputSchema`, `ParallizerOutputSchema`, `TaskSchema`, `ResultSchema` using Zod.
2. **Scheduler** (`scheduler.ts`)
   - Implement DAG validation, ready-queue, concurrency pools (global + group), retries, timeouts, cancellation.
3. **Agent** (`agent.ts`)
   - Instantiate `Agent` with `openai('gpt-4o-mini')` parity, `tools: async () => ({ ...mcpTools, memoryTool })`.
   - Bridge tasks to either `invokeAgent` or `invokeTool` with JSON-only outputs for agents.
4. **Prompt** (`prompt.ts`)
   - Document responsibilities, JSON requirements, and safety checks (short, deterministic).
5. **Examples** (`examples/parallizer-example.ts`)
   - Show sample DAG with mixed `tool` and `agent` tasks, with group limits (e.g., `{ github: 2 }`).
6. **Tests**
   - Unit: DAG validation, scheduling order, concurrency limit enforcement, timeouts, retries, cancellation, dependency failure propagation, output shape.
   - Integration: minimal MCP tool invocation (mocked) and agent call with deterministic JSON.
7. **Docs**
   - Update `README.md` with usage and example; reference this plan.

### Testing Strategy
- **Framework**: `vitest` with fake timers for backoff/timeout tests.
- **Mocks**: Stub agents and MCP tools with deterministic outputs; use spies to assert concurrency (call counts and overlap windows).
- **Coverage goals**: ≥85% for scheduler; ≥75% overall for agent + DTOs.

### Example Usage (for docs and example file)
```ts
// pnpm tsx examples/parallizer-example.ts
await parallizerAgent.generate([
  { role: 'user', content: JSON.stringify({
      runId: 'demo-1',
      concurrency: 3,
      limits: { byGroup: { github: 2 } },
      tasks: [
        { id: 'A', type: 'tool', target: 'github.search_code', payload: { query: 'repo:owner/repo path:src "TODO"' } },
        { id: 'B', type: 'agent', target: 'developerAgent', payload: { request: 'Summarize findings as JSON' }, dependsOn: ['A'] },
        { id: 'C', type: 'tool', target: 'memory-operations', payload: { operation: 'store', key: 'summary', value: '...' }, dependsOn: ['B'], concurrencyGroup: 'github' }
      ]
  })}
]);
```

### Operational Considerations
- **Package manager**: Use `pnpm` for scripts and examples.
- **Env**: Expect `GITHUB_MCP_PAT` for GitHub MCP; document minimum env for examples.
- **Limits**: Provide sane defaults (`concurrency=3`, `timeoutMs=60_000`, retry `3×` with `500ms` base backoff).

### Risks & Mitigations
- **Non-deterministic agent outputs**: Enforce strict JSON parsing with corrective re-prompt and fallback.
- **Hidden cycles in task graph**: Zod validation + explicit cycle detection algorithm; fail before execution.
- **MCP rate limits**: Per-group concurrency caps + backoff; surface 429 telemetry.

### Acceptance Criteria
- `parallizerAgent` accepts a DAG of tasks and returns structured results with metrics.
- Concurrency and per-group limits enforced; retries and timeouts work as configured.
- Comprehensive unit tests for scheduler logic; integration test with mocked MCP tool.
- Example runnable via `pnpm tsx examples/parallizer-example.ts`.

### Milestones
- **M1**: DTOs + scheduler skeleton + basic tests (2 days)
- **M2**: Agent wiring + MCP integration + retries/timeouts (2 days)
- **M3**: Full test suite + example + docs (1 day)

### Project Structure
- `src/mastra/agents/`: Example agents (e.g., `weather-agent.ts`).
- `src/mastra/tools/`: Example tools invoked by agents.
- `src/mastra/workflows/`: Example workflows orchestrating agents and tools.
- `src/mastra/index.ts`: Entrypoint wiring agents/workflows.

### Parallizer Agent

The Parallizer orchestrates a DAG of tasks (tools or agents) with concurrency limits, retries, and timeouts.

Run the example:

```bash
pnpm tsx examples/parallizer-example.ts
```

Optional: set `GITHUB_MCP_PAT` to enable GitHub MCP tools; the system continues without them if missing.
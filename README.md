TechLibs Agent
===============

TechLibs Agent is our agentic orchestrator that leads development end-to-end — from backlog to deployment, from product knowledge to low-level coding — powered by a backbone of 40+ specialized agents for a seamless developer experience.

### Key Capabilities
- **Intelligent automation**: Orchestrates multi-agent workflows to reduce manual effort and accelerate delivery.
- **Blockchain-native**: Deep expertise across smart contracts, on-chain data, and wallet flows.
- **Production readiness**: Emphasis on reliability, testing, monitoring, and maintainability.
- **Developer experience**: Opinionated tooling and patterns that integrate cleanly with modern stacks.

### About this Repository
This repository contains the TechLibs Agent scaffolding and example agents/workflows (see `src/mastra/`) that demonstrate how we compose tools and agents for real-world automation.

### Quick Start
```bash
pnpm install
pnpm run build
pnpm run start
```

### Project Structure
- `src/mastra/agents/`: Example agents (e.g., `weather-agent.ts`).
- `src/mastra/tools/`: Example tools invoked by agents.
- `src/mastra/workflows/`: Example workflows orchestrating agents and tools.
- `src/mastra/index.ts`: Entrypoint wiring agents/workflows.

TechLibs Agent orchestrator

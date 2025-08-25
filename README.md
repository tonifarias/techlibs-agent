

TechLibs Agent is our agentic orchestrator that leads development end-to-end — from backlog to deployment, from product knowledge to low-level coding — powered by a backbone of specialized agents for a seamless developer experience.

### Key Capabilities
- **Intelligent automation**: Orchestrates multi-agent workflows to reduce manual effort and accelerate delivery.
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

### Cloudflare MCP Integration

To enable Cloudflare tools via MCP in agents (e.g., `developerAgent`), set the following environment variables:

```bash
export CLOUDFLARE_MCP_URL="https://your-cloudflare-mcp-endpoint/" # required
export CLOUDFLARE_API_TOKEN="cf_xxx"                                # optional if your endpoint requires Bearer auth
```

The Cloudflare MCP client is defined in `src/mastra/tools/cloudflare/tool.ts` and is loaded alongside the GitHub MCP client. If variables are not set, the Cloudflare MCP client will initialize with no servers.

### Project Structure
```text
src/
  mastra/
    agents/
      bdd-specialist/
      code-reviewer/
      developer-agent/
      product-owner/
    tools/
      json-extractor-tool.ts
    workflows/
      techlibs-agent/
        workflow.ts
        diagrams/
          architecture.mmd
        dtos/
          constraint.dto.ts
          init-input.dto.ts
          state.dto.ts
          final-output.dto.ts
        steps/
          ai-research-and-discovery/
            dto.ts
            step.ts
            diagram.mmd
          user-research/
            dto.ts
            step.ts
          design-system-brief/
            dto.ts
            step.ts
          tech-architecture/
            dto.ts
            step.ts
          stories-and-epics/
            dto.ts
            step.ts
          tasks-and-implementation/
            dto.ts
            step.ts
          definition-of-done/
            dto.ts
            step.ts
          roadmap-plan/
            dto.ts
            step.ts
          assemble-prd/
            dto.ts
            step.ts
        gates/
          design-approval-gate.ts
          architecture-approval-gate.ts
```

### Workflow Design (Mastra + MCP)
- **DTOs**: Each step declares input/output schemas with `zod` for strong typing and validation.
- **Tools**: Shared `json-extractor` parses agent outputs safely.
- **Gates**: `waitForEvent` approvals separated under `gates/` to support suspend/resume.
- **Agents**: Reuse `productOwnerAgent`, `bddSpecialistAgent`, `developerAgent`, `codeReviewerAgent`.

### Constraints Model
- `constraints` accepts structured objects or strings.
- Structured form: `{ category, detail, priority? }` where `category` ∈ { time, budget, compliance, security, performance, tech_stack, team, other } and `priority` ∈ { must, should, could }.
- Steps can translate constraints into prompts with explicit categories for clarity.

### Diagrams
- Project-level: `src/mastra/workflows/techlibs-agent/diagrams/architecture.mmd` (Mermaid).
- Per-step diagrams live alongside step code as `diagram.mmd` where relevant.

### Plan Guide
- The plan guide orchestrates: AI Research → User Research → Design System Brief → Approval → Tech Architecture → Approval → Stories & Epics → Tasks → DoD → Roadmap → Assemble PRD.
- Each step consumes/produces DTOs, enabling composition and testability.
- Prompts are minimal, deterministic, and typed to enforce strict JSON outputs.

### Mastra Architect (Scaffolder)
- An agent that follows Mastra best practices to generate new agents/tools/gates/steps from user prompts. See `src/mastra/agents/mastra-architect/`.

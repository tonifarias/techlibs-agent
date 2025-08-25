
## Techlibs PRD Creation & Delivery Architecture

### Overview
- Purpose: Orchestrate PRD creation from discovery to roadmap using typed Mastra workflow steps with suspend/resume, branches, and tool/agent calls.
- Inputs: `problemStatement`, `companyContext`, `constraints`, optional `assets` (links to repos, docs, figma).
- Outputs: `prd`, `designSystemBrief`, `techArchitecture`, `storiesEpics`, `tasksImplementation`, `definitionOfDone`, `roadmapPlan`.

### High-level Phases (mapped to workflow steps)
1. AI Research & Discovery (`ai-research-and-discovery`)
   - Gathers market, competitors, tech feasibility signals via MCP tools (web search, filesystem, custom sources).
   - Output: `researchBrief`, `keyFindings`.
   - May suspend for human approval of sources.

2. User Research (`user-research`)
   - Produces personas, journeys, and use cases from problem and research.
   - Output: `personas`, `journeys`, `useCases`.

3. Design System (`design-system-brief`)
   - Drafts color palette and component inventory; outputs a `designSystemBrief` summarizing tokens and components to be refined by design.
   - Output: `designSystemBrief`.
   - Optional suspend for design signoff.

4. Tech Architecture (`tech-architecture`)
   - Drafts system architecture, API surface, and storage choices; validates feasibility.
   - Output: `techArchitecture` with `systemDiagram`, `apis`, `storage`.

5. Stories & Epics (`stories-and-epics`)
   - Converts use cases into epics, user stories with acceptance criteria (BDD outline style).
   - Output: `storiesEpics` array.

6. Tasks & Implementation (`tasks-and-implementation`)
   - Breaks stories into tasks (dev, testing) with estimates and dependencies.
   - Output: `tasksImplementation` with `tasks`, `dependencies`.

7. Definition of Done (`definition-of-done`)
   - Produces DoD including testing, quality gates, and review rules.
   - Output: `definitionOfDone`.

8. Roadmap Plan (`roadmap-plan`)
   - Builds roadmap by milestones with timelines and resource allocation.
   - Output: `roadmapPlan`.

### Control Flow
- Sequential flow across phases with validation gates:
  - After `ai-research-and-discovery`, branch to `user-research` only if `keyFindings` not empty; else fail with actionable error.
  - Optional suspend points: `design-system-brief` and `tech-architecture` for human approval using `sleepUntil`/`waitForEvent`.
- On any step error, workflow fails fast with clear message.

### Typed Contracts (Zod)
- Input schema: `{ problemStatement: string; companyContext?: string; constraints?: string[]; assets?: string[] }`
- Output schema: `{ prd: string; designSystemBrief: string; techArchitecture: string; storiesEpics: string[]; tasksImplementation: { tasks: string[]; dependencies: string[] }; definitionOfDone: string; roadmapPlan: string }`

### Suspend/Resume Events
- `design-approval-required` fired after `design-system-brief`; resume when event received with `{approved: true}`.
- `architecture-approval-required` fired after `tech-architecture`; resume when `{approved: true}`.
 - `bdd-scenarios-ready` emitted by `stories-and-epics` after BDD Specialist completes scenarios; optional human review may resume with `{approved: true}`.
 - `code-review-complete` emitted by `definition-of-done` after Code Reviewer validates DoD and repo guidelines; optional rework loop if `{changesRequested: true}`.

### Agent/Tool Usage
- Specialists are invoked via `mastra.getAgent('<agentName>')` within step `execute` functions, following the `weatherAgent` pattern.
  - Product Owner (`productOwner`)
    - Steps: `ai-research-and-discovery`, `user-research`, `roadmap-plan`
    - Outputs: refined `researchBrief`, `personas`, `journeys`, `useCases`, prioritized milestones
  - BDD Specialist (`bddSpecialist`)
    - Step: `stories-and-epics`
    - Outputs: epics with executable Given/When/Then acceptance criteria; emits `bdd-scenarios-ready`
  - Developer (`developerAgent`)
    - Steps: `tech-architecture`, `tasks-and-implementation`
    - Outputs: `techArchitecture` (system, APIs, storage) and `tasksImplementation` (tasks, dependencies, estimates)
  - Code Reviewer (`codeReviewer`)
    - Step: `definition-of-done`
    - Outputs: repo-aligned DoD; emits `code-review-complete`

#### Invocation pattern (example)
```ts
const agent = mastra?.getAgent('bddSpecialist');
if (!agent) throw new Error('BDD Specialist agent not found');
const res = await agent.generate([
  { role: 'user', content: 'Convert use cases to epics with BDD scenarios. Return JSON array of strings.' }
]);
const storiesEpics = JSON.parse(res.text);
```

#### Linear & Figma (MCP) integration
- Update Linear tasks automatically at key milestones:
  - After `user-research`: attach personas/journeys/use cases
  - After `stories-and-epics`: attach BDD scenarios (happy path, edge, error)
  - After `definition-of-done`: attach DoD and review notes
- When UI behavior is involved, fetch Figma design metadata via MCP for tokens/components and reference in `design-system-brief`.

### Success Criteria
- All outputs populated and non-empty.
- Workflow status `success` and final `prd` includes sections: Research, Personas, Use Cases, Design System, Tech Architecture, Stories/Epics, Tasks, DoD, Roadmap.
 - Linear tasks updated with BDD scenarios and DoD; optional approvals recorded via events.

import { createWorkflow } from "@mastra/core/workflows";
import { finalOutputSchema } from "./techlibs-agent/dtos/final-output.dto";
import { initInputSchema } from "./techlibs-agent/dtos/init-input.dto";
import { architectureApprovalGate } from "./techlibs-agent/gates/architecture-approval-gate";
import { designApprovalGate } from "./techlibs-agent/gates/design-approval-gate";
import { aiResearchAndDiscovery } from "./techlibs-agent/steps/ai-research-and-discovery/step";
import { assemblePRD } from "./techlibs-agent/steps/assemble-prd/step";
import { definitionOfDone } from "./techlibs-agent/steps/definition-of-done/step";
import { designSystemBriefStep } from "./techlibs-agent/steps/design-system-brief/step";
import { roadmapPlan } from "./techlibs-agent/steps/roadmap-plan/step";
import { storiesAndEpics } from "./techlibs-agent/steps/stories-and-epics/step";
import { tasksAndImplementation } from "./techlibs-agent/steps/tasks-and-implementation/step";
import { techArchitecture } from "./techlibs-agent/steps/tech-architecture/step";
import { userResearch } from "./techlibs-agent/steps/user-research/step";

// Define the workflow with suspend/resume gates using waitForEvent
const techlibsAgentWorkflow = createWorkflow({
  id: "techlibs-agent-workflow-legacy",
  inputSchema: initInputSchema,
  outputSchema: finalOutputSchema,
})
  .then(aiResearchAndDiscovery as any)
  .then(userResearch as any)
  .then(designSystemBriefStep as any)
  .waitForEvent("design-approval-required", designApprovalGate as any)
  .then(techArchitecture as any)
  .waitForEvent(
    "architecture-approval-required",
    architectureApprovalGate as any
  )
  .then(storiesAndEpics as any)
  .then(tasksAndImplementation as any)
  .then(definitionOfDone as any)
  .then(roadmapPlan as any)
  .then(assemblePRD as any);

techlibsAgentWorkflow.commit();

export { techlibsAgentWorkflow };

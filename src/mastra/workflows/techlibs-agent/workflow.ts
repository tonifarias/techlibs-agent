import { createWorkflow } from "@mastra/core/workflows";
import { mastra } from "../../index";
import { finalOutputSchema } from "./dtos/final-output.dto";
import { initInputSchema } from "./dtos/init-input.dto";
import { architectureApprovalGate } from "./gates/architecture-approval-gate";
import { designApprovalGate } from "./gates/design-approval-gate";
import { aiResearchAndDiscovery } from "./steps/ai-research-and-discovery/step";
import { assemblePRD } from "./steps/assemble-prd/step";
import { definitionOfDone } from "./steps/definition-of-done/step";
import { designSystemBriefStep } from "./steps/design-system-brief/step";
import { roadmapPlan } from "./steps/roadmap-plan/step";
import { storiesAndEpics } from "./steps/stories-and-epics/step";
import { tasksAndImplementation } from "./steps/tasks-and-implementation/step";
import { techArchitecture } from "./steps/tech-architecture/step";
import { userResearch } from "./steps/user-research/step";

// Function to get available agents from Mastra
export const getAvailableAgents = () => {
  const agents = mastra.getAgents();
  return Object.keys(agents).map((agentName) => ({
    name: agentName,
    agent: agents[agentName as keyof typeof agents],
  }));
};

// Function to get agent by name
export const getAgentByName = (name: string) => {
  const agents = mastra.getAgents();
  return agents[name as keyof typeof agents];
};

export const techlibsAgentWorkflow = createWorkflow({
  id: "techlibs-agent-workflow",
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

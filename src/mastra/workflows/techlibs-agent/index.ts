import { createWorkflow } from "@mastra/core/workflows";
import { mastra } from "../../index";
import { finalOutputSchema } from "./dtos/final-output.dto";
import { initInputSchema } from "./dtos/init-input.dto";
import { approvedTechArchitectureOutputSchema, architectureApprovalGate } from "./gates/architecture-approval-gate";
import { designApprovalGate } from "./gates/design-approval-gate";
import { assemble } from "./steps/assemble/step";
import { definitionOfDone } from "./steps/definition-of-done/step";
import { designSystemBriefStep } from "./steps/design-system-brief/step";
import { roadmapPlan } from "./steps/roadmap-plan/step";
import { storiesAndEpics } from "./steps/stories-and-epics/step";
import { tasksAndImplementation } from "./steps/tasks-and-implementation/step";
import { techArchitecture } from "./steps/tech-architecture/step";
import { userResearchOutputSchema } from "../user-research/steps/user-research/dto";
import researchWorkflow from "../user-research";
import { definitionOfDoneOutputSchema } from "./steps/definition-of-done/dto";

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

const taskWorkflow = createWorkflow({
  id: "task-workflow",
  inputSchema: userResearchOutputSchema,
  outputSchema: definitionOfDoneOutputSchema,
})
  .then(storiesAndEpics)
  .then(tasksAndImplementation)
  .then(definitionOfDone)
  .commit();

const architectureWorkflow = createWorkflow({
  id: "architecture-workflow",
  inputSchema: userResearchOutputSchema,
  outputSchema: approvedTechArchitectureOutputSchema,
})
  .then(designSystemBriefStep)
  .then(designApprovalGate)
  .then(techArchitecture)
  .then(architectureApprovalGate)
  .commit();

const techlibsAgentWorkflow = createWorkflow({
  id: "techlibs-agent-workflow",
  inputSchema: initInputSchema,
  outputSchema: finalOutputSchema,
})
  .then(researchWorkflow)
  .parallel([taskWorkflow, architectureWorkflow, roadmapPlan])
  .then(assemble)
  .commit();

export default techlibsAgentWorkflow;

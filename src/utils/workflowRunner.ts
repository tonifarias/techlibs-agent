import { mastra } from "../mastra/index";

export async function runWorkflow(workflowName: string, params: any) {
  const workflows = mastra.getWorkflows();
  switch (workflowName) {
    case "memoryWorkflow":
      return await workflows.memoryWorkflow.execute(params); // Use the correct method to execute
    case "ai-research-workflow":
      return await workflows.aiResearchWorkflow.execute(params); // Use the correct method to execute
    // Add more cases for other workflows as needed
    default:
      throw new Error(`Workflow ${workflowName} not found.`);
  }
}

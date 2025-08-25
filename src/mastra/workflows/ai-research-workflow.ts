import { createWorkflow } from "@mastra/core/workflows";
import { stateSchema } from "../context";
import {
  aiResearchAndDiscovery,
  initInputSchema,
} from "./techlibs-agent-workflow";

export const aiResearchWorkflow = createWorkflow({
  id: "ai-research-workflow",
  inputSchema: initInputSchema,
  outputSchema: stateSchema,
}).then(aiResearchAndDiscovery);

aiResearchWorkflow.commit();

export default aiResearchWorkflow;

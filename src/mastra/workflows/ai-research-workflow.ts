import { createWorkflow } from "@mastra/core/workflows";
import { stateSchema } from "../context";
import { initInputSchema } from "./techlibs-agent/dtos/init-input.dto";
import { aiResearchAndDiscovery } from "./techlibs-agent/steps/ai-research-and-discovery/step";

export const aiResearchWorkflow = createWorkflow({
  id: "ai-research-workflow",
  inputSchema: initInputSchema,
  outputSchema: stateSchema,
}).then(aiResearchAndDiscovery);

aiResearchWorkflow.commit();

export default aiResearchWorkflow;

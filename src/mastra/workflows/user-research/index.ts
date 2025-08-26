import { createWorkflow } from "@mastra/core/workflows";
import { initInputSchema } from "../techlibs-agent/dtos/init-input.dto";
import { userResearchOutputSchema } from "./steps/user-research/dto";
import { researchAndDiscovery } from "./steps/research-and-discovery/step";
import { userResearch } from "./steps/user-research/step";

const researchWorkflow = createWorkflow({
  id: "research-workflow",
  inputSchema: initInputSchema,
  outputSchema: userResearchOutputSchema,
}) 
  .then(researchAndDiscovery)
  .then(userResearch)
  .commit();

export default researchWorkflow;

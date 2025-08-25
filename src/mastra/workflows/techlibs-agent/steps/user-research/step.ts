import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { userResearchInputSchema, userResearchOutputSchema } from "./dto";

export const userResearch = createStep({
  id: "user-research",
  description: "Produce personas, journeys, and use cases",
  inputSchema: userResearchInputSchema,
  outputSchema: userResearchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.keyFindings || inputData.keyFindings.length === 0) {
      throw new Error("Cannot proceed: keyFindings is empty");
    }

    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `You are a Product Owner.
From the problem and prior research, produce:
- personas (string, concise but clear)
- journeys (string, concise but clear)
- useCases (string[])
Return ONLY JSON with keys: personas, journeys, useCases.

problemStatement: ${inputData.problemStatement}
researchBrief: ${inputData.researchBrief}
keyFindings: ${(inputData.keyFindings ?? []).join("; ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;

    const json = extractFirstJsonObject(text) as {
      personas?: string;
      journeys?: string;
      useCases?: string[];
    };
    if (!json.personas || !json.journeys || !json.useCases) {
      throw new Error("Failed to produce personas/journeys/useCases");
    }

    return {
      personas: json.personas,
      journeys: json.journeys,
      useCases: json.useCases,
    };
  },
});

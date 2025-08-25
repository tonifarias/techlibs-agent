import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  designSystemBriefInputSchema,
  designSystemBriefOutputSchema,
} from "./dto";

export const designSystemBriefStep = createStep({
  id: "design-system-brief",
  description: "Draft color palette and component inventory summary",
  inputSchema: designSystemBriefInputSchema,
  outputSchema: designSystemBriefOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `Draft a design system brief summarizing tokens and components.
Include: colors (semantic), spacing, typography, and a component inventory.
Return ONLY JSON: { designSystemBrief: string }.

context:
- problemStatement: ${inputData.problemStatement}
- personas: ${inputData.personas ?? ""}
- journeys: ${inputData.journeys ?? ""}
- useCases: ${(inputData.useCases ?? []).join(", ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { designSystemBrief?: string };
    if (!json.designSystemBrief)
      throw new Error("Failed to produce designSystemBrief");

    return { designSystemBrief: json.designSystemBrief };
  },
});

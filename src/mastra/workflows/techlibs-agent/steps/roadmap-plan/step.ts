import { createStep } from "@mastra/core/workflows";
import { roadmapPlanOutputSchema } from "./dto";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { userResearchOutputSchema } from "../../../user-research/steps/user-research/dto";

export const roadmapPlan = createStep({
  id: "roadmap-plan",
  description: "Build roadmap milestones with timelines and resources",
  inputSchema: userResearchOutputSchema,
  outputSchema: roadmapPlanOutputSchema,
  execute: async ({ mastra, inputData }) => {
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `Create a concise roadmap plan with milestones and rough timelines.
Return ONLY JSON: { roadmapPlan: string }.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { roadmapPlan?: string };
    if (!json.roadmapPlan) throw new Error("Failed to produce roadmapPlan");

    return { ...inputData, roadmapPlan: json.roadmapPlan };
  },
});

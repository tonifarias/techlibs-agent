import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { roadmapPlanInputSchema, roadmapPlanOutputSchema } from "./dto";

export const roadmapPlan = createStep({
  id: "roadmap-plan",
  description: "Build roadmap milestones with timelines and resources",
  inputSchema: roadmapPlanInputSchema,
  outputSchema: roadmapPlanOutputSchema,
  execute: async ({ mastra }) => {
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `Create a concise roadmap plan with milestones and rough timelines.
Return ONLY JSON: { roadmapPlan: string }.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { roadmapPlan?: string };
    if (!json.roadmapPlan) throw new Error("Failed to produce roadmapPlan");

    return { roadmapPlan: json.roadmapPlan };
  },
});

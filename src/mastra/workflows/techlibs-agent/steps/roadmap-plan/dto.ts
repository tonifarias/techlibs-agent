import { z } from "zod";

export const roadmapPlanInputSchema = z.object({});

export const roadmapPlanOutputSchema = z.object({
  roadmapPlan: z.string(),
});

export type RoadmapPlanInput = z.infer<typeof roadmapPlanInputSchema>;
export type RoadmapPlanOutput = z.infer<typeof roadmapPlanOutputSchema>;

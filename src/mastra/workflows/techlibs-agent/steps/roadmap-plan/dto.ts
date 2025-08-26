import { z } from "zod";
import { initInputSchema } from "../../dtos/init-input.dto";

export const roadmapPlanOutputSchema = initInputSchema.extend({
  roadmapPlan: z.string(),
});

export type RoadmapPlanOutput = z.infer<typeof roadmapPlanOutputSchema>;

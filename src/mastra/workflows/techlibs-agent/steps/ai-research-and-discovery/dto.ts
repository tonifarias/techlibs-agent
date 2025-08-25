import { z } from "zod";
import { initInputSchema } from "../../dtos/init-input.dto";

export const aiResearchInputSchema = initInputSchema;

export const aiResearchOutputSchema = z.object({
  researchBrief: z.string(),
  keyFindings: z.array(z.string()).min(1),
});

export type AIResearchInput = z.infer<typeof aiResearchInputSchema>;
export type AIResearchOutput = z.infer<typeof aiResearchOutputSchema>;

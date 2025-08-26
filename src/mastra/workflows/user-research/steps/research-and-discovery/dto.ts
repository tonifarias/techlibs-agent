import { z } from "zod";
import { initInputSchema } from "../../../techlibs-agent/dtos/init-input.dto";

export const researchInputSchema = initInputSchema;

export const researchOutputSchema = z.object({
  problemStatement: z.string(),
  researchBrief: z.string(),
  keyFindings: z.array(z.string()).min(1),
});

export type ResearchInput = z.infer<typeof researchInputSchema>;
export type ResearchOutput = z.infer<typeof researchOutputSchema>;

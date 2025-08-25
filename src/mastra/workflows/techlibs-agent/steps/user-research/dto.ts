import { z } from "zod";

export const userResearchInputSchema = z.object({
  problemStatement: z.string(),
  researchBrief: z.string(),
  keyFindings: z.array(z.string()).min(1),
});

export const userResearchOutputSchema = z.object({
  personas: z.string(),
  journeys: z.string(),
  useCases: z.array(z.string()).min(1),
});

export type UserResearchInput = z.infer<typeof userResearchInputSchema>;
export type UserResearchOutput = z.infer<typeof userResearchOutputSchema>;

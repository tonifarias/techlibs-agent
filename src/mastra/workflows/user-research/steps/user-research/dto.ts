import { z } from "zod";

export const userResearchOutputSchema = z.object({
  problemStatement: z.string(),
  personas: z.string(),
  journeys: z.string(),
  useCases: z.array(z.string()).min(1),
  keyFindings: z.array(z.string()).min(1),
});

export type UserResearchOutput = z.infer<typeof userResearchOutputSchema>;

import { z } from "zod";

export const designSystemBriefInputSchema = z.object({
  problemStatement: z.string(),
  personas: z.string().optional(),
  journeys: z.string().optional(),
  useCases: z.array(z.string()).optional(),
});

export const designSystemBriefOutputSchema = z.object({
  designSystemBrief: z.string(),
});

export type DesignSystemBriefInput = z.infer<
  typeof designSystemBriefInputSchema
>;
export type DesignSystemBriefOutput = z.infer<
  typeof designSystemBriefOutputSchema
>;

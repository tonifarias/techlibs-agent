import { z } from "zod";

export const techArchitectureInputSchema = z.object({
  problemStatement: z.string(),
  keyFindings: z.array(z.string()).optional(),
  designSystemBrief: z.string().optional(),
});

export const techArchitectureOutputSchema = z.object({
  techArchitecture: z.string(),
});

export type TechArchitectureInput = z.infer<typeof techArchitectureInputSchema>;
export type TechArchitectureOutput = z.infer<
  typeof techArchitectureOutputSchema
>;

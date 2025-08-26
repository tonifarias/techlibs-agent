import { z } from "zod";

export const techArchitectureOutputSchema = z.object({
  designSystemBrief: z.string(),
  techArchitecture: z.string(),
});

export type TechArchitectureOutput = z.infer<
  typeof techArchitectureOutputSchema
>;

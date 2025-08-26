import { z } from "zod";

export const designSystemBriefOutputSchema = z.object({
  designSystemBrief: z.string(),
  keyFindings: z.array(z.string()).min(1),
  problemStatement: z.string(),
});

export type DesignSystemBriefOutput = z.infer<
  typeof designSystemBriefOutputSchema
>;

import { z } from "zod";
import { constraintsUnionSchema } from "../dtos/constraint.dto";

export const initInputSchema = z.object({
  problemStatement: z.string(),
  companyContext: z.string().optional(),
  // Accept either structured constraints or simple strings (backward compatible)
  constraints: z.array(constraintsUnionSchema).optional(),
  assets: z.array(z.string()).optional(),
});

export type InitInput = z.infer<typeof initInputSchema>;

import { z } from "zod";

// Constraint model captures business/technical limitations that guide decisions.
// Examples: deadlines, budget, compliance, security, stack mandates, performance SLAs.
export const constraintSchema = z.object({
  category: z.enum([
    "time",
    "budget",
    "compliance",
    "security",
    "performance",
    "tech_stack",
    "team",
    "other",
  ]),
  detail: z.string(),
  priority: z.enum(["must", "should", "could"]).optional(),
});

export type Constraint = z.infer<typeof constraintSchema>;

// Backward compatible union: accept either structured constraints or plain strings
export const constraintsUnionSchema = z.union([constraintSchema, z.string()]);

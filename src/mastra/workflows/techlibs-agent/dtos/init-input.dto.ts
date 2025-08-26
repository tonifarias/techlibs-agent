import { z } from "zod";

/**
 * Enhanced initial input schema with improved UX
 * All fields are text-based and optional (except problemStatement)
 * Provides flexible input while maintaining workflow quality
 */
export const initInputSchema = z.object({
  // Required: Core problem to solve
  problemStatement: z.string()
    .min(10, "Problem statement must be at least 10 characters")
    .describe("What specific problem or opportunity are you addressing?"),
  
  // Optional: Business context
  companyContext: z.string()
    .optional()
    .describe("Brief description of your company, industry, and current situation"),
  
  // Optional: Project constraints (text-based for better UX)
  constraints: z.string()
    .optional()
    .describe("Any constraints like timeline, budget, technology requirements, compliance needs, etc."),
  
  // Optional: Available assets (text-based for better UX)
  assets: z.string()
    .optional()
    .describe("Existing resources like brand assets, documentation, user research, competitor analysis, etc."),
  
  // Optional: Target audience information
  targetAudience: z.string()
    .optional()
    .describe("Who are the primary users/customers for this solution?"),
  
  // Optional: Success criteria
  successCriteria: z.string()
    .optional()
    .describe("How will you measure the success of this project?"),
  
  // Optional: Project priority/urgency
  priority: z.enum(["low", "medium", "high", "critical"])
    .optional()
    .describe("Project priority level")
    .default("medium"),
});

export type InitInput = z.infer<typeof initInputSchema>;

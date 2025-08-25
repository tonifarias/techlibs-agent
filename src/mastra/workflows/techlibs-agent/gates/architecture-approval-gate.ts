import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { techArchitectureInputSchema } from "../steps/tech-architecture/dto";

const approvalResumeSchema = z.object({ approved: z.boolean() });

export const architectureApprovalGate = createStep({
  id: "architecture-approval-gate",
  description: "Gate that requires external approval for architecture",
  inputSchema: techArchitectureInputSchema.extend({
    techArchitecture: z.string().optional(),
  }),
  outputSchema: techArchitectureInputSchema.extend({
    architectureApproved: z.boolean().optional(),
  }),
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData }) => {
    if (!resumeData?.approved) {
      throw new Error("Tech architecture not approved");
    }
    return { ...inputData, architectureApproved: true } as any;
  },
});

import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { techArchitectureOutputSchema } from "../steps/tech-architecture/dto";

const approvalResumeSchema = z.object({ approved: z.boolean().optional() });

export const approvedTechArchitectureOutputSchema = techArchitectureOutputSchema.merge(approvalResumeSchema);

export const architectureApprovalGate = createStep({
  id: "architecture-approval-gate",
  description: "Gate that requires external approval for architecture",
  inputSchema: techArchitectureOutputSchema,
  outputSchema: approvedTechArchitectureOutputSchema,
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    if (!resumeData?.approved) {
      await suspend({});
      return inputData;
    }
    return { ...inputData, approved: true } as any;
  },
});

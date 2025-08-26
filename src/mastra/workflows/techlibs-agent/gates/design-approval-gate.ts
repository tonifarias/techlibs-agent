import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { designSystemBriefOutputSchema } from "../steps/design-system-brief/dto";

const approvalResumeSchema = z.object({ approved: z.boolean() });

export const approvedDesignSystemBriefOutputSchema = designSystemBriefOutputSchema.merge(approvalResumeSchema);

export const designApprovalGate = createStep({
  id: "design-approval-gate",
  description: "Gate that requires external approval for design system brief",
  inputSchema: designSystemBriefOutputSchema,
  outputSchema: approvedDesignSystemBriefOutputSchema,
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    if (!resumeData?.approved) {
      await suspend({});
      return inputData;
    }
    return { ...inputData, designApproved: true } as any;
  },
});

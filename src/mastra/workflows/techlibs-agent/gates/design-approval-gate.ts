import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { designSystemBriefInputSchema } from "../steps/design-system-brief/dto";

const approvalResumeSchema = z.object({ approved: z.boolean() });

export const designApprovalGate = createStep({
  id: "design-approval-gate",
  description: "Gate that requires external approval for design system brief",
  inputSchema: designSystemBriefInputSchema.extend({
    designSystemBrief: z.string().optional(),
  }),
  outputSchema: designSystemBriefInputSchema.extend({
    designApproved: z.boolean().optional(),
  }),
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData }) => {
    if (!resumeData?.approved) {
      throw new Error("Design system brief not approved");
    }
    return { ...inputData, designApproved: true } as any;
  },
});

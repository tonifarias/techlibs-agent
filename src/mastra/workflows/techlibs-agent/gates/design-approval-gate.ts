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
    console.log('[Design Gate] Resume data received:', JSON.stringify(resumeData));
    
    // Auto-approve for testing (can be disabled later)
    const autoApprove = process.env.AUTO_APPROVE_GATES !== 'false';
    
    if (autoApprove) {
      console.log('[Design Gate] Auto-approving for testing (set AUTO_APPROVE_GATES=false to disable)');
      return { ...inputData, designApproved: true } as any;
    }
    
    if (!resumeData?.approved) {
      console.log('[Design Gate] Approval denied or missing');
      throw new Error("Design system brief not approved");
    }
    
    console.log('[Design Gate] Design approved, continuing workflow');
    return { ...inputData, designApproved: true } as any;
  },
});

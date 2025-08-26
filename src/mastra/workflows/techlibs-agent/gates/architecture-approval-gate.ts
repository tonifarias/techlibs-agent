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
    console.log('[Architecture Gate] Resume data received:', JSON.stringify(resumeData));
    
    // Auto-approve for testing (can be disabled later)
    const autoApprove = process.env.AUTO_APPROVE_GATES !== 'false';
    
    if (autoApprove) {
      console.log('[Architecture Gate] Auto-approving for testing (set AUTO_APPROVE_GATES=false to disable)');
      return { ...inputData, architectureApproved: true } as any;
    }
    
    if (!resumeData?.approved) {
      console.log('[Architecture Gate] Approval denied or missing');
      throw new Error("Tech architecture not approved");
    }
    
    console.log('[Architecture Gate] Architecture approved, continuing workflow');
    return { ...inputData, architectureApproved: true } as any;
  },
});

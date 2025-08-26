import { z } from "zod";
import { roadmapPlanOutputSchema } from "../roadmap-plan/dto";
import { definitionOfDoneOutputSchema } from "../definition-of-done/dto";
import { approvedTechArchitectureOutputSchema } from "../../gates/architecture-approval-gate";

export const assembleInputSchema = z.object({
  "roadmap-plan": roadmapPlanOutputSchema,
  "architecture-workflow": approvedTechArchitectureOutputSchema,
  "task-workflow": definitionOfDoneOutputSchema,
});

export type AssembleInput = z.infer<typeof assembleInputSchema>;
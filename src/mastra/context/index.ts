import z from "zod";

// Aggregating state carried between steps
export const stateSchema = z.object({
  problemStatement: z.string(),
  companyContext: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  assets: z.array(z.string()).optional(),
  researchBrief: z.string().optional(),
  keyFindings: z.array(z.string()).optional(),
  personas: z.string().optional(),
  journeys: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  designSystemBrief: z.string().optional(),
  designApproved: z.boolean().optional(),
  techArchitecture: z.string().optional(),
  architectureApproved: z.boolean().optional(),
  storiesEpics: z.array(z.string()).optional(),
  tasksImplementation: z
    .object({
      tasks: z.array(z.string()),
      dependencies: z.array(z.string()),
    })
    .optional(),
  definitionOfDone: z.string().optional(),
  roadmapPlan: z.string().optional(),
  prd: z.string().optional(),
});

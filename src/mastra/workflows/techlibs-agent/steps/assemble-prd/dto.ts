import { z } from "zod";

export const assemblePrdInputSchema = z.object({
  researchBrief: z.string().optional(),
  personas: z.string().optional(),
  journeys: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  designSystemBrief: z.string().optional(),
  techArchitecture: z.string().optional(),
  storiesEpics: z.array(z.string()).optional(),
  tasksImplementation: z
    .object({
      tasks: z.array(z.string()),
      dependencies: z.array(z.string()),
    })
    .optional(),
  definitionOfDone: z.string().optional(),
  roadmapPlan: z.string().optional(),
});

export const assemblePrdOutputSchema = z.object({
  prd: z.string(),
  designSystemBrief: z.string(),
  techArchitecture: z.string(),
  storiesEpics: z.array(z.string()),
  tasksImplementation: z.object({
    tasks: z.array(z.string()),
    dependencies: z.array(z.string()),
  }),
  definitionOfDone: z.string(),
  roadmapPlan: z.string(),
});

export type AssemblePrdInput = z.infer<typeof assemblePrdInputSchema>;
export type AssemblePrdOutput = z.infer<typeof assemblePrdOutputSchema>;

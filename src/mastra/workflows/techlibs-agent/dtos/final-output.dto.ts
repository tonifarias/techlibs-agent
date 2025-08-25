import { z } from "zod";

export const finalOutputSchema = z.object({
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

export type FinalOutput = z.infer<typeof finalOutputSchema>;

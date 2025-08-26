import { z } from "zod";

export const tasksAndImplementationOutputSchema = z.object({
  storiesEpics: z.array(z.string()),
  tasksImplementation: z.object({
    tasks: z.array(z.string()).min(1),
    dependencies: z.array(z.string()).optional().default([]),
  }),
});

export type TasksAndImplementationOutput = z.infer<
  typeof tasksAndImplementationOutputSchema
>;

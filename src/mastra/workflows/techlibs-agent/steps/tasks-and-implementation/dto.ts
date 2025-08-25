import { z } from "zod";

export const tasksAndImplementationInputSchema = z.object({
  storiesEpics: z.array(z.string()).min(1),
});

export const tasksAndImplementationOutputSchema = z.object({
  tasksImplementation: z.object({
    tasks: z.array(z.string()).min(1),
    dependencies: z.array(z.string()).optional().default([]),
  }),
});

export type TasksAndImplementationInput = z.infer<
  typeof tasksAndImplementationInputSchema
>;
export type TasksAndImplementationOutput = z.infer<
  typeof tasksAndImplementationOutputSchema
>;

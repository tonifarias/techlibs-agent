import { z } from "zod";

export const definitionOfDoneOutputSchema = z.object({
  storiesEpics: z.array(z.string()),
  tasksImplementation: z.object({
    tasks: z.array(z.string()),
    dependencies: z.array(z.string()),
  }),
  definitionOfDone: z.string(),
});

export type DefinitionOfDoneOutput = z.infer<
  typeof definitionOfDoneOutputSchema
>;

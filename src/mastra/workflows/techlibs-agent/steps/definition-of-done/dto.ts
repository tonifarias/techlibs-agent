import { z } from "zod";

export const definitionOfDoneInputSchema = z.object({
  tasksImplementation: z
    .object({
      tasks: z.array(z.string()).min(1),
      dependencies: z.array(z.string()).optional().default([]),
    })
    .optional(),
});

export const definitionOfDoneOutputSchema = z.object({
  definitionOfDone: z.string(),
});

export type DefinitionOfDoneInput = z.infer<typeof definitionOfDoneInputSchema>;
export type DefinitionOfDoneOutput = z.infer<
  typeof definitionOfDoneOutputSchema
>;

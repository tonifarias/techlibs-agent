import { z } from "zod";

export const storiesAndEpicsInputSchema = z.object({
  useCases: z.array(z.string()).min(1),
});

export const storiesAndEpicsOutputSchema = z.object({
  storiesEpics: z.array(z.string()).min(1),
});

export type StoriesAndEpicsInput = z.infer<typeof storiesAndEpicsInputSchema>;
export type StoriesAndEpicsOutput = z.infer<typeof storiesAndEpicsOutputSchema>;

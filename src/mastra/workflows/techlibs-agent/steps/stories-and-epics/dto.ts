import { z } from "zod";


export const storiesAndEpicsOutputSchema = z.object({
  storiesEpics: z.array(z.string()).min(1),
});

export type StoriesAndEpicsOutput = z.infer<typeof storiesAndEpicsOutputSchema>;

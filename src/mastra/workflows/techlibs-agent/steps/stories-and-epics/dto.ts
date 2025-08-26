import { z } from "zod";

// Enhanced input schema with comprehensive validation
export const storiesAndEpicsInputSchema = z.object({
  useCases: z.array(z.string().min(10, "Use case must be at least 10 characters")).min(1, "At least one use case is required"),
  // Optional context for better story generation
  personas: z.string().optional(),
  techArchitecture: z.string().optional(),
  designSystemBrief: z.string().optional(),
});

// Enhanced output schema with structured story validation
export const storiesAndEpicsOutputSchema = z.object({
  storiesEpics: z.array(
    z.string()
      .min(20, "Story must be at least 20 characters")
      .refine(
        (story) => story.includes("As a") || story.includes("Epic:"), 
        "Story must follow user story or epic format"
      )
  ).min(3, "Must generate at least 3 stories/epics"),
  // Additional metadata for tracking
  metadata: z.object({
    totalEpics: z.number().min(0),
    totalStories: z.number().min(0),
    generatedAt: z.string().datetime(),
  }).optional(),
});

export type StoriesAndEpicsInput = z.infer<typeof storiesAndEpicsInputSchema>;
export type StoriesAndEpicsOutput = z.infer<typeof storiesAndEpicsOutputSchema>;

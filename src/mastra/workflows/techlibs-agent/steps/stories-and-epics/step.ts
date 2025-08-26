import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { storiesAndEpicsInputSchema, storiesAndEpicsOutputSchema } from "./dto";

// Structured output schema for the AI agent
const structuredOutputSchema = z.object({
  storiesEpics: z.array(z.string()),
  analysis: z.object({
    totalEpics: z.number(),
    totalStories: z.number(),
    complexity: z.enum(["low", "medium", "high"]),
  }).optional(),
});

export const storiesAndEpics = createStep({
  id: "stories-and-epics",
  description: "Convert use cases into epics and BDD scenarios with enhanced validation",
  inputSchema: storiesAndEpicsInputSchema,
  outputSchema: storiesAndEpicsOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("bddSpecialistAgent");
    if (!agent) throw new Error("bddSpecialistAgent not found");

    const prompt = `You are a BDD Specialist. Convert the following use cases into detailed epics and user stories using Behavior-Driven Development format.

For each use case, create:
1. An epic title
2. Multiple user stories with Given/When/Then format
3. Acceptance criteria

Use Cases:
${(inputData.useCases ?? []).map((uc, i) => `${i + 1}. ${uc}`).join('\n')}

Return ONLY a valid JSON object in this exact format:
{
  "storiesEpics": [
    "Epic: [Epic Title] - As a [user type], I want [goal] so that [benefit]",
    "Story: As a [user type], I want [action] so that [benefit]. Given [context], When [action], Then [outcome]",
    "Story: As a [user type], I want [action] so that [benefit]. Given [context], When [action], Then [outcome]"
  ]
}

Ensure the storiesEpics array contains at least 3-5 detailed entries.`;

    const maxRetries = 2;
    let lastError: Error | null = null;
    const startTime = Date.now();

    // Enhanced logging for observability
    console.log(`[${new Date().toISOString()}] Starting stories-and-epics generation with ${inputData.useCases?.length || 0} use cases`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use structured output with the agent for better consistency
        const response = await agent.generate(
          [{ role: "user", content: prompt }],
          {
            // Enable structured output if supported
            schema: structuredOutputSchema,
            resourceId: `workflow-${Date.now()}`, // For memory tracking
            threadId: `stories-epics-${Date.now()}`, // For conversation context
          }
        );
        
        const text = response.text;
        const json = extractFirstJsonObject(text) as { storiesEpics?: string[]; analysis?: any };
        
        // Enhanced validation with better error messages
        if (!json.storiesEpics || !Array.isArray(json.storiesEpics)) {
          throw new Error(`Invalid response format: expected array of stories, got ${typeof json.storiesEpics}`);
        }
        
        if (json.storiesEpics.length === 0) {
          throw new Error(`Empty storiesEpics array - agent failed to generate content`);
        }

        // Validate each story format
        const invalidStories = json.storiesEpics.filter(
          story => !story.includes("As a") && !story.includes("Epic:")
        );
        
        if (invalidStories.length > 0) {
          console.warn(`Generated ${invalidStories.length} stories with improper format, but proceeding`);
        }

        // Enhanced output with metadata
        const executionTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Successfully generated ${json.storiesEpics.length} stories in ${executionTime}ms`);
        
        return { 
          ...inputData, 
          storiesEpics: json.storiesEpics,
          metadata: {
            totalEpics: json.storiesEpics.filter(s => s.includes("Epic:")).length,
            totalStories: json.storiesEpics.filter(s => s.includes("As a")).length,
            generatedAt: new Date().toISOString(),
          }
        };
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`[${new Date().toISOString()}] Stories and epics generation attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries) {
          const totalTime = Date.now() - startTime;
          throw new Error(`Failed to generate storiesEpics after ${maxRetries} attempts in ${totalTime}ms. Last error: ${lastError.message}`);
        }
        
        // Exponential backoff for retries
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Unexpected error in storiesEpics generation");
  },
});

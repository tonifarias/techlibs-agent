import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { storiesAndEpicsInputSchema, storiesAndEpicsOutputSchema } from "./dto";

export const storiesAndEpics = createStep({
  id: "stories-and-epics",
  description: "Convert use cases into epics and BDD scenarios",
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

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as { storiesEpics?: string[] };
        
        if (json.storiesEpics && json.storiesEpics.length > 0) {
          return { ...inputData, storiesEpics: json.storiesEpics };
        } else {
          throw new Error(`Empty or invalid storiesEpics array (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Stories and epics generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate storiesEpics after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in storiesEpics generation");
  },
});

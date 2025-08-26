import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  tasksAndImplementationInputSchema,
  tasksAndImplementationOutputSchema,
} from "./dto";

export const tasksAndImplementation = createStep({
  id: "tasks-and-implementation",
  description: "Break stories into tasks/dependencies with estimates",
  inputSchema: tasksAndImplementationInputSchema,
  outputSchema: tasksAndImplementationOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `You are a Developer Agent. Break down the following stories and epics into concrete, actionable development tasks with dependencies.

Stories & Epics:
${(inputData.storiesEpics ?? []).map((story, i) => `${i + 1}. ${story}`).join('\n')}

For each story/epic, create:
1. Specific development tasks (be concrete: "Create login form component", "Implement JWT authentication middleware")
2. Dependencies between tasks (what must be completed before other tasks can start)

Return ONLY a valid JSON object in this exact format:
{
  "tasksImplementation": {
    "tasks": [
      "Set up project structure and dependencies",
      "Create database schema for user management",
      "Implement user registration API endpoint",
      "Create login form component",
      "Implement authentication middleware",
      "Add error handling for authentication flows"
    ],
    "dependencies": [
      "Database schema must be created before API endpoints",
      "Authentication middleware depends on user registration API",
      "Login form component requires authentication API to be ready"
    ]
  }
}

Ensure tasks array contains at least 5-8 concrete development tasks and dependencies array contains at least 3-5 dependency relationships.`;
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as {
          tasksImplementation?: { tasks: string[]; dependencies: string[] };
        };
        
        if (json.tasksImplementation && 
            json.tasksImplementation.tasks && 
            json.tasksImplementation.tasks.length > 0) {
          return { ...inputData, tasksImplementation: json.tasksImplementation };
        } else {
          throw new Error(`Invalid or empty tasksImplementation (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tasks and implementation generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate tasksImplementation after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in tasksImplementation generation");
  },
});

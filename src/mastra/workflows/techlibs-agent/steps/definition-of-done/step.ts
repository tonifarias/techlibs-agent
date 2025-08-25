import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  definitionOfDoneInputSchema,
  definitionOfDoneOutputSchema,
} from "./dto";

export const definitionOfDone = createStep({
  id: "definition-of-done",
  description: "Produce DoD including testing, quality gates, review rules",
  inputSchema: definitionOfDoneInputSchema,
  outputSchema: definitionOfDoneOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("codeReviewerAgent");
    if (!agent) throw new Error("Code Reviewer agent not found");

    const prompt = `Create a Definition of Done covering: tests, quality gates, CI, code review.
Return ONLY JSON: { definitionOfDone: string }.

context:
- tasks: ${
      inputData.tasksImplementation
        ? inputData.tasksImplementation.tasks.join(", ")
        : ""
    }`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { definitionOfDone?: string };
    if (!json.definitionOfDone)
      throw new Error("Failed to produce definitionOfDone");

    return { definitionOfDone: json.definitionOfDone };
  },
});

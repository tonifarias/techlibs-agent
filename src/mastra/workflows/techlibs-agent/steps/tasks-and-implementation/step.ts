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

    const prompt = `Given the stories/epics, produce tasks and dependencies.
Return ONLY JSON: { tasksImplementation: { tasks: string[], dependencies: string[] } }.

storiesEpics: ${(inputData.storiesEpics ?? []).join("\n- ")}`;
    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as {
      tasksImplementation?: { tasks: string[]; dependencies: string[] };
    };
    if (!json.tasksImplementation)
      throw new Error("Failed to produce tasksImplementation");

    return { tasksImplementation: json.tasksImplementation };
  },
});

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
    if (!agent) throw new Error("BDD Specialist agent not found");

    const prompt = `Convert useCases into epics and user stories with Given/When/Then.
Return ONLY JSON: { storiesEpics: string[] }.

useCases: ${(inputData.useCases ?? []).join("; ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { storiesEpics?: string[] };
    if (!json.storiesEpics) throw new Error("Failed to produce storiesEpics");

    return { storiesEpics: json.storiesEpics };
  },
});

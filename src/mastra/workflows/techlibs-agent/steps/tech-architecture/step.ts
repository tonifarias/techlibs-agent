import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { techArchitectureOutputSchema } from "./dto";
import { approvedDesignSystemBriefOutputSchema } from "../../gates/design-approval-gate";

export const techArchitecture = createStep({
  id: "tech-architecture",
  description: "Draft system architecture, API surface, storage choices",
  inputSchema: approvedDesignSystemBriefOutputSchema,
  outputSchema: techArchitectureOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `Create a technical architecture.
Include: systemDiagram (text summary), apis (endpoints list), storage (choices and rationale).
Return ONLY JSON: { techArchitecture: string }.

context:
- problemStatement: ${inputData.problemStatement}
- keyFindings: ${(inputData.keyFindings ?? []).join("; ")}
- designSystemBrief: ${inputData.designSystemBrief ?? ""}`;
    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of (response as any).textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { techArchitecture?: string };
    if (!json.techArchitecture)
      throw new Error("Failed to produce techArchitecture");

    return {
      designSystemBrief: inputData.designSystemBrief,
      techArchitecture: json.techArchitecture,
    };
  },
});

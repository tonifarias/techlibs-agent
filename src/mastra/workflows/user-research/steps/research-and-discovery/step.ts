import { createStep } from "@mastra/core/workflows";
import { researchInputSchema, researchOutputSchema } from "./dto";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";

export const researchAndDiscovery = createStep({
  id: "research-and-discovery",
  description:
    "Gather market/competitor/feasibility via agents/tools and summarize",
  inputSchema: researchInputSchema,
  outputSchema: researchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error("Input data not found");

    const prompt = `You are a Product Owner.
Given the problem statement and context, produce concise research.
Return ONLY valid JSON with keys: researchBrief (string), keyFindings (string[]).

problemStatement: ${inputData.problemStatement}
companyContext: ${inputData.companyContext ?? ""}
constraints: ${(inputData.constraints ?? [])
      .map((c: any) =>
        typeof c === "string" ? c : `${c.category}:${c.detail}`
      )
      .join(", ")}
assets: ${(inputData.assets ?? []).join(", ")}`;

    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const response = await agent.generate([{ role: "user", content: prompt }]);
    const text = response.text;
    const json = extractFirstJsonObject(text);

    if (
      !json?.researchBrief ||
      !Array.isArray(json?.keyFindings) ||
      json.keyFindings.length === 0
    ) {
      throw new Error("Failed to produce researchBrief/keyFindings");
    }

    return {
      problemStatement: inputData.problemStatement,
      researchBrief: json.researchBrief,
      keyFindings: json.keyFindings,
    };
  },
});

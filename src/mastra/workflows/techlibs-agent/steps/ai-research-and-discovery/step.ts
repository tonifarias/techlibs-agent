import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { aiResearchInputSchema, aiResearchOutputSchema } from "./dto";

export const aiResearchAndDiscovery = createStep({
  id: "ai-research-and-discovery",
  description:
    "Conduct comprehensive market research and feasibility analysis with context extraction",
  inputSchema: aiResearchInputSchema,
  outputSchema: aiResearchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error("Input data not found");

    // Enhanced context extraction from text-based inputs
    const contextSummary = {
      problemStatement: inputData.problemStatement,
      companyContext: inputData.companyContext || "Not specified",
      constraints: inputData.constraints || "None specified",
      assets: inputData.assets || "None specified",
      targetAudience: inputData.targetAudience || "To be determined",
      successCriteria: inputData.successCriteria || "To be defined",
      priority: inputData.priority || "medium"
    };

    const prompt = `You are an expert Product Research Analyst. Your role is to conduct thorough, specific research based on the provided context.

CONTEXT ANALYSIS:
- Problem Statement: ${contextSummary.problemStatement}
- Company Context: ${contextSummary.companyContext}
- Constraints: ${contextSummary.constraints}
- Available Assets: ${contextSummary.assets}
- Target Audience: ${contextSummary.targetAudience}
- Success Criteria: ${contextSummary.successCriteria}
- Priority Level: ${contextSummary.priority}

RESEARCH REQUIREMENTS:
1. Conduct SPECIFIC research relevant to this exact problem - avoid generic industry data
2. Focus on actionable insights that inform product decisions
3. Identify market opportunities, competitive landscape, and feasibility factors
4. Extract constraints and requirements from the context provided
5. Highlight critical success factors and potential risks

QUALITY GATES:
✓ Research must be specific to the stated problem, not generic
✓ Insights must be actionable for product development
✓ Must identify at least 3 key findings that inform next steps
✓ Must validate feasibility within stated constraints

Return ONLY valid JSON in this exact format:
{
  "researchBrief": "Comprehensive research summary specific to the problem",
  "keyFindings": ["Finding 1: Specific insight", "Finding 2: Market opportunity", "Finding 3: Technical feasibility"]
}`;

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
      ...inputData,
      researchBrief: json.researchBrief,
      keyFindings: json.keyFindings,
    };
  },
});

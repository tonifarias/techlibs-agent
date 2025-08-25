import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export function extractFirstJsonObject(text: string): any {
  try {
    return JSON.parse(text);
  } catch (_) {
    const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1]);
      } catch {}
    }
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
    }
  }
  throw new Error("Unable to parse JSON from agent response");
}

export const jsonExtractorTool = createTool({
  id: "json-extractor",
  description:
    "Extracts the first valid JSON object from a possibly messy LLM response (supports fenced code blocks)",
  inputSchema: z.object({
    text: z
      .string()
      .describe("Raw text possibly containing valid JSON or fenced JSON block"),
  }),
  outputSchema: z.object({
    json: z.any().describe("Parsed JSON object extracted from the text"),
  }),
  execute: async (ctx) => {
    const { text } = (ctx as any)?.context as { text: string };
    const json = extractFirstJsonObject(text);
    return { json } as any;
  },
});

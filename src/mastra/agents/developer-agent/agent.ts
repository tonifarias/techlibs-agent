import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { memoryTool } from "../../tools/memory-tool";
import { prompt } from "./prompt";
import { githubMCPClient } from "../../tools/github/tool";

export const developerAgent = new Agent({
  name: "Developer Agent",
  instructions: prompt,
  model: openai("gpt-4o-mini"),
  tools: async () => {
    const mcpTools = await githubMCPClient.getTools();
    return { memoryTool, ...mcpTools };
  },
});

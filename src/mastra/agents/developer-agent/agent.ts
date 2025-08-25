import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import type { ToolsInput } from "@mastra/core/agent";
import { memoryTool } from "../../tools/memory-tool";
import { prompt } from "./prompt";
import { githubMCPClient } from "../../tools/github/tool";

export const developerAgent = new Agent({
  name: "Developer Agent",
  instructions: prompt,
  model: openai("gpt-4o-mini"),
  tools: async () => {
    try {
      const patPresent = Boolean(process.env.GITHUB_MCP_PAT);
      if (!patPresent) {
        return { memoryTool } as ToolsInput;
      }
      const mcpTools = await githubMCPClient.getTools();
      return { memoryTool, ...mcpTools } as ToolsInput;
    } catch (error) {
      console.warn("[developerAgent] MCP tools unavailable, continuing without GitHub MCP:", (error as Error)?.message);
      return { memoryTool } as ToolsInput;
    }
  },
});

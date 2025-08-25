import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import type { ToolsInput } from "@mastra/core/agent";
import { z } from "zod";
import { ParallizerInputSchema } from "./dtos";
import { Scheduler } from "./scheduler";
import { memoryTool } from "../../tools/memory-tool";
import { githubMCPClient } from "../../tools/github/tool";

// Internal execution tool to run the scheduler
export const parallizerRunTool = createTool({
  id: "parallizer.run",
  description: "Execute a DAG of tasks with parallelism, retries, and timeouts",
  inputSchema: ParallizerInputSchema,
  outputSchema: z.any(),
  execute: async ({ context, mastra, runtimeContext }) => {
    const input = context;
    const scheduler = new Scheduler(async (task, _signal) => {
      if (task.type === "tool") {
        const parAgent = mastra?.getAgent?.("parallizerAgent");
        const toolsMap = parAgent ? await parAgent.getTools({ runtimeContext: runtimeContext as any }) : ({} as ToolsInput);
        const tool = (toolsMap as any)?.[task.target];
        if (!tool?.execute) throw new Error(`Tool not found: ${task.target}`);
        return await tool.execute({ context: task.payload, mastra, runtimeContext } as any);
      }
      if (task.type === "agent") {
        const agent = mastra?.getAgent?.(task.target);
        if (!agent) throw new Error(`Agent not found: ${task.target}`);
        // Enforce JSON-only prompt by wrapping payload
        const userContent = typeof task.payload === "string" ? task.payload : JSON.stringify(task.payload);
        const res = await agent.generate([
          { role: "system", content: "Respond with strict JSON only. No prose." },
          { role: "user", content: userContent },
        ]);
        // Try parse JSON; minimal corrective retry once
        try {
          return JSON.parse((res as any).text ?? "");
        } catch (_) {
          const res2 = await agent.generate([
            { role: "system", content: "Output MUST be valid JSON. If not, correct and output only JSON." },
            { role: "user", content: userContent },
          ]);
          return JSON.parse((res2 as any).text ?? "");
        }
      }
      throw new Error(`Unsupported task type: ${task.type}`);
    });

    return await scheduler.run(input);
  },
});

export const parallizerAgent = new Agent({
  name: "parallizerAgent",
  instructions: "You orchestrate execution of parallel tasks. Always call parallizer.run with provided DAG.",
  model: openai("gpt-4o-mini"),
  tools: async () => {
    // Merge memory tool and MCP tools (optional)
    try {
      const patPresent = Boolean(process.env.GITHUB_MCP_PAT);
      const mcpTools = patPresent ? await githubMCPClient.getTools() : {};
      return { memoryTool, ...mcpTools, parallizerRunTool } as ToolsInput;
    } catch (e) {
      console.warn("[parallizerAgent] MCP tools unavailable:", (e as Error)?.message);
      return { memoryTool, parallizerRunTool } as ToolsInput;
    }
  },
});


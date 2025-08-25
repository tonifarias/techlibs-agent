import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mastra } from "../index";

const getAvailableAgentsSchema = z.object({
  includeDetails: z
    .boolean()
    .optional()
    .describe("Whether to include detailed agent information"),
});

const getAgentByNameSchema = z.object({
  agentName: z.string().describe("The name of the agent to retrieve"),
});

export const agentDiscoveryTool = createTool({
  id: "agent_discovery",
  description: "Discover and interact with available Mastra agents",
  inputSchema: z.union([getAvailableAgentsSchema, getAgentByNameSchema]),
  execute: async ({ context }) => {
    const agentsRecord = mastra.getAgents();

    if ("agentName" in context) {
      const agentName = context.agentName as keyof typeof agentsRecord;
      const agent = agentsRecord[agentName];
      if (!agent) {
        return {
          error: `Agent '${String(agentName)}' not found`,
          availableAgents: Object.keys(agentsRecord),
        };
      }

      return {
        agentName: String(agentName),
        agent: {
          name: agent.name,
          instructions: agent.instructions,
          model: (agent as any).model?.id || "Unknown",
          hasTools: Boolean((agent as any).tools),
        },
      };
    } else {
      const includeDetails = (context as any).includeDetails as
        | boolean
        | undefined;
      const agents = Object.keys(agentsRecord).map((key) => {
        const agent = agentsRecord[key as keyof typeof agentsRecord] as any;
        return {
          name: key,
          agentName: agent.name,
          hasTools: Boolean(agent.tools),
          model: agent.model?.id || "Unknown",
          ...(includeDetails && {
            instructions: agent.instructions,
            tools: agent.tools ? "Available" : "None",
          }),
        };
      });

      return {
        availableAgents: agents,
        totalCount: agents.length,
      };
    }
  },
});

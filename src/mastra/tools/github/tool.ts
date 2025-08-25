import { MCPClient } from "@mastra/mcp";

const GITHUB_MCP_URL = new URL("https://api.githubcopilot.com/mcp/");
const pat = process.env.GITHUB_MCP_PAT;

export const githubMCPClient = new MCPClient({
  servers: {
    github: {
      url: GITHUB_MCP_URL,
      requestInit: {
        headers: {
          Authorization: `Bearer ${pat}`,
        },
      },
    },
  },
});

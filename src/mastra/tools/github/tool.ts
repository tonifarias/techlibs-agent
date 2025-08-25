import { MCPClient } from "@mastra/mcp";

const DEFAULT_GITHUB_MCP_URL = "https://api.githubcopilot.com/mcp/";
const GITHUB_MCP_URL = process.env.GITHUB_MCP_URL ?? DEFAULT_GITHUB_MCP_URL;
const GITHUB_MCP_PAT = process.env.GITHUB_MCP_PAT;

export const githubMCPClient = new MCPClient({
  id: "github-mcp-client",
  servers: GITHUB_MCP_PAT
    ? {
        github: {
          url: new URL(GITHUB_MCP_URL),
          requestInit: {
            headers: {
              Authorization: `Bearer ${GITHUB_MCP_PAT}`,
            },
          },
        },
      }
    : {},
});

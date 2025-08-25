import { MCPClient } from "@mastra/mcp";

const GITHUB_MCP_URL = new URL("https://api.githubcopilot.com/mcp/");
const pat = process.env.GITHUB_MCP_PAT;
if (!pat) {
  console.warn(
    "[githubMCPClient] GITHUB_MCP_PAT not set; GitHub MCP tools will be unavailable."
  );
}

export const githubMCPClient = new MCPClient({
  servers: pat
    ? {
        github: {
          url: GITHUB_MCP_URL,
          requestInit: {
            headers: { Authorization: `Bearer ${pat}` },
          },
        },
      }
    : {},
});

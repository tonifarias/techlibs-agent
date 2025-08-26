import { MCPClient } from "@mastra/mcp";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_MCP_PAT;
if (!GITHUB_ACCESS_TOKEN) {
  console.warn(
    "[githubMCPClient] GITHUB_ACCESS_TOKEN not set; GitHub MCP tools will be unavailable."
  );
}

export const githubMCPClient = new MCPClient({
  id: "github-mcp-client",
  servers: GITHUB_ACCESS_TOKEN
    ? {
        github: {
          command: "npx",
          args: ["@andrebuzeli/github-mcp-v2"],
          env: {
            GITHUB_ACCESS_TOKEN: GITHUB_ACCESS_TOKEN,
          },
        },
      }
    : {},
});

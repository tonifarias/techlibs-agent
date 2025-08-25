import { MCPClient } from "@mastra/mcp";

/**
 * GitHub MCP client factory and helpers
 *
 * Connects to the GitHub Copilot MCP HTTP server with the required Authorization header.
 *
 * Server config:
 *  - type: http
 *  - url: https://api.githubcopilot.com/mcp/
 *  - headers: { Authorization: `Bearer ${input:github_mcp_pat}` }
 */

const GITHUB_MCP_URL = new URL("https://api.githubcopilot.com/mcp/");

/**
 * Create an MCP client connected to GitHub's MCP server.
 *
 * The token can be provided directly or read from environment variables:
 *  - GITHUB_MCP_PAT (preferred)
 *  - GITHUB_TOKEN (fallback)
 */
export function createGithubMcpClient(token?: string) {
  const pat = token || process.env.GITHUB_MCP_PAT || process.env.GITHUB_TOKEN;

  if (!pat) {
    throw new Error(
      "Missing GitHub MCP token. Provide it as an argument or set GITHUB_MCP_PAT (or GITHUB_TOKEN)."
    );
  }

  return new MCPClient({
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
}

/**
 * Fetch all available tools from the GitHub MCP server for static agent configuration.
 */
export async function getGithubMcpTools(token?: string) {
  const mcp = createGithubMcpClient(token);
  return mcp.getTools();
}

/**
 * Fetch toolsets for dynamic, per-request configuration.
 */
export async function getGithubMcpToolsets(token?: string) {
  const mcp = createGithubMcpClient(token);
  return mcp.getToolsets();
}

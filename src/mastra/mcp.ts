import { MCPClient } from "@mastra/mcp";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_MCP_PAT;
const FIREFLIES_MCP_URL =
  process.env.FIREFLIES_MCP_URL ?? "https://api.fireflies.ai/mcp";
const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY;
const FILESYSTEM_DIR = process.env.MCP_FILESYSTEM_DIR; // Optional

export const mcp = new MCPClient({
  id: "core-mcp-client",
  servers: {
    ...(FILESYSTEM_DIR
      ? {
          filesystem: {
            command: "pnpm",
            args: [
              "dlx",
              "@modelcontextprotocol/server-filesystem",
              FILESYSTEM_DIR,
            ],
          },
        }
      : {}),
    ...(GITHUB_ACCESS_TOKEN
      ? {
          github: {
            command: "npx",
            args: ["@andrebuzeli/github-mcp-v2"],
            env: {
              GITHUB_ACCESS_TOKEN: GITHUB_ACCESS_TOKEN,
            },
          },
        }
      : {}),
    ...(FIREFLIES_API_KEY
      ? {
          fireflies: {
            command: "pnpm",
            args: [
              "dlx",
              "mcp-remote",
              FIREFLIES_MCP_URL,
              "--header",
              `Authorization: Bearer ${FIREFLIES_API_KEY}`,
            ],
          },
        }
      : {}),
  },
});

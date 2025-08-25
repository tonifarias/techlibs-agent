import { MCPClient } from "@mastra/mcp";

// Configure MCPClient to connect to your server(s)
// process.env.GITHUB_MCP_PAT
export const mcp = new MCPClient({
  servers: {
    filesystem: {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Downloads",
      ],
    },
  },
});

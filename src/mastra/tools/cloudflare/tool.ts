import { MCPClient } from "@mastra/mcp";

const CLOUDFLARE_MCP_URL = process.env.CLOUDFLARE_MCP_URL;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Create a dedicated MCP client for Cloudflare. This mirrors the GitHub MCP client pattern
// and relies on environment variables to configure the remote server URL and auth.
export const cloudflareMCPClient = new MCPClient({
  id: "cloudflare-mcp-client",
  servers: CLOUDFLARE_MCP_URL
    ? {
        cloudflare: {
          url: new URL(CLOUDFLARE_MCP_URL),
          requestInit: {
            headers: CLOUDFLARE_API_TOKEN
              ? {
                  Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                }
              : undefined,
          },
        },
      }
    : {},
});

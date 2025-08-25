import { MCPServer } from "@mastra/mcp";
import { mastra } from "./index";

// Public MCP server exposing all registered agents and workflows from Mastra
export const publicMCPServer = new MCPServer({
  name: "techlibs-agent-mcp",
  version: "1.0.0",
  description: "Public MCP endpoint exposing TechLibs agents and workflows",
  // tools can be empty; agents/workflows will be converted into tools
  tools: {},
  agents: mastra.getAgents?.(),
  workflows: mastra.getWorkflows?.(),
});

// Helper to wire HTTP requests when running under a generic Node server
export async function handleMCPHttpRequest(req: any, res: any) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Streamable HTTP transport for unified MCP-over-HTTP
    if (url.pathname.startsWith("/api/mcp/techlibs-agent-mcp/mcp")) {
      await publicMCPServer.startHTTP({
        url,
        httpPath: "/api/mcp/techlibs-agent-mcp/mcp",
        req,
        res,
      });
      return;
    }

    // SSE endpoints for MCP
    if (
      url.pathname === "/api/mcp/techlibs-agent-mcp/sse" ||
      url.pathname === "/api/mcp/techlibs-agent-mcp/message"
    ) {
      await publicMCPServer.startSSE({
        url,
        ssePath: "/api/mcp/techlibs-agent-mcp/sse",
        messagePath: "/api/mcp/techlibs-agent-mcp/message",
        req,
        res,
      });
      return;
    }

    res.writeHead(404);
    res.end();
  } catch (e) {
    res.writeHead(500);
    res.end("MCP server error");
  }
}

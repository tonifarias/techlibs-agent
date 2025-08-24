import { MCPClient } from "@mastra/mcp";
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

// Configure memory storage
const memoryStorage = new LibSQLStore({
  url: 'file:../mastra.db', // Persistent storage for memory
});

// Configure MCPClient to connect to your server(s)
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
    // Add memory server configuration
    memory: {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-memory",
      ],
    },
  },
  // Configure memory for MCP
  memory: new Memory({
    storage: memoryStorage,
  }),
});
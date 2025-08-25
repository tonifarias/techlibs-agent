import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const memoryTool = createTool({
  id: "memory-operations",
  description: "Memory operations for storing and retrieving information",
  inputSchema: z.object({
    operation: z
      .enum(["store", "retrieve", "delete", "list"])
      .describe("Memory operation to perform"),
    key: z
      .string()
      .optional()
      .describe(
        "Key for storing/retrieving data (required for store, retrieve, delete)"
      ),
    value: z
      .string()
      .optional()
      .describe("Value to store (required for store operation)"),
    namespace: z
      .string()
      .optional()
      .describe("Namespace for organizing memory (optional)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    message: z.string(),
  }),
  execute: async (ctx) => {
    const { operation, key, value, namespace } = (ctx as any)?.context as {
      operation: "store" | "retrieve" | "delete" | "list";
      key?: string;
      value?: string;
      namespace?: string;
    };
    const memory = (ctx as any)?.memory as any;

    try {
      switch (operation) {
        case "store":
          if (!key || !value) {
            return {
              success: false,
              message: "Key and value are required for store operation",
            };
          }
          // Store the memory using Mastra's memory system
          await memory?.set(key, value, { namespace });
          return {
            success: true,
            message: `Successfully stored memory with key: ${key}`,
          };

        case "retrieve":
          if (!key) {
            return {
              success: false,
              message: "Key is required for retrieve operation",
            };
          }
          const retrievedValue = await memory?.get(key, { namespace });
          return {
            success: true,
            data: retrievedValue,
            message: retrievedValue
              ? `Retrieved memory for key: ${key}`
              : `No memory found for key: ${key}`,
          };

        case "delete":
          if (!key) {
            return {
              success: false,
              message: "Key is required for delete operation",
            };
          }
          await memory?.delete(key, { namespace });
          return {
            success: true,
            message: `Successfully deleted memory with key: ${key}`,
          };

        case "list":
          const memories = await memory?.list({ namespace });
          return {
            success: true,
            data: memories,
            message: `Found ${memories?.length || 0} memories`,
          };

        default:
          return {
            success: false,
            message: `Unknown operation: ${operation}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Memory operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
});

import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { beforeEach, describe, expect, it } from "vitest";
import { memoryTool } from "../../src/mastra/tools/memory-tool";

describe("Memory Tool", () => {
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory({
      storage: new LibSQLStore({
        url: ":memory:",
      }),
    });
  });

  it("should store and retrieve data", async () => {
    const result = await memoryTool.execute({
      context: {
        operation: "store",
        key: "test-key",
        value: "test-value",
        namespace: "test-namespace",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Successfully stored memory");

    const retrieveResult = await memoryTool.execute({
      context: {
        operation: "retrieve",
        key: "test-key",
        namespace: "test-namespace",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(retrieveResult.success).toBe(true);
    expect(retrieveResult.data).toBe("test-value");
  });

  it("should handle missing key for store operation", async () => {
    const result = await memoryTool.execute({
      context: {
        operation: "store",
        value: "test-value",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Key and value are required");
  });

  it("should handle missing key for retrieve operation", async () => {
    const result = await memoryTool.execute({
      context: {
        operation: "retrieve",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Key is required");
  });

  it("should delete stored data", async () => {
    await memoryTool.execute({
      context: {
        operation: "store",
        key: "delete-test",
        value: "delete-value",
      },
      runtimeContext: {} as any,
      memory,
    });

    const deleteResult = await memoryTool.execute({
      context: {
        operation: "delete",
        key: "delete-test",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.message).toContain("Successfully deleted memory");

    const retrieveResult = await memoryTool.execute({
      context: {
        operation: "retrieve",
        key: "delete-test",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(retrieveResult.data).toBeUndefined();
  });

  it("should list stored memories", async () => {
    await memoryTool.execute({
      context: {
        operation: "store",
        key: "key1",
        value: "value1",
      },
      runtimeContext: {} as any,
      memory,
    });

    await memoryTool.execute({
      context: {
        operation: "store",
        key: "key2",
        value: "value2",
      },
      runtimeContext: {} as any,
      memory,
    });

    const listResult = await memoryTool.execute({
      context: {
        operation: "list",
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(listResult.success).toBe(true);
    expect(listResult.data).toBeDefined();
    expect(Array.isArray(listResult.data)).toBe(true);
  });

  it("should handle unknown operations", async () => {
    const result = await memoryTool.execute({
      context: {
        operation: "unknown" as any,
      },
      runtimeContext: {} as any,
      memory,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Unknown operation");
  });
});

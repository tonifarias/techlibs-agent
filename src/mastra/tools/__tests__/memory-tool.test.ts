import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { memoryTool } from '../memory-tool';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

describe('Memory Tool', () => {
  let memory: Memory;

  beforeEach(() => {
    // Use in-memory storage for tests
    memory = new Memory({
      storage: new LibSQLStore({
        url: ':memory:',
      }),
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await memory.clear();
  });

  it('should store and retrieve data', async () => {
    const result = await memoryTool.execute({
      operation: 'store',
      key: 'test-key',
      value: 'test-value',
      namespace: 'test-namespace',
    }, { memory });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Successfully stored memory');

    const retrieveResult = await memoryTool.execute({
      operation: 'retrieve',
      key: 'test-key',
      namespace: 'test-namespace',
    }, { memory });

    expect(retrieveResult.success).toBe(true);
    expect(retrieveResult.data).toBe('test-value');
  });

  it('should handle missing key for store operation', async () => {
    const result = await memoryTool.execute({
      operation: 'store',
      value: 'test-value',
    }, { memory });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Key and value are required');
  });

  it('should handle missing key for retrieve operation', async () => {
    const result = await memoryTool.execute({
      operation: 'retrieve',
    }, { memory });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Key is required');
  });

  it('should delete stored data', async () => {
    // First store some data
    await memoryTool.execute({
      operation: 'store',
      key: 'delete-test',
      value: 'delete-value',
    }, { memory });

    // Then delete it
    const deleteResult = await memoryTool.execute({
      operation: 'delete',
      key: 'delete-test',
    }, { memory });

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.message).toContain('Successfully deleted memory');

    // Verify it's gone
    const retrieveResult = await memoryTool.execute({
      operation: 'retrieve',
      key: 'delete-test',
    }, { memory });

    expect(retrieveResult.data).toBeUndefined();
  });

  it('should list stored memories', async () => {
    // Store multiple memories
    await memoryTool.execute({
      operation: 'store',
      key: 'key1',
      value: 'value1',
    }, { memory });

    await memoryTool.execute({
      operation: 'store',
      key: 'key2',
      value: 'value2',
    }, { memory });

    const listResult = await memoryTool.execute({
      operation: 'list',
    }, { memory });

    expect(listResult.success).toBe(true);
    expect(listResult.data).toBeDefined();
    expect(Array.isArray(listResult.data)).toBe(true);
  });

  it('should handle unknown operations', async () => {
    const result = await memoryTool.execute({
      operation: 'unknown' as any,
    }, { memory });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown operation');
  });
});

import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { memoryTool } from '../../tools/memory-tool';
import { prompt } from './prompt';

// Enhanced memory configuration for context retention
const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db"
  })
});

export const bddSpecialistAgent = new Agent({
  name: 'BDD Specialist',
  instructions: prompt,
  model: openai('gpt-4o-mini'),
  tools: { memoryTool },
  memory, // Add memory support for context retention
  maxSteps: 2, // Control multi-step tool calls for BDD scenarios
});
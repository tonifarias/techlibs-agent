import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memoryTool } from '../../tools/memory-tool';
import { prompt } from './prompt';

export const productOwnerAgent = new Agent({
  name: 'Product Owner',
  instructions: prompt,
  model: openai('gpt-4o-mini'),
  tools: { memoryTool },
});
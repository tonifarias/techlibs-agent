
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { memoryWorkflow } from './workflows/memory-workflow';
import { weatherAgent } from './agents/weather-agent';
import { bddSpecialistAgent } from './agents/bdd-specialist/agent';
import { mcp } from './mcp';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, memoryWorkflow },
  agents: { weatherAgent, bddSpecialistAgent },
  storage: new LibSQLStore({
    // Use persistent storage for telemetry, evals, etc.
    url: 'file:../mastra.db',
  }),
  // Use MCP memory for the main Mastra instance
  memory: mcp.memory,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});


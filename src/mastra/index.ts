import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { productOwner } from "./agents/productOwner";
import { weatherAgent } from "./agents/weather-agent";
import { memoryWorkflow } from "./workflows/memory-workflow";
import { techlibsAgentWorkflow } from "./workflows/techlibs-agent-workflow";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, memoryWorkflow, techlibsAgentWorkflow },
  agents: { weatherAgent, productOwner },
  storage: new LibSQLStore({
    // Use persistent storage for telemetry, evals, etc.
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});

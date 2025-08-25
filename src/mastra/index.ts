import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { bddSpecialistAgent } from "./agents/bdd-specialist/agent";
import { codeReviewerAgent } from "./agents/code-reviewer/agent";
import { developerAgent } from "./agents/developer-agent/agent";
import { firefliesAgent } from "./agents/fireflies-agent/agent";
import { mastraArchitectAgent } from "./agents/mastra-architect/agent";
import { parallizerAgent } from "./agents/parallizer/agent";
import { productOwnerAgent } from "./agents/product-owner/agent";
import { weatherAgent } from "./agents/weather-agent";
import { firefliesWorkflow } from "./workflows/fireflies-workflow";
import { memoryWorkflow } from "./workflows/memory-workflow";
import { techlibsAgentWorkflow } from "./workflows/techlibs-agent-workflow";
import { techlibsAgentWorkflow as modularTechlibsWorkflow } from "./workflows/techlibs-agent/workflow";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
    memoryWorkflow,
    techlibsAgentWorkflow,
    modularTechlibsWorkflow,
    firefliesWorkflow,
  },
  agents: {
    weatherAgent,
    productOwnerAgent,
    bddSpecialistAgent,
    developerAgent,
    codeReviewerAgent,
    firefliesAgent,
    parallizerAgent,
    mastraArchitectAgent,
  },
  storage: new LibSQLStore({
    // Use persistent storage for telemetry, evals, etc.
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});

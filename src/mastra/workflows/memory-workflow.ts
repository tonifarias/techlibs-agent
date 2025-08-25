import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const echoStep = createStep({
  id: "memory-echo",
  description: "Echoes the provided text (placeholder for memory demo)",
  inputSchema: z.object({
    text: z.string().describe("Text to echo back"),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    return { text: inputData.text };
  },
});

const memoryWorkflow = createWorkflow({
  id: "memory-workflow",
  inputSchema: z.object({
    text: z.string().describe("Text to echo back"),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
}).then(echoStep);

memoryWorkflow.commit();

export { memoryWorkflow };


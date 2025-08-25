import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import {
  getFirefliesTranscriptTool,
  getFirefliesUserTool,
  searchFirefliesTranscriptsTool,
} from "../../tools/fireflies-tool";
import { firefliesPrompt } from "./prompt";

export const firefliesAgent = new Agent({
  name: "Fireflies Meeting Analyst",
  instructions: firefliesPrompt,
  model: openai("gpt-4o-mini"),
  tools: {
    getFirefliesUserTool,
    getFirefliesTranscriptTool,
    searchFirefliesTranscriptsTool,
  },
});

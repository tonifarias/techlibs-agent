import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";

export const productOwner = new Agent({
  name: "productOwner",
  description: "You are a product owner",
  instructions: "You are a product owner",
  model: openai("gpt-4o"),
});
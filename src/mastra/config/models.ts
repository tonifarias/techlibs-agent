import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

// Model configuration
export const MODEL_CONFIG = {
  CLAUDE: {
    "claude-3-5-sonnet-20241022": "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022": "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229": "claude-3-opus-20240229",
  },
  OPENAI: {
    "gpt-4o": "gpt-4o",
    "gpt-4o-mini": "gpt-4o-mini",
    "gpt-4-turbo": "gpt-4-turbo",
  },
} as const;

// Default model selection
export const DEFAULT_MODELS = {
  CLAUDE: "claude-3-5-sonnet-20241022",
  OPENAI: "gpt-4o-mini",
} as const;

// Model factory functions
export function createClaudeModel(modelName: string = DEFAULT_MODELS.CLAUDE) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required for Claude models");
  }
  return anthropic(modelName);
}

export function createOpenAIModel(modelName: string = DEFAULT_MODELS.OPENAI) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for OpenAI models");
  }
  return openai(modelName);
}

// Get available models
export function getAvailableModels() {
  return {
    claude: Object.keys(MODEL_CONFIG.CLAUDE),
    openai: Object.keys(MODEL_CONFIG.OPENAI),
  };
}

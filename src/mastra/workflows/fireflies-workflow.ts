import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const firefliesInputSchema = z.object({
  action: z.enum([
    "analyze-recent",
    "search-meetings",
    "get-action-items",
    "meeting-summary",
  ]),
  query: z
    .string()
    .optional()
    .describe("Search query for finding specific meetings"),
  transcriptId: z
    .string()
    .optional()
    .describe("Specific transcript ID to analyze"),
  dateRange: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional()
    .describe("Date range for searching meetings"),
  participants: z
    .array(z.string())
    .optional()
    .describe("Filter by participant emails"),
});

const firefliesOutputSchema = z.object({
  analysis: z.string(),
  metadata: z.object({
    action: z.string(),
    timestamp: z.string(),
  }),
});

const firefliesExecuteStep = createStep({
  id: "fireflies-exec",
  description: "Run Fireflies meeting analysis actions",
  inputSchema: firefliesInputSchema,
  outputSchema: firefliesOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("firefliesAgent");
    if (!agent) throw new Error("Fireflies agent not found");

    let prompt = "";

    switch (inputData.action) {
      case "analyze-recent":
        prompt = `Please analyze my recent meetings from the last 7 days. 
                  Provide a summary of key topics discussed, decisions made, and action items across all meetings.`;
        break;

      case "search-meetings":
        prompt = `Search for meetings ${
          inputData.query ? `containing "${inputData.query}"` : ""
        } 
                  ${
                    inputData.dateRange
                      ? `between ${inputData.dateRange.startDate} and ${inputData.dateRange.endDate}`
                      : ""
                  }
                  ${
                    inputData.participants
                      ? `with participants: ${inputData.participants.join(
                          ", "
                        )}`
                      : ""
                  }
                  and provide a summary of the results.`;
        break;

      case "get-action-items":
        if (inputData.transcriptId) {
          prompt = `Analyze the transcript ${inputData.transcriptId} and extract all action items with their assignees.
                    Format them as a clear, actionable list.`;
        } else {
          prompt = `Search recent meetings and compile all action items from the last week.
                    Group them by assignee and priority.`;
        }
        break;

      case "meeting-summary":
        if (inputData.transcriptId) {
          prompt = `Provide a comprehensive summary of meeting ${inputData.transcriptId} including:
                    1. Key topics discussed
                    2. Decisions made
                    3. Action items and assignees
                    4. Next steps
                    5. Meeting effectiveness assessment`;
        } else {
          prompt = `Analyze my meetings from the last month and provide:
                    1. Most discussed topics
                    2. Meeting patterns and frequency
                    3. Common action items
                    4. Suggestions for improving meeting effectiveness`;
        }
        break;
    }

    const response = await agent.generate([{ role: "user", content: prompt }]);

    return {
      analysis: response.text,
      metadata: {
        action: inputData.action,
        timestamp: new Date().toISOString(),
      },
    };
  },
});

export const firefliesWorkflow = createWorkflow({
  id: "fireflies-meeting-analysis",
  inputSchema: firefliesInputSchema,
  outputSchema: firefliesOutputSchema,
}).then(firefliesExecuteStep);

firefliesWorkflow.commit();

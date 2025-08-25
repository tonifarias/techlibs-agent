import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Fireflies API configuration
const FIREFLIES_API_BASE = "https://api.fireflies.ai/v1";
const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY;

// Helper function to make authenticated requests to Fireflies API
async function firefliesApiCall(endpoint: string, options: RequestInit = {}) {
  if (!FIREFLIES_API_KEY) {
    throw new Error("FIREFLIES_API_KEY environment variable is required");
  }

  const url = `${FIREFLIES_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${FIREFLIES_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Fireflies API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Tool to get user profile information
export const getFirefliesUserTool = createTool({
  id: "get-fireflies-user",
  description: "Get Fireflies user profile information",
  inputSchema: z.object({}),
  outputSchema: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
    organizationId: z.string().optional(),
    createdAt: z.string().optional(),
  }),
  execute: async () => {
    try {
      const result = await firefliesApiCall("/user");
      return result;
    } catch (error) {
      throw new Error(`Failed to get Fireflies user: ${error}`);
    }
  },
});

// Tool to get a specific transcript
export const getFirefliesTranscriptTool = createTool({
  id: "get-fireflies-transcript",
  description: "Retrieve a full transcript using transcriptId",
  inputSchema: z.object({
    transcriptId: z.string().describe("The ID of the transcript to retrieve"),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    duration: z.number().optional(),
    participants: z
      .array(
        z.object({
          name: z.string(),
          email: z.string().optional(),
        })
      )
      .optional(),
    transcript: z.string(),
    summary: z.string().optional(),
    actionItems: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    try {
      const result = await firefliesApiCall(
        `/transcripts/${context.transcriptId}`
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to get transcript: ${error}`);
    }
  },
});

// Tool to search transcripts
export const searchFirefliesTranscriptsTool = createTool({
  id: "search-fireflies-transcripts",
  description: "Search across past transcripts with filters",
  inputSchema: z.object({
    query: z.string().optional().describe("Search query to filter transcripts"),
    startDate: z
      .string()
      .optional()
      .describe("Start date for filtering (ISO format)"),
    endDate: z
      .string()
      .optional()
      .describe("End date for filtering (ISO format)"),
    participants: z
      .array(z.string())
      .optional()
      .describe("Filter by participant emails"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of results to return"),
    offset: z.number().optional().default(0).describe("Offset for pagination"),
  }),
  outputSchema: z.object({
    transcripts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        date: z.string(),
        duration: z.number().optional(),
        participants: z
          .array(
            z.object({
              name: z.string(),
              email: z.string().optional(),
            })
          )
          .optional(),
        summary: z.string().optional(),
      })
    ),
    total: z.number(),
    hasMore: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const params = new URLSearchParams();

      if (context.query) params.append("query", context.query);
      if (context.startDate) params.append("start_date", context.startDate);
      if (context.endDate) params.append("end_date", context.endDate);
      if (context.participants)
        params.append("participants", context.participants.join(","));
      if (context.limit) params.append("limit", context.limit.toString());
      if (context.offset) params.append("offset", context.offset.toString());

      const result = await firefliesApiCall(
        `/transcripts?${params.toString()}`
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to search transcripts: ${error}`);
    }
  },
});

// Tool to list active products
export const listFirefliesActiveProductsTool = createTool({
  id: "list-fireflies-active-products",
  description: "List all active products in Fireflies",
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .default(50)
      .describe("Maximum number of products to return"),
    offset: z.number().optional().default(0).describe("Offset for pagination"),
    status: z
      .enum(["active", "inactive", "all"])
      .optional()
      .default("active")
      .describe("Filter by product status"),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        status: z.string(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        organizationId: z.string().optional(),
        features: z.array(z.string()).optional(),
        pricing: z
          .object({
            plan: z.string().optional(),
            cost: z.number().optional(),
            currency: z.string().optional(),
          })
          .optional(),
      })
    ),
    total: z.number(),
    hasMore: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const params = new URLSearchParams();

      if (context.limit) params.append("limit", context.limit.toString());
      if (context.offset) params.append("offset", context.offset.toString());
      if (context.status) params.append("status", context.status);

      const result = await firefliesApiCall(`/products?${params.toString()}`);
      return result;
    } catch (error) {
      throw new Error(`Failed to list active products: ${error}`);
    }
  },
});

// Tool to list active apps/integrations
export const listFirefliesActiveAppsTool = createTool({
  id: "list-fireflies-active-apps",
  description: "List all active apps and integrations in Fireflies",
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .default(50)
      .describe("Maximum number of apps to return"),
    offset: z.number().optional().default(0).describe("Offset for pagination"),
    status: z
      .enum(["active", "inactive", "all"])
      .optional()
      .default("active")
      .describe("Filter by app status"),
    category: z
      .string()
      .optional()
      .describe(
        "Filter by app category (e.g., 'calendar', 'crm', 'communication')"
      ),
  }),
  outputSchema: z.object({
    apps: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        status: z.string(),
        category: z.string().optional(),
        icon: z.string().optional(),
        url: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        organizationId: z.string().optional(),
        features: z.array(z.string()).optional(),
        permissions: z.array(z.string()).optional(),
        isConnected: z.boolean().optional(),
        lastSync: z.string().optional(),
      })
    ),
    total: z.number(),
    hasMore: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const params = new URLSearchParams();

      if (context.limit) params.append("limit", context.limit.toString());
      if (context.offset) params.append("offset", context.offset.toString());
      if (context.status) params.append("status", context.status);
      if (context.category) params.append("category", context.category);

      const result = await firefliesApiCall(`/apps?${params.toString()}`);
      return result;
    } catch (error) {
      throw new Error(`Failed to list active apps: ${error}`);
    }
  },
});

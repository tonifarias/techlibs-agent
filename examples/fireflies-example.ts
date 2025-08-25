import { config } from "dotenv";
import { mastra } from "../src/mastra";

config();

async function runFirefliesExample() {
  console.log("🔥 Fireflies Meeting Analysis Example\n");

  try {
    // Example 1: Analyze recent meetings
    console.log("1. Analyzing recent meetings...");
    const recentMeetingsResult =
      await mastra.workflows.firefliesWorkflow.execute({
        action: "analyze-recent",
      });
    console.log("Recent meetings analysis:", recentMeetingsResult.analysis);
    console.log("\n---\n");

    // Example 2: Search for specific meetings
    console.log('2. Searching for meetings about "project roadmap"...');
    const searchResult = await mastra.workflows.firefliesWorkflow.execute({
      action: "search-meetings",
      query: "project roadmap",
    });
    console.log("Search results:", searchResult.analysis);
    console.log("\n---\n");

    // Example 3: Get action items from recent meetings
    console.log("3. Extracting action items from recent meetings...");
    const actionItemsResult = await mastra.workflows.firefliesWorkflow.execute({
      action: "get-action-items",
    });
    console.log("Action items:", actionItemsResult.analysis);
    console.log("\n---\n");

    // Example 4: Get a comprehensive meeting summary (with a specific transcript ID)
    // Note: Replace 'TRANSCRIPT_ID' with an actual transcript ID from your Fireflies account
    const transcriptId = process.env.FIREFLIES_SAMPLE_TRANSCRIPT_ID;
    if (transcriptId) {
      console.log(`4. Getting summary for transcript ${transcriptId}...`);
      const summaryResult = await mastra.workflows.firefliesWorkflow.execute({
        action: "meeting-summary",
        transcriptId: transcriptId,
      });
      console.log("Meeting summary:", summaryResult.analysis);
    } else {
      console.log("4. Analyzing meeting patterns from the last month...");
      const patternsResult = await mastra.workflows.firefliesWorkflow.execute({
        action: "meeting-summary",
      });
      console.log("Meeting patterns analysis:", patternsResult.analysis);
    }
  } catch (error) {
    console.error("Error running Fireflies example:", error);
    console.log(
      "\nMake sure you have configured Fireflies MCP server correctly:"
    );
    console.log(
      "1. For OAuth: The server will prompt for authentication on first run"
    );
    console.log("2. For API Key: Update the API key in src/mastra/mcp.ts");
  }
}

// Run the example
runFirefliesExample();

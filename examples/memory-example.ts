import { runWorkflow } from "../utils/workflowRunner";

async function demonstrateMemory() {
  console.log("🚀 Starting Memory Demonstration...\n");

  try {
    // Example 1: Store user preferences
    console.log("📝 Example 1: Storing User Preferences");
    const storeResult = await runWorkflow("memoryWorkflow", {
      action: "store_preferences",
      name: "John",
      preferredLocation: "San Francisco",
      temperaturePreference: "moderate",
      activityPreference: ["hiking", "cycling", "coffee shops"],
    });
    console.log("Result:", storeResult.message, "\n");

    // Example 2: Get personalized weather
    console.log("🌤️ Example 2: Getting Personalized Weather");
    const weatherResult = await runWorkflow("memoryWorkflow", {
      action: "get_weather",
      name: "John",
    });
    console.log("Weather Result:", weatherResult.recommendations, "\n");

    // Example 3: Update location history
    console.log("📍 Example 3: Updating Location History");
    const historyResult = await runWorkflow("memoryWorkflow", {
      action: "update_history",
      name: "John",
      location: "Golden Gate Park",
    });
    console.log("History Result:", historyResult.message, "\n");

    // Example 4: Direct agent interaction with memory
    console.log("🤖 Example 4: Direct Agent Interaction with Memory");
    const agent = mastra.getAgent("weatherAgent");
    if (agent) {
      const response = await agent.stream([
        {
          role: "user",
          content:
            "What do you remember about John's preferences? Use the memoryTool to retrieve this information.",
        },
      ]);

      console.log("Agent Response:");
      for await (const chunk of response.textStream) {
        process.stdout.write(chunk);
      }
      console.log("\n");
    }
  } catch (error) {
    console.error("❌ Error during memory demonstration:", error);
  }
}

// Run the demonstration
demonstrateMemory().catch(console.error);

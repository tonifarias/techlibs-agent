import { mastra } from "../src/mastra/index";
import { agentDiscoveryTool } from "../src/mastra/tools/agent-discovery-tool";

async function demonstrateAgentDiscovery() {
  console.log("=== Mastra Agent Discovery Example ===\n");

  // Method 1: Direct access to Mastra agents
  console.log("1. Direct access to available agents:");
  const availableAgents = Object.keys(mastra.agents);
  console.log("Available agents:", availableAgents);
  console.log("Total agents:", availableAgents.length);
  console.log();

  // Method 2: Using the agent discovery tool
  console.log("2. Using agent discovery tool:");

  // Get all agents (basic info)
  const allAgentsResult = await agentDiscoveryTool.execute({
    input: { includeDetails: false },
  });
  console.log("All agents (basic):", JSON.stringify(allAgentsResult, null, 2));
  console.log();

  // Get all agents with details
  const detailedAgentsResult = await agentDiscoveryTool.execute({
    input: { includeDetails: true },
  });
  console.log(
    "All agents (detailed):",
    JSON.stringify(detailedAgentsResult, null, 2)
  );
  console.log();

  // Get specific agent
  const specificAgentResult = await agentDiscoveryTool.execute({
    input: { agentName: "developerAgent" },
  });
  console.log(
    "Developer agent details:",
    JSON.stringify(specificAgentResult, null, 2)
  );
  console.log();

  // Try to get non-existent agent
  const nonExistentAgentResult = await agentDiscoveryTool.execute({
    input: { agentName: "nonExistentAgent" },
  });
  console.log(
    "Non-existent agent result:",
    JSON.stringify(nonExistentAgentResult, null, 2)
  );
  console.log();

  // Method 3: Access specific agent directly
  console.log("3. Direct agent access:");
  const developerAgent = mastra.agents.developerAgent;
  console.log("Developer agent name:", developerAgent.name);
  console.log("Developer agent model:", developerAgent.model?.id);
  console.log("Developer agent has tools:", Boolean(developerAgent.tools));
  console.log();

  // Method 4: List all agents with their properties
  console.log("4. Detailed agent listing:");
  Object.entries(mastra.agents).forEach(([key, agent]) => {
    console.log(`- ${key}:`);
    console.log(`  Name: ${agent.name}`);
    console.log(`  Model: ${agent.model?.id || "Unknown"}`);
    console.log(`  Has Tools: ${Boolean(agent.tools)}`);
    console.log(
      `  Instructions Length: ${agent.instructions?.length || 0} characters`
    );
    console.log();
  });
}

// Run the example
demonstrateAgentDiscovery().catch(console.error);

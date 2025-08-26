import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { sharedContext, getProjectId } from "../../utils/shared-context";
import { userResearchInputSchema, userResearchOutputSchema } from "./dto";

export const userResearch = createStep({
  id: "user-research",
  description: "Produce personas, journeys, and use cases",
  inputSchema: userResearchInputSchema,
  outputSchema: userResearchOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.keyFindings || inputData.keyFindings.length === 0) {
      throw new Error("Cannot proceed: keyFindings is empty");
    }

    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    // Get or recover project context from accumulated state
    const projectId = inputData._projectId || getProjectId(inputData);
    let relevantContext = sharedContext.getRelevantContext(projectId, "user-research");
    
    // If context doesn't exist, initialize it with current state
    if (!sharedContext.getContext(projectId)) {
      console.log(`[User Research] Context not found, initializing for project: ${projectId}`);
      sharedContext.initializeContext(projectId, inputData);
      relevantContext = sharedContext.getRelevantContext(projectId, "user-research");
    }
    
    console.log(`[User Research] Using context for project: ${projectId}`);
    
    const prompt = `You are a UX Research Specialist conducting comprehensive user research analysis. Build upon previous research insights to create detailed, actionable user research outputs.

## CONTEXT FROM PREVIOUS ANALYSIS
### Problem Statement
${inputData.problemStatement}

### Research Brief
${inputData.researchBrief}

### Key Research Findings
${(inputData.keyFindings ?? []).map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

### Previous Context
${relevantContext.keyDecisions?.length > 0 ? '**Previous Decisions:** ' + relevantContext.keyDecisions.map(d => d.decision).join(', ') : ''}
${relevantContext.extractedRequirements?.length > 0 ? '**Extracted Requirements:** ' + relevantContext.extractedRequirements.slice(0, 3).join(', ') : ''}

## RESEARCH TASK
Create comprehensive, specific user research outputs that directly address the stated problem:

1. **Personas**: Detailed user personas with demographics, goals, pain points, and technical background
2. **Journeys**: Customer journey maps showing user interactions and touchpoints
3. **Use Cases**: Specific scenarios and use cases derived from the personas and journeys

Return ONLY a valid JSON object in this exact format:
{
  "personas": "Primary Persona: [Name] - [Description with demographics, goals, pain points, technical level]\\nSecondary Persona: [Name] - [Description]",
  "journeys": "Journey 1: [User type] discovers product through [touchpoint], evaluates [features], experiences [friction points], achieves [outcome]\\nJourney 2: [Different scenario]",
  "useCases": [
    "Use Case 1: As a [user type], I need to [specific action] to achieve [specific goal]",
    "Use Case 2: As a [user type], I want to [specific action] so that [specific benefit]",
    "Use Case 3: [Another concrete use case]"
  ]
}

Ensure personas and journeys are detailed strings, and useCases is an array with at least 3-5 concrete use cases.`;

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate(
          [{ role: "user", content: prompt }],
          {
            resourceId: `workflow-${projectId.slice(-10)}`,
            threadId: `user-research-${Date.now()}`,
          }
        );
        const text = response.text;
        const json = extractFirstJsonObject(text) as {
          personas?: string;
          journeys?: string;
          useCases?: string[];
        };
        
        if (json.personas && json.journeys && json.useCases && json.useCases.length > 0) {
          const result = {
            ...inputData,
            personas: json.personas,
            journeys: json.journeys,
            useCases: json.useCases,
            _projectId: projectId, // Pass project ID to next step
          };
          
          // Update shared context with results
          sharedContext.updateContext(projectId, "user-research", result, {
            decisions: [{
              decision: "Primary user personas identified",
              rationale: "Based on research findings and market analysis"
            }],
            requirements: json.useCases.slice(0, 3), // Extract top use cases as requirements
            references: ["ai-research-and-discovery"] // Reference previous step
          });

          // Validate output quality
          const validation = sharedContext.validateContextQuality(projectId, "user-research", result);
          if (!validation.passed && attempt < maxRetries) {
            throw new Error(`Quality validation failed: ${validation.feedback.join(', ')}`);
          }

          console.log(`[User Research] Successfully completed with quality score: ${validation.score}%`);
          return result;
        } else {
          throw new Error(`Invalid user research data (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`User research generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate user research after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in user research generation");
  },
});

import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { sharedContext, getProjectId } from "../../utils/shared-context";
import {
  tasksAndImplementationInputSchema,
  tasksAndImplementationOutputSchema,
} from "./dto";

export const tasksAndImplementation = createStep({
  id: "tasks-and-implementation",
  description: "Break stories into concrete development tasks with realistic dependencies and estimates",
  inputSchema: tasksAndImplementationInputSchema,
  outputSchema: tasksAndImplementationOutputSchema,
  execute: async ({ inputData, mastra }) => {
    // Get or recover project context
    const projectId = inputData._projectId || getProjectId(inputData);
    let relevantContext = sharedContext.getRelevantContext(projectId, "tasks-and-implementation");
    
    // Initialize context if not found
    if (!sharedContext.getContext(projectId)) {
      console.log(`[Tasks Implementation] Context not found, initializing for project: ${projectId}`);
      sharedContext.initializeContext(projectId, inputData);
      relevantContext = sharedContext.getRelevantContext(projectId, "tasks-and-implementation");
    }
    
    console.log(`[Tasks Implementation] Using context for project: ${projectId}`);

    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `You are a Senior Tech Lead with expertise in breaking down complex features into implementable tasks. Create a detailed implementation plan based on the complete project context.

## COMPLETE PROJECT CONTEXT
### Problem Statement
${inputData.problemStatement}

### Technical Architecture
${inputData.techArchitecture || 'Not specified'}

### Design System Brief
${inputData.designSystemBrief || 'Not specified'}

### Stories & Epics to Implement
${(inputData.storiesEpics ?? []).map((story, i) => `${i + 1}. ${story}`).join('\n')}

### Constraints & Timeline
${inputData.constraints || 'Not specified'}

### Previous Decisions
${relevantContext.keyDecisions?.length > 0 ? relevantContext.keyDecisions.map(d => `- ${d.decision}: ${d.rationale}`).join('\n') : 'No previous decisions recorded'}

## IMPLEMENTATION BREAKDOWN TASK
Based on the technical architecture and stories, create a detailed implementation plan with:
1. **Specific, actionable development tasks** (not generic - tied to this exact project)
2. **Realistic dependencies** between tasks
3. **Consider the technical stack** mentioned in the architecture
4. **Align with design system** requirements

Return ONLY a valid JSON object in this exact format:
{
  "tasksImplementation": {
    "tasks": [
      "Set up project structure and dependencies",
      "Create database schema for user management",
      "Implement user registration API endpoint",
      "Create login form component",
      "Implement authentication middleware",
      "Add error handling for authentication flows"
    ],
    "dependencies": [
      "Database schema must be created before API endpoints",
      "Authentication middleware depends on user registration API",
      "Login form component requires authentication API to be ready"
    ]
  }
}

Ensure tasks array contains at least 5-8 concrete development tasks and dependencies array contains at least 3-5 dependency relationships.`;
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate(
          [{ role: "user", content: prompt }],
          {
            resourceId: `workflow-${projectId.slice(-10)}`,
            threadId: `tasks-impl-${Date.now()}`,
          }
        );
        const text = response.text;
        const json = extractFirstJsonObject(text) as {
          tasksImplementation?: { tasks: string[]; dependencies: string[] };
        };
        
        if (json.tasksImplementation && 
            json.tasksImplementation.tasks && 
            json.tasksImplementation.tasks.length > 0) {
          const result = {
            ...inputData,
            tasksImplementation: json.tasksImplementation,
            _projectId: projectId,
          };
          
          // Update shared context with implementation planning
          sharedContext.updateContext(projectId, "tasks-and-implementation", result, {
            decisions: [{
              decision: "Implementation roadmap and task breakdown completed",
              rationale: "Based on technical architecture and user stories prioritization"
            }],
            requirements: json.tasksImplementation.tasks.slice(0, 5), // Top 5 tasks as requirements
            references: ["stories-and-epics", "tech-architecture"]
          });

          // Validate implementation plan quality
          const validation = sharedContext.validateContextQuality(projectId, "tasks-and-implementation", result);
          if (!validation.passed && attempt < maxRetries) {
            throw new Error(`Implementation plan validation failed: ${validation.feedback.join(', ')}`);
          }

          console.log(`[Tasks Implementation] Successfully completed with quality score: ${validation.score}%`);
          return result;
        } else {
          throw new Error(`Invalid or empty tasksImplementation (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tasks and implementation generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate tasksImplementation after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in tasksImplementation generation");
  },
});

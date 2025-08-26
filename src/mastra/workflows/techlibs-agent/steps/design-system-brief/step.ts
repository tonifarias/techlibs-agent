import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { sharedContext, getProjectId } from "../../utils/shared-context";
import {
  designSystemBriefInputSchema,
  designSystemBriefOutputSchema,
} from "./dto";

export const designSystemBriefStep = createStep({
  id: "design-system-brief",
  description: "Create comprehensive design system brief with context-aware recommendations",
  inputSchema: designSystemBriefInputSchema,
  outputSchema: designSystemBriefOutputSchema,
  execute: async ({ inputData, mastra }) => {
    // Get or recover project context
    const projectId = inputData._projectId || getProjectId(inputData);
    let relevantContext = sharedContext.getRelevantContext(projectId, "design-system-brief");
    
    // Initialize context if not found
    if (!sharedContext.getContext(projectId)) {
      console.log(`[Design Brief] Context not found, initializing for project: ${projectId}`);
      sharedContext.initializeContext(projectId, inputData);
      relevantContext = sharedContext.getRelevantContext(projectId, "design-system-brief");
    }
    
    console.log(`[Design Brief] Using context for project: ${projectId}`);

    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `You are a Design System Architect with expertise in creating scalable, user-centered design systems. Build upon previous research insights to create a comprehensive design system brief.

## CONTEXT FROM PREVIOUS ANALYSIS
### Problem Statement
${inputData.problemStatement}

### Company Context
${inputData.companyContext || 'Not specified'}

### Target Audience Insights
${inputData.targetAudience || 'Not specified'}

### User Personas
${inputData.personas ?? "Not available"}

### Customer Journeys
${inputData.journeys ?? "Not available"}

### Use Cases
${(inputData.useCases ?? []).map((uc, i) => `${i + 1}. ${uc}`).join('\n')}

### Previous Context
${relevantContext.keyDecisions?.length > 0 ? '**Previous Decisions:** ' + relevantContext.keyDecisions.map(d => d.decision).join(', ') : ''}
${relevantContext.extractedRequirements?.length > 0 ? '**Key Requirements:** ' + relevantContext.extractedRequirements.slice(0, 3).join(', ') : ''}

## DESIGN SYSTEM TASK
Create a detailed design system brief that addresses the specific problem and user needs identified. Include:

1. **Color Palette**: Primary, secondary, neutral colors with semantic naming
2. **Typography**: Font families, sizes, weights, line heights
3. **Spacing System**: Consistent spacing units and grid system
4. **Component Inventory**: Core UI components needed
5. **Design Tokens**: Standardized design decisions

Return ONLY a valid JSON object in this exact format:
{
  "designSystemBrief": "## Color Palette\nPrimary: #1234AB (brand), Secondary: #5678CD (accent)\n\n## Typography\nHeadings: Inter Bold, Body: Inter Regular\n\n## Spacing\nBase unit: 8px, Grid: 12-column\n\n## Components\n- Navigation (header, sidebar, breadcrumbs)\n- Forms (inputs, buttons, validation)\n- Content (cards, lists, modals)\n- Feedback (alerts, tooltips, loading states)\n\n## Design Tokens\nColors, spacing, typography, shadows defined as CSS custom properties"
}

Ensure the designSystemBrief is a detailed string with proper formatting and covers all essential design system elements.`;

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate(
          [{ role: "user", content: prompt }],
          {
            resourceId: `workflow-${projectId.slice(-10)}`,
            threadId: `design-brief-${Date.now()}`,
          }
        );
        const text = response.text;
        const json = extractFirstJsonObject(text) as { designSystemBrief?: string };
        
        if (json.designSystemBrief && json.designSystemBrief.length > 50) {
          const result = {
            ...inputData,
            designSystemBrief: json.designSystemBrief,
            _projectId: projectId, // Pass project ID to next step
          };
          
          // Update shared context with results
          sharedContext.updateContext(projectId, "design-system-brief", result, {
            decisions: [{
              decision: "Design system architecture defined",
              rationale: "Based on user research, personas, and use cases"
            }],
            requirements: [
              "Consistent visual language",
              "Scalable component library", 
              "Accessible design tokens"
            ],
            references: ["user-research"] // Reference previous step
          });

          // Validate output quality
          const validation = sharedContext.validateContextQuality(projectId, "design-system-brief", result);
          if (!validation.passed && attempt < maxRetries) {
            throw new Error(`Quality validation failed: ${validation.feedback.join(', ')}`);
          }

          console.log(`[Design Brief] Successfully completed with quality score: ${validation.score}%`);
          return result;
        } else {
          throw new Error(`Invalid or too short designSystemBrief (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Design system brief generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate designSystemBrief after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in design system brief generation");
  },
});

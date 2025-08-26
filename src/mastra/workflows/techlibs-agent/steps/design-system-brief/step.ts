import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  designSystemBriefInputSchema,
  designSystemBriefOutputSchema,
} from "./dto";

export const designSystemBriefStep = createStep({
  id: "design-system-brief",
  description: "Draft color palette and component inventory summary",
  inputSchema: designSystemBriefInputSchema,
  outputSchema: designSystemBriefOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `You are a Design System Architect. Create a comprehensive design system brief based on the user research and project context.

## Problem Statement
${inputData.problemStatement}

## User Personas
${inputData.personas ?? "Not available"}

## Customer Journeys
${inputData.journeys ?? "Not available"}

## Use Cases
${(inputData.useCases ?? []).map((uc, i) => `${i + 1}. ${uc}`).join('\n')}

## Task
Create a detailed design system brief that includes:

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
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as { designSystemBrief?: string };
        
        if (json.designSystemBrief && json.designSystemBrief.length > 50) {
          return { ...inputData, designSystemBrief: json.designSystemBrief };
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

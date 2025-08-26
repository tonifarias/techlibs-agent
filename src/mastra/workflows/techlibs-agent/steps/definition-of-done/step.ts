import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  definitionOfDoneInputSchema,
  definitionOfDoneOutputSchema,
} from "./dto";

export const definitionOfDone = createStep({
  id: "definition-of-done",
  description: "Produce DoD including testing, quality gates, review rules",
  inputSchema: definitionOfDoneInputSchema,
  outputSchema: definitionOfDoneOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("codeReviewerAgent");
    if (!agent) throw new Error("Code Reviewer agent not found");

    const prompt = `You are a Senior Code Reviewer and QA Lead. Create a comprehensive Definition of Done (DoD) based on the project tasks and implementation requirements.

## Development Tasks
${inputData.tasksImplementation?.tasks ? inputData.tasksImplementation.tasks.map((task, i) => `${i + 1}. ${task}`).join('\n') : "No tasks available"}

## Dependencies
${inputData.tasksImplementation?.dependencies ? inputData.tasksImplementation.dependencies.map((dep, i) => `${i + 1}. ${dep}`).join('\n') : "No dependencies available"}

## Task
Create a detailed Definition of Done that ensures quality and completeness. Include:

1. **Code Quality Standards**: Code review requirements, coding standards, documentation
2. **Testing Requirements**: Unit tests, integration tests, E2E tests, coverage thresholds
3. **Quality Gates**: Linting, type checking, security scans, performance benchmarks
4. **CI/CD Requirements**: Build success, automated tests pass, deployment readiness
5. **Documentation**: Code comments, API docs, user guides, README updates
6. **Review Process**: Peer review, stakeholder approval, QA sign-off
7. **Acceptance Criteria**: Feature completeness, accessibility, browser compatibility

Return ONLY a valid JSON object in this exact format:
{
  "definitionOfDone": "## Code Quality\n- All code reviewed by senior developer\n- ESLint and TypeScript checks pass\n- Code coverage minimum 80%\n\n## Testing\n- Unit tests for all business logic\n- Integration tests for API endpoints\n- E2E tests for critical user journeys\n\n## Quality Gates\n- Build pipeline successful\n- Security scan passed\n- Performance benchmarks met\n\n## Documentation\n- API endpoints documented\n- README updated with setup instructions\n- Code comments for complex logic\n\n## Acceptance\n- Feature works as specified\n- Accessible (WCAG 2.1 AA)\n- Cross-browser tested\n- Stakeholder approved"
}

Ensure the definitionOfDone is a comprehensive checklist with specific, measurable criteria.`;

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as { definitionOfDone?: string };
        
        if (json.definitionOfDone && json.definitionOfDone.length > 100) {
          return { ...inputData, definitionOfDone: json.definitionOfDone };
        } else {
          throw new Error(`Invalid or too short definitionOfDone (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Definition of Done generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate definitionOfDone after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in Definition of Done generation");
  },
});

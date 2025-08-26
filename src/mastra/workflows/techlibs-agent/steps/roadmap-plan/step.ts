import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { roadmapPlanInputSchema, roadmapPlanOutputSchema } from "./dto";

export const roadmapPlan = createStep({
  id: "roadmap-plan",
  description: "Build roadmap milestones with timelines and resources",
  inputSchema: roadmapPlanInputSchema,
  outputSchema: roadmapPlanOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `You are a Product Owner creating a project roadmap. Based on the tasks, dependencies, and Definition of Done, create a realistic timeline with milestones.

## Development Tasks
${inputData.tasksImplementation?.tasks ? inputData.tasksImplementation.tasks.map((task, i) => `${i + 1}. ${task}`).join('\n') : "No tasks available"}

## Task Dependencies
${inputData.tasksImplementation?.dependencies ? inputData.tasksImplementation.dependencies.map((dep, i) => `${i + 1}. ${dep}`).join('\n') : "No dependencies available"}

## Definition of Done
${inputData.definitionOfDone || "Standard quality requirements"}

## Task
Create a detailed roadmap plan that includes:

1. **Project Phases**: Logical groupings of work (Setup, Development, Testing, Launch)
2. **Milestones**: Key deliverables and checkpoints
3. **Timeline Estimates**: Realistic time estimates for each phase
4. **Resource Requirements**: Team size and skill requirements
5. **Risk Mitigation**: Potential blockers and contingency plans
6. **Success Metrics**: How to measure project success

Return ONLY a valid JSON object in this exact format:
{
  "roadmapPlan": "## Phase 1: Project Setup (Week 1-2)\n- Set up development environment\n- Configure CI/CD pipeline\n- Create project structure\nMilestone: Development environment ready\n\n## Phase 2: Core Development (Week 3-6)\n- Implement authentication system\n- Build core user interface\n- Develop main features\nMilestone: MVP functionality complete\n\n## Phase 3: Integration & Testing (Week 7-8)\n- Integration testing\n- Performance optimization\n- Bug fixes and refinements\nMilestone: Production-ready code\n\n## Phase 4: Launch Preparation (Week 9-10)\n- User acceptance testing\n- Documentation completion\n- Deployment and monitoring setup\nMilestone: Successful production launch\n\n## Resources: 2-3 developers, 1 designer, 1 PM\n## Success Metrics: User adoption, performance benchmarks, zero critical bugs"
}

Ensure the roadmapPlan includes specific phases, timelines, milestones, and resource considerations.`;

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as { roadmapPlan?: string };
        
        if (json.roadmapPlan && json.roadmapPlan.length > 100) {
          return { ...inputData, roadmapPlan: json.roadmapPlan };
        } else {
          throw new Error(`Invalid or too short roadmapPlan (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Roadmap plan generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate roadmapPlan after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in roadmap plan generation");
  },
});

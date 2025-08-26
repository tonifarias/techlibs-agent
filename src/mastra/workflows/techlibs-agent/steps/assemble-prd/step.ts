import { createStep } from "@mastra/core/workflows";
import { assemblePrdInputSchema, assemblePrdOutputSchema } from "./dto";

export const assemblePRD = createStep({
  id: "assemble-prd",
  description: "Assemble final PRD output from accumulated state",
  inputSchema: assemblePrdInputSchema,
  outputSchema: assemblePrdOutputSchema,
  execute: async ({ inputData }) => {
    const prdSections: string[] = [];
    prdSections.push(`# Product Requirements Document`);
    prdSections.push(`\n## Research\n${inputData.researchBrief ?? ""}`);
    prdSections.push(`\n## Personas\n${typeof inputData.personas === 'string' ? inputData.personas : JSON.stringify(inputData.personas, null, 2) ?? ""}`);
    prdSections.push(`\n## Journeys\n${typeof inputData.journeys === 'string' ? inputData.journeys : JSON.stringify(inputData.journeys, null, 2) ?? ""}`);
    prdSections.push(
      `\n## Use Cases\n- ${(inputData.useCases ?? []).join("\n- ")}`
    );
    prdSections.push(
      `\n## Design System\n${typeof inputData.designSystemBrief === 'string' ? inputData.designSystemBrief : JSON.stringify(inputData.designSystemBrief, null, 2) ?? ""}`
    );
    prdSections.push(
      `\n## Tech Architecture\n${typeof inputData.techArchitecture === 'string' ? inputData.techArchitecture : JSON.stringify(inputData.techArchitecture, null, 2) ?? ""}`
    );
    prdSections.push(
      `\n## Stories & Epics\n- ${(inputData.storiesEpics ?? []).join("\n- ")}`
    );
    prdSections.push(
      `\n## Tasks\n- ${
        inputData.tasksImplementation
          ? inputData.tasksImplementation.tasks.join("\n- ")
          : ""
      }`
    );
    prdSections.push(
      `\n## Definition of Done\n${inputData.definitionOfDone ?? ""}`
    );
    prdSections.push(`\n## Roadmap\n${inputData.roadmapPlan ?? ""}`);

    const prd = prdSections.join("\n").trim();

    // Validate that we have the essential sections
    const missingRequiredSections = [];
    if (!inputData.researchBrief) missingRequiredSections.push("researchBrief");
    if (!inputData.personas) missingRequiredSections.push("personas");
    if (!inputData.useCases?.length) missingRequiredSections.push("useCases");
    if (!inputData.storiesEpics?.length) missingRequiredSections.push("storiesEpics");
    if (!inputData.tasksImplementation?.tasks?.length) missingRequiredSections.push("tasksImplementation");

    if (missingRequiredSections.length > 0) {
      throw new Error(`Missing required sections for final PRD: ${missingRequiredSections.join(", ")}`);
    }

    return {
      prd,
      designSystemBrief: typeof inputData.designSystemBrief === 'string' ? inputData.designSystemBrief : JSON.stringify(inputData.designSystemBrief, null, 2),
      techArchitecture: typeof inputData.techArchitecture === 'string' ? inputData.techArchitecture : JSON.stringify(inputData.techArchitecture, null, 2),
      storiesEpics: inputData.storiesEpics || [],
      tasksImplementation: inputData.tasksImplementation || { tasks: [], dependencies: [] },
      definitionOfDone: inputData.definitionOfDone || "",
      roadmapPlan: inputData.roadmapPlan || "",
    };
  },
});

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
    prdSections.push(`\n## Personas\n${inputData.personas ?? ""}`);
    prdSections.push(`\n## Journeys\n${inputData.journeys ?? ""}`);
    prdSections.push(
      `\n## Use Cases\n- ${(inputData.useCases ?? []).join("\n- ")}`
    );
    prdSections.push(
      `\n## Design System\n${inputData.designSystemBrief ?? ""}`
    );
    prdSections.push(
      `\n## Tech Architecture\n${inputData.techArchitecture ?? ""}`
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

    if (
      !inputData.designSystemBrief ||
      !inputData.techArchitecture ||
      !inputData.storiesEpics ||
      !inputData.tasksImplementation ||
      !inputData.definitionOfDone ||
      !inputData.roadmapPlan
    ) {
      throw new Error("Missing required sections for final PRD");
    }

    return {
      prd,
      designSystemBrief: inputData.designSystemBrief,
      techArchitecture: inputData.techArchitecture,
      storiesEpics: inputData.storiesEpics,
      tasksImplementation: inputData.tasksImplementation,
      definitionOfDone: inputData.definitionOfDone,
      roadmapPlan: inputData.roadmapPlan,
    };
  },
});

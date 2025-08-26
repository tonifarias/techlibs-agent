import { createStep } from "@mastra/core/workflows";
import { assembleInputSchema } from "./dto";
import { finalOutputSchema } from "../../dtos/final-output.dto";

export const assemble = createStep({
  id: "assemble",
  description: "Assemble final PRD output from accumulated state",
  inputSchema: assembleInputSchema,
  outputSchema: finalOutputSchema,
  execute: async ({ inputData }) => {
    const prdSections: string[] = [];
    prdSections.push(`# Product Requirements Document`);
    // prdSections.push(`\n## Research\n${inputData.researchBrief ?? ""}`);
    // prdSections.push(`\n## Personas\n${inputData.personas ?? ""}`);
    // prdSections.push(`\n## Journeys\n${inputData.journeys ?? ""}`);
    // prdSections.push(
    //   `\n## Use Cases\n- ${(inputData.useCases ?? []).join("\n- ")}`
    // );
    prdSections.push(
      `\n## Design System\n${inputData["architecture-workflow"].designSystemBrief ?? ""}`
    );
    prdSections.push(
      `\n## Tech Architecture\n${inputData["architecture-workflow"].techArchitecture ?? ""}`
    );
    prdSections.push(
      `\n## Stories & Epics\n- ${(inputData["task-workflow"].storiesEpics ?? []).join("\n- ")}`
    );
    prdSections.push(
      `\n## Tasks\n- ${
        inputData["task-workflow"].tasksImplementation
          ? inputData["task-workflow"].tasksImplementation.tasks.join("\n- ")
          : ""
      }`
    );
    prdSections.push(
      `\n## Definition of Done\n${inputData["task-workflow"].definitionOfDone ?? ""}`
    );
    prdSections.push(`\n## Roadmap\n${inputData["roadmap-plan"].roadmapPlan ?? ""}`);

    const prd = prdSections.join("\n").trim();

    if (
      !inputData["architecture-workflow"].designSystemBrief ||
      !inputData["architecture-workflow"].techArchitecture ||
      !inputData["task-workflow"].storiesEpics ||
      !inputData["task-workflow"].tasksImplementation ||
      !inputData["task-workflow"].definitionOfDone ||
      !inputData["roadmap-plan"].roadmapPlan
    ) {
      throw new Error("Missing required sections for final PRD");
    }

    return {
      prd,
      designSystemBrief: inputData["architecture-workflow"].designSystemBrief,
      techArchitecture: inputData["architecture-workflow"].techArchitecture,
      storiesEpics: inputData["task-workflow"].storiesEpics,
      tasksImplementation: inputData["task-workflow"].tasksImplementation,
      definitionOfDone: inputData["task-workflow"].definitionOfDone,
      roadmapPlan: inputData["roadmap-plan"].roadmapPlan,
    };
  },
});

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { productOwner } from "../agents/productOwner";

// Input schema as specified by the plan
const initInputSchema = z.object({
  problemStatement: z.string(),
  companyContext: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  assets: z.array(z.string()).optional(),
});

// Aggregating state carried between steps
const stateSchema = z.object({
  problemStatement: z.string(),
  companyContext: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  assets: z.array(z.string()).optional(),
  researchBrief: z.string().optional(),
  keyFindings: z.array(z.string()).optional(),
  personas: z.string().optional(),
  journeys: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  designSystemBrief: z.string().optional(),
  designApproved: z.boolean().optional(),
  techArchitecture: z.string().optional(),
  architectureApproved: z.boolean().optional(),
  storiesEpics: z.array(z.string()).optional(),
  tasksImplementation: z
    .object({
      tasks: z.array(z.string()),
      dependencies: z.array(z.string()),
    })
    .optional(),
  definitionOfDone: z.string().optional(),
  roadmapPlan: z.string().optional(),
  prd: z.string().optional(),
});

// Final output schema as specified by the plan
const finalOutputSchema = z.object({
  prd: z.string(),
  designSystemBrief: z.string(),
  techArchitecture: z.string(),
  storiesEpics: z.array(z.string()),
  tasksImplementation: z.object({
    tasks: z.array(z.string()),
    dependencies: z.array(z.string()),
  }),
  definitionOfDone: z.string(),
  roadmapPlan: z.string(),
});

// Helpers
function extractFirstJsonObject(text: string): any {
  try {
    // Try direct JSON
    return JSON.parse(text);
  } catch (_) {
    // Try fenced code block
    const fenceMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1]);
      } catch {}
    }
    // Try from first { to last }
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
    }
  }
  throw new Error("Unable to parse JSON from agent response");
}

// 1) AI Research & Discovery
const aiResearchAndDiscovery = createStep({
  id: "ai-research-and-discovery",
  description:
    "Gather market/competitor/feasibility via agents/tools and summarize",
  inputSchema: initInputSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error("Input data not found");

    const prompt = `You are a Product Owner.
Given the problem statement and context, produce concise research.
Return ONLY valid JSON with keys: researchBrief (string), keyFindings (string[]).

problemStatement: ${inputData.problemStatement}
companyContext: ${inputData.companyContext ?? ""}
constraints: ${(inputData.constraints ?? []).join(", ")}
assets: ${(inputData.assets ?? []).join(", ")}`;

    const { text } = await productOwner.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);

    const json = extractFirstJsonObject(text) as {
      researchBrief?: string;
      keyFindings?: string[];
    };

    if (
      !json.researchBrief ||
      !json.keyFindings ||
      json.keyFindings.length === 0
    ) {
      throw new Error("Failed to produce researchBrief/keyFindings");
    }

    return {
      ...inputData,
      researchBrief: json.researchBrief,
      keyFindings: json.keyFindings,
    };
  },
});

// 2) User Research
const userResearch = createStep({
  id: "user-research",
  description: "Produce personas, journeys, and use cases",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.keyFindings || inputData.keyFindings.length === 0) {
      throw new Error("Cannot proceed: keyFindings is empty");
    }

    const agent = mastra?.getAgent("productOwner");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `You are a Product Owner.
From the problem and prior research, produce:
- personas (string, concise but clear)
- journeys (string, concise but clear)
- useCases (string[])
Return ONLY JSON with keys: personas, journeys, useCases.

problemStatement: ${inputData.problemStatement}
researchBrief: ${inputData.researchBrief}
keyFindings: ${(inputData.keyFindings ?? []).join("; ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;

    const json = extractFirstJsonObject(text) as {
      personas?: string;
      journeys?: string;
      useCases?: string[];
    };
    if (!json.personas || !json.journeys || !json.useCases) {
      throw new Error("Failed to produce personas/journeys/useCases");
    }

    return {
      ...inputData,
      personas: json.personas,
      journeys: json.journeys,
      useCases: json.useCases,
    };
  },
});

// 3) Design System Brief
const designSystemBriefStep = createStep({
  id: "design-system-brief",
  description: "Draft color palette and component inventory summary",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("productOwner");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `Draft a design system brief summarizing tokens and components.
Include: colors (semantic), spacing, typography, and a component inventory.
Return ONLY JSON: { designSystemBrief: string }.

context:
- problemStatement: ${inputData.problemStatement}
- personas: ${inputData.personas ?? ""}
- journeys: ${inputData.journeys ?? ""}
- useCases: ${(inputData.useCases ?? []).join(", ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { designSystemBrief?: string };
    if (!json.designSystemBrief)
      throw new Error("Failed to produce designSystemBrief");

    return { ...inputData, designSystemBrief: json.designSystemBrief };
  },
});

// Approval resume schema for waitForEvent gates
const approvalResumeSchema = z.object({ approved: z.boolean() });

// Design approval gate
const designApprovalGate = createStep({
  id: "design-approval-gate",
  description: "Gate that requires external approval for design system brief",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData }) => {
    if (!resumeData?.approved) {
      throw new Error("Design system brief not approved");
    }
    return { ...inputData, designApproved: true };
  },
});

// 4) Tech Architecture
const techArchitecture = createStep({
  id: "tech-architecture",
  description: "Draft system architecture, API surface, storage choices",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `Create a technical architecture.
Include: systemDiagram (text summary), apis (endpoints list), storage (choices and rationale).
Return ONLY JSON: { techArchitecture: string }.

context:
- problemStatement: ${inputData.problemStatement}
- keyFindings: ${(inputData.keyFindings ?? []).join("; ")}
- designSystemBrief: ${inputData.designSystemBrief ?? ""}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { techArchitecture?: string };
    if (!json.techArchitecture)
      throw new Error("Failed to produce techArchitecture");

    return { ...inputData, techArchitecture: json.techArchitecture };
  },
});

// Architecture approval gate
const architectureApprovalGate = createStep({
  id: "architecture-approval-gate",
  description: "Gate that requires external approval for architecture",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  resumeSchema: approvalResumeSchema,
  execute: async ({ inputData, resumeData }) => {
    if (!resumeData?.approved) {
      throw new Error("Tech architecture not approved");
    }
    return { ...inputData, architectureApproved: true };
  },
});

// 5) Stories & Epics (BDD)
const storiesAndEpics = createStep({
  id: "stories-and-epics",
  description: "Convert use cases into epics and BDD scenarios",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("bddSpecialist");
    if (!agent) throw new Error("BDD Specialist agent not found");

    const prompt = `Convert useCases into epics and user stories with Given/When/Then.
Return ONLY JSON: { storiesEpics: string[] }.

useCases: ${(inputData.useCases ?? []).join("; ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { storiesEpics?: string[] };
    if (!json.storiesEpics) throw new Error("Failed to produce storiesEpics");

    return { ...inputData, storiesEpics: json.storiesEpics };
  },
});

// 6) Tasks & Implementation
const tasksAndImplementation = createStep({
  id: "tasks-and-implementation",
  description: "Break stories into tasks/dependencies with estimates",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `Given the stories/epics, produce tasks and dependencies.
Return ONLY JSON: { tasksImplementation: { tasks: string[], dependencies: string[] } }.

storiesEpics: ${(inputData.storiesEpics ?? []).join("\n- ")}`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as {
      tasksImplementation?: { tasks: string[]; dependencies: string[] };
    };
    if (!json.tasksImplementation)
      throw new Error("Failed to produce tasksImplementation");

    return { ...inputData, tasksImplementation: json.tasksImplementation };
  },
});

// 7) Definition of Done
const definitionOfDone = createStep({
  id: "definition-of-done",
  description: "Produce DoD including testing, quality gates, review rules",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("codeReviewer");
    if (!agent) throw new Error("Code Reviewer agent not found");

    const prompt = `Create a Definition of Done covering: tests, quality gates, CI, code review.
Return ONLY JSON: { definitionOfDone: string }.

context:
- tasks: ${
      inputData.tasksImplementation
        ? inputData.tasksImplementation.tasks.join(", ")
        : ""
    }`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { definitionOfDone?: string };
    if (!json.definitionOfDone)
      throw new Error("Failed to produce definitionOfDone");

    return { ...inputData, definitionOfDone: json.definitionOfDone };
  },
});

// 8) Roadmap Plan
const roadmapPlan = createStep({
  id: "roadmap-plan",
  description: "Build roadmap milestones with timelines and resources",
  inputSchema: stateSchema,
  outputSchema: stateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("productOwner");
    if (!agent) throw new Error("Product Owner agent not found");

    const prompt = `Create a concise roadmap plan with milestones and rough timelines.
Return ONLY JSON: { roadmapPlan: string }.`;

    const response = await agent.stream([{ role: "user", content: prompt }]);
    let text = "";
    for await (const chunk of response.textStream) text += chunk;
    const json = extractFirstJsonObject(text) as { roadmapPlan?: string };
    if (!json.roadmapPlan) throw new Error("Failed to produce roadmapPlan");

    return { ...inputData, roadmapPlan: json.roadmapPlan };
  },
});

// Final assembly of PRD output
const assemblePRD = createStep({
  id: "assemble-prd",
  description: "Assemble final PRD output from accumulated state",
  inputSchema: stateSchema,
  outputSchema: finalOutputSchema,
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

// Define the workflow with suspend/resume gates using waitForEvent
const techlibsAgentWorkflow = createWorkflow({
  id: "techlibs-agent-workflow",
  inputSchema: initInputSchema,
  outputSchema: finalOutputSchema,
})
  .then(aiResearchAndDiscovery)
  .then(userResearch)
  .then(designSystemBriefStep)
  .waitForEvent("design-approval-required", designApprovalGate)
  .then(techArchitecture)
  .waitForEvent("architecture-approval-required", architectureApprovalGate)
  .then(storiesAndEpics)
  .then(tasksAndImplementation)
  .then(definitionOfDone)
  .then(roadmapPlan)
  .then(assemblePRD);

techlibsAgentWorkflow.commit();

export { techlibsAgentWorkflow };

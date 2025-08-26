import { createStep } from "@mastra/core/workflows";
import { sharedContext, getProjectId } from "../../utils/shared-context";
import { assemblePrdInputSchema, assemblePrdOutputSchema } from "./dto";

export const assemblePRD = createStep({
  id: "assemble-prd",
  description: "Synthesize comprehensive PRD with intelligent information aggregation and cross-references",
  inputSchema: assemblePrdInputSchema,
  outputSchema: assemblePrdOutputSchema,
  execute: async ({ inputData, mastra }) => {
    // Get complete project context and history
    const projectId = inputData._projectId || getProjectId(inputData);
    const contextSummary = sharedContext.generateContextSummary(projectId);
    
    console.log(`[Assemble PRD] Generating final PRD for project: ${projectId}`);
    
    // Use agent to create intelligent synthesis
    const agent = mastra?.getAgent("productOwnerAgent");
    if (!agent) {
      console.warn("Product Owner agent not available, using basic assembly");
      return basicPrdAssembly(inputData);
    }
    // Create intelligent PRD synthesis prompt
    const synthesisPrompt = `You are a Senior Product Manager with expertise in creating comprehensive, actionable PRDs. Synthesize all workflow information into a cohesive, professional Product Requirements Document.

## COMPLETE PROJECT CONTEXT
### Original Problem Statement
${inputData.problemStatement}

### Company & Market Context
${inputData.companyContext || 'Not specified'}
${inputData.constraints ? '**Project Constraints:** ' + inputData.constraints : ''}
${inputData.targetAudience ? '**Target Audience:** ' + inputData.targetAudience : ''}
${inputData.successCriteria ? '**Success Criteria:** ' + inputData.successCriteria : ''}

### Research Insights
${inputData.researchBrief || 'No research brief available'}
${inputData.keyFindings?.length ? '**Key Findings:** ' + inputData.keyFindings.join(', ') : ''}

### User Research
**Personas:** ${inputData.personas || 'Not defined'}
**Customer Journeys:** ${inputData.journeys || 'Not defined'}
**Use Cases:** ${inputData.useCases?.join(', ') || 'None defined'}

### Design & Technical Architecture
**Design System:** ${inputData.designSystemBrief || 'Not defined'}
**Technical Architecture:** ${inputData.techArchitecture || 'Not defined'}

### Implementation Plan
**Stories & Epics:** ${inputData.storiesEpics?.join(', ') || 'None defined'}
**Development Tasks:** ${inputData.tasksImplementation?.tasks?.join(', ') || 'None defined'}
**Dependencies:** ${inputData.tasksImplementation?.dependencies?.join(', ') || 'None defined'}

### Quality Metrics & Timeline
**Definition of Done:** ${inputData.definitionOfDone || 'Not defined'}
**Roadmap:** ${inputData.roadmapPlan || 'Not defined'}

### Workflow Context
**Key Decisions Made:** ${contextSummary.decisionTrail?.map(d => d.decision).join(', ') || 'None recorded'}
**Quality Score:** ${contextSummary.qualityMetrics?.overallQuality || 'Not available'}%

## PRD SYNTHESIS TASK
Create a comprehensive, executive-ready PRD that:
1. **Synthesizes information** - Don't just concatenate, but intelligently combine insights
2. **Identifies connections** - Link research findings to technical decisions
3. **Prioritizes content** - Highlight most critical information
4. **Ensures consistency** - Resolve any contradictions between sections
5. **Provides traceability** - Show how final decisions connect to original research

Return ONLY a valid JSON object with a single 'prd' field containing the complete markdown PRD:
{
  "prd": "# Comprehensive PRD content here..."
}`;
    
    let synthesizedPrd = null;
    try {
      const response = await agent.generate(
        [{ role: "user", content: synthesisPrompt }],
        {
          resourceId: `workflow-${projectId.slice(-10)}`,
          threadId: `prd-synthesis-${Date.now()}`,
        }
      );
      
      const json = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      if (json.prd && json.prd.length > 500) {
        synthesizedPrd = json.prd;
        console.log(`[Assemble PRD] AI synthesis successful - ${synthesizedPrd.length} characters`);
      }
    } catch (error) {
      console.warn(`[Assemble PRD] AI synthesis failed, using basic assembly:`, error.message);
    }
    
    // Fallback to basic assembly if AI synthesis fails
    const prd = synthesizedPrd || createBasicPrd(inputData, contextSummary);

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

    // Final quality check and context update
    const finalResult = {
      prd,
      designSystemBrief: typeof inputData.designSystemBrief === 'string' ? inputData.designSystemBrief : JSON.stringify(inputData.designSystemBrief, null, 2),
      techArchitecture: typeof inputData.techArchitecture === 'string' ? inputData.techArchitecture : JSON.stringify(inputData.techArchitecture, null, 2),
      storiesEpics: inputData.storiesEpics || [],
      tasksImplementation: inputData.tasksImplementation || { tasks: [], dependencies: [] },
      definitionOfDone: inputData.definitionOfDone || "",
      roadmapPlan: inputData.roadmapPlan || "",
      _projectId: projectId,
      _contextSummary: contextSummary
    };
    
    // Final validation
    const validation = sharedContext.validateContextQuality(projectId, "assemble-prd", finalResult);
    console.log(`[Assemble PRD] Final PRD quality score: ${validation.score}%`);
    
    if (validation.score < 60) {
      console.warn(`[Assemble PRD] Low quality score. Issues: ${validation.feedback.join(', ')}`);
    }
    
    return finalResult;
  },
});

/**
 * Basic PRD assembly function (fallback when AI synthesis is not available)
 */
function basicPrdAssembly(inputData: any) {
  console.log('[Assemble PRD] Using basic assembly fallback');
  
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

  return {
    prd: prdSections.join("\n").trim(),
    designSystemBrief: typeof inputData.designSystemBrief === 'string' ? inputData.designSystemBrief : JSON.stringify(inputData.designSystemBrief, null, 2),
    techArchitecture: typeof inputData.techArchitecture === 'string' ? inputData.techArchitecture : JSON.stringify(inputData.techArchitecture, null, 2),
    storiesEpics: inputData.storiesEpics || [],
    tasksImplementation: inputData.tasksImplementation || { tasks: [], dependencies: [] },
    definitionOfDone: inputData.definitionOfDone || "",
    roadmapPlan: inputData.roadmapPlan || "",
  };
}

/**
 * Create basic PRD with context information
 */
function createBasicPrd(inputData: any, contextSummary: any): string {
  const sections = [];
  
  // Executive Summary with context
  sections.push(`# Product Requirements Document`);
  sections.push(`\n## Executive Summary`);
  sections.push(`**Problem Statement:** ${inputData.problemStatement}`);
  sections.push(`**Company Context:** ${inputData.companyContext || 'Not specified'}`);
  sections.push(`**Target Audience:** ${inputData.targetAudience || 'Not specified'}`);
  sections.push(`**Success Criteria:** ${inputData.successCriteria || 'Not specified'}`);
  
  if (contextSummary?.qualityMetrics) {
    sections.push(`**Workflow Quality Score:** ${contextSummary.qualityMetrics.overallQuality}%`);
  }
  
  // Research & Analysis
  sections.push(`\n## Market Research & Analysis`);
  sections.push(inputData.researchBrief || 'Research not available');
  
  if (inputData.keyFindings?.length) {
    sections.push(`\n### Key Findings`);
    inputData.keyFindings.forEach((finding: string, i: number) => {
      sections.push(`${i + 1}. ${finding}`);
    });
  }
  
  // User Research
  sections.push(`\n## User Research`);
  sections.push(`### Personas\n${inputData.personas || 'Not defined'}`);
  sections.push(`### Customer Journeys\n${inputData.journeys || 'Not defined'}`);
  
  if (inputData.useCases?.length) {
    sections.push(`### Use Cases`);
    inputData.useCases.forEach((uc: string, i: number) => {
      sections.push(`${i + 1}. ${uc}`);
    });
  }
  
  // Technical Specifications
  sections.push(`\n## Technical Specifications`);
  sections.push(`### Design System\n${inputData.designSystemBrief || 'Not defined'}`);
  sections.push(`### Architecture\n${inputData.techArchitecture || 'Not defined'}`);
  
  // Implementation Plan
  sections.push(`\n## Implementation Plan`);
  
  if (inputData.storiesEpics?.length) {
    sections.push(`### User Stories & Epics`);
    inputData.storiesEpics.forEach((story: string, i: number) => {
      sections.push(`${i + 1}. ${story}`);
    });
  }
  
  if (inputData.tasksImplementation?.tasks?.length) {
    sections.push(`### Development Tasks`);
    inputData.tasksImplementation.tasks.forEach((task: string, i: number) => {
      sections.push(`${i + 1}. ${task}`);
    });
  }
  
  if (inputData.tasksImplementation?.dependencies?.length) {
    sections.push(`### Dependencies`);
    inputData.tasksImplementation.dependencies.forEach((dep: string, i: number) => {
      sections.push(`${i + 1}. ${dep}`);
    });
  }
  
  // Quality & Delivery
  sections.push(`\n## Quality Assurance`);
  sections.push(inputData.definitionOfDone || 'Definition of Done not specified');
  
  sections.push(`\n## Project Roadmap`);
  sections.push(inputData.roadmapPlan || 'Roadmap not defined');
  
  return sections.join('\n\n');
}

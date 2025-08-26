import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import { sharedContext, getProjectId } from "../../utils/shared-context";
import {
  techArchitectureInputSchema,
  techArchitectureOutputSchema,
} from "./dto";

export const techArchitecture = createStep({
  id: "tech-architecture",
  description: "Design comprehensive technical architecture aligned with business requirements",
  inputSchema: techArchitectureInputSchema,
  outputSchema: techArchitectureOutputSchema,
  execute: async ({ inputData, mastra }) => {
    // Get or recover project context
    const projectId = inputData._projectId || getProjectId(inputData);
    let relevantContext = sharedContext.getRelevantContext(projectId, "tech-architecture");
    
    // Initialize context if not found
    if (!sharedContext.getContext(projectId)) {
      console.log(`[Tech Architecture] Context not found, initializing for project: ${projectId}`);
      sharedContext.initializeContext(projectId, inputData);
      relevantContext = sharedContext.getRelevantContext(projectId, "tech-architecture");
    }
    
    console.log(`[Tech Architecture] Using context for project: ${projectId}`);

    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `You are a Senior Software Architect with expertise in scalable, secure, and maintainable systems. Design a technical architecture that directly addresses the business problem and constraints.

## COMPLETE CONTEXT ANALYSIS
### Problem Statement
${inputData.problemStatement}

### Company Context & Constraints
${inputData.companyContext || 'Not specified'}
${inputData.constraints ? '**Constraints:** ' + inputData.constraints : ''}

### Key Research Findings
${(inputData.keyFindings ?? []).map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

### Target Audience Technical Profile
${inputData.targetAudience || 'Not specified'}

### Design System Brief
${inputData.designSystemBrief ?? "Not available"}

### Success Criteria
${inputData.successCriteria || 'Not specified'}

### Previous Context
${relevantContext.keyDecisions?.length > 0 ? '**Previous Decisions:** ' + relevantContext.keyDecisions.map(d => d.decision).join(', ') : ''}
${relevantContext.extractedRequirements?.length > 0 ? '**Key Requirements:** ' + relevantContext.extractedRequirements.slice(0, 5).join(', ') : ''}

## ARCHITECTURE TASK
Design a technical architecture that is SPECIFIC to this problem (not generic). Consider the constraints, target audience, and success criteria. Include:

1. **System Architecture**: High-level system components and their relationships
2. **Technology Stack**: Frontend, backend, database, and infrastructure choices
3. **API Design**: REST/GraphQL endpoints with request/response structure
4. **Data Storage**: Database schema, caching strategy, file storage
5. **Security**: Authentication, authorization, data protection
6. **Performance**: Scalability, optimization, monitoring
7. **Deployment**: CI/CD, hosting, environment strategy

Return ONLY a valid JSON object in this exact format:
{
  "techArchitecture": "## System Architecture\nFrontend: React/Next.js SPA\nBackend: Node.js/Express API\nDatabase: PostgreSQL with Redis cache\n\n## API Endpoints\n- GET /api/users - User management\n- POST /api/auth - Authentication\n- GET/POST /api/projects - Project CRUD\n\n## Data Storage\nPostgreSQL: Users, projects, configurations\nRedis: Session cache, API rate limiting\nS3: File uploads, static assets\n\n## Security\nJWT authentication, HTTPS, input validation, SQL injection protection\n\n## Performance\nAPI response caching, CDN for static assets, database indexing\n\n## Deployment\nDocker containers, AWS/Vercel hosting, GitHub Actions CI/CD"
}

Ensure the techArchitecture is a comprehensive string covering all architectural aspects with specific technology choices and implementation details.`;
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await agent.generate(
          [{ role: "user", content: prompt }],
          {
            resourceId: `workflow-${projectId.slice(-10)}`,
            threadId: `tech-arch-${Date.now()}`,
          }
        );
        const text = response.text;
        const json = extractFirstJsonObject(text) as { techArchitecture?: string };
        
        if (json.techArchitecture && json.techArchitecture.length > 100) {
          const result = {
            ...inputData,
            techArchitecture: json.techArchitecture,
            _projectId: projectId,
          };
          
          // Update shared context with technical decisions
          sharedContext.updateContext(projectId, "tech-architecture", result, {
            decisions: [{
              decision: "Technical architecture and stack defined",
              rationale: "Aligned with constraints, scalability needs, and team capabilities"
            }],
            requirements: [
              "Scalable system architecture",
              "Secure data handling",
              "Performance optimized",
              "Maintainable codebase"
            ],
            references: ["design-system-brief", "ai-research-and-discovery"]
          });

          // Validate architecture quality
          const validation = sharedContext.validateContextQuality(projectId, "tech-architecture", result);
          if (!validation.passed && attempt < maxRetries) {
            throw new Error(`Architecture quality validation failed: ${validation.feedback.join(', ')}`);
          }

          console.log(`[Tech Architecture] Successfully completed with quality score: ${validation.score}%`);
          return result;
        } else {
          throw new Error(`Invalid or too short techArchitecture (attempt ${attempt}/${maxRetries})`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tech architecture generation attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate techArchitecture after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Add slight delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error("Unexpected error in tech architecture generation");
  },
});

import { createStep } from "@mastra/core/workflows";
import { extractFirstJsonObject } from "../../../../tools/json-extractor-tool";
import {
  techArchitectureInputSchema,
  techArchitectureOutputSchema,
} from "./dto";

export const techArchitecture = createStep({
  id: "tech-architecture",
  description: "Draft system architecture, API surface, storage choices",
  inputSchema: techArchitectureInputSchema,
  outputSchema: techArchitectureOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("developerAgent");
    if (!agent) throw new Error("Developer agent not found");

    const prompt = `You are a Senior Software Architect. Design a comprehensive technical architecture for the project based on the requirements and design system.

## Problem Statement
${inputData.problemStatement}

## Key Research Findings
${(inputData.keyFindings ?? []).map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

## Design System Brief
${inputData.designSystemBrief ?? "Not available"}

## Task
Create a detailed technical architecture that includes:

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
        const response = await agent.generate([{ role: "user", content: prompt }]);
        const text = response.text;
        const json = extractFirstJsonObject(text) as { techArchitecture?: string };
        
        if (json.techArchitecture && json.techArchitecture.length > 100) {
          return { ...inputData, techArchitecture: json.techArchitecture };
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

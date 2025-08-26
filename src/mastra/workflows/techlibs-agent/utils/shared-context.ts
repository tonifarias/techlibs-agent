/**
 * Shared Context Management System for TechLibs Agent Workflow
 * Ensures context continuity and agent coordination throughout the workflow
 */

interface WorkflowContext {
  // Core project information
  projectId: string;
  problemStatement: string;
  companyContext?: string;
  constraints?: string;
  assets?: string;
  targetAudience?: string;
  successCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Extracted insights and decisions
  extractedRequirements: string[];
  keyDecisions: Array<{
    step: string;
    decision: string;
    rationale: string;
    timestamp: string;
  }>;
  
  // Cross-references between workflow steps
  references: Record<string, string[]>;
  
  // Quality validation tracking
  validationResults: Record<string, {
    passed: boolean;
    score: number;
    feedback: string[];
  }>;
  
  // Step-specific context
  stepContexts: Record<string, any>;
}

class SharedContextManager {
  private contexts: Map<string, WorkflowContext> = new Map();
  
  /**
   * Initialize context for a new workflow run
   */
  initializeContext(projectId: string, initialInput: any): WorkflowContext {
    const context: WorkflowContext = {
      projectId,
      problemStatement: initialInput.problemStatement,
      companyContext: initialInput.companyContext,
      constraints: initialInput.constraints,
      assets: initialInput.assets,
      targetAudience: initialInput.targetAudience,
      successCriteria: initialInput.successCriteria,
      priority: initialInput.priority || 'medium',
      extractedRequirements: [],
      keyDecisions: [],
      references: {},
      validationResults: {},
      stepContexts: {}
    };
    
    this.contexts.set(projectId, context);
    return context;
  }
  
  /**
   * Get context for a workflow run
   */
  getContext(projectId: string): WorkflowContext | undefined {
    return this.contexts.get(projectId);
  }
  
  /**
   * Update context with new information from a workflow step
   */
  updateContext(projectId: string, stepId: string, stepOutput: any, metadata?: any): void {
    const context = this.contexts.get(projectId);
    if (!context) throw new Error(`Context not found for project: ${projectId}`);
    
    // Store step-specific context
    context.stepContexts[stepId] = stepOutput;
    
    // Extract and store key decisions
    if (metadata?.decisions) {
      context.keyDecisions.push(...metadata.decisions.map((decision: any) => ({
        ...decision,
        step: stepId,
        timestamp: new Date().toISOString()
      })));
    }
    
    // Extract requirements if provided
    if (metadata?.requirements) {
      context.extractedRequirements.push(...metadata.requirements);
    }
    
    // Store cross-references
    if (metadata?.references) {
      context.references[stepId] = metadata.references;
    }
    
    this.contexts.set(projectId, context);
  }
  
  /**
   * Get relevant context for a specific step
   */
  getRelevantContext(projectId: string, stepId: string): any {
    const context = this.contexts.get(projectId);
    if (!context) return {};
    
    return {
      projectCore: {
        problemStatement: context.problemStatement,
        companyContext: context.companyContext,
        constraints: context.constraints,
        assets: context.assets,
        targetAudience: context.targetAudience,
        successCriteria: context.successCriteria,
        priority: context.priority
      },
      extractedRequirements: context.extractedRequirements,
      keyDecisions: context.keyDecisions,
      previousSteps: context.stepContexts,
      references: context.references[stepId] || [],
      validationHistory: context.validationResults
    };
  }
  
  /**
   * Validate context quality at each step
   */
  validateContextQuality(projectId: string, stepId: string, output: any): {
    passed: boolean;
    score: number;
    feedback: string[];
  } {
    const context = this.contexts.get(projectId);
    if (!context) throw new Error(`Context not found for project: ${projectId}`);
    
    const feedback: string[] = [];
    let score = 0;
    
    // Check specificity (not generic)
    if (this.isOutputSpecific(output, context.problemStatement)) {
      score += 25;
    } else {
      feedback.push('Output appears too generic - should be more specific to the problem statement');
    }
    
    // Check relevance to previous steps
    if (this.isRelevantToPreviousSteps(output, context.stepContexts)) {
      score += 25;
    } else {
      feedback.push('Output should better connect with previous workflow steps');
    }
    
    // Check completeness
    if (this.isOutputComplete(output, stepId)) {
      score += 25;
    } else {
      feedback.push('Output missing key required elements');
    }
    
    // Check actionability
    if (this.isOutputActionable(output)) {
      score += 25;
    } else {
      feedback.push('Output should provide more actionable insights');
    }
    
    const result = {
      passed: score >= 70, // 70% threshold
      score,
      feedback
    };
    
    context.validationResults[stepId] = result;
    this.contexts.set(projectId, context);
    
    return result;
  }
  
  /**
   * Generate context summary for final PRD assembly
   */
  generateContextSummary(projectId: string): any {
    const context = this.contexts.get(projectId);
    if (!context) return {};
    
    return {
      projectOverview: {
        problemStatement: context.problemStatement,
        companyContext: context.companyContext,
        priority: context.priority
      },
      keyInsights: this.extractKeyInsights(context),
      decisionTrail: context.keyDecisions,
      requirementsSummary: context.extractedRequirements,
      qualityMetrics: this.calculateQualityMetrics(context),
      workflowTrace: Object.keys(context.stepContexts)
    };
  }
  
  // Private helper methods
  private isOutputSpecific(output: any, problemStatement: string): boolean {
    const outputText = JSON.stringify(output).toLowerCase();
    const problemWords = problemStatement.toLowerCase().split(' ').filter(w => w.length > 3);
    const matches = problemWords.filter(word => outputText.includes(word));
    return matches.length >= Math.min(3, problemWords.length * 0.3);
  }
  
  private isRelevantToPreviousSteps(output: any, stepContexts: Record<string, any>): boolean {
    // Simple check - more sophisticated logic can be added
    return Object.keys(stepContexts).length === 0 || JSON.stringify(output).length > 100;
  }
  
  private isOutputComplete(output: any, stepId: string): boolean {
    // Step-specific completeness checks
    const requiredFields: Record<string, string[]> = {
      'ai-research-and-discovery': ['researchBrief', 'keyFindings'],
      'user-research': ['personas', 'journeys', 'useCases'],
      'stories-and-epics': ['storiesEpics'],
      // Add more as needed
    };
    
    const required = requiredFields[stepId] || [];
    return required.every(field => output[field] && 
      (Array.isArray(output[field]) ? output[field].length > 0 : output[field].length > 10));
  }
  
  private isOutputActionable(output: any): boolean {
    const actionWords = ['implement', 'create', 'develop', 'design', 'build', 'test', 'deploy', 'integrate'];
    const outputText = JSON.stringify(output).toLowerCase();
    return actionWords.some(word => outputText.includes(word));
  }
  
  private extractKeyInsights(context: WorkflowContext): any[] {
    const insights = [];
    
    // Extract from research
    if (context.stepContexts['ai-research-and-discovery']?.keyFindings) {
      insights.push(...context.stepContexts['ai-research-and-discovery'].keyFindings);
    }
    
    // Extract from user research
    if (context.stepContexts['user-research']?.useCases) {
      insights.push(...context.stepContexts['user-research'].useCases.slice(0, 3));
    }
    
    return insights.slice(0, 10); // Limit to top 10 insights
  }
  
  private calculateQualityMetrics(context: WorkflowContext): any {
    const results = Object.values(context.validationResults);
    const avgScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0;
    
    return {
      overallQuality: avgScore,
      stepsCompleted: Object.keys(context.stepContexts).length,
      decisionsTracked: context.keyDecisions.length,
      requirementsExtracted: context.extractedRequirements.length
    };
  }
}

// Singleton instance for workflow-wide context management
export const sharedContext = new SharedContextManager();

/**
 * Helper function to get project ID from workflow run context
 * Use a consistent English-based ID to ensure continuity
 */
export function getProjectId(inputData?: any): string {
  if (inputData?.problemStatement) {
    // Create consistent ID from problem statement hash (English-friendly)
    const cleanStatement = inputData.problemStatement
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 30); // Shorter for cleaner IDs
    return `project-${cleanStatement}-${Date.now().toString().slice(-6)}`;
  }
  return `project-${Date.now()}`;
}

/**
 * Context validation decorator for workflow steps
 */
export function withContextValidation(stepId: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const { inputData } = args[0];
      const projectId = getProjectId(inputData?.workflowRunId);
      
      try {
        const result = await method.apply(this, args);
        
        // Validate output quality
        const validation = sharedContext.validateContextQuality(projectId, stepId, result);
        
        if (!validation.passed) {
          console.warn(`Quality validation failed for step ${stepId}:`, validation.feedback);
          // Could implement retry logic here if needed
        }
        
        // Update shared context
        sharedContext.updateContext(projectId, stepId, result);
        
        return result;
      } catch (error) {
        console.error(`Step ${stepId} failed:`, error);
        throw error;
      }
    };
  };
}
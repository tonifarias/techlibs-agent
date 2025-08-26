/**
 * Enhanced observability utilities for Mastra workflows
 * Based on official Mastra documentation for tracking performance and costs
 */

interface WorkflowMetrics {
  stepId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  inputSize: number;
  outputSize: number;
  retryAttempts: number;
  agentCalls: number;
}

interface EmbeddingMetrics {
  operation: string;
  tokensProcessed: number;
  cost: number;
  latency: number;
  cacheHit: boolean;
}

class WorkflowObservability {
  private metrics: WorkflowMetrics[] = [];
  private embeddingMetrics: EmbeddingMetrics[] = [];

  /**
   * Track step performance and costs
   */
  trackStepExecution(stepId: string, metrics: Partial<WorkflowMetrics>) {
    const existingMetric = this.metrics.find(m => m.stepId === stepId);
    
    if (existingMetric) {
      Object.assign(existingMetric, metrics);
      if (metrics.endTime && existingMetric.startTime) {
        existingMetric.duration = metrics.endTime - existingMetric.startTime;
      }
    } else {
      this.metrics.push({
        stepId,
        startTime: Date.now(),
        success: false,
        inputSize: 0,
        outputSize: 0,
        retryAttempts: 0,
        agentCalls: 0,
        ...metrics,
      });
    }
  }

  /**
   * Track embedding generation performance and costs
   */
  trackEmbedding(metrics: EmbeddingMetrics) {
    this.embeddingMetrics.push(metrics);
  }

  /**
   * Get step performance summary
   */
  getStepMetrics(stepId?: string): WorkflowMetrics[] {
    if (stepId) {
      return this.metrics.filter(m => m.stepId === stepId);
    }
    return this.metrics;
  }

  /**
   * Get overall workflow performance
   */
  getWorkflowSummary() {
    const totalSteps = this.metrics.length;
    const successfulSteps = this.metrics.filter(m => m.success).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const totalRetries = this.metrics.reduce((sum, m) => sum + m.retryAttempts, 0);
    const totalAgentCalls = this.metrics.reduce((sum, m) => sum + m.agentCalls, 0);

    return {
      totalSteps,
      successfulSteps,
      failureRate: ((totalSteps - successfulSteps) / totalSteps) * 100,
      totalDuration,
      averageDuration: totalDuration / totalSteps,
      totalRetries,
      totalAgentCalls,
      embeddingOperations: this.embeddingMetrics.length,
      totalEmbeddingCost: this.embeddingMetrics.reduce((sum, m) => sum + m.cost, 0),
    };
  }

  /**
   * Export metrics for external observability platforms
   */
  exportMetrics() {
    return {
      workflow: this.getWorkflowSummary(),
      steps: this.metrics,
      embeddings: this.embeddingMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear metrics (useful for testing or resetting)
   */
  reset() {
    this.metrics = [];
    this.embeddingMetrics = [];
  }
}

// Singleton instance for workflow-wide tracking
export const workflowObservability = new WorkflowObservability();

/**
 * Decorator for tracking step execution
 */
export function trackStepExecution(stepId: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      workflowObservability.trackStepExecution(stepId, { 
        startTime,
        inputSize: JSON.stringify(args[0] || {}).length,
      });

      try {
        const result = await method.apply(this, args);
        const endTime = Date.now();
        
        workflowObservability.trackStepExecution(stepId, {
          endTime,
          success: true,
          outputSize: JSON.stringify(result || {}).length,
          agentCalls: 1, // Assuming one agent call per step
        });

        return result;
      } catch (error) {
        workflowObservability.trackStepExecution(stepId, {
          endTime: Date.now(),
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    };
  };
}

/**
 * Log workflow performance for debugging
 */
export function logWorkflowPerformance() {
  const summary = workflowObservability.getWorkflowSummary();
  console.log("=== WORKFLOW PERFORMANCE SUMMARY ===");
  console.log(`Steps: ${summary.successfulSteps}/${summary.totalSteps} successful`);
  console.log(`Failure Rate: ${summary.failureRate.toFixed(2)}%`);
  console.log(`Total Duration: ${summary.totalDuration}ms`);
  console.log(`Average Step Duration: ${summary.averageDuration.toFixed(2)}ms`);
  console.log(`Total Retries: ${summary.totalRetries}`);
  console.log(`Total Agent Calls: ${summary.totalAgentCalls}`);
  console.log("=====================================");
}
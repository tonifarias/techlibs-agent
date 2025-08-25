import { z } from "zod";

export const RetryPolicySchema = z.object({
  maxAttempts: z.number().int().min(0).default(3),
  backoffMs: z.number().int().min(0).default(500),
  backoffFactor: z.number().min(1).default(2),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["agent", "tool"]),
  target: z.string().min(1),
  payload: z.unknown(),
  dependsOn: z.array(z.string()).optional().default([]),
  timeoutMs: z.number().int().min(0).optional(),
  retry: RetryPolicySchema.partial().optional(),
  concurrencyGroup: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const ParallizerInputSchema = z.object({
  runId: z.string().min(1),
  concurrency: z.number().int().min(1).optional().default(3),
  timeoutMs: z.number().int().min(0).optional().default(60_000),
  retry: RetryPolicySchema.optional(),
  tasks: z.array(TaskSchema).min(1),
  limits: z
    .object({
      byGroup: z.record(z.number().int().min(1)).optional(),
    })
    .optional()
    .default({}),
});

export type ParallizerInput = z.infer<typeof ParallizerInputSchema>;

export const ResultSchema = z.object({
  id: z.string(),
  status: z.enum(["completed", "failed", "skipped"]),
  durationMs: z.number().int().min(0),
  output: z.unknown().optional(),
  error: z
    .object({ message: z.string(), cause: z.string().optional() })
    .optional(),
});

export type TaskResult = z.infer<typeof ResultSchema>;

export const ParallizerOutputSchema = z.object({
  runId: z.string(),
  status: z.enum(["success", "partial", "failed"]),
  results: z.array(ResultSchema),
  metrics: z.object({
    totalDurationMs: z.number().int().min(0),
    completed: z.number().int().min(0),
    failed: z.number().int().min(0),
    skipped: z.number().int().min(0),
  }),
});

export type ParallizerOutput = z.infer<typeof ParallizerOutputSchema>;


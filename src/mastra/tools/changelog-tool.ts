import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";

type StepInfo = {
  varName: string;
  id: string;
  description: string;
};

type SequenceItem = { type: "step" | "event"; id: string };

function parseSteps(contents: string): StepInfo[] {
  const lines = contents.split("\n");
  const steps: StepInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/const\s+([A-Za-z0-9_]+)\s*=\s*createStep\(/);
    if (!match) continue;

    const varName = match[1];
    let id: string | undefined;
    let description: string | undefined;

    // Heuristically scan next ~40 lines for id/description before execute
    for (let j = i; j < Math.min(i + 40, lines.length); j++) {
      if (!id) {
        const idMatch = lines[j].match(/id:\s*["'`]([^"'`]+)["'`]/);
        if (idMatch) id = idMatch[1].trim();
      }
      if (!description) {
        const dMatch = lines[j].match(/description:\s*["'`]([^"'`]+)["'`]/);
        if (dMatch) description = dMatch[1].trim();
      }
      if (lines[j].includes("execute:")) break;
      if (id && description) break;
    }

    steps.push({ varName, id: id ?? varName, description: description ?? "" });
  }

  return steps;
}

function parseSequence(contents: string): SequenceItem[] {
  const start = contents.indexOf("createWorkflow");
  if (start === -1) return [];
  const tail = contents.slice(start);
  const sequence: SequenceItem[] = [];

  let pos = 0;
  while (pos < tail.length) {
    const nextThen = tail.indexOf(".then(", pos);
    const nextWait = tail.indexOf(".waitForEvent(", pos);

    if (nextThen === -1 && nextWait === -1) break;

    if (nextWait !== -1 && (nextThen === -1 || nextWait < nextThen)) {
      // Event first
      const sub = tail.slice(nextWait);
      const m = sub.match(/\.waitForEvent\(\s*["'`]([^"'`]+)["'`]/);
      if (m) {
        sequence.push({ type: "event", id: m[1] });
      }
      pos = nextWait + 13; // advance past .waitForEvent(
    } else {
      // Then first
      const sub = tail.slice(nextThen);
      const m = sub.match(/\.then\(\s*([A-Za-z0-9_]+)\s*\)/);
      if (m) {
        sequence.push({ type: "step", id: m[1] });
      }
      pos = nextThen + 6; // advance past .then(
    }
  }

  return sequence;
}

function parseWorkflowId(contents: string): string | undefined {
  const m = contents.match(/createWorkflow\(\{[\s\S]*?id:\s*["'`]([^"'`]+)["'`]/);
  return m?.[1];
}

function parseSchemaKeys(contents: string, constName: string): string[] {
  const re = new RegExp(
    `const\\s+${constName}\\s*=\\s*z\\.object\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)`,
    "m"
  );
  const m = contents.match(re);
  if (!m) return [];
  const block = m[1];
  const keys: string[] = [];
  const lines = block.split("\n");
  for (const line of lines) {
    const km = line.match(/\s*([A-Za-z0-9_]+)\s*:/);
    if (km) keys.push(km[1]);
  }
  return keys;
}

function renderMarkdown(args: {
  workflowId?: string;
  steps: StepInfo[];
  sequence: SequenceItem[];
  inputKeys: string[];
  outputKeys: string[];
  sourcePath: string;
}): string {
  const { workflowId, steps, sequence, inputKeys, outputKeys, sourcePath } =
    args;
  const date = new Date().toISOString();
  const stepMap: Record<string, StepInfo> = Object.fromEntries(
    steps.map((s) => [s.varName, s])
  );
  const events = Array.from(
    new Set(sequence.filter((s) => s.type === "event").map((e) => e.id))
  );

  const stepLines = steps.map(
    (s) => `- ${s.id}: ${s.description}${s.varName !== s.id ? ` (var: ${s.varName})` : ""}`
  );

  const seqLines = sequence.map((item, idx) => {
    if (item.type === "event") return `${idx + 1}. event: ${item.id}`;
    const resolved = stepMap[item.id]?.id ?? item.id;
    return `${idx + 1}. step: ${resolved}`;
  });

  return [
    `# Changelog — ${workflowId ?? "workflow"}`,
    ``,
    `Generated: ${date}`,
    `Source: ${sourcePath}`,
    ``,
    `## Steps (${steps.length})`,
    ...stepLines,
    ``,
    `## Execution order (${sequence.length})`,
    ...seqLines,
    ``,
    `## Approval gates (${events.length})`,
    ...events.map((e) => `- ${e}`),
    ``,
    `## Contracts`,
    `- Input: ${inputKeys.join(", ") || "(none)"}`,
    `- Output: ${outputKeys.join(", ") || "(none)"}`,
    ``,
    `> Generated automatically from the workflow source. Do not edit by hand.`,
    ``,
  ].join("\n");
}

export const changelogTool = createTool({
  id: "generate-workflow-changelog",
  description:
    "Generate a Markdown changelog for techlibs-agent workflow and write to plans/changelog.md",
  inputSchema: z.object({
    workflowPath: z
      .string()
      .optional()
      .describe("Absolute path to workflow TS file"),
    changelogPath: z
      .string()
      .optional()
      .describe("Absolute path to output changelog markdown"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    changelogPath: z.string(),
    stepsCount: z.number(),
    eventsCount: z.number(),
    message: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const rootDir = (runtimeContext as any)?.cwd || process.cwd();
      const workflowPath = (context as any)?.workflowPath
        ? String((context as any).workflowPath)
        : path.resolve(
            rootDir,
            "src/mastra/workflows/techlibs-agent-workflow.ts"
          );
      const changelogPath = (context as any)?.changelogPath
        ? String((context as any).changelogPath)
        : path.resolve(rootDir, "plans/changelog.md");

      const contents = await fs.readFile(workflowPath, "utf-8");

      const steps = parseSteps(contents);
      const sequence = parseSequence(contents);
      const inputKeys = parseSchemaKeys(contents, "initInputSchema");
      const outputKeys = parseSchemaKeys(contents, "finalOutputSchema");
      const workflowId = parseWorkflowId(contents);

      const markdown = renderMarkdown({
        workflowId,
        steps,
        sequence,
        inputKeys,
        outputKeys,
        sourcePath: workflowPath,
      });

      await fs.mkdir(path.dirname(changelogPath), { recursive: true });
      await fs.writeFile(changelogPath, markdown, "utf-8");

      const eventsCount = sequence.filter((s) => s.type === "event").length;
      return {
        success: true,
        changelogPath,
        stepsCount: steps.length,
        eventsCount,
        message: `Changelog generated with ${steps.length} steps and ${eventsCount} events`,
      };
    } catch (error) {
      return {
        success: false,
        changelogPath: "",
        stepsCount: 0,
        eventsCount: 0,
        message:
          error instanceof Error
            ? `Failed to generate changelog: ${error.message}`
            : "Failed to generate changelog: Unknown error",
      };
    }
  },
});

export default changelogTool;



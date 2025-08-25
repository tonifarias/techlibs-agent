import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { changelogTool } from "../changelog-tool";

describe("Changelog Tool", () => {
  it("generates a changelog markdown from the workflow", async () => {
    const thisFile = fileURLToPath(import.meta.url);
    const testDir = path.dirname(thisFile);
    const projectRoot = path.resolve(testDir, "../../../..");
    const workflowPath = path.resolve(
      projectRoot,
      "src/mastra/workflows/techlibs-agent-workflow.ts"
    );

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "changelog-"));
    const outPath = path.resolve(tmpDir, "changelog.md");

    const result = await changelogTool.execute({
      context: {
        workflowPath,
        changelogPath: outPath,
      },
      runtimeContext: { cwd: projectRoot } as any,
    } as any);

    expect(result.success).toBe(true);
    expect(result.changelogPath).toBe(outPath);
    expect(result.stepsCount).toBeGreaterThan(0);

    const md = await fs.readFile(outPath, "utf-8");
    expect(md).toContain("# Changelog");
    expect(md).toContain("## Steps");
    expect(md).toContain("## Execution order");
    expect(md).toContain("## Contracts");
  });
});



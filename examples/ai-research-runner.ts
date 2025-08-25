import { mastra } from "../src/mastra/index.js";

async function main() {
  const problemStatement =
    process.env.PROBLEM_STATEMENT ?? "Marketplace petshop B2B platform";
  const companyContext = process.env.COMPANY_CONTEXT ?? "";
  const constraints = (process.env.CONSTRAINTS ?? "")
    .split("||")
    .filter(Boolean);
  const assets = (process.env.ASSETS ?? "").split("||").filter(Boolean);

  const result = await mastra.runWorkflow("ai-research-workflow", {
    problemStatement,
    companyContext,
    constraints,
    assets,
  });

  // Print only the ai-research fields
  console.log(
    JSON.stringify(
      {
        researchBrief: result.researchBrief,
        keyFindings: result.keyFindings,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

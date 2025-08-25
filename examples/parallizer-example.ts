import { mastra } from "../src/mastra";

async function main() {
  const agent = mastra.getAgent("parallizerAgent");
  if (!agent) throw new Error("parallizerAgent not found");

  const input = {
    runId: "demo-1",
    concurrency: 3,
    limits: { byGroup: { github: 2 } },
    tasks: [
      {
        id: "A",
        type: "tool" as const,
        target: "memory-operations",
        payload: { operation: "store", key: "demo", value: "hello", namespace: "parallizer" },
      },
      {
        id: "B",
        type: "agent" as const,
        target: "developerAgent",
        payload: { request: "Return {\"ok\":true} strictly as JSON" },
        dependsOn: ["A"],
      },
      {
        id: "C",
        type: "tool" as const,
        target: "memory-operations",
        payload: { operation: "retrieve", key: "demo", namespace: "parallizer" },
        dependsOn: ["B"],
        concurrencyGroup: "github",
      },
    ],
  };

  const res = await agent.generate([
    { role: "system", content: "Call the tool with the user JSON" },
    { role: "user", content: JSON.stringify(input) },
  ]);

  console.log((res as any).text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


import { describe, it, expect } from "vitest";
import { mastra } from "../../../index";

describe("parallizerAgent integration", () => {
  it("is registered and can be retrieved", () => {
    const agent = mastra.getAgent("parallizerAgent");
    expect(agent).toBeTruthy();
  });
});


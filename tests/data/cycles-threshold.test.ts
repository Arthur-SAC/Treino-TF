import { describe, it, expect } from "vitest";
import { CYCLES } from "../../src/data/cycles-seed";

describe("CYCLES thresholds", () => {
  it("Adaptação foi encurtada para 28 sessões", () => {
    const adapt = CYCLES.find((c) => c.id === "adaptacao");
    expect(adapt?.threshold).toBe(28);
  });
  it("demais ciclos seguem em 60", () => {
    for (const id of ["variacao", "hipertrofia", "refinamento"]) {
      expect(CYCLES.find((c) => c.id === id)?.threshold).toBe(60);
    }
  });
});

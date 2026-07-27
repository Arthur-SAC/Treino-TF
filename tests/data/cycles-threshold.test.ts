import { describe, it, expect } from "vitest";
import { CYCLES, CYCLE_TO_GOAL } from "../../src/data/cycles-seed";

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

describe("Fase de Entrada", () => {
  it("os três ciclos de entrada vêm antes de adaptação, nesta ordem", () => {
    const ids = CYCLES.map((c) => c.id);
    expect(ids.slice(0, 4)).toEqual(["entrada-1", "entrada-2", "entrada-3", "adaptacao"]);
  });

  it("cada semana da entrada fecha em 5 sessões", () => {
    for (const id of ["entrada-1", "entrada-2", "entrada-3"]) {
      expect(CYCLES.find((c) => c.id === id)?.threshold).toBe(5);
    }
  });

  it("as três semanas de entrada usam o plano de déficit", () => {
    for (const id of ["entrada-1", "entrada-2", "entrada-3"] as const) {
      expect(CYCLE_TO_GOAL[id]).toBe("deficit");
    }
  });
});

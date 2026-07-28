import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

describe("seed da Fase de Entrada", () => {
  it("os ids da Entrada não colidem com nenhum template existente", () => {
    const existentes = new Set([...WORKOUT_PLAN, ...CYCLE_TEMPLATES].map((t) => t.id));
    const colisoes = ENTRADA_TEMPLATES.filter((t) => existentes.has(t.id)).map((t) => t.id);
    expect(colisoes).toEqual([]);
  });

  it("são 15 templates ao todo", () => {
    expect(ENTRADA_TEMPLATES).toHaveLength(15);
  });
});

import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("zona 2 saiu dos treinos — a caminhada de 5 km já entrega", () => {
  it("nenhum template prescreve cardio-zona2", () => {
    const comZona2 = ALL_TEMPLATES
      .filter((t) => t.exercises.some((e) => e.exerciseId === "cardio-zona2"))
      .map((t) => t.id);
    expect(comZona2).toEqual([]);
  });

  it("o exercício continua no catálogo — a prescrição migrou, não sumiu", () => {
    expect(EXERCISES.find((e) => e.id === "cardio-zona2")).toBeDefined();
  });

  it("o aquecimento na esteira continua nos dias de força", () => {
    const comAquecimento = ALL_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "cardio-leve-esteira"),
    );
    expect(comAquecimento.length).toBeGreaterThan(0);
  });
});

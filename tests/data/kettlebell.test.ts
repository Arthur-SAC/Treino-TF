import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

describe("kettlebell", () => {
  it("o swing existe no catálogo e é de dobradiça (glúteo)", () => {
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing).toBeDefined();
    expect(swing?.category).toBe("gluteo");
    expect(swing?.equipment).toContain("kettlebell");
  });

  it("o swing não aparece na Entrada nem na Adaptação — exige dobradiça já aprendida", () => {
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing?.difficulty).not.toBe("iniciante");
  });

  it("o swing é programado em algum ciclo de variação em diante", () => {
    const usado = CYCLE_TEMPLATES.some((t) =>
      t.exercises.some((e) => e.exerciseId === "kettlebell-swing"),
    );
    expect(usado).toBe(true);
  });
});

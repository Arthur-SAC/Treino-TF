import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";

describe("kettlebell", () => {
  it("o swing existe no catálogo e é de dobradiça (glúteo)", () => {
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing).toBeDefined();
    expect(swing?.category).toBe("gluteo");
    expect(swing?.equipment).toContain("kettlebell");
  });

  it("o swing não é programado na Entrada nem na Adaptação — exige dobradiça já aprendida", () => {
    // Varre os templates de verdade: `exposureLevel` 3 passaria na rampa da
    // semana 2 da Entrada, então a checagem de dificuldade não protege nada.
    const programado = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN]
      .filter((t) => t.exercises.some((e) => e.exerciseId === "kettlebell-swing"))
      .map((t) => t.id);
    expect(programado).toEqual([]);
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing?.difficulty).not.toBe("iniciante");
  });

  // Máquina primeiro (decisão dela, 2026-11-09): o pull-through na polia é o
  // principal e o swing ficou como plano B dele. O que a regra protege é o
  // swing continuar no programa, como exercício OU como substituto.
  it("o swing continua no programa da variação em diante, como exercício ou plano B", () => {
    const usado = CYCLE_TEMPLATES.some((t) =>
      t.exercises.some((e) => e.exerciseId === "kettlebell-swing" || e.substitutoId === "kettlebell-swing"),
    );
    expect(usado).toBe(true);
  });
});

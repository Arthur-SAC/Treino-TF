import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

const TODOS = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("correções de programação (Bloco B da spec 2026-07-27)", () => {
  it("nenhum template usa puxada aberta — ela alarga o dorsal", () => {
    const usos = TODOS.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "puxada-frente-maquina"),
    ).map((t) => t.id);
    expect(usos).toEqual([]);
  });

  it("búlgaro não aparece na Adaptação — é avançado demais pra iniciante a 96 kg", () => {
    const naAdaptacao = WORKOUT_PLAN.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "agachamento-bulgaro"),
    ).map((t) => t.id);
    expect(naAdaptacao).toEqual([]);
  });

  it("a Adaptação ensina dobradiça de quadril", () => {
    const temHinge = WORKOUT_PLAN.some((t) =>
      t.exercises.some((e) => ["stiff", "good-morning", "stiff-unilateral"].includes(e.exerciseId)),
    );
    expect(temHinge).toBe(true);
  });

  it("o peitoral da hipertrofia é leve — pesado constrói peito masculino", () => {
    const h = CYCLE_TEMPLATES.find((t) => t.id === "h-ter-cintura-costas");
    const supino = h?.exercises.find((e) => e.exerciseId === "supino-inclinado-halteres");
    expect(supino?.sets).toBeLessThanOrEqual(3);
    expect(supino?.repsTarget.toLowerCase()).toContain("leve");
  });

  it("todo dia de força fecha com zona 2 explícita, não com uma observação solta", () => {
    const diasDeForca = TODOS.filter(
      (t) => t.cycle && t.exercises.some((e) => e.exerciseId === "hip-thrust-barra" || e.exerciseId === "smith-squat"),
    );
    const semZona2 = diasDeForca
      .filter((t) => !t.exercises.some((e) => e.exerciseId === "cardio-zona2"))
      .map((t) => t.id);
    expect(semZona2).toEqual([]);
  });
});

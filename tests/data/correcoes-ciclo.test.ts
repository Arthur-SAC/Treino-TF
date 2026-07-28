import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import type { WorkoutTemplate } from "../../src/lib/db";

const TODOS = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

// Dia de inferior: o que carrega quadril/coxa por agachamento, dobradiça ou
// extensão de quadril. É onde a zona 2 entra — e em nenhum outro.
const INFERIOR = [
  "hip-thrust-barra",
  "hip-thrust-unilateral",
  "smith-squat",
  "agachamento-livre",
  "agachamento-sumo",
  "agachamento-bulgaro",
  "stiff",
  "stiff-unilateral",
  "good-morning",
];

const ehInferior = (t: WorkoutTemplate) =>
  t.exercises.some((e) => INFERIOR.includes(e.exerciseId));

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

  it("todo dia de inferior fecha com zona 2 explícita, e só os dias de inferior a programam", () => {
    const temZona2 = (t: (typeof TODOS)[number]) =>
      t.exercises.some((e) => e.exerciseId === "cardio-zona2");
    const faltando = TODOS.filter((t) => ehInferior(t) && !temZona2(t)).map((t) => t.id);
    const sobrando = TODOS.filter((t) => !ehInferior(t) && temZona2(t)).map((t) => t.id);
    expect({ faltando, sobrando }).toEqual({ faltando: [], sobrando: [] });
  });

  it("a zona 2 cai 3x por semana em todo ciclo — a dose que o guia da sessão promete", () => {
    const ciclos = [...new Set(TODOS.map((t) => t.cycle))];
    const contagem = Object.fromEntries(
      ciclos.map((c) => [
        c,
        TODOS.filter((t) => t.cycle === c && t.exercises.some((e) => e.exerciseId === "cardio-zona2")).length,
      ]),
    );
    for (const c of ciclos) {
      expect({ ciclo: c, dias: contagem[c as string] }).toEqual({ ciclo: c, dias: 3 });
    }
  });

  it("na Entrada a regra é a mesma, com o dia leve de exceção — lá o cardio é o treino", () => {
    const DIA_LEVE = ["e1-qui", "e2-qui", "e3-qui"];
    const temZona2 = (t: WorkoutTemplate) => t.exercises.some((e) => e.exerciseId === "cardio-zona2");
    const faltando = ENTRADA_TEMPLATES.filter((t) => ehInferior(t) && !temZona2(t)).map((t) => t.id);
    const sobrando = ENTRADA_TEMPLATES
      .filter((t) => !ehInferior(t) && temZona2(t) && !DIA_LEVE.includes(t.id))
      .map((t) => t.id);
    expect({ faltando, sobrando }).toEqual({ faltando: [], sobrando: [] });
    for (const cycle of ["entrada-1", "entrada-2", "entrada-3"]) {
      const dias = ENTRADA_TEMPLATES.filter((t) => t.cycle === cycle && temZona2(t)).length;
      expect({ cycle, dias }).toEqual({ cycle, dias: 3 });
    }
  });
});

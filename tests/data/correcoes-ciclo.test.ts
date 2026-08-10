import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import type { WorkoutTemplate } from "../../src/lib/db";

const TODOS = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

// Dia de inferior: o que carrega quadril/coxa por agachamento, dobradiça ou
// extensão de quadril. Usado abaixo só pra confirmar que a zona 2 não
// programa mais em nenhum deles — a caminhada de 5 km do trabalho pra casa
// já entrega a dose todo dia útil (2026-08-10).
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

  it("nenhum dia de inferior programa mais zona 2 — a caminhada diária já entrega a dose", () => {
    const temZona2 = (t: (typeof TODOS)[number]) =>
      t.exercises.some((e) => e.exerciseId === "cardio-zona2");
    const aindaComZona2 = TODOS.filter((t) => ehInferior(t) && temZona2(t)).map((t) => t.id);
    expect(aindaComZona2).toEqual([]);
  });

  it("a zona 2 não cai mais em nenhum dia de nenhum ciclo — a caminhada diária já entrega a dose", () => {
    const ciclos = [...new Set(TODOS.map((t) => t.cycle))];
    const contagem = Object.fromEntries(
      ciclos.map((c) => [
        c,
        TODOS.filter((t) => t.cycle === c && t.exercises.some((e) => e.exerciseId === "cardio-zona2")).length,
      ]),
    );
    for (const c of ciclos) {
      expect({ ciclo: c, dias: contagem[c as string] }).toEqual({ ciclo: c, dias: 0 });
    }
  });

  // Na Entrada a distribuição costumava ser declarada item por item: a quarta
  // (glúteo médio + solo) fechava com zona 2 por ser o dia LEVE de carga, a
  // terça (postura + core) ficava de fora de propósito. Essa distribuição
  // sumiu inteira em 2026-08-10 — a caminhada de 5 km do trabalho pra casa,
  // todo dia útil, já entrega a dose em quantidade melhor que os 3-4x/semana
  // que a sessão programava.
  it("na Entrada, nenhum dia fecha mais com cardio — a caminhada diária já entrega a dose", () => {
    const temZona2 = (t: WorkoutTemplate) => t.exercises.some((e) => e.exerciseId === "cardio-zona2");
    for (const semana of ["1", "2", "3"]) {
      const comCardio = ENTRADA_TEMPLATES.filter((t) => t.cycle === `entrada-${semana}` && temZona2(t))
        .map((t) => t.id)
        .sort();
      expect(comCardio).toEqual([]);
    }
  });

  it("nenhum dia de inferior da Entrada programa mais zona 2", () => {
    const temZona2 = (t: WorkoutTemplate) => t.exercises.some((e) => e.exerciseId === "cardio-zona2");
    const aindaComZona2 = ENTRADA_TEMPLATES.filter((t) => ehInferior(t) && temZona2(t)).map((t) => t.id);
    expect(aindaComZona2).toEqual([]);
  });

  it("o cardio é sempre o ÚLTIMO exercício da sessão da Entrada, nunca no meio", () => {
    const foraDoFim = ENTRADA_TEMPLATES.filter((t) => {
      const i = t.exercises.findIndex((e) => e.exerciseId === "cardio-zona2");
      return i >= 0 && i !== t.exercises.length - 1;
    }).map((t) => t.id);
    expect(foraDoFim).toEqual([]);
  });
});

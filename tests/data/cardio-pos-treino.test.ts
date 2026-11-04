import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { CYCLE_TO_GOAL, type CycleId } from "../../src/data/cycles-seed";
import { semCardioPosTreinoNaEsteira, CARDIO_POS_TREINO } from "../../src/lib/session-order";
import { isTimeBased } from "../../src/lib/progression";

// 2026-11-04: ela pediu pra acelerar a fase 1. A caminhada de 5 km já é a zona
// 2 do dia; o acelerador que sobra é 15-20 min de cardio leve logo depois da
// força, só enquanto o plano é de déficit.
const ex = EXERCISES.find((e) => e.id === CARDIO_POS_TREINO);
const texto = ex ? [ex.name, ex.description, ex.successCue ?? "", ...(ex.proTips ?? []), ex.easierVariation ?? "", ex.harderVariation ?? ""].join(" | ") : "";
const deficit = (t: { cycle?: string }) => CYCLE_TO_GOAL[t.cycle as CycleId] === "deficit";

describe("cardio pós-treino", () => {
  it("existe no catálogo, é por tempo e diz 15-20 min", () => {
    expect(ex).toBeTruthy();
    expect(ex!.category).toBe("cardio");
    expect(texto).toMatch(/15\s*-\s*20\s*min/);
  });

  it("diz a intensidade com número e o teste da conversa", () => {
    expect(texto).toMatch(/\d+\s*-\s*\d+\s*%/);
    expect(texto).toMatch(/conversa/i);
    expect(ex!.successCue).toBeTruthy();
  });

  it("não chama atenção: entra até na primeira semana da Entrada", () => {
    expect(ex!.exposureLevel).toBeLessThanOrEqual(1);
  });

  it("fecha todo treino de déficit, uma vez só e por último", () => {
    for (const t of ALL_TEMPLATES.filter(deficit)) {
      const itens = t.exercises.filter((e) => e.exerciseId === CARDIO_POS_TREINO);
      expect({ id: t.id, n: itens.length }).toEqual({ id: t.id, n: 1 });
      expect({ id: t.id, ultimo: t.exercises.at(-1)?.exerciseId, bloco: t.exercises.at(-1)?.block })
        .toEqual({ id: t.id, ultimo: CARDIO_POS_TREINO, bloco: "final" });
      expect(isTimeBased(t.exercises.at(-1)!.repsTarget)).toBe(true);
    }
  });

  it("não entra na construção nem na manutenção — lá a balança sobe de propósito", () => {
    const fora = ALL_TEMPLATES.filter((t) => !deficit(t))
      .filter((t) => t.exercises.some((e) => e.exerciseId === CARDIO_POS_TREINO))
      .map((t) => t.id);
    expect(fora).toEqual([]);
  });

  it("no modo esteira some: a esteira de 1 h depois da força já é o cardio do dia", () => {
    const tpl = ALL_TEMPLATES.find(deficit)!;
    expect(semCardioPosTreinoNaEsteira(tpl.exercises, "esteira").some((e) => e.exerciseId === CARDIO_POS_TREINO)).toBe(false);
    expect(semCardioPosTreinoNaEsteira(tpl.exercises, "caminhada")).toEqual(tpl.exercises);
    expect(semCardioPosTreinoNaEsteira(tpl.exercises, "pausada")).toEqual(tpl.exercises);
  });
});

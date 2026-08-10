import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES, CYCLES } from "../../src/data/cycles-seed";

describe("integridade dos templates", () => {
  it("ALL_TEMPLATES junta os três conjuntos, sem sobra nem falta", () => {
    expect(ALL_TEMPLATES).toHaveLength(
      ENTRADA_TEMPLATES.length + WORKOUT_PLAN.length + CYCLE_TEMPLATES.length,
    );
  });

  it("nenhum template repete o mesmo exerciseId duas vezes", () => {
    // SessionDetail usa `key={tplEx.exerciseId}`. Com a reordenação por bloco,
    // uma key duplicada faria o React reaproveitar o SessionRecorder errado —
    // vazando reps e peso digitados de um exercício pro outro.
    const duplicados = ALL_TEMPLATES.flatMap((t) => {
      const vistos = new Set<string>();
      return t.exercises
        .filter((e) => (vistos.has(e.exerciseId) ? true : (vistos.add(e.exerciseId), false)))
        .map((e) => `${t.id}: ${e.exerciseId}`);
    });
    expect(duplicados).toEqual([]);
  });

  it("nenhum id de template se repete entre os ciclos", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(ids).toHaveLength(new Set(ids).size);
  });
});

describe("nenhuma fase de treino existe para alinhar com a TRH", () => {
  it("as descrições dos ciclos não citam TRH", () => {
    const comTRH = CYCLES.filter((c) => /TRH/i.test(c.description)).map((c) => c.id);
    expect(comTRH).toEqual([]);
  });

  it("os propósitos dos templates não citam TRH", () => {
    const comTRH = ALL_TEMPLATES
      .filter((t) => /TRH/i.test(t.purpose ?? ""))
      .map((t) => t.id);
    expect(comTRH).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

// A tabela congelada de contagem e duração da hipertrofia/refinamento/manutenção
// saiu em 2026-11-09: os ciclos foram reescritos pra Smartfit Jardins e a regra
// passou a ser ≤ 60 min pelo estimador (tests/data/fase2-smartfit.test.ts).
describe("as trocas não fazem a sessão crescer", () => {
  it("o goblet saiu do limbo — estava no catálogo sem estar em treino nenhum", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "agachamento-goblet"));
    expect(usos.length).toBeGreaterThanOrEqual(4);
  });

  it("o carregamento frontal entrou nos ciclos de construção", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "carregamento-frontal"));
    expect(usos.length).toBeGreaterThanOrEqual(3);
  });

  it("a prancha antirrotação entrou", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "prancha-antirrotacao"));
    expect(usos.length).toBeGreaterThanOrEqual(4);
  });

  it("todo exerciseId dos templates existe no catálogo — troca não pode deixar id órfão", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    const orfaos = ALL_TEMPLATES.flatMap((t) => t.exercises.map((e) => e.exerciseId)).filter((id) => !ids.has(id));
    expect([...new Set(orfaos)]).toEqual([]);
  });

  it("o vacuum abdominal não foi sacrificado — é a alavanca da cintura dela", () => {
    const comVacuum = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "vacuum-abdominal"));
    expect(comVacuum.length).toBeGreaterThanOrEqual(6);
  });
});

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

  // Máquina primeiro (2026-11-09): o pallof na polia é o principal e a prancha
  // antirrotação ficou como plano B dele — conta como exercício OU substituto.
  it("a prancha antirrotação entrou (como exercício ou plano B do pallof)", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "prancha-antirrotacao" || e.substitutoId === "prancha-antirrotacao"));
    expect(usos.length).toBeGreaterThanOrEqual(4);
  });

  it("todo exerciseId dos templates existe no catálogo — troca não pode deixar id órfão", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    const orfaos = ALL_TEMPLATES.flatMap((t) => t.exercises.map((e) => e.exerciseId)).filter((id) => !ids.has(id));
    expect([...new Set(orfaos)]).toEqual([]);
  });

  // O vacuum saiu da academia em 2026-11-09 e passou a ser diário em casa, no
  // alongamento da manhã — a regra que protege a alavanca da cintura dela agora
  // é "vacuum todo dia fora do treino" (tests/data/maquina-primeiro.test.ts).
  it("o vacuum abdominal não foi sacrificado — continua no catálogo", () => {
    expect(EXERCISES.some((e) => e.id === "vacuum-abdominal")).toBe(true);
  });
});

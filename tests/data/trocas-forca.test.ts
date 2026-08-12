import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

/** Contagem e duração por template ANTES desta task. Congelado de propósito:
 *  a decisão da usuária é que a sessão não cresce, e um número escrito aqui é
 *  o que impede alguém de "só acrescentar um exercício" depois. */
const ANTES: Record<string, { ex: number; min: number }> = {
  "v-seg-gluteo-unilateral": { ex: 7, min: 42 },
  "v-ter-cintura-costas": { ex: 8, min: 52 },
  "v-qua-mobilidade-danca": { ex: 10, min: 54 },
  "v-qui-gluteo-stiff": { ex: 8, min: 37 },
  "v-sex-peitoral-postura": { ex: 7, min: 32 },
  "h-seg-gluteo-volume": { ex: 7, min: 47 },
  "h-ter-cintura-costas": { ex: 6, min: 35 },
  "h-qua-mobilidade-danca": { ex: 9, min: 54 },
  "h-qui-gluteo-posterior": { ex: 7, min: 37 },
  "h-sex-peitoral-postura": { ex: 8, min: 37 },
  "r-seg-gluteo-densidade": { ex: 7, min: 32 },
  "r-ter-cintura-postura": { ex: 8, min: 48 },
  "r-qua-mobilidade-danca": { ex: 9, min: 56 },
  "r-qui-gluteo-simetria": { ex: 7, min: 32 },
  "r-sex-peitoral-refinamento": { ex: 7, min: 32 },
  "m-seg-gluteo": { ex: 6, min: 32 },
  "m-ter-superior": { ex: 7, min: 45 },
  "m-qua-mobilidade": { ex: 8, min: 48 },
  "m-qui-gluteo": { ex: 5, min: 27 },
  "m-sex-gluteo": { ex: 6, min: 27 },
};

describe("as trocas não fazem a sessão crescer", () => {
  it("nenhum template ganhou ou perdeu exercício", () => {
    const divergentes = Object.entries(ANTES)
      .map(([id, esperado]) => {
        const t = ALL_TEMPLATES.find((x) => x.id === id);
        return { id, agora: t?.exercises.length, esperado: esperado.ex };
      })
      .filter((r) => r.agora !== r.esperado);
    expect(divergentes).toEqual([]);
  });

  it("nenhum template mudou de duração", () => {
    const divergentes = Object.entries(ANTES)
      .map(([id, esperado]) => {
        const t = ALL_TEMPLATES.find((x) => x.id === id);
        return { id, agora: t?.durationMin, esperado: esperado.min };
      })
      .filter((r) => r.agora !== r.esperado);
    expect(divergentes).toEqual([]);
  });

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

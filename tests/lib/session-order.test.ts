import { describe, it, expect } from "vitest";
import { ordenarPorBloco } from "../../src/lib/session-order";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import type { WorkoutTemplate } from "../../src/lib/db";

type TplEx = WorkoutTemplate["exercises"][number];

function ex(exerciseId: string, block?: TplEx["block"]): TplEx {
  return { exerciseId, sets: 1, repsTarget: "10", restSec: 30, block };
}

const ids = (lista: TplEx[]) => lista.map((e) => e.exerciseId);

describe("ordenarPorBloco", () => {
  const sessao: TplEx[] = [
    ex("bike-reclinada", "aquecimento"),
    ex("smith-squat", "maquina"),
    ex("abdutor-maquina", "maquina"),
    ex("ponte-gluteo-band", "solo"),
    ex("cardio-zona2", "final"),
  ];

  it("o aquecimento abre e o cardio final fecha, nos dois valores de soloPrimeiro", () => {
    for (const soloPrimeiro of [false, true]) {
      const saida = ids(ordenarPorBloco(sessao, soloPrimeiro));
      expect(saida[0]).toBe("bike-reclinada");
      expect(saida.at(-1)).toBe("cardio-zona2");
    }
  });

  it("só o miolo troca de lugar — máquina e solo, nada mais", () => {
    expect(ids(ordenarPorBloco(sessao, false))).toEqual([
      "bike-reclinada", "smith-squat", "abdutor-maquina", "ponte-gluteo-band", "cardio-zona2",
    ]);
    expect(ids(ordenarPorBloco(sessao, true))).toEqual([
      "bike-reclinada", "ponte-gluteo-band", "smith-squat", "abdutor-maquina", "cardio-zona2",
    ]);
  });

  it("a ordem interna de cada bloco do miolo é preservada quando ele troca de lugar", () => {
    const comDoisDeCada: TplEx[] = [
      ex("smith-squat", "maquina"),
      ex("adutora-maquina", "maquina"),
      ex("prancha", "solo"),
      ex("dead-bug", "solo"),
    ];
    expect(ids(ordenarPorBloco(comDoisDeCada, true))).toEqual([
      "prancha", "dead-bug", "smith-squat", "adutora-maquina",
    ]);
  });

  it("template sem bloco nenhum sai idêntico à entrada (ciclos antigos)", () => {
    const antigo: TplEx[] = [ex("cardio-leve-esteira"), ex("hip-thrust-barra"), ex("cardio-zona2")];
    for (const soloPrimeiro of [false, true]) {
      expect(ordenarPorBloco(antigo, soloPrimeiro)).toEqual(antigo);
    }
    for (const t of WORKOUT_PLAN) {
      expect(ordenarPorBloco(t.exercises, true)).toEqual(t.exercises);
    }
  });

  it("a ordem padrão segue a ordem autorada, não uma convenção fixa de máquina-antes-de-solo", () => {
    const soloAutoradoPrimeiro: TplEx[] = [
      ex("bike-reclinada", "aquecimento"),
      ex("stiff", "solo"),
      ex("smith-squat", "maquina"),
      ex("adutora-maquina", "maquina"),
      ex("cardio-zona2", "final"),
    ];
    // soloPrimeiro = false (padrão): a ordem renderizada segue a autorada — solo antes de máquina.
    expect(ids(ordenarPorBloco(soloAutoradoPrimeiro, false))).toEqual([
      "bike-reclinada", "stiff", "smith-squat", "adutora-maquina", "cardio-zona2",
    ]);
    // soloPrimeiro = true inverte a ordem natural: máquina passa a vir primeiro.
    expect(ids(ordenarPorBloco(soloAutoradoPrimeiro, true))).toEqual([
      "bike-reclinada", "smith-squat", "adutora-maquina", "stiff", "cardio-zona2",
    ]);
  });

  it("nos 15 templates da Entrada, a ordem padrão é IDÊNTICA à ordem autorada", () => {
    expect(ENTRADA_TEMPLATES).toHaveLength(15);
    for (const t of ENTRADA_TEMPLATES) {
      expect({ id: t.id, ordem: ids(ordenarPorBloco(t.exercises, false)) })
        .toEqual({ id: t.id, ordem: ids(t.exercises) });
    }
  });

  it("na Entrada o aquecimento nunca vem depois de carga e o cardio final nunca vem antes", () => {
    for (const soloPrimeiro of [false, true]) {
      for (const t of ENTRADA_TEMPLATES) {
        const saida = ordenarPorBloco(t.exercises, soloPrimeiro);
        const ultimoAquecimento = saida.map((e) => e.block).lastIndexOf("aquecimento");
        const primeiroFinal = saida.findIndex((e) => e.block === "final");
        const primeiroMiolo = saida.findIndex((e) => e.block === "maquina" || e.block === "solo");
        if (primeiroMiolo >= 0) {
          expect(ultimoAquecimento).toBeLessThan(primeiroMiolo);
          if (primeiroFinal >= 0) expect(primeiroFinal).toBeGreaterThan(primeiroMiolo);
        }
        if (primeiroFinal >= 0) expect(primeiroFinal).toBe(saida.length - 1);
      }
    }
  });
});

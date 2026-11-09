import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";

describe("Fase de Entrada — blocos independentes", () => {
  it("todo exercício da Entrada declara a que bloco pertence", () => {
    const semBloco = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises.filter((e) => !e.block).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(semBloco).toEqual([]);
  });

  it("toda sessão abre pelo aquecimento", () => {
    const semAquecimento = ENTRADA_TEMPLATES
      .filter((t) => t.exercises[0].block !== "aquecimento")
      .map((t) => t.id);
    expect(semAquecimento).toEqual([]);
  });

  it("quem programa cardio final o coloca por último, e só uma vez", () => {
    for (const t of ENTRADA_TEMPLATES) {
      const finais = t.exercises.filter((e) => e.block === "final");
      if (finais.length === 0) continue;
      expect({ id: t.id, n: finais.length }).toEqual({ id: t.id, n: 1 });
      expect({ id: t.id, ultimo: t.exercises.at(-1)?.block }).toEqual({ id: t.id, ultimo: "final" });
    }
  });

  it("os blocos são trechos contíguos — é disso que ordenarPorBloco depende", () => {
    // A ordem entre máquina e solo não é fixa (ordenarPorBloco segue a ordem
    // autorada), mas cada bloco só pode aparecer como UM trecho contíguo —
    // senão trocar de ordem intercalaria exercícios de blocos diferentes.
    for (const t of ENTRADA_TEMPLATES) {
      const sequencia = t.exercises
        .map((e) => e.block)
        .filter((b, i, arr) => b !== arr[i - 1]); // colapsa repetições vizinhas
      const distintos = new Set(sequencia);
      expect({ id: t.id, contiguo: sequencia.length === distintos.size }).toEqual({
        id: t.id,
        contiguo: true,
      });
    }
  });

  it("todo template da Entrada tem miolo, com bloco em todos os itens e blocos contíguos", () => {
    // Na Smartfit (2026-11-09) não há mais dia leve: os cinco dias seguem a
    // divisão da variação, só com máquina e polia.
    for (const t of ENTRADA_TEMPLATES) {
      expect({ id: t.id, semBloco: t.exercises.filter((e) => !e.block).length }).toEqual({ id: t.id, semBloco: 0 });
      expect({ id: t.id, miolo: t.exercises.some((e) => e.block === "maquina" || e.block === "solo") }).toEqual({ id: t.id, miolo: true });
      const seq = t.exercises.map((e) => e.block).filter((b, i, arr) => b !== arr[i - 1]);
      expect({ id: t.id, contiguo: seq.length === new Set(seq).size }).toEqual({ id: t.id, contiguo: true });
    }
  });
});

import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";

const ORDEM_CANONICA = ["aquecimento", "maquina", "solo", "final"] as const;

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

  it("os blocos são trechos contíguos, na ordem canônica — é disso que ordenarPorBloco depende", () => {
    for (const t of ENTRADA_TEMPLATES) {
      const sequencia = t.exercises
        .map((e) => e.block)
        .filter((b, i, arr) => b !== arr[i - 1]); // colapsa repetições vizinhas
      // cada bloco aparece uma vez só (contíguo) e na ordem canônica
      expect({ id: t.id, sequencia }).toEqual({
        id: t.id,
        sequencia: ORDEM_CANONICA.filter((b) => sequencia.includes(b)),
      });
    }
  });

  it("só os dias sem miolo completo são os leves e o da graduação do hip thrust", () => {
    const semMiolo = ENTRADA_TEMPLATES.filter((t) => {
      const blocos = new Set(t.exercises.map((e) => e.block));
      return !(blocos.has("maquina") && blocos.has("solo"));
    }).map((t) => t.id).sort();
    // e1-qui/e2-qui/e3-qui são dias leves (mobilidade + cardio, ou step-up);
    // e3-seg é hip thrust + abdutora, ambos em estação — não há o que reordenar.
    expect(semMiolo).toEqual(["e1-qui", "e2-qui", "e3-qui", "e3-seg"]);
  });
});

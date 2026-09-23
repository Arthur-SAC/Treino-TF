import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";

// Revisão da auditoria: o peito passou a progredir (peito cheio em cima), mas
// o catálogo e a nota da hipertrofia ainda mandavam manter LEVE de propósito —
// ela leria "+2 kg" do lado de "não suba o peso". O que masculiniza é supino
// reto/declinado pesado, e esses não existem no programa.
const PEITO = ["supino-inclinado-halteres", "cross-over-cabo", "voador-maquina"];

describe("peito de cima progride — e o texto concorda", () => {
  it("o catálogo não manda manter o peito leve", () => {
    for (const id of PEITO) {
      const e = EXERCISES.find((x) => x.id === id)!;
      const texto = [e.name, e.description, ...e.commonMistakes, ...(e.proTips ?? [])].join(" ");
      expect({ id, leve: /\bLEVE\b|queremos leve|CARGA LEVE/.test(texto) }).toEqual({ id, leve: false });
    }
  });
  it("nenhum template diz que o supino inclinado é leve de propósito", () => {
    const notas = ALL_TEMPLATES.flatMap((t) => t.exercises.filter((e) => e.exerciseId === "supino-inclinado-halteres"))
      .map((e) => `${e.repsTarget} ${e.notes ?? ""}`);
    // "(leve)" na manutenção e "bem leve" no refinamento são a intenção dessas
    // fases; o que contradiz a progressão é o "leve de propósito" pra não
    // masculinizar, e o marcador "(LEVE)" em caixa alta.
    expect(notas.filter((n) => /leve de prop[óo]sito/i.test(n) || /\(LEVE\)/.test(n))).toEqual([]);
  });
});

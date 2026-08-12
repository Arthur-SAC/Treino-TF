import { describe, it, expect } from "vitest";
import { rotuloDaSequencia, sequenciaDoCatalogo } from "../../src/lib/sequence-label";
import { rotuloPelvicoDoDia, pelvicDoDia } from "../../src/lib/pelvic-progression";
import { flexDoDia } from "../../src/lib/flex-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A regra de rótulo do item que serve uma sequência era escrita duas vezes:
// em `pelvic-progression.ts` e, copiada, em `Today.tsx`. Este módulo é a
// escrita única — e estes testes são o que impede a cópia de voltar.

describe("rótulo derivado do catálogo de sequências", () => {
  it("a duração vem do catálogo, nunca de um número cravado no item", () => {
    const seq = SEQUENCES[0];
    expect(rotuloDaSequencia("Alongamento manhã", seq.id))
      .toBe(`Alongamento manhã · ${seq.durationMin} min`);
  });

  it("sem sequência no catálogo, o rótulo fica nu em vez de mentir uma duração", () => {
    expect(rotuloDaSequencia("Alongamento noite", "sequencia-que-nao-existe"))
      .toBe("Alongamento noite");
    expect(sequenciaDoCatalogo("sequencia-que-nao-existe")).toBeUndefined();
  });

  it("o item pélvico usa esta regra, não uma cópia dela", () => {
    for (const n of [0, 5, 10, 17, 40]) {
      const doDia = pelvicDoDia(n);
      expect({ n, label: rotuloPelvicoDoDia(doDia).label })
        .toEqual({ n, label: rotuloDaSequencia("Assoalho pélvico", doDia.sequenceId) });
    }
  });

  it("as sequências das duas trilhas de flexibilidade existem no catálogo e rendem duração", () => {
    for (const momento of ["manha", "noite"] as const) {
      for (const n of [0, 30, 100]) {
        const { sequenceId } = flexDoDia(momento, n);
        expect({ momento, n, temDuracao: /· \d+ min$/.test(rotuloDaSequencia("Alongamento", sequenceId)) })
          .toEqual({ momento, n, temDuracao: true });
      }
    }
  });
});

import { describe, it, expect } from "vitest";
import { revisarSemana } from "../../src/lib/revisao-semanal";

const CHEIA = { dias: 7, treinos: 5, diasCardio: 7, noitesNoAlvo: 7, alongamentosNoite: 7, cinturaUltima: 96.5, cinturaAnterior: 97.2 };

describe("revisão de domingo", () => {
  it("semana cheia: as cinco linhas e 'repete'", () => {
    const r = revisarSemana(CHEIA, "caminhada");
    expect(r.linhas).toEqual([
      "Treinos: 5 de 5",
      "Caminhada ou esteira: 7 de 7 dias",
      "Sono no horário: 7 de 7 noites",
      "Alongamento da noite: 7 de 7",
      "Cintura: 96,5 cm (−0,7 desde a medida anterior)",
    ]);
    expect(r.ajuste).toMatch(/[Rr]epete/);
  });

  it("pausada tira a linha de cardio", () => {
    expect(revisarSemana(CHEIA, "pausada").linhas.some((l) => /Caminhada/.test(l))).toBe(false);
  });

  // Review Focus: domingo com a semana vazia
  it("semana vazia: zeros, sem cintura, e o ajuste aponta o treino", () => {
    const r = revisarSemana({ dias: 7, treinos: 0, diasCardio: 0, noitesNoAlvo: 0, alongamentosNoite: 0 }, "caminhada");
    expect(r.linhas[0]).toBe("Treinos: 0 de 5");
    expect(r.linhas.at(-1)).toBe("Cintura: sem medida ainda");
    expect(r.ajuste).toMatch(/Treino/);
    expect(JSON.stringify(r)).not.toMatch(/NaN|undefined/);
  });
});

import { describe, it, expect } from "vitest";
import { revisarSemana } from "../../src/lib/revisao-semanal";
import { idsTrancados } from "../../src/lib/desbloqueios";
import { contarAdesao } from "../../src/lib/adesao";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const CHEIA = { dias: 7, treinos: 5, diasCardio: 7, noitesNoAlvo: 7, alongamentosNoite: 5, noitesComBloco: 5, cinturaUltima: 96.5, cinturaAnterior: 97.2 };

describe("revisão de domingo", () => {
  it("semana cheia: as cinco linhas e 'repete'", () => {
    const r = revisarSemana(CHEIA, "caminhada");
    expect(r.linhas).toEqual([
      "Treinos: 5 de 5",
      "Caminhada ou esteira: 7 de 7 dias",
      "Sono no horário: 7 de 7 noites",
      "Alongamento da noite: 5 de 5",
      "Cintura: 96,5 cm (−0,7 desde a medida anterior)",
    ]);
    expect(r.ajuste).toMatch(/[Rr]epete/);
  });

  it("alongamento da noite trancado: a linha some, o resto fica", () => {
    const r = revisarSemana(CHEIA, "caminhada", idsTrancados({}));
    expect(r.linhas).toEqual([
      "Treinos: 5 de 5",
      "Caminhada ou esteira: 7 de 7 dias",
      "Sono no horário: 7 de 7 noites",
      "Cintura: 96,5 cm (−0,7 desde a medida anterior)",
    ]);
    // Aberto, volta.
    const aberto = revisarSemana(CHEIA, "caminhada", idsTrancados({ "alongamento-noite": "2026-11-01" }));
    expect(aberto.linhas).toContain("Alongamento da noite: 5 de 5");
  });

  it("pausada tira a linha de cardio", () => {
    expect(revisarSemana(CHEIA, "pausada").linhas.some((l) => /Caminhada/.test(l))).toBe(false);
  });

  // Review Focus: domingo com a semana vazia
  it("semana vazia: zeros, sem cintura, e o ajuste aponta o treino", () => {
    const r = revisarSemana({ dias: 7, treinos: 0, diasCardio: 0, noitesNoAlvo: 0, alongamentosNoite: 0, noitesComBloco: 5 }, "caminhada");
    expect(r.linhas[0]).toBe("Treinos: 0 de 5");
    expect(r.linhas.at(-1)).toBe("Cintura: sem medida ainda");
    expect(r.ajuste).toMatch(/Treino/);
    expect(JSON.stringify(r)).not.toMatch(/NaN|undefined/);
  });
});

// Revisão final 2026-11-19, item 3: sexta e sábado à noite são dela — o
// alongamento da noite não existe nelas, então não entra no denominador.
describe("revisão de domingo: noites livres fora do alongamento", () => {
  // segunda 16/11 a domingo 22/11
  const JANELA = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"];
  const pratica = (date: string) => ({ date, sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true });
  const dados = (datas: string[]) => ({ sessoes: [], checks: [], logs: [], praticas: datas.map(pratica) as never });
  const linhaAlong = (datas: string[]) =>
    revisarSemana(contarAdesao(JANELA, dados(datas), "22:30"), "caminhada").linhas.find((l) => l.startsWith("Alongamento"));

  it("todas as noites com bloco feitas: 5 de 5, não 5 de 7", () => {
    expect(linhaAlong(["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-22"])).toBe("Alongamento da noite: 5 de 5");
  });

  it("alongar na sexta não cobre a segunda que faltou", () => {
    expect(linhaAlong(["2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-22"])).toBe("Alongamento da noite: 4 de 5");
  });
});

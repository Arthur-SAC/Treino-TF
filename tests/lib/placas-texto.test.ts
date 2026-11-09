import { describe, it, expect } from "vitest";
import {
  ehFimDeSemana, etiquetaHorario, faltamTreinos, linhaDaQueda, linhaFaltam, linhaProximoDesbloqueio, nadaDesbloqueado,
} from "../../src/lib/placas-texto";
import { DESBLOQUEIOS } from "../../src/lib/desbloqueios";

describe("linhaDaQueda", () => {
  it("1 dia perdido e foi ontem: Ontem não teve treino", () => {
    // quinta 2026-11-05 perdida, aberto na sexta 2026-11-06
    expect(linhaDaQueda("2026-11-05", 1, "2026-11-06")).toBe("Ontem não teve treino");
  });

  it("1 dia perdido que não foi ontem: nome do dia com maiúscula", () => {
    // sexta 2026-11-06 perdida, aberto na segunda 2026-11-09
    expect(linhaDaQueda("2026-11-06", 1, "2026-11-09")).toBe("Sexta não teve treino");
    expect(linhaDaQueda("2026-11-02", 1, "2026-11-04")).toBe("Segunda não teve treino");
    expect(linhaDaQueda("2026-11-03", 1, "2026-11-05")).toBe("Terça não teve treino");
    expect(linhaDaQueda("2026-11-04", 1, "2026-11-06")).toBe("Quarta não teve treino");
    expect(linhaDaQueda("2026-11-05", 1, "2026-11-09")).toBe("Quinta não teve treino");
  });

  it("2 ou mais dias: N dias úteis sem treino", () => {
    expect(linhaDaQueda("2026-11-05", 2, "2026-11-09")).toBe("2 dias úteis sem treino");
    expect(linhaDaQueda("2026-11-02", 4, "2026-11-06")).toBe("4 dias úteis sem treino");
  });

  it("vira de mês: 1º de dezembro, ontem é 30 de novembro", () => {
    expect(linhaDaQueda("2026-11-30", 1, "2026-12-01")).toBe("Ontem não teve treino");
  });
});

describe("próximos desbloqueios", () => {
  it("Conquistas: faltam, falta 1 e, com o patamar batido, pronto pra abrir", () => {
    expect(faltamTreinos(4)).toBe("faltam 4 treinos");
    expect(faltamTreinos(1)).toBe("falta 1 treino");
    expect(faltamTreinos(0)).toBe("pronto pra abrir no próximo treino ou ao reabrir o app");
    expect(faltamTreinos(-3)).toBe("pronto pra abrir no próximo treino ou ao reabrir o app");
  });
  it("Hoje: nunca 'faltam 0 treinos'", () => {
    expect(linhaProximoDesbloqueio("X", 5)).toBe("Próximo desbloqueio: X — faltam 5 treinos");
    expect(linhaProximoDesbloqueio("X", 1)).toBe("Próximo desbloqueio: X — falta 1 treino");
    expect(linhaProximoDesbloqueio("X", 0)).toBe("Próximo desbloqueio: X — pronto pra abrir");
  });
  it("Conquistas vazia: o patamar vem da tabela", () => {
    expect(nadaDesbloqueado(DESBLOQUEIOS[0].patamar)).toBe(`Nada ainda. O primeiro abre com ${DESBLOQUEIOS[0].patamar} treinos seguidos.`);
  });
});

describe("etiquetaHorario", () => {
  it("formata como o resto do app", () => {
    expect(etiquetaHorario("21:00")).toBe("às 21h");
    expect(etiquetaHorario("21:20")).toBe("às 21h20");
    expect(etiquetaHorario("06:00")).toBe("às 6h");
  });
});

describe("ehFimDeSemana", () => {
  it("sábado e domingo sim; segunda e sexta não", () => {
    expect(ehFimDeSemana("2026-11-14")).toBe(true);
    expect(ehFimDeSemana("2026-11-15")).toBe(true);
    expect(ehFimDeSemana("2026-11-16")).toBe(false);
    expect(ehFimDeSemana("2026-11-13")).toBe(false);
  });
});

describe("linhaFaltam", () => {
  it("plural, singular, pronta e última parte", () => {
    expect(linhaFaltam(3, "X")).toBe("faltam 3 treinos pra X");
    expect(linhaFaltam(1, "X")).toBe("falta 1 treino pra X");
    expect(linhaFaltam(0, "X")).toBe("Pronta pra X");
    expect(linhaFaltam(0, null)).toBe("Você está na última parte");
  });
});

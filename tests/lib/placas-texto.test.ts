import { describe, it, expect } from "vitest";
import { linhaDaQueda, linhaFaltam } from "../../src/lib/placas-texto";

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

describe("linhaFaltam", () => {
  it("plural, singular, pronta e última parte", () => {
    expect(linhaFaltam(3, "X")).toBe("faltam 3 treinos pra X");
    expect(linhaFaltam(1, "X")).toBe("falta 1 treino pra X");
    expect(linhaFaltam(0, "X")).toBe("Pronta pra X");
    expect(linhaFaltam(0, null)).toBe("Você está na última parte");
  });
});

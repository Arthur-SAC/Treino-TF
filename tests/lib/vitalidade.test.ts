import { describe, it, expect } from "vitest";
import { calcularStreak } from "../../src/lib/vitalidade";

describe("streak de vitalidade", () => {
  it("sem nenhum gasto registrado, conta desde o início do acompanhamento", () => {
    expect(calcularStreak([], "2026-08-11", "2026-08-01")).toEqual({ atual: 11, recorde: 11 });
  });

  it("conta os dias desde o último gasto", () => {
    expect(calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01").atual).toBe(6);
  });

  it("marcar hoje zera o atual", () => {
    expect(calcularStreak(["2026-08-11"], "2026-08-11", "2026-08-01").atual).toBe(0);
  });

  it("guarda o recorde quando o streak zera — o número que ela perde não some", () => {
    // 01 a 09 limpos (9 dias), gasto no 10, hoje é 11 (1 dia limpo)
    const r = calcularStreak(["2026-08-10"], "2026-08-11", "2026-08-01");
    expect(r).toEqual({ atual: 1, recorde: 9 });
  });

  it("o recorde é a maior sequência limpa entre dois gastos", () => {
    // gastos em 03, 05 e 20 — a corrida de 06 a 19 tem 14 dias
    const r = calcularStreak(["2026-08-03", "2026-08-05", "2026-08-20"], "2026-08-21", "2026-08-01");
    expect(r.recorde).toBe(14);
  });

  it("o streak atual entra na disputa do recorde", () => {
    const r = calcularStreak(["2026-08-02"], "2026-08-30", "2026-08-01");
    expect(r).toEqual({ atual: 28, recorde: 28 });
  });

  it("datas fora de ordem e repetidas não quebram a conta", () => {
    const r = calcularStreak(["2026-08-10", "2026-08-05", "2026-08-10"], "2026-08-11", "2026-08-01");
    expect(r).toEqual({ atual: 1, recorde: 4 });
  });

  it("gasto anterior ao início do acompanhamento é ignorado", () => {
    expect(calcularStreak(["2026-07-20"], "2026-08-11", "2026-08-01").atual).toBe(11);
  });

  it("é puro — não usa a data do sistema", () => {
    const a = calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01");
    const b = calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01");
    expect(a).toEqual(b);
  });

  it("no primeiro dia de uso, sem nada marcado, já conta 1 — começar em zero seria o pior arranque", () => {
    expect(calcularStreak([], "2026-08-01", "2026-08-01")).toEqual({ atual: 1, recorde: 1 });
  });
});

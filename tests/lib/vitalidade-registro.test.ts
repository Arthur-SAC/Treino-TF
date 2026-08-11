import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import {
  registrarGastoAutomatico,
  diasComGasto,
} from "../../src/lib/daily-log-helpers";
import {
  inicioDoAcompanhamento,
  garantirInicioDoAcompanhamento,
} from "../../src/lib/vitalidade-adesao";
import { calcularStreak } from "../../src/lib/vitalidade";

describe("registro de gasto automático", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
    await db.settings.clear();
  });

  it("marca o dia sem apagar o resto do registro", async () => {
    await db.dailyLog.put({ date: "2026-08-11", waterMl: 800, activeBreakCount: 3 });
    await registrarGastoAutomatico("2026-08-11", true);
    const log = await db.dailyLog.get("2026-08-11");
    expect(log).toMatchObject({ gastoAutomatico: true, waterMl: 800, activeBreakCount: 3 });
  });

  it("cria o registro do dia se ainda não existir", async () => {
    await registrarGastoAutomatico("2026-08-11", true);
    expect((await db.dailyLog.get("2026-08-11"))?.gastoAutomatico).toBe(true);
  });

  it("desmarcar volta atrás — engano não vira dívida permanente", async () => {
    await registrarGastoAutomatico("2026-08-11", true);
    await registrarGastoAutomatico("2026-08-11", false);
    expect((await db.dailyLog.get("2026-08-11"))?.gastoAutomatico).toBe(false);
  });

  it("lista só os dias marcados", async () => {
    await db.dailyLog.put({ date: "2026-08-09", waterMl: 0, activeBreakCount: 0 });
    await registrarGastoAutomatico("2026-08-10", true);
    await registrarGastoAutomatico("2026-08-11", true);
    expect((await diasComGasto()).sort()).toEqual(["2026-08-10", "2026-08-11"]);
  });

});

// O início do acompanhamento é o dia em que ela ADERIU ao protocolo — nunca
// derivado do `dailyLog`, que recebe linha todo dia por água, caminhada, cães
// e sono desde meses antes desta frente existir. Derivado dali, o app abria
// no primeiro uso mostrando "Vitalidade · 79" e "Recorde 79" sobre justamente
// o período em que havia consumo: um recorde inventado, e um recorde
// inatingível contra o qual a primeira marcação honesta zerava.
describe("início do acompanhamento", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
    await db.settings.clear();
  });

  it("sem adesão, não há início", async () => {
    expect(await inicioDoAcompanhamento()).toBeNull();
  });

  it("aderir grava o dia informado", async () => {
    await garantirInicioDoAcompanhamento("2026-08-11");
    expect(await inicioDoAcompanhamento()).toBe("2026-08-11");
  });

  it("aderir de novo não reinicia o marco — reabrir a tela não custa o streak", async () => {
    await garantirInicioDoAcompanhamento("2026-08-01");
    const segunda = await garantirInicioDoAcompanhamento("2026-08-11");
    expect(segunda).toBe("2026-08-01");
    expect(await inicioDoAcompanhamento()).toBe("2026-08-01");
  });

  it("registro diário antigo NÃO vira início — o dailyLog não sabe de adesão", async () => {
    await db.dailyLog.put({ date: "2026-05-26", waterMl: 800, activeBreakCount: 2 });
    await db.dailyLog.put({ date: "2026-08-11", waterMl: 800, activeBreakCount: 2 });
    expect(await inicioDoAcompanhamento()).toBeNull();
  });

  it("banco com dailyLog antigo e sem adesão não produz streak retroativo", async () => {
    // O cenário real do primeiro uso: meses de dailyLog (água, caminhada,
    // cães, sono) e nenhuma adesão. O início cai em HOJE, então o streak
    // nasce em 1 — não em 79, que era o número que o app inventava.
    for (const date of ["2026-05-26", "2026-06-15", "2026-07-30", "2026-08-10"]) {
      await db.dailyLog.put({ date, waterMl: 800, activeBreakCount: 2 });
    }
    const hoje = "2026-08-11";
    const inicio = await inicioDoAcompanhamento();
    const streak = calcularStreak(await diasComGasto(), hoje, inicio ?? hoje);
    expect(streak).toEqual({ atual: 1, recorde: 1 });
  });
});

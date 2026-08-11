import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import {
  registrarGastoAutomatico,
  diasComGasto,
  inicioDoAcompanhamento,
} from "../../src/lib/daily-log-helpers";

describe("registro de gasto automático", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
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

  it("o início do acompanhamento é o dia mais antigo com registro", async () => {
    await db.dailyLog.put({ date: "2026-08-09", waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: "2026-08-11", waterMl: 0, activeBreakCount: 0 });
    expect(await inicioDoAcompanhamento()).toBe("2026-08-09");
  });

  it("sem nenhum registro, não há início", async () => {
    expect(await inicioDoAcompanhamento()).toBeNull();
  });
});

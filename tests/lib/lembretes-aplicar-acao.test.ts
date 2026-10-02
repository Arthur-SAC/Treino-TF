import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../src/lib/db";
import { aplicarAcao } from "../../src/lib/lembretes/aplicar-acao";

const D = "2026-10-01";
const ev = (id: number, actionId: string, extra: unknown = { dia: D, rota: "/" }) => ({ actionId, notification: { id, extra } });
const deps = (h: number, m: number) => ({ navigate: vi.fn(), agora: new Date(2026, 9, 1, h, m) });

beforeEach(async () => { await db.dailyLog.clear(); await db.routineChecks.clear(); await db.settings.clear(); });

describe("aplicarAcao", () => {
  it("bebi duas vezes com o mesmo id soma 200 ml uma vez", async () => {
    await aplicarAcao(ev(1, "bebi"), deps(10, 0));
    await aplicarAcao(ev(1, "bebi"), deps(10, 5));
    expect((await db.dailyLog.get(D))?.waterMl).toBe(200);
  });
  it("ids diferentes aplicam os dois", async () => {
    await aplicarAcao(ev(1, "bebi"), deps(10, 0));
    await aplicarAcao(ev(2, "bebi"), deps(11, 0));
    expect((await db.dailyLog.get(D))?.waterMl).toBe(400);
  });
  it("deitei duas vezes mantém a primeira hora e marca o item dormir", async () => {
    await aplicarAcao(ev(3, "deitei"), deps(22, 10));
    await aplicarAcao(ev(3, "deitei"), deps(23, 40));
    expect((await db.dailyLog.get(D))?.sleepAt).toBe("22:10");
    expect(await db.routineChecks.get([D, "dormir"])).toMatchObject({ done: true });
  });
  it("feito marca o item no dia do lembrete", async () => {
    await aplicarAcao(ev(4, "feito", { dia: D, itemId: "vitamina-d", rota: "/" }), deps(9, 0));
    expect(await db.routineChecks.get([D, "vitamina-d"])).toMatchObject({ done: true });
  });
  it("tap navega a cada vez", async () => {
    const d = deps(9, 0);
    await aplicarAcao(ev(5, "tap", { rota: "/corpo/medidas" }), d);
    await aplicarAcao(ev(5, "tap", { rota: "/corpo/medidas" }), d);
    expect(d.navigate).toHaveBeenCalledTimes(2);
  });
  it("guarda só as últimas 50 chaves", async () => {
    for (let i = 0; i < 55; i++) await aplicarAcao(ev(i, "bebi"), deps(10, 0));
    const row = await db.settings.get("acoesTratadas");
    expect((row?.value as string[]).length).toBe(50);
  });

  // Android pode reentregar o intent de partida a frio por dias (singleTask sem
  // setIntent; a HyperOS mata o processo): a lista de 50 chaves só cobre ~5 dias.
  it("replay tardio: bebi de 3 dias antes não soma água", async () => {
    await aplicarAcao(ev(10, "bebi", { dia: "2026-09-28", rota: "/" }), deps(10, 0));
    expect(await db.dailyLog.get("2026-09-28")).toBeUndefined();
  });
  it("feito de ontem ainda aplica", async () => {
    await aplicarAcao(ev(11, "feito", { dia: "2026-09-30", itemId: "vitamina-d", rota: "/" }), deps(9, 0));
    expect(await db.routineChecks.get(["2026-09-30", "vitamina-d"])).toMatchObject({ done: true });
  });
  it("deitei na manhã seguinte (depois das 06:00) é ignorado", async () => {
    await aplicarAcao(ev(12, "deitei", { dia: "2026-09-30", rota: "/" }), deps(7, 0));
    expect(await db.dailyLog.get("2026-09-30")).toBeUndefined();
    expect(await db.routineChecks.get(["2026-09-30", "dormir"])).toBeUndefined();
  });
  it("deitei na madrugada seguinte (antes das 06:00) ainda vale", async () => {
    await aplicarAcao(ev(13, "deitei", { dia: "2026-09-30", rota: "/" }), deps(0, 40));
    expect((await db.dailyLog.get("2026-09-30"))?.sleepAt).toBe("00:40");
  });
  it("deitei não sobrescreve a hora que ela já registrou, mas marca dormir", async () => {
    await db.dailyLog.put({ date: D, waterMl: 0, activeBreakCount: 0, sleepAt: "21:50" });
    await aplicarAcao(ev(14, "deitei"), deps(22, 30));
    expect((await db.dailyLog.get(D))?.sleepAt).toBe("21:50");
    expect(await db.routineChecks.get([D, "dormir"])).toMatchObject({ done: true });
  });
});

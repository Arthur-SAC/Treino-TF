import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { creditarPasseio, registrarSono, noitesNoAlvo, noitesNoAlvoRecentes } from "../../src/lib/daily-log-helpers";
import { ultimosDiasISO } from "../../src/lib/today-date";

beforeEach(async () => { await db.dailyLog.clear(); });

describe("passeio credita minutos de movimento", () => {
  it("marcar o passeio soma 60 min ao dia", async () => {
    await creditarPasseio("2026-07-28");
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(60);
  });

  it("cria o registro do dia se ainda não existir", async () => {
    await creditarPasseio("2026-07-29");
    const log = await db.dailyLog.get("2026-07-29");
    expect(log).toBeDefined();
    expect(log!.waterMl).toBe(0);
  });

  it("desmarcar devolve os 60 min, sem ficar negativo", async () => {
    await creditarPasseio("2026-07-28");
    await creditarPasseio("2026-07-28", false);
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(0);
    await creditarPasseio("2026-07-28", false);
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(0);
  });
});

describe("sono", () => {
  it("registra a hora real de deitar", async () => {
    await registrarSono("2026-07-28", "22:40");
    expect((await db.dailyLog.get("2026-07-28"))?.sleepAt).toBe("22:40");
  });

  it("conta as noites no alvo dos últimos 7 dias", async () => {
    await registrarSono("2026-07-26", "22:15");
    await registrarSono("2026-07-27", "23:40");
    await registrarSono("2026-07-28", "22:30");
    const logs = await db.dailyLog.toArray();
    expect(noitesNoAlvo(logs, "22:30")).toBe(2);
  });

  it("noite sem registro não conta nem a favor nem contra", async () => {
    await registrarSono("2026-07-28", "22:00");
    expect(noitesNoAlvo(await db.dailyLog.toArray(), "22:30")).toBe(1);
  });

  // Desmarcar "Dormir" deixava a linha desmarcada mas o subtítulo continuava
  // "Você deitou às 22:35" — e a noite seguia contando no streak.
  it("desmarcar apaga a hora de deitar, e a noite sai da contagem", async () => {
    await registrarSono("2026-07-28", "22:00");
    await registrarSono("2026-07-28", undefined);
    const log = await db.dailyLog.get("2026-07-28");
    expect(log?.sleepAt).toBeUndefined();
    expect(noitesNoAlvo(await db.dailyLog.toArray(), "22:30")).toBe(0);
  });

  it("apagar preserva o resto do dia (água, pausas, movimento)", async () => {
    await db.dailyLog.put({ date: "2026-07-28", waterMl: 1200, activeBreakCount: 4, walkMin: 60, sleepAt: "22:10" });
    await registrarSono("2026-07-28", undefined);
    const log = await db.dailyLog.get("2026-07-28");
    expect({ waterMl: log?.waterMl, pausas: log?.activeBreakCount, walkMin: log?.walkMin, sleepAt: log?.sleepAt })
      .toEqual({ waterMl: 1200, pausas: 4, walkMin: 60, sleepAt: undefined });
  });

  it("desmarcar num dia que nem tem registro não cria log vazio", async () => {
    await registrarSono("2026-07-30", undefined);
    expect(await db.dailyLog.get("2026-07-30")).toBeUndefined();
  });
});

// Hoje e Vitalidade mostram o MESMO streak de sono. O alvo já era resolvido
// por `resolverAlvoSono` nas duas, mas a janela de 7 dias e a consulta ao
// dailyLog estavam copiadas nas duas telas — e cópia de medida diverge na
// primeira vez que alguém mexe num lado só. `noitesNoAlvoRecentes` é a janela
// unificada; estes testes são a rede que ela ganhou ao virar função.
describe("janela dos últimos 7 dias", () => {
  it("lista os 7 dias terminando em hoje, do mais recente pro mais antigo", () => {
    expect(ultimosDiasISO("2026-08-11", 7)).toEqual([
      "2026-08-11", "2026-08-10", "2026-08-09", "2026-08-08",
      "2026-08-07", "2026-08-06", "2026-08-05",
    ]);
  });

  it("atravessa a virada de mês sem inventar dia 0", () => {
    expect(ultimosDiasISO("2026-03-02", 4)).toEqual([
      "2026-03-02", "2026-03-01", "2026-02-28", "2026-02-27",
    ]);
  });

  it("conta só as noites dentro da janela — o que é mais velho fica de fora", async () => {
    await registrarSono("2026-08-11", "22:00"); // hoje, no alvo
    await registrarSono("2026-08-06", "22:10"); // dentro dos 7 dias, no alvo
    await registrarSono("2026-08-09", "23:30"); // dentro, fora do alvo
    await registrarSono("2026-08-01", "21:00"); // fora da janela, no alvo
    expect(await noitesNoAlvoRecentes("22:30", "2026-08-11")).toBe(2);
  });

  it("segue o alvo recebido, não um horário fixo", async () => {
    await registrarSono("2026-08-11", "23:00");
    expect(await noitesNoAlvoRecentes("22:30", "2026-08-11")).toBe(0);
    expect(await noitesNoAlvoRecentes("23:15", "2026-08-11")).toBe(1);
  });
});

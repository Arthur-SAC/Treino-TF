import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "../../src/lib/db";
import { startScheduler, stopScheduler } from "../../src/lib/notification-scheduler";
import { lembrarSkincareNoite, textoSkincareManha } from "../../src/lib/notification-scheduler";
import { EXPOE } from "../../src/lib/discricao";

// O tick do scheduler web lê o banco e chama notify; a decisão do "Skincare
// noturno" mora numa função própria pra ser testada sem relógio.
const HOJE = "2026-11-09";
const base = { currentMin: 20 * 60 + 30, eveningMin: 20 * 60 + 30, lastEvening: "2026-11-08", todayISO: HOJE };

describe("lembrete de skincare noturno (web)", () => {
  it("no horário, sem ter avisado hoje e com o skincare da noite aberto: avisa", () => {
    expect(lembrarSkincareNoite({ ...base, trancados: new Set() })).toBe(true);
  });
  it("com skincare-noite trancado, não avisa", () => {
    expect(lembrarSkincareNoite({ ...base, trancados: new Set(["skincare-noite"]) })).toBe(false);
  });
  it("antes do horário ou já avisado hoje, não avisa", () => {
    expect(lembrarSkincareNoite({ ...base, currentMin: base.eveningMin - 1, trancados: new Set() })).toBe(false);
    expect(lembrarSkincareNoite({ ...base, lastEvening: HOJE, trancados: new Set() })).toBe(false);
  });
});

describe("lembrete de skincare da manhã (web)", () => {
  it("com o skincare completo trancado, fala do protetor solar", () => {
    const t = textoSkincareManha({});
    expect(t.titulo).toBe("Protetor solar");
    expect(t.corpo).toBe("Rosto, orelhas e pescoço antes de sair");
    expect(`${t.titulo} ${t.corpo}`).not.toMatch(EXPOE);
  });
  it("com o skincare completo aberto, a rotina de rosto", () => {
    expect(textoSkincareManha({ "skincare-3": "2026-11-09" }).titulo).toBe("Skincare matinal");
  });
});

// Spec 2026-11-19: sexta e sábado à noite são dela — o tick não manda skincare
// nem o aviso de movimento; na quarta ainda manda.
describe("tick do scheduler web à noite", () => {
  const avisos: string[] = [];
  beforeEach(async () => {
    avisos.length = 0;
    await db.settings.clear();
    await db.settings.bulkPut([
      { key: "notificationsEnabled", value: true },
      { key: "eveningReminderTime", value: "20:45" },
      { key: "presencaReminderTime", value: "21:00" },
      { key: "desbloqueios", value: { "skincare-2": "2026-11-01", postura: "2026-11-01" } },
    ]);
    class FakeNotification {
      static permission = "granted";
      constructor(titulo: string) { avisos.push(titulo); }
    }
    vi.stubGlobal("Notification", FakeNotification);
    vi.useFakeTimers({ toFake: ["setInterval", "Date"] });
  });
  afterEach(() => { stopScheduler(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  async function tickEm(dia: Date) {
    vi.setSystemTime(dia);
    startScheduler();
    vi.advanceTimersByTime(60_000);
    await vi.waitFor(() => expect(true).toBe(true));
    await new Promise((r) => setTimeout(r, 300));
  }

  it("quarta 21:30: avisa skincare noturno e movimento", async () => {
    await tickEm(new Date(2026, 10, 18, 21, 30)); // quarta
    expect(avisos).toContain("Skincare noturno");
    expect(avisos).toContain("Antes de dormir");
  });
  it("sexta 21:30: não avisa nenhum dos dois", async () => {
    await tickEm(new Date(2026, 10, 20, 21, 30)); // sexta
    expect(avisos).not.toContain("Skincare noturno");
    expect(avisos).not.toContain("Antes de dormir");
  });
});

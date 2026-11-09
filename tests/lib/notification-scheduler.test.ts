import { describe, it, expect } from "vitest";
import { lembrarSkincareNoite } from "../../src/lib/notification-scheduler";

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

import { describe, it, expect } from "vitest";
import { DEFAULTS } from "../../src/lib/settings-helpers";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { isWithinQuietHours } from "../../src/lib/notifications";

// Auditoria de 2026-09-23: os lembretes de skincare tocavam 8h e 22h, e o
// silêncio 22h-8h engolia os dois — nenhum tocava. O dia dela começa às 6h e
// ela deita às 22h30.
const itens = buildDayRoutine(1, 1).blocks.flatMap((b) => b.items);
const hora = (id: string) => itens.find((i) => i.id === id)!.defaultTime!;
const naHora = (hhmm: string) => new Date(`2026-09-28T${hhmm}:00`);

describe("lembretes seguem a rotina do Hoje", () => {
  it("skincare de manhã e de noite nos horários dos itens da rotina", () => {
    expect(DEFAULTS.morningReminderTime).toBe(hora("skincare-manha"));
    expect(DEFAULTS.eveningReminderTime).toBe(hora("skincare-noite"));
  });
  it("o silêncio da noite não engole nenhum lembrete padrão", () => {
    const { from, to } = DEFAULTS.quietHours;
    for (const h of [DEFAULTS.morningReminderTime, DEFAULTS.eveningReminderTime, DEFAULTS.workoutReminderTime]) {
      expect({ h, silenciado: isWithinQuietHours(naHora(h), from, to) }).toEqual({ h, silenciado: false });
    }
  });
  it("meta de água de 3 L — 96 kg, 5 km a pé e treino em Aracaju", () => {
    expect(DEFAULTS.hydrationGoalMl).toBe(3000);
  });
});

describe("migração dos lembretes no aparelho dela", () => {
  it("troca só o que ainda está no padrão antigo; o que ela ajustou fica", async () => {
    const { db } = await import("../../src/lib/db");
    const { seedDatabase } = await import("../../src/lib/seed");
    await db.settings.clear();
    await db.settings.bulkPut([
      { key: "morningReminderTime", value: "08:00" },
      { key: "eveningReminderTime", value: "21:15" }, // ela ajustou
      { key: "quietHours", value: { from: "22:00", to: "08:00" } },
      { key: "hydrationGoalMl", value: 2000 },
    ]);
    await seedDatabase();
    expect((await db.settings.get("morningReminderTime"))?.value).toBe("06:25");
    expect((await db.settings.get("eveningReminderTime"))?.value).toBe("21:15");
    expect((await db.settings.get("quietHours"))?.value).toEqual({ from: "22:30", to: "06:00" });
    expect((await db.settings.get("hydrationGoalMl"))?.value).toBe(3000);
  });
});

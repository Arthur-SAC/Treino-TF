import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { DEFAULTS } from "../../src/lib/settings-helpers";

describe("migração da Smartfit: recomeço na Entrada", () => {
  beforeEach(async () => {
    await db.workoutSessions.clear();
    await db.settings.delete("smartfitMigration");
    await db.settings.delete("tetoPredio");
    await db.settings.put({ key: "activeCycle", value: "variacao" });
    await db.settings.put({ key: "cycleStartSessionCount", value: 3 });
  });

  async function criaSessoes(n: number) {
    for (let i = 0; i < n; i++) {
      await db.workoutSessions.add({ date: `2026-10-${String(i + 1).padStart(2, "0")}`, exercises: [] });
    }
  }

  it("com 12 sessões em variacao → vai pra entrada-1 com cycleStartSessionCount 12 e as 12 sessões continuam", async () => {
    await criaSessoes(12);
    await seedDatabase();
    expect((await db.settings.get("activeCycle"))?.value).toBe("entrada-1");
    expect((await db.settings.get("cycleStartSessionCount"))?.value).toBe(12);
    expect(await db.workoutSessions.count()).toBe(12);
    expect((await db.settings.get("smartfitMigration"))?.value).toBe(1);
  });

  it("apaga tetoPredio", async () => {
    await db.settings.put({ key: "tetoPredio", value: { "leg-press": 120 } });
    await seedDatabase();
    expect(await db.settings.get("tetoPredio")).toBeUndefined();
  });

  it("roda uma vez: depois de setar activeCycle entrada-2, rodar seedDatabase de novo não volta pra entrada-1", async () => {
    await criaSessoes(5);
    await seedDatabase();
    await db.settings.put({ key: "activeCycle", value: "entrada-2" });
    await seedDatabase();
    expect((await db.settings.get("activeCycle"))?.value).toBe("entrada-2");
    expect((await db.settings.get("cycleStartSessionCount"))?.value).toBe(5);
  });

  it("DEFAULTS.aparelhosAusentes é []", () => {
    expect(DEFAULTS.aparelhosAusentes).toEqual([]);
  });
});

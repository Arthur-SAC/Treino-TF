import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { coletarBackup, restaurarBackup } from "../../src/lib/backup-io";
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

  describe("restaurar backup", () => {
    async function backupAntigo(comMigracao: boolean) {
      await db.workoutSessions.clear();
      await criaSessoes(7);
      await db.settings.put({ key: "activeCycle", value: "variacao" });
      await db.settings.put({ key: "cycleStartSessionCount", value: 2 });
      await db.settings.put({ key: "tetoPredio", value: { "leg-press": 100 } });
      const p = await coletarBackup();
      const cfg = ((p.settings ?? []) as Array<{ key: string; value: unknown }>)
        .filter((c) => c.key !== "smartfitMigration");
      if (comMigracao) cfg.push({ key: "smartfitMigration", value: 1 });
      p.settings = cfg;
      return p;
    }

    it("backup sem smartfitMigration, sobre aparelho já migrado, refaz a migração", async () => {
      await seedDatabase();
      const p = await backupAntigo(false);
      await db.settings.put({ key: "smartfitMigration", value: 1 });
      await restaurarBackup(p);
      await seedDatabase();
      expect((await db.settings.get("activeCycle"))?.value).toBe("entrada-1");
      expect((await db.settings.get("cycleStartSessionCount"))?.value).toBe(7);
      expect(await db.settings.get("tetoPredio")).toBeUndefined();
    });

    it("backup com smartfitMigration 1 não roda a migração de novo", async () => {
      await seedDatabase();
      const p = await backupAntigo(true);
      await restaurarBackup(p);
      await seedDatabase();
      expect((await db.settings.get("activeCycle"))?.value).toBe("variacao");
      expect((await db.settings.get("cycleStartSessionCount"))?.value).toBe(2);
    });
  });
});

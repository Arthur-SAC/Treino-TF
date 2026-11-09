import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { hojeISO } from "../../src/lib/today-date";

describe("migração do marco da sequência", () => {
  beforeEach(async () => {
    await db.settings.delete("sequenciaMigration");
    await db.settings.delete("sequenciaDesde");
  });

  it("marca o início em hoje e grava a versão", async () => {
    await seedDatabase();
    expect((await db.settings.get("sequenciaDesde"))?.value).toBe(hojeISO());
    expect((await db.settings.get("sequenciaMigration"))?.value).toBe(1);
  });

  it("rodar de novo não muda o marco", async () => {
    await seedDatabase();
    await db.settings.put({ key: "sequenciaDesde", value: "2026-01-01" });
    await seedDatabase();
    expect((await db.settings.get("sequenciaDesde"))?.value).toBe("2026-01-01");
  });

  it("marcador ausente com marco já preenchido preserva o marco", async () => {
    await db.settings.put({ key: "sequenciaDesde", value: "2026-01-01" });
    await seedDatabase();
    expect((await db.settings.get("sequenciaDesde"))?.value).toBe("2026-01-01");
    expect((await db.settings.get("sequenciaMigration"))?.value).toBe(1);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { coletarBackup, restaurarBackup } from "../../src/lib/backup-io";
import { SEQUENCIAS_FLEX, ATE_FLEX_FASE_2, ATE_FLEX_FASE_3 } from "../../src/lib/flex-progression";
import { faseDaContagem, type FasesAceitas } from "../../src/lib/ofertas";
import { hojeISO } from "../../src/lib/today-date";

async function praticasFlexNoite(n: number) {
  for (let i = 0; i < n; i++) {
    await db.practiceLogs.add({ date: "2026-10-01", sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true, durationMin: 5 } as never);
  }
}

describe("migração da rotina em linha do tempo", () => {
  beforeEach(async () => {
    await db.practiceLogs.clear();
    await db.settings.delete("rotinaLinhaMigracao");
    await db.settings.delete("fasesAceitas");
    await db.settings.delete("desbloqueios");
  });

  it("flexNoite com 40 práticas fica na fase que 40 dá hoje, e as outras trilhas na 1", async () => {
    await praticasFlexNoite(40);
    await seedDatabase();
    const f = (await db.settings.get("fasesAceitas"))?.value as FasesAceitas;
    expect(f.flexNoite).toBe(faseDaContagem("flexNoite", 40));
    expect(f.flexNoite).toBe(40 >= ATE_FLEX_FASE_3 ? 3 : 40 >= ATE_FLEX_FASE_2 ? 2 : 1);
    expect(f.flexManha).toBe(1);
    expect(f.pelvica).toBe(1);
    expect((await db.settings.get("rotinaLinhaMigracao"))?.value).toBe(1);
  });

  it("roda uma vez: práticas novas depois não mexem nas fases", async () => {
    await seedDatabase();
    await praticasFlexNoite(40);
    await seedDatabase();
    const f = (await db.settings.get("fasesAceitas"))?.value as FasesAceitas;
    expect(f.flexNoite).toBe(1);
  });

  it("abre alongamento-noite com a data de hoje, sem sobrescrever data existente", async () => {
    await seedDatabase();
    expect(((await db.settings.get("desbloqueios"))?.value as Record<string, string>)["alongamento-noite"]).toBe(hojeISO());
    await db.settings.delete("rotinaLinhaMigracao");
    await db.settings.put({ key: "desbloqueios", value: { "alongamento-noite": "2026-10-10" } });
    await seedDatabase();
    expect(((await db.settings.get("desbloqueios"))?.value as Record<string, string>)["alongamento-noite"]).toBe("2026-10-10");
  });

  it("restaurar backup sem a marca roda de novo (e a fase nunca cai)", async () => {
    await seedDatabase();
    await praticasFlexNoite(40);
    const p = await coletarBackup();
    p.settings = ((p.settings ?? []) as Array<{ key: string; value: unknown }>).filter((c) => c.key !== "rotinaLinhaMigracao");
    await restaurarBackup(p);
    const f = (await db.settings.get("fasesAceitas"))?.value as FasesAceitas;
    expect(f.flexNoite).toBe(faseDaContagem("flexNoite", 40));
  });
});

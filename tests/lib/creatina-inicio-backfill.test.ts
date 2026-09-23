import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";

// Revisão da auditoria: o início da creatina passou a ser gravado na primeira
// marcação — mas quem já vinha marcando antes do app publicado ficaria com a
// contagem de 2 semanas recomeçando do zero na próxima marcação.
describe("início da creatina no aparelho dela", () => {
  beforeEach(async () => {
    await db.routineChecks.clear();
    await db.settings.delete("creatinaInicio");
  });

  it("vem da primeira marcação que já existe", async () => {
    await db.routineChecks.bulkPut([
      { date: "2026-09-20", itemId: "creatina", done: true },
      { date: "2026-09-18", itemId: "creatina", done: false },
      { date: "2026-09-19", itemId: "creatina", done: true },
      { date: "2026-09-10", itemId: "agua", done: true },
    ]);
    await seedDatabase();
    expect((await db.settings.get("creatinaInicio"))?.value).toBe("2026-09-19");
  });

  it("não mexe no início que já está gravado", async () => {
    await db.routineChecks.put({ date: "2026-09-19", itemId: "creatina", done: true });
    await db.settings.put({ key: "creatinaInicio", value: "2026-09-21" });
    await seedDatabase();
    expect((await db.settings.get("creatinaInicio"))?.value).toBe("2026-09-21");
  });
});

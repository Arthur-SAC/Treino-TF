import { describe, it, expect } from "vitest";
import { seedMakeup } from "../../src/lib/makeup-seed";
import { db } from "../../src/lib/db";

describe("seedMakeup", () => {
  it("popula produtos e rotinas de maquiagem", async () => {
    await seedMakeup();
    const products = await db.products.where("category").equals("makeup").toArray();
    const routines = await db.makeupRoutines.toArray();
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(routines.length).toBeGreaterThanOrEqual(5);
  });

  it("é idempotente", async () => {
    await seedMakeup();
    const a = (await db.products.where("category").equals("makeup").toArray()).length;
    await seedMakeup();
    expect((await db.products.where("category").equals("makeup").toArray()).length).toBe(a);
  });

  it("rotinas têm passos não-vazios", async () => {
    await seedMakeup();
    for (const r of await db.makeupRoutines.toArray()) {
      expect(r.steps.length).toBeGreaterThan(0);
      expect(r.durationMin).toBeGreaterThan(0);
    }
  });
});

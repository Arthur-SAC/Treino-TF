import { describe, it, expect } from "vitest";
import { seedBeauty } from "../../src/lib/beauty-seed";
import { db } from "../../src/lib/db";

describe("seedBeauty", () => {
  it("popula produtos e rotinas na primeira chamada", async () => {
    await seedBeauty();
    const products = await db.products.toArray();
    const routines = await db.skincareRoutines.toArray();
    expect(products.length).toBeGreaterThanOrEqual(15);
    expect(routines.length).toBeGreaterThanOrEqual(5);
  });

  it("não duplica em chamadas repetidas", async () => {
    await seedBeauty();
    const firstP = (await db.products.toArray()).length;
    const firstR = (await db.skincareRoutines.toArray()).length;
    await seedBeauty();
    expect((await db.products.toArray()).length).toBe(firstP);
    expect((await db.skincareRoutines.toArray()).length).toBe(firstR);
  });

  it("todo produto tem nome e categoria", async () => {
    await seedBeauty();
    for (const p of await db.products.toArray()) {
      expect(p.name).toBeTruthy();
      expect(["skincare", "haircare", "supplements"]).toContain(p.category);
    }
  });
});

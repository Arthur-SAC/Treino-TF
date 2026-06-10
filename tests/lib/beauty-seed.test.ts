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

  it("migra rotinas novas pra contas existentes sem duplicar", async () => {
    // simula conta antiga: já semeada, numa versão de rotina anterior, sem as novas
    await db.settings.put({ key: "beautySeeded", value: true });
    await db.settings.put({ key: "routineSeedVersion", value: 1 });
    await seedBeauty();
    const names = (await db.skincareRoutines.toArray()).map((r) => r.name);
    expect(names.some((n) => n.includes("Manchas de sol"))).toBe(true);
    expect(names.some((n) => n.toLowerCase().includes("perianal"))).toBe(true);
    const count = (await db.skincareRoutines.toArray()).length;
    await seedBeauty();
    expect((await db.skincareRoutines.toArray()).length).toBe(count);
  });

  it("todo produto tem nome e categoria", async () => {
    await seedBeauty();
    for (const p of await db.products.toArray()) {
      expect(p.name).toBeTruthy();
      expect(["skincare", "haircare", "supplements"]).toContain(p.category);
    }
  });
});

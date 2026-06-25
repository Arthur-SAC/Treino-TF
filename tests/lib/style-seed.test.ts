import { describe, it, expect } from "vitest";
import { seedStyle } from "../../src/lib/style-seed";
import { db } from "../../src/lib/db";

describe("seedStyle", () => {
  it("popula garments e palette", async () => {
    await seedStyle();
    expect((await db.garments.toArray()).length).toBeGreaterThanOrEqual(26);
    expect((await db.stylePalette.toArray()).length).toBe(1);
  });

  it("toda peça tem discretion válida e whyItWorks", async () => {
    await seedStyle();
    for (const g of await db.garments.toArray()) {
      expect(g.whyItWorks).toBeTruthy();
      expect(["discreto", "livre"]).toContain(g.discretion);
    }
  });

  it("popula combinações com campos obrigatórios", async () => {
    await seedStyle();
    const outfits = await db.outfits.toArray();
    expect(outfits.length).toBeGreaterThanOrEqual(6);
    for (const o of outfits) {
      expect(["discreto", "livre"]).toContain(o.context);
      expect(o.silhouetteNote).toBeTruthy();
      expect(["ideia", "comprando", "tenho", "testei"]).toContain(o.status);
    }
    expect(outfits.some((o) => o.context === "discreto")).toBe(true);
    expect(outfits.some((o) => o.context === "livre")).toBe(true);
  });

  it("é idempotente (peças e combinações)", async () => {
    await seedStyle();
    const g = (await db.garments.toArray()).length;
    const o = (await db.outfits.toArray()).length;
    await seedStyle();
    expect((await db.garments.toArray()).length).toBe(g);
    expect((await db.outfits.toArray()).length).toBe(o);
  });
});

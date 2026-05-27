import { describe, it, expect } from "vitest";
import { seedStyle } from "../../src/lib/style-seed";
import { db } from "../../src/lib/db";

describe("seedStyle", () => {
  it("popula garments e palette", async () => {
    await seedStyle();
    expect((await db.garments.toArray()).length).toBeGreaterThanOrEqual(20);
    expect((await db.stylePalette.toArray()).length).toBe(1);
  });

  it("é idempotente", async () => {
    await seedStyle();
    const a = (await db.garments.toArray()).length;
    await seedStyle();
    expect((await db.garments.toArray()).length).toBe(a);
  });

  it("peças têm whyItWorks", async () => {
    await seedStyle();
    for (const g of await db.garments.toArray()) {
      expect(g.whyItWorks).toBeTruthy();
    }
  });
});

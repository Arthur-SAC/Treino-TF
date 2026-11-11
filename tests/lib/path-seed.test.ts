import { describe, it, expect } from "vitest";
import { seedPath } from "../../src/lib/path-seed";
import { db } from "../../src/lib/db";

describe("seedPath", () => {
  it("popula milestones e mealPlan", async () => {
    await seedPath();
    expect((await db.milestones.toArray()).length).toBeGreaterThanOrEqual(5);
    expect((await db.mealPlans.toArray()).length).toBeGreaterThanOrEqual(1);
  });

  it("é idempotente", async () => {
    await seedPath();
    const a = (await db.milestones.toArray()).length;
    await seedPath();
    expect((await db.milestones.toArray()).length).toBe(a);
  });

  it("migra o marco de pixie pro marco de cabelo atual (o corte)", async () => {
    await db.milestones.add({ datePlanned: "2026-12-01", title: "Marco visual: pixie cacheado formato definido", category: "fisico" } as never);
    await db.settings.put({ key: "pathSeeded", value: true });
    await db.settings.put({ key: "milestoneSeedVersion", value: 3 });
    await seedPath();
    const titles = (await db.milestones.toArray()).map((m) => m.title);
    expect(titles.some((t) => t.includes("pixie"))).toBe(false);
    expect(titles.some((t) => t.startsWith("✂") && t.includes("corte"))).toBe(true);
  });

  it("plano alimentar é de déficit com slots", async () => {
    await seedPath();
    const plan = (await db.mealPlans.toArray())[0];
    expect(plan.kcalDaily).toBe(2200);
    expect(plan.proteinG).toBeGreaterThanOrEqual(160);
    expect(plan.slots).toHaveLength(4);
    // Desde 2026-11-10: duas opções de café — a do dia e uma troca livre.
    expect(plan.slots[0].variants.length).toBe(2);
    expect(plan.slots[0].variants[0].dias).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

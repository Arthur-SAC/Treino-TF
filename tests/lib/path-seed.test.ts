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

  it("plano alimentar tem macros", async () => {
    await seedPath();
    const plan = (await db.mealPlans.toArray())[0];
    expect(plan.kcalDaily).toBeGreaterThan(1500);
    expect(plan.proteinG).toBeGreaterThan(80);
  });
});

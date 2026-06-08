import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { getActiveMealPlan } from "../../src/lib/meal-plan";
import { setSetting } from "../../src/lib/settings-helpers";

describe("planos alimentares por fase", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    for (const p of ALL_MEAL_PLANS) await db.mealPlans.add(p as never);
  });

  it("tem 3 planos com metas distintas e kcal crescente", () => {
    const goals = ALL_MEAL_PLANS.map((p) => p.goal);
    expect(new Set(goals)).toEqual(new Set(["deficit", "manutencao", "superavit"]));
    const byGoal = Object.fromEntries(ALL_MEAL_PLANS.map((p) => [p.goal, p.kcalDaily]));
    expect(byGoal.deficit).toBeLessThan(byGoal.manutencao);
    expect(byGoal.manutencao).toBeLessThan(byGoal.superavit);
  });

  it("seleciona o plano pela fase do ciclo ativo", async () => {
    await setSetting("activeCycle", "hipertrofia");
    expect((await getActiveMealPlan())?.goal).toBe("superavit");
    await setSetting("activeCycle", "adaptacao");
    expect((await getActiveMealPlan())?.goal).toBe("deficit");
    await setSetting("activeCycle", "refinamento");
    expect((await getActiveMealPlan())?.goal).toBe("manutencao");
  });

  it("o plano de superávit traz os acréscimos da fase em todas as variantes do café", () => {
    const surplus = ALL_MEAL_PLANS.find((p) => p.goal === "superavit")!;
    const cafe = surplus.slots.find((s) => s.mealType === "cafe")!;
    for (const v of cafe.variants) {
      expect(v.foods.some((f) => /whey extra da fase/i.test(f.name))).toBe(true);
    }
  });
});

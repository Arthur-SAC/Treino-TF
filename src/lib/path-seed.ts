import { db } from "./db";
import { MILESTONES } from "../data/milestones-seed";
import { INITIAL_PLAN } from "../data/meal-plan-seed";

export async function seedPath(): Promise<void> {
  const seeded = await db.settings.get("pathSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.milestones, db.mealPlans, db.settings], async () => {
    for (const m of MILESTONES) {
      await db.milestones.add(m as never);
    }
    if ((await db.mealPlans.count()) === 0) {
      await db.mealPlans.add(INITIAL_PLAN as never);
    }
    await db.settings.put({ key: "pathSeeded", value: true });
  });
}

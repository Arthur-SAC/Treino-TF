import { db } from "./db";
import { MILESTONES, BODY_GOAL_MILESTONES } from "../data/milestones-seed";
import { INITIAL_PLAN } from "../data/meal-plan-seed";

const MEAL_PLAN_VERSION = 3;
const MILESTONE_SEED_VERSION = 2;

export async function seedPath(): Promise<void> {
  // Seed inicial (marcos + plano) acontece uma vez
  const seeded = await db.settings.get("pathSeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.milestones, db.mealPlans, db.settings], async () => {
      for (const m of [...MILESTONES, ...BODY_GOAL_MILESTONES]) {
        await db.milestones.add(m as never);
      }
      if ((await db.mealPlans.count()) === 0) {
        await db.mealPlans.add(INITIAL_PLAN as never);
      }
      await db.settings.put({ key: "pathSeeded", value: true });
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
    });
  }

  // Migração de marcos: contas existentes (que já tinham pathSeeded) recebem os
  // marcos do objetivo físico aqui. Guardado por versão pra não duplicar.
  const msVersion = await db.settings.get("milestoneSeedVersion");
  if (((msVersion?.value as number) ?? 1) < MILESTONE_SEED_VERSION) {
    await db.transaction("rw", [db.milestones, db.settings], async () => {
      for (const m of BODY_GOAL_MILESTONES) {
        await db.milestones.add(m as never);
      }
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
    });
  }

  // Migração do plano alimentar — atualiza pra última versão sem duplicar
  const versionSetting = await db.settings.get("mealPlanVersion");
  const currentVersion = (versionSetting?.value as number) ?? 1;
  if (currentVersion < MEAL_PLAN_VERSION) {
    await db.transaction("rw", [db.mealPlans, db.settings], async () => {
      const existing = (await db.mealPlans.toArray())[0];
      if (existing && existing.id !== undefined) {
        await db.mealPlans.update(existing.id, INITIAL_PLAN);
      } else {
        await db.mealPlans.add(INITIAL_PLAN as never);
      }
      await db.settings.put({ key: "mealPlanVersion", value: MEAL_PLAN_VERSION });
    });
  }
}

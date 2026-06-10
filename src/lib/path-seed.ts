import { db } from "./db";
import { MILESTONES, BODY_GOAL_MILESTONES, BUST_MILESTONES } from "../data/milestones-seed";
import { ALL_MEAL_PLANS, INITIAL_PLAN } from "../data/meal-plan-seed";

const MEAL_PLAN_VERSION = 4;
const MILESTONE_SEED_VERSION = 4;

/** Upsert dos planos por `goal` (déficit/manutenção/superávit): atualiza o que
 *  já existe e adiciona os que faltam, sem duplicar. Idempotente. O déficit é
 *  inserido primeiro, então fica em [0] (retrocompat com quem lê mealPlans[0]). */
async function upsertMealPlans(): Promise<void> {
  const existing = await db.mealPlans.toArray();
  for (const p of ALL_MEAL_PLANS) {
    const match = existing.find((x) => x.goal === p.goal);
    if (match?.id !== undefined) {
      await db.mealPlans.update(match.id, p);
    } else {
      await db.mealPlans.add(p as never);
    }
  }
}

export async function seedPath(): Promise<void> {
  // Seed inicial (marcos + planos) acontece uma vez
  const seeded = await db.settings.get("pathSeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.milestones, db.mealPlans, db.settings], async () => {
      for (const m of [...MILESTONES, ...BODY_GOAL_MILESTONES, ...BUST_MILESTONES]) {
        await db.milestones.add(m as never);
      }
      if ((await db.mealPlans.count()) === 0) {
        await db.mealPlans.add(INITIAL_PLAN as never); // garante déficit em [0]
      }
      await upsertMealPlans();
      await db.settings.put({ key: "pathSeeded", value: true });
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
      await db.settings.put({ key: "mealPlanVersion", value: MEAL_PLAN_VERSION });
    });
  }

  // Migração de marcos por etapas (evita duplicar quem já passou por uma versão):
  // v2 adiciona os marcos do objetivo físico; v3 adiciona o marco de busto;
  // v4 atualiza o marco antigo de "pixie" pro de "transição" (crescimento do cabelo).
  const msVersionSetting = await db.settings.get("milestoneSeedVersion");
  const msVersion = (msVersionSetting?.value as number) ?? 1;
  if (msVersion < MILESTONE_SEED_VERSION) {
    await db.transaction("rw", [db.milestones, db.settings], async () => {
      if (msVersion < 2) {
        for (const m of BODY_GOAL_MILESTONES) await db.milestones.add(m as never);
      }
      if (msVersion < 3) {
        for (const m of BUST_MILESTONES) await db.milestones.add(m as never);
      }
      if (msVersion < 4) {
        // Atualiza o marco antigo de "pixie" pro de crescimento (ou adiciona se faltar).
        const novo = MILESTONES.find((m) => m.title.includes("transição"));
        if (novo) {
          const fisicos = await db.milestones.where("category").equals("fisico").toArray();
          const pixie = fisicos.find((m) => m.title.includes("pixie"));
          if (pixie?.id !== undefined) {
            await db.milestones.update(pixie.id, { title: novo.title, notes: novo.notes });
          } else {
            await db.milestones.add(novo as never);
          }
        }
      }
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
    });
  }

  // Migração dos planos alimentares — atualiza o déficit e adiciona os planos
  // de manutenção e superávit (planos por fase). Upsert por meta, sem duplicar.
  const versionSetting = await db.settings.get("mealPlanVersion");
  const currentVersion = (versionSetting?.value as number) ?? 1;
  if (currentVersion < MEAL_PLAN_VERSION) {
    await db.transaction("rw", [db.mealPlans, db.settings], async () => {
      await upsertMealPlans();
      await db.settings.put({ key: "mealPlanVersion", value: MEAL_PLAN_VERSION });
    });
  }
}

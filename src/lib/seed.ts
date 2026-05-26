import { db } from "./db";
import { EXERCISES } from "../data/exercises-seed";
import { WORKOUT_PLAN } from "../data/workout-plan-seed";

export async function seedDatabase(): Promise<void> {
  const seeded = await db.settings.get("seeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
    for (const ex of EXERCISES) {
      await db.exercises.put(ex);
    }
    for (const tpl of WORKOUT_PLAN) {
      await db.workoutTemplates.put(tpl);
    }
    await db.settings.put({ key: "seeded", value: true });
  });
}

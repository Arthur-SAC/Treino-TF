import { db } from "./db";
import { EXERCISES } from "../data/exercises-seed";
import { WORKOUT_PLAN } from "../data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../data/cycles-seed";

export async function seedDatabase(): Promise<void> {
  const seeded = await db.settings.get("seeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
      for (const ex of EXERCISES) {
        await db.exercises.put(ex);
      }
      for (const tpl of WORKOUT_PLAN) {
        await db.workoutTemplates.put(tpl);
      }
      for (const tpl of CYCLE_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "seeded", value: true });
    });
  }

  // Migration pra contas existentes: marca templates antigos como adaptacao
  // e adiciona os novos ciclos.
  const cyclesSeeded = await db.settings.get("cyclesSeeded");
  if (cyclesSeeded?.value !== true) {
    await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
      // Garante que os novos exercícios estejam presentes (pra contas existentes)
      for (const ex of EXERCISES) {
        const existing = await db.exercises.get(ex.id);
        if (!existing) {
          await db.exercises.put(ex);
        }
      }
      // Marca templates antigos como adaptacao (se não tiverem cycle setado)
      const existing = await db.workoutTemplates.toArray();
      for (const tpl of existing) {
        if (!tpl.cycle) {
          await db.workoutTemplates.update(tpl.id, { cycle: "adaptacao" });
        }
      }
      // Adiciona os novos ciclos
      for (const tpl of CYCLE_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "cyclesSeeded", value: true });
    });
  }
}

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

  // Re-seed de exercícios: as telas leem do IndexedDB, não do arquivo. Logo,
  // mudanças no conteúdo dos exercícios (nome, equipamento, descrição) só chegam
  // em contas existentes via este bloco. Bumpar EXERCISE_SEED_VERSION força um
  // put() de todos os exercícios — idempotente, não duplica (mesmo id sobrescreve).
  const EXERCISE_SEED_VERSION = 4;
  const exVersion = await db.settings.get("exerciseSeedVersion");
  if (((exVersion?.value as number) ?? 0) < EXERCISE_SEED_VERSION) {
    await db.transaction("rw", db.exercises, db.settings, async () => {
      for (const ex of EXERCISES) {
        await db.exercises.put(ex);
      }
      await db.settings.put({ key: "exerciseSeedVersion", value: EXERCISE_SEED_VERSION });
    });
  }

  // Re-seed de templates: mesma lógica. Quando o plano de treino muda (split
  // glúteo-prioritário, novo ciclo de manutenção), bumpar TEMPLATE_SEED_VERSION
  // re-grava todos os templates. put() sobrescreve os de mesmo id e adiciona os
  // novos (manutenção). Idempotente.
  const TEMPLATE_SEED_VERSION = 4;
  const tplVersion = await db.settings.get("templateSeedVersion");
  if (((tplVersion?.value as number) ?? 0) < TEMPLATE_SEED_VERSION) {
    await db.transaction("rw", db.workoutTemplates, db.settings, async () => {
      for (const tpl of WORKOUT_PLAN) {
        await db.workoutTemplates.put(tpl);
      }
      for (const tpl of CYCLE_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "templateSeedVersion", value: TEMPLATE_SEED_VERSION });
    });
  }
}

import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

// Bump quando o seed de rotinas mudar. A migração faz upsert POR NOME: atualiza
// os passos das rotinas do seed (troca de produtos) e adiciona as que faltam.
const ROUTINE_SEED_VERSION = 3;

export async function seedBeauty(): Promise<void> {
  const seeded = await db.settings.get("beautySeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.products, db.skincareRoutines, db.settings], async () => {
      for (const p of PRODUCTS) {
        await db.products.add(p as never);
      }
      for (const r of ROUTINES) {
        await db.skincareRoutines.add(r as never);
      }
      await db.settings.put({ key: "beautySeeded", value: true });
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    });
  }

  // Migração de rotinas pra contas existentes: upsert POR NOME — atualiza os
  // passos das rotinas do seed (ex.: troca de produtos pelo kit barato) e
  // adiciona as que faltam. Idempotente.
  const rvSetting = await db.settings.get("routineSeedVersion");
  const rv = (rvSetting?.value as number) ?? 1;
  if (rv < ROUTINE_SEED_VERSION) {
    await db.transaction("rw", [db.skincareRoutines, db.settings], async () => {
      const existing = await db.skincareRoutines.toArray();
      for (const r of ROUTINES) {
        const match = existing.find((x) => x.name === r.name);
        if (match?.id !== undefined) {
          await db.skincareRoutines.update(match.id, { time: r.time, target: r.target, steps: r.steps });
        } else {
          await db.skincareRoutines.add(r as never);
        }
      }
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    });
  }
}

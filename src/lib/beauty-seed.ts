import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

// Bump quando entrarem rotinas novas no seed: a migração adiciona as que faltam
// (por nome), sem duplicar nem sobrescrever rotinas que a usuária editou/criou.
const ROUTINE_SEED_VERSION = 2;

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

  // Migração de rotinas pra contas existentes: adiciona qualquer rotina do seed
  // cujo `name` ainda não exista no banco. Idempotente.
  const rvSetting = await db.settings.get("routineSeedVersion");
  const rv = (rvSetting?.value as number) ?? 1;
  if (rv < ROUTINE_SEED_VERSION) {
    await db.transaction("rw", [db.skincareRoutines, db.settings], async () => {
      const names = new Set((await db.skincareRoutines.toArray()).map((r) => r.name));
      for (const r of ROUTINES) {
        if (!names.has(r.name)) await db.skincareRoutines.add(r as never);
      }
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    });
  }
}

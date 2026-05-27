import { db } from "./db";
import { MAKEUP_PRODUCTS } from "../data/makeup-products-seed";
import { MAKEUP_ROUTINES } from "../data/makeup-routines-seed";

export async function seedMakeup(): Promise<void> {
  const seeded = await db.settings.get("makeupSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.products, db.makeupRoutines, db.settings], async () => {
    for (const p of MAKEUP_PRODUCTS) {
      await db.products.add(p as never);
    }
    for (const r of MAKEUP_ROUTINES) {
      await db.makeupRoutines.add(r as never);
    }
    await db.settings.put({ key: "makeupSeeded", value: true });
  });
}

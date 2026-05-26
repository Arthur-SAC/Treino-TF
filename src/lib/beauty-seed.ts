import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

export async function seedBeauty(): Promise<void> {
  const seeded = await db.settings.get("beautySeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.products, db.skincareRoutines, db.settings], async () => {
    for (const p of PRODUCTS) {
      await db.products.add(p as never);
    }
    for (const r of ROUTINES) {
      await db.skincareRoutines.add(r as never);
    }
    await db.settings.put({ key: "beautySeeded", value: true });
  });
}

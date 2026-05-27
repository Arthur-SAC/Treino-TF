import { db } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";

export async function seedStyle(): Promise<void> {
  const seeded = await db.settings.get("styleSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.garments, db.stylePalette, db.settings], async () => {
    for (const g of GARMENTS) {
      await db.garments.put(g);
    }
    if ((await db.stylePalette.count()) === 0) {
      await db.stylePalette.add(INITIAL_PALETTE as never);
    }
    await db.settings.put({ key: "styleSeeded", value: true });
  });
}

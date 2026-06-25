import { db } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";
import { OUTFITS } from "../data/outfits-seed";

export async function seedStyle(): Promise<void> {
  const v1 = await db.settings.get("styleSeeded");
  if (v1?.value !== true) {
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

  // V2: aplica discrição/fitTip + peças novas + combinações. Idempotente e não destrutivo.
  const v2 = await db.settings.get("styleSeededV2");
  if (v2?.value !== true) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      for (const g of GARMENTS) {
        await db.garments.put(g); // put atualiza as existentes e cria as novas
      }
      for (const o of OUTFITS) {
        await db.outfits.add(o as never);
      }
      await db.settings.put({ key: "styleSeededV2", value: true });
    });
  }
}

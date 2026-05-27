import { db } from "./db";
import { SEQUENCES } from "../data/sequences-seed";

export async function seedMovement(): Promise<void> {
  const seeded = await db.settings.get("movementSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.danceSequences, db.settings], async () => {
    for (const s of SEQUENCES) {
      await db.danceSequences.put(s);
    }
    await db.settings.put({ key: "movementSeeded", value: true });
  });
}

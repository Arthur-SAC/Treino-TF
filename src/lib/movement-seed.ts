import { db } from "./db";
import { SEQUENCES } from "../data/sequences-seed";

const MOVEMENT_VERSION = 7;

export async function seedMovement(): Promise<void> {
  const seeded = await db.settings.get("movementSeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.danceSequences, db.settings], async () => {
      for (const s of SEQUENCES) {
        await db.danceSequences.put(s);
      }
      await db.settings.put({ key: "movementSeeded", value: true });
    });
  }

  // Migração: adiciona sequências novas se versão for menor
  const versionSetting = await db.settings.get("movementVersion");
  const currentVersion = (versionSetting?.value as number) ?? 1;
  if (currentVersion < MOVEMENT_VERSION) {
    await db.transaction("rw", [db.danceSequences, db.settings], async () => {
      for (const s of SEQUENCES) {
        const existing = await db.danceSequences.get(s.id);
        await db.danceSequences.put({ ...s, videoUrl: existing?.videoUrl ?? s.videoUrl }); // preserva o link do usuário
      }
      await db.settings.put({ key: "movementVersion", value: MOVEMENT_VERSION });
    });
  }
}

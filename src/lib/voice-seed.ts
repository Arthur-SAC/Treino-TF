import { db } from "./db";
import { VOICE_EXERCISES } from "../data/voice-seed";

export async function seedVoice(): Promise<void> {
  const seeded = await db.settings.get("voiceSeeded");
  if (seeded?.value === true) return;
  await db.transaction("rw", [db.voiceExercises, db.settings], async () => {
    for (const ex of VOICE_EXERCISES) {
      await db.voiceExercises.put(ex);
    }
    await db.settings.put({ key: "voiceSeeded", value: true });
  });
}

import { db } from "./db";
import { SEQUENCES } from "../data/sequences-seed";

// Exportada (e não mais local) pelo mesmo motivo das outras versões de seed: o
// teste de chegada precisa plantar a versão imediatamente anterior, e derivar
// "anterior = atual − 1" é a única forma de esse número não destoar do código.
// Era a última versão de seed grande sem essa rede.
//
// v9 (histórico): as quatro sequências de flexibilidade das fases 2 e 3.
// v10: o repertório íntimo — grinding reescrito pra configuração real dela
// (sempre por cima, congelar variáveis, 15-25 min), esfregar com roupa,
// receber por mão e dedos, e as quatro fases de resistência do rebolado.
// Sem este bump, tudo isso fica só no repositório.
export const MOVEMENT_VERSION = 10;

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

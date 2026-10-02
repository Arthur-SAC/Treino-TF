import { db } from "./db";
import { hojeISO } from "./today-date";

// O que entra no backup e como volta. Saiu de Settings.tsx (auditoria de
// 2026-09-23) porque o backup deixava de fora as configurações — ciclo atual,
// contagem de sessões do ciclo, horários, altura, início da vitalidade —, as
// marcações do Hoje e as tabelas de estilo, produtos e depilação. É o único
// lugar onde os dados dela existem fora do celular; restaurar num aparelho novo
// voltava pra Entrada 1. Aqui a ida e a volta têm teste.

export async function blobParaBase64(blob: Blob): Promise<string> {
  // No navegador o IndexedDB devolve Blob de verdade; o banco falso dos testes
  // devolve objeto sem métodos — aí não há bytes a copiar.
  if (typeof blob?.arrayBuffer !== "function") return "";
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

export function base64ParaBlob(b64: string, type = "application/octet-stream"): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

type ComBlob = { blob: Blob; [k: string]: unknown };
type ComBase64 = { blob: string; blobType?: string; [k: string]: unknown };

async function serializar(rows: ComBlob[]): Promise<ComBase64[]> {
  return Promise.all(rows.map(async (r) => ({ ...r, blob: await blobParaBase64(r.blob), blobType: r.blob?.type ?? "" })));
}

function desserializar(rows: ComBase64[] | undefined): ComBlob[] {
  return (rows ?? []).map(({ blobType, ...r }) => ({ ...r, blob: base64ParaBlob(r.blob, blobType || undefined) }));
}

export interface BackupPayload {
  measurements: unknown[];
  photos: ComBase64[];
  sessions: unknown[];
  meals: unknown[];
  skincareLogs: unknown[];
  haircare: unknown[];
  dailyLog: unknown[];
  voiceRecordings?: ComBase64[];
  voicePracticeLogs?: unknown[];
  practiceLogs?: unknown[];
  milestones?: unknown[];
  // Desde 2026-09-23:
  settings?: unknown[];
  routineChecks?: unknown[];
  looks?: ComBase64[];
  wishlist?: unknown[];
  garments?: unknown[];
  outfits?: unknown[];
  stylePalette?: unknown[];
  products?: unknown[];
  mealPlans?: unknown[];
  hairRemovalSessions?: unknown[];
  // Desde 2026-09-24 (migração pro APK): tabelas semeadas que a interface
  // edita — links de vídeo colados, rotinas de skincare e maquiagem.
  exercises?: unknown[];
  skincareRoutines?: unknown[];
  danceSequences?: unknown[];
  makeupRoutines?: unknown[];
}

/** Tabelas que só o seed escreve: nenhuma tela grava nelas, então o seed do
 *  aparelho novo as recria iguais. O teste backup-cobre-tudo confere isso. */
export const TABELAS_SO_SEED: readonly string[] = ["workoutTemplates", "voiceExercises"];

export async function coletarBackup(): Promise<BackupPayload> {
  return {
    measurements: await db.measurements.toArray(),
    photos: await serializar((await db.photos.toArray()) as unknown as ComBlob[]),
    sessions: await db.workoutSessions.toArray(),
    meals: await db.meals.toArray(),
    skincareLogs: await db.skincareLogs.toArray(),
    haircare: await db.haircare.toArray(),
    dailyLog: await db.dailyLog.toArray(),
    voiceRecordings: await serializar((await db.voiceRecordings.toArray()) as unknown as ComBlob[]),
    voicePracticeLogs: await db.voicePracticeLogs.toArray(),
    practiceLogs: await db.practiceLogs.toArray(),
    milestones: await db.milestones.toArray(),
    settings: await db.settings.toArray(),
    routineChecks: await db.routineChecks.toArray(),
    looks: await serializar((await db.looks.toArray()) as unknown as ComBlob[]),
    wishlist: await db.wishlist.toArray(),
    garments: await db.garments.toArray(),
    outfits: await db.outfits.toArray(),
    stylePalette: await db.stylePalette.toArray(),
    products: await db.products.toArray(),
    mealPlans: await db.mealPlans.toArray(),
    hairRemovalSessions: await db.hairRemovalSessions.toArray(),
    exercises: await db.exercises.toArray(),
    skincareRoutines: await db.skincareRoutines.toArray(),
    danceSequences: await db.danceSequences.toArray(),
    makeupRoutines: await db.makeupRoutines.toArray(),
  };
}

/** Tudo entra com `bulkPut`: restaura cada registro com o id que tinha. Com
 *  `bulkAdd` (como era), restaurar no mesmo aparelho abortava a importação
 *  inteira no primeiro id repetido; e num aparelho novo, o que o seed já criou
 *  (configurações, peças, produtos, planos) precisa ser substituído, não somado. */
export async function restaurarBackup(p: BackupPayload): Promise<void> {
  await db.transaction("rw", db.tables, async () => {
    // Tabelas que o seed de um aparelho novo já preencheu, com ids que não
    // batem com os dela (os dela têm buracos e linhas de migração): se o
    // backup traz a tabela, ela é limpa antes — senão as sobras do seed ficam
    // duplicadas ao lado das dela. Tabela ausente (backup antigo) fica como está.
    const semeadas = [
      [p.milestones, db.milestones], [p.products, db.products], [p.mealPlans, db.mealPlans],
      [p.stylePalette, db.stylePalette], [p.outfits, db.outfits], [p.garments, db.garments],
      [p.skincareRoutines, db.skincareRoutines], [p.makeupRoutines, db.makeupRoutines],
      [p.danceSequences, db.danceSequences],
    ] as const;
    for (const [dados, tabela] of semeadas) {
      if (dados) await tabela.clear();
    }
    await db.measurements.bulkPut(p.measurements as never);
    await db.photos.bulkPut(desserializar(p.photos) as never);
    await db.workoutSessions.bulkPut(p.sessions as never);
    await db.meals.bulkPut(p.meals as never);
    await db.skincareLogs.bulkPut(p.skincareLogs as never);
    await db.haircare.bulkPut(p.haircare as never);
    await db.dailyLog.bulkPut(p.dailyLog as never);
    await db.voiceRecordings.bulkPut(desserializar(p.voiceRecordings) as never);
    await db.voicePracticeLogs.bulkPut((p.voicePracticeLogs ?? []) as never);
    await db.practiceLogs.bulkPut((p.practiceLogs ?? []) as never);
    await db.milestones.bulkPut((p.milestones ?? []) as never);
    await db.settings.bulkPut((p.settings ?? []) as never);
    await db.routineChecks.bulkPut((p.routineChecks ?? []) as never);
    await db.looks.bulkPut(desserializar(p.looks) as never);
    await db.wishlist.bulkPut((p.wishlist ?? []) as never);
    await db.garments.bulkPut((p.garments ?? []) as never);
    await db.outfits.bulkPut((p.outfits ?? []) as never);
    await db.stylePalette.bulkPut((p.stylePalette ?? []) as never);
    await db.products.bulkPut((p.products ?? []) as never);
    await db.mealPlans.bulkPut((p.mealPlans ?? []) as never);
    await db.hairRemovalSessions.bulkPut((p.hairRemovalSessions ?? []) as never);
    // exercises fica fora de `semeadas`: o id é texto e igual ao do seed, então
    // o put sobrescreve sem duplicar, e exercício novo de um seed mais novo fica.
    await db.exercises.bulkPut((p.exercises ?? []) as never);
    await db.skincareRoutines.bulkPut((p.skincareRoutines ?? []) as never);
    await db.danceSequences.bulkPut((p.danceSequences ?? []) as never);
    await db.makeupRoutines.bulkPut((p.makeupRoutines ?? []) as never);
    // Depois do bulkPut das configurações (senão ele sobrescreve): o arquivo que
    // ela acabou de restaurar É um backup, então o aviso de 15 dias recomeça hoje.
    await db.settings.put({ key: "ultimoBackupEm", value: hojeISO() });
  });
}

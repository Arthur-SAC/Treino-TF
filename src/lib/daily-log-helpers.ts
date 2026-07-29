// Helpers do registro diário (`dailyLog`). Padrão comum: pega o log do dia,
// atualiza se existir, cria com os campos zerados se não existir — o mesmo
// jeito que Today.tsx já usava inline para água e caminhada.
import { db } from "./db";
import type { DailyLog } from "./db";

export async function addWater(date: string, ml: number): Promise<void> {
  const log = await db.dailyLog.get(date);
  if (log) {
    await db.dailyLog.update(date, { waterMl: log.waterMl + ml });
  } else {
    await db.dailyLog.put({ date, waterMl: ml, activeBreakCount: 0 });
  }
}

export async function addWalk(date: string, min: number): Promise<void> {
  const log = await db.dailyLog.get(date);
  if (log) {
    await db.dailyLog.update(date, { walkMin: (log.walkMin ?? 0) + min });
  } else {
    await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, walkMin: min });
  }
}

/** Passeio com os cães credita (ou devolve, se desmarcado) 1h de movimento.
 *  Nunca deixa `walkMin` negativo — desmarcar duas vezes seguidas não desconta
 *  do dia anterior nem de outro item. */
export async function creditarPasseio(date: string, marcado = true): Promise<void> {
  const delta = marcado ? 60 : -60;
  const log = await db.dailyLog.get(date);
  if (log) {
    await db.dailyLog.update(date, { walkMin: Math.max(0, (log.walkMin ?? 0) + delta) });
  } else {
    await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, walkMin: Math.max(0, delta) });
  }
}

/** Registra a hora real (HH:MM) em que ela deitou. */
export async function registrarSono(date: string, hhmm: string): Promise<void> {
  const log = await db.dailyLog.get(date);
  if (log) {
    await db.dailyLog.update(date, { sleepAt: hhmm });
  } else {
    await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, sleepAt: hhmm });
  }
}

/** Pura: conta, dentro dos logs recebidos, quantas noites têm `sleepAt`
 *  registrado e não mais tarde que `alvo` (comparação de string "HH:MM",
 *  válida porque ambos vêm zero-padded). Quem chama decide a janela (ex.: só
 *  os logs dos últimos 7 dias) — dias sem `sleepAt` simplesmente não entram
 *  na contagem, nem a favor nem contra. */
export function noitesNoAlvo(logs: DailyLog[], alvo: string): number {
  return logs.filter((l) => l.sleepAt !== undefined && l.sleepAt <= alvo).length;
}

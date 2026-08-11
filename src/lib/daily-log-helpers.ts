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
  // Ler e escrever na mesma transação: dois toques rápidos no item dos cães
  // chegavam aqui em paralelo, liam o mesmo `walkMin` e uma das escritas se
  // perdia — sobrava um total que não voltava mais pro zero.
  await db.transaction("rw", db.dailyLog, async () => {
    const log = await db.dailyLog.get(date);
    if (log) {
      await db.dailyLog.update(date, { walkMin: Math.max(0, (log.walkMin ?? 0) + delta) });
    } else {
      await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, walkMin: Math.max(0, delta) });
    }
  });
}

/** Registra a hora real (HH:MM) em que ela deitou — ou apaga o registro, com
 *  `hhmm` indefinido, quando ela desmarca "Dormir". Sem isso a linha ficava
 *  desmarcada mas continuava dizendo "Você deitou às…", que é a mesma classe
 *  de mentira que o check errado. */
export async function registrarSono(date: string, hhmm?: string): Promise<void> {
  const log = await db.dailyLog.get(date);
  if (log) {
    const { sleepAt: _antigo, ...semSono } = log;
    await db.dailyLog.put(hhmm === undefined ? semSono : { ...semSono, sleepAt: hhmm });
  } else if (hhmm !== undefined) {
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

/** Marca (ou desmarca) o dia como gasto automático. Lê e escreve na mesma
 *  transação pelo mesmo motivo de `creditarPasseio`: dois toques rápidos em
 *  paralelo liam o mesmo registro e uma das escritas se perdia. */
export async function registrarGastoAutomatico(date: string, marcado: boolean): Promise<void> {
  await db.transaction("rw", db.dailyLog, async () => {
    const log = await db.dailyLog.get(date);
    if (log) {
      await db.dailyLog.update(date, { gastoAutomatico: marcado });
    } else {
      await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, gastoAutomatico: marcado });
    }
  });
}

/** Dias marcados como gasto automático. */
export async function diasComGasto(): Promise<string[]> {
  const logs = await db.dailyLog.toArray();
  return logs.filter((l) => l.gastoAutomatico).map((l) => l.date);
}

/** Dia mais antigo com registro diário — serve de início do acompanhamento pro
 *  streak. Sem isso, "nenhum gasto" seria indistinguível de "nunca registrou",
 *  e o app inventaria um recorde que ela não fez. `date` é a chave primária de
 *  `dailyLog`, então `orderBy` usa o índice dela sem precisar de índice extra. */
export async function inicioDoAcompanhamento(): Promise<string | null> {
  const logs = await db.dailyLog.orderBy("date").limit(1).toArray();
  return logs[0]?.date ?? null;
}

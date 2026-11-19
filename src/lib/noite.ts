// src/lib/noite.ts
// Teto do bloco do app à noite e rodízio dos itens que não cabem todo dia
// (spec 2026-11-19). Módulo puro: quem chama injeta os minutos das sequências.
import type { DayRoutine, RoutineItem } from "./today-routine";

export const TETO_NOITE_MIN = 30;
/** Ordem de prioridade: o que vem antes ganha quando só um cabe. */
export const RODIZIO_NOITE = ["postura", "voz", "assoalho-pelvico"] as const;

/** Itens fixos do bloco: contam no teto e nunca saem. */
const FIXOS_NOITE = ["skincare-noite", "alongamento-noite"] as const;
/** Noites com bloco do app, na ordem em que a semana de rodízio roda. */
const NOITES_COM_BLOCO = [1, 2, 3, 4, 0] as const;

function ehRodizio(id: string): boolean {
  return (RODIZIO_NOITE as readonly string[]).includes(id);
}

/** Dia da semana (0–6) → itens do rodízio naquela noite. Quem apareceu menos
 *  vezes na semana vai na frente; empate resolve pela prioridade. Sexta e
 *  sábado são sempre vazios. Se os fixos já enchem o teto, tudo vazio. */
export function rodizioDaSemana(
  abertos: readonly string[],
  minutosDe: (itemId: string) => number,
): Record<number, string[]> {
  const sem: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const candidatos = RODIZIO_NOITE.filter((id) => abertos.includes(id));
  const fixos = FIXOS_NOITE.reduce((a, id) => a + minutosDe(id), 0);
  const sobra = TETO_NOITE_MIN - fixos;
  if (sobra <= 0) return sem;
  const vezes: Record<string, number> = {};
  for (const id of candidatos) vezes[id] = 0;
  for (const dia of NOITES_COM_BLOCO) {
    const ordem = [...candidatos].sort(
      (a, b) => vezes[a] - vezes[b] || RODIZIO_NOITE.indexOf(a) - RODIZIO_NOITE.indexOf(b),
    );
    let usado = 0;
    for (const id of ordem) {
      const m = minutosDe(id);
      if (usado + m <= sobra) {
        sem[dia].push(id);
        usado += m;
        vezes[id] += 1;
      }
    }
  }
  return sem;
}

function paraMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function paraHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Tira do dia os itens do rodízio que não couberem e dá horário sequencial aos
 *  que ficam, logo depois do alongamento. Só mexe nos itens do rodízio. */
export function ajustarNoite(r: DayRoutine, minutosDe: (itemId: string) => number): DayRoutine {
  const bloco = r.blocks.find((b) => b.id === "noite");
  if (!bloco) return r;
  const presentes = bloco.items.filter((i) => ehRodizio(i.id));
  if (presentes.length === 0) return r;

  const ids = presentes.map((i) => i.id);
  const escolhidos = rodizioDaSemana(ids, minutosDe)[r.dayOfWeek] ?? [];
  const alongamento = bloco.items.find((i) => i.id === "alongamento-noite");
  const refHorario = alongamento?.defaultTime;
  let t = refHorario ? paraMin(refHorario) + minutosDe("alongamento-noite") : null;

  const ficam: RoutineItem[] = escolhidos.map((id) => {
    const item = presentes.find((i) => i.id === id)!;
    if (t === null) return item;
    const novo = { ...item, defaultTime: paraHHMM(t) };
    t += minutosDe(id);
    return novo;
  });

  // Os que ficam entram no lugar do primeiro item do rodízio, em ordem de horário.
  const primeiro = bloco.items.findIndex((i) => ehRodizio(i.id));
  const itens: RoutineItem[] = [];
  bloco.items.forEach((i, idx) => {
    if (idx === primeiro) itens.push(...ficam);
    if (!ehRodizio(i.id)) itens.push(i);
  });
  return { ...r, blocks: r.blocks.map((b) => (b === bloco ? { ...b, items: itens } : b)) };
}

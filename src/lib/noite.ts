// src/lib/noite.ts
// Teto do bloco do app Ã  noite e rodÃ­zio dos itens que nÃ£o cabem todo dia
// (spec 2026-11-19). MÃ³dulo puro: quem chama injeta os minutos das sequÃªncias.
import type { DayRoutine, RoutineItem } from "./today-routine";

export const TETO_NOITE_MIN = 30;
/** Ordem de prioridade: o que vem antes ganha quando sÃ³ um cabe. */
export const RODIZIO_NOITE = ["postura", "voz", "assoalho-pelvico"] as const;

/** Itens fixos do bloco: contam no teto e nunca saem. */
const FIXOS_NOITE = ["skincare-noite", "alongamento-noite"] as const;
/** Noites com bloco do app, na ordem em que a semana de rodÃ­zio roda. */
const NOITES_COM_BLOCO = [1, 2, 3, 4, 0] as const;

function ehRodizio(id: string): boolean {
  return (RODIZIO_NOITE as readonly string[]).includes(id);
}

/** Dia da semana (0â€“6) â†’ itens do rodÃ­zio naquela noite. Quem apareceu menos
 *  vezes na semana vai na frente; empate resolve pela prioridade. Sexta e
 *  sÃ¡bado sÃ£o sempre vazios. Se os fixos jÃ¡ enchem o teto, tudo vazio. */
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

/** O bloco do app é sequencial: o alongamento começa logo depois do skincare
 *  e os itens do rodízio logo depois do alongamento. Tira do dia os do rodízio
 *  que não couberem (teto e, por segurança, o início do "com ela"). Só mexe no
 *  alongamento (horário) e nos itens do rodízio. */
export function ajustarNoite(r: DayRoutine, minutosDe: (itemId: string) => number): DayRoutine {
  const bloco = r.blocks.find((b) => b.id === "noite");
  if (!bloco) return r;
  const presentes = bloco.items.filter((i) => ehRodizio(i.id));
  if (presentes.length === 0) return r;

  const escolhidos = rodizioDaSemana(presentes.map((i) => i.id), minutosDe)[r.dayOfWeek] ?? [];
  const skincare = bloco.items.find((i) => i.id === "skincare-noite");
  const comEla = bloco.items.find((i) => i.id === "com-ela");
  let alongamento = bloco.items.find((i) => i.id === "alongamento-noite");
  if (alongamento && skincare?.defaultTime) {
    alongamento = { ...alongamento, defaultTime: paraHHMM(paraMin(skincare.defaultTime) + minutosDe("skincare-noite")) };
  }
  let t = alongamento?.defaultTime ? paraMin(alongamento.defaultTime) + minutosDe("alongamento-noite") : null;
  const limite = comEla?.defaultTime ? paraMin(comEla.defaultTime) : null;

  const ficam: RoutineItem[] = [];
  for (const id of escolhidos) {
    const item = presentes.find((i) => i.id === id)!;
    if (t === null) { ficam.push(item); continue; }
    const fim = t + minutosDe(id);
    if (limite !== null && fim > limite) continue;
    ficam.push({ ...item, defaultTime: paraHHMM(t) });
    t = fim;
  }

  // Os que ficam entram no lugar do primeiro item do rodízio, em ordem de execução.
  const primeiro = bloco.items.findIndex((i) => ehRodizio(i.id));
  const itens: RoutineItem[] = [];
  bloco.items.forEach((i, idx) => {
    if (idx === primeiro) itens.push(...ficam);
    if (!ehRodizio(i.id)) itens.push(i.id === "alongamento-noite" && alongamento ? alongamento : i);
  });
  return { ...r, blocks: r.blocks.map((b) => (b === bloco ? { ...b, items: itens } : b)) };
}

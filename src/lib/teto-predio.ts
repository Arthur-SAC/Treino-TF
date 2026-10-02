// O teto de carga da academia do prédio, aprendido no uso. Módulo puro.
//
// A troca pra Smartfit acontece quando ela bater a carga máxima do prédio —
// e ela não sabe quanto é (2026-10-02). Então o app aprende: quando ele sugere
// subir e o aparelho não tem mais, ela toca "não tem mais peso aqui".
//
// Decisão dela (2026-10-02): a troca de academia só acontece na fase 2, mesmo
// que o teto chegue antes. Até a cintura chegar no fim da fase 1, o prédio
// continua com as táticas — a prioridade da fase 1 é a barriga, não a carga.

import { FASES } from "./objetivo";

/** Cintura do fim da fase 1 — a mesma régua que libera a fase 2. */
export const CINTURA_PRA_SMARTFIT = FASES.find((f) => f.id === "fase-1")!.cinturaCm;

/** Os que constroem glúteo e coxa e mais vão pedir carga. Quando os quatro
 *  estiverem no teto, as táticas não seguram o crescimento por muito tempo. */
export const EXERCICIOS_CHAVE = ["hip-thrust-barra", "leg-press-pes-medios", "abdutor-maquina", "agachamento-bulgaro"] as const;

export type LadoFraco = "" | "esquerdo" | "direito";

export function noTeto(sugerido: number, teto?: number): boolean {
  return teto !== undefined && sugerido > teto;
}

export const TATICAS_NO_TETO = [
  "Faz 2 repetições acima do topo da faixa antes de pensar em carga.",
  "Segura 2 s na contração de cada repetição.",
  "Desce em 4 s — a descida lenta é trabalho que a carga não dá.",
] as const;

const TATICA_UNILATERAL = "Troca pela versão de uma perna (ou um braço): a mesma carga vira quase o dobro.";

/** Abdutora não tem versão de uma perna: oferecer a troca seria dica impossível. */
export function taticasNoTeto(repsTarget: string, exerciseId?: string): string[] {
  const semUnilateral = ehUnilateral(repsTarget) || exerciseId === "abdutor-maquina";
  return semUnilateral ? [...TATICAS_NO_TETO] : [...TATICAS_NO_TETO, TATICA_UNILATERAL];
}

export function progressoTeto(tetos: Record<string, number>): { noTeto: number; total: number; todos: boolean } {
  const n = EXERCICIOS_CHAVE.filter((id) => tetos[id] !== undefined).length;
  return { noTeto: n, total: EXERCICIOS_CHAVE.length, todos: n === EXERCICIOS_CHAVE.length };
}

/** "12 cada" é um lado e depois o outro. A prancha "6 trocas cada lado" tem
 *  "cada" mas é bilateral — não faz sentido perguntar lado ali. */
export function ehUnilateral(repsTarget: string): boolean {
  return /\bcada\b/i.test(repsTarget) && !/troca/i.test(repsTarget);
}

/** Hora de trocar: os quatro exercícios-chave no teto E a cintura já na fase 2.
 *  Sem medida de cintura, ainda não — não dá pra afirmar a fase. */
export function horaDaSmartfit(tetos: Record<string, number>, cinturaAtual: number | undefined): boolean {
  return progressoTeto(tetos).todos && cinturaAtual !== undefined && cinturaAtual <= CINTURA_PRA_SMARTFIT;
}

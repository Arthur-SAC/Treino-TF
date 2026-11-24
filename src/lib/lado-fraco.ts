// Lado fraco primeiro: nos exercícios de um lado de cada vez, começar pelo
// lado que ela marcou como mais fraco. Módulo puro.

export type LadoFraco = "" | "esquerdo" | "direito";

/** "12 cada" é um lado e depois o outro. A prancha "6 trocas cada lado" tem
 *  "cada" mas é bilateral — não faz sentido perguntar lado ali. */
export function ehUnilateral(repsTarget: string): boolean {
  return /\bcada\b/i.test(repsTarget) && !/troca/i.test(repsTarget);
}

/** Isolados de glúteo (coice e abdução). Ela tem um glúteo visivelmente menor
 *  (2026-11-24): aqui a série a mais só do lado fraco custa ~1 min e não
 *  carrega a coluna. Nos compostos (búlgaro, stiff unilateral) ela não entra:
 *  cansaria o lado fraco antes do resto do treino. */
const ISOLADOS_DE_GLUTEO = new Set([
  "coice-gluteo-polia", "kickback", "kickback-cabo", "coice-maquina",
  "abducao-quadril-polia", "abdutor-band-em-pe", "abdutor-cabo-em-pe",
  "abdutor-deitada", "clamshell",
]);

/** Glúteo com as duas pernas juntas, onde o lado forte costuma tomar conta. */
const BILATERAIS_DE_GLUTEO = new Set([
  "hip-thrust-maquina", "hip-thrust-barra", "smith-squat",
]);

export function temSerieExtraDoLadoFraco(exerciseId: string, repsTarget: string): boolean {
  return ehUnilateral(repsTarget) && ISOLADOS_DE_GLUTEO.has(exerciseId);
}

export function pedeEmpurrarIgual(exerciseId: string, repsTarget: string): boolean {
  return !ehUnilateral(repsTarget) && BILATERAIS_DE_GLUTEO.has(exerciseId);
}

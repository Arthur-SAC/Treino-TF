// Lado fraco primeiro: nos exercícios de um lado de cada vez, começar pelo
// lado que ela marcou como mais fraco. Módulo puro.

export type LadoFraco = "" | "esquerdo" | "direito";

/** "12 cada" é um lado e depois o outro. A prancha "6 trocas cada lado" tem
 *  "cada" mas é bilateral — não faz sentido perguntar lado ali. */
export function ehUnilateral(repsTarget: string): boolean {
  return /\bcada\b/i.test(repsTarget) && !/troca/i.test(repsTarget);
}

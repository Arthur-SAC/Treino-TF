// Qual é o aquecimento DESTA sessão.
//
// O card "Antes de começar" da tela da sessão tinha um texto fixo prometendo
// "bike ou esteira leve e mobilidade, conforme o dia". Nas quartas e quintas
// da Fase de Entrada não há bike nem esteira no começo — o aquecimento é
// mobilidade articular, e o cardio é o item do FIM. A usuária foi procurar a
// esteira e não achou.
//
// Aqui o texto passa a ser derivado da sessão real: nomeia os itens que de
// fato abrem o treino, e nunca promete um equipamento que ela não vai usar.

import type { WorkoutTemplate } from "./db";

type TplEx = WorkoutTemplate["exercises"][number];

/** Ids que abrem sessão como aquecimento em templates antigos, que não têm o
 *  campo `block`. Nos templates da Entrada o `block: "aquecimento"` já diz. */
const IDS_DE_AQUECIMENTO = new Set([
  "cardio-leve-esteira",
  "bike-reclinada",
  "aquecimento-articular",
  "cat-cow",
]);

function ehAquecimento(e: TplEx): boolean {
  if (e.block) return e.block === "aquecimento";
  return IDS_DE_AQUECIMENTO.has(e.exerciseId);
}

/** Nomes dos itens que abrem a sessão como aquecimento — só o trecho INICIAL.
 *  Para no primeiro item que não é aquecimento, então o cardio do fim (que é
 *  `block: "final"`) nunca entra aqui. */
export function itensDeAquecimento(
  exercises: TplEx[],
  nomeDe: (id: string) => string | undefined,
): string[] {
  const nomes: string[] = [];
  for (const e of exercises) {
    if (!ehAquecimento(e)) break;
    const nome = nomeDe(e.exerciseId);
    if (nome) nomes.push(nome);
  }
  return nomes;
}

/** A frase do card "Antes de começar", montada a partir da sessão real. */
export function textoDeAquecimento(
  exercises: TplEx[],
  nomeDe: (id: string) => string | undefined,
): string {
  const nomes = itensDeAquecimento(exercises, nomeDe);
  if (nomes.length === 0) {
    return "Esta sessão não tem item de aquecimento separado — o primeiro exercício já entra leve. Comece por ele, sem pressa nas primeiras repetições.";
  }
  const lista = nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
  const plural = nomes.length > 1;
  return `Seu aquecimento hoje ${plural ? "são os primeiros itens" : "é o primeiro item"} da lista: ${lista}. Comece por ${plural ? "eles" : "ele"}, na ordem em que aparece${plural ? "m" : ""}.`;
}

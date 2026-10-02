// O que custa comer fora, em tempo. Módulo puro — sem I/O, sem Date.
//
// Existe porque a verba discricionária (CONSUMO.discricionariaKcal) estava
// declarada em objetivo.ts desde a frente 1 e NUNCA apareceu numa tela: o
// único lugar do repositório que a tocava era um teste conferindo que ela é
// maior que zero. Alguém decidiu que ela tinha 250 kcal/dia de folga e não
// contou pra ela.
//
// E a verba não é de graça, apesar da palavra "discricionária" sugerir isso.
// O cardápio já ocupa as 2.200 kcal inteiras da meta — os quatro slots somam
// exatamente o kcalDaily do plano, e há teste cobrando isso. Então a verba é
// consumo POR CIMA do plano, e sai direto do déficit. Dizer "você tem 250 kcal
// livres" sem dizer o preço seria a mesma classe de meia-verdade que a frente 1
// existiu pra tirar do app.
//
// O preço se paga em tempo, não em fracasso: gastar a verba não quebra nada,
// atrasa. Este módulo devolve esse atraso em número, para ela decidir com o
// dado na mão em vez de decidir com culpa.

import { CONSUMO, gastoEstimado, type ModoCaminhada } from "./objetivo";

/** Energia de um quilo de gordura corporal. É a constante clássica (~7.700
 *  kcal) e é aproximação: parte do peso que sai em déficit é água e glicogênio,
 *  sobretudo nas primeiras semanas. Serve pra comparar cenários entre si, que é
 *  o uso aqui — não pra prever a balança de uma semana específica. */
export const KCAL_POR_KG_GORDURA = 7700;

/** Déficit da semana com o plano seguido à risca, no modo de caminhada dado.
 *  Com a caminhada pausada ele encolhe ~2.600 kcal na semana, e a verba deixa
 *  de caber nele inteira. */
export function deficitSemanalKcal(modo: ModoCaminhada = "caminhada"): number {
  const [min, max] = gastoEstimado(modo);
  return ((min + max) / 2 - CONSUMO.metaKcal) * 7;
}

/** Déficit do plano seguido à risca, sem tocar na verba (modo caminhada). */
export const DEFICIT_SEMANAL_KCAL = deficitSemanalKcal("caminhada");
export const DEFICIT_DIARIO_KCAL = DEFICIT_SEMANAL_KCAL / 7;

/** A verba de besteira acumulada na semana. Guardar pra uma ocasião só, em vez
 *  de espalhar em sete dias, é o que a torna útil: 250 kcal por dia não compram
 *  nada memorável, e 1.750 de uma vez compram uma noite inteira. */
export const VERBA_SEMANAL_KCAL = CONSUMO.discricionariaKcal * 7;

/** Quanto uma refeição fora custa A MAIS que a refeição do plano que ela
 *  substitui. É a única conta que importa: a pessoa não come o jantar do plano
 *  E o restaurante, ela troca um pelo outro. Um jantar do plano são 650 kcal e
 *  um prato de restaurante fica na faixa de 1.200 a 1.600 — a diferença é isto.
 *  Valor conservador da faixa, porque errar pra cima aqui só deixa a
 *  estimativa mais segura. */
export const CUSTO_MARGINAL_REFEICAO_FORA_KCAL = 800;

export interface RitmoDaSemana {
  /** Quanto do déficit sobrou depois de gastar `kcalGastas`. */
  deficitSemanalKcal: number;
  /** Perda de peso semanal correspondente, em kg. */
  kgPorSemana: number;
  /** Quanto mais lento que o plano à risca, em pontos percentuais inteiros. */
  perdaDeRitmoPct: number;
}

const arredonda2 = (n: number) => Math.round(n * 100) / 100;

/** O ritmo da semana depois de gastar `kcalGastas` acima do plano.
 *  Nunca devolve déficit negativo como "ganho": acima do gasto o resultado é
 *  superávit, e a conta de perda semanal deixa de significar alguma coisa —
 *  por isso o piso em zero, com a perda de ritmo saturando em 100%. */
export function ritmoDaSemana(kcalGastas: number, modo: ModoCaminhada = "caminhada"): RitmoDaSemana {
  const total = deficitSemanalKcal(modo);
  // Local com outro nome pra não sombrear a função de mesmo nome acima.
  const sobra = Math.max(0, total - kcalGastas);
  return {
    deficitSemanalKcal: sobra,
    kgPorSemana: arredonda2(sobra / KCAL_POR_KG_GORDURA),
    perdaDeRitmoPct: Math.round((1 - sobra / total) * 100),
  };
}

/** O mesmo, contado em noites fora em vez de calorias. */
export function ritmoComNoitesFora(noites: number, modo: ModoCaminhada = "caminhada"): RitmoDaSemana {
  return ritmoDaSemana(noites * CUSTO_MARGINAL_REFEICAO_FORA_KCAL, modo);
}

/** Quantas noites fora a verba declarada cobre por semana, inteiras. É o número
 *  que responde "posso comer besteira?" sem rodeio: esta quantidade já estava
 *  orçada no plano desde o começo. */
export const NOITES_QUE_A_VERBA_COBRE = Math.floor(
  VERBA_SEMANAL_KCAL / CUSTO_MARGINAL_REFEICAO_FORA_KCAL,
);

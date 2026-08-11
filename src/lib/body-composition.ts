// src/lib/body-composition.ts

/** Qual das duas réguas Navy descreve o corpo que está sendo medido.
 *
 *  "androide" é a fórmula que a literatura Navy chama de masculina, calibrada
 *  para gordura concentrada no abdome (usa cintura − pescoço). "ginoide" é a
 *  chamada feminina, calibrada para gordura concentrada em quadril e coxa (usa
 *  cintura + quadril − pescoço). */
export type FatDistribution = "androide" | "ginoide";

export interface NavyInput {
  heightCm?: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
  /** Sem default de propósito — ver o comentário de `estimateBodyFatNavy`. */
  distribuicao: FatDistribution;
}

/**
 * %BF estimada por circunferências — US Navy (Hodgdon-Beckett), unidades em cm.
 *
 * androide: 495 / (1.0324 − 0.19077·log10(cintura−pescoço) + 0.15456·log10(altura)) − 450
 * ginoide:  495 / (1.29579 − 0.35004·log10(cintura+quadril−pescoço) + 0.22100·log10(altura)) − 450
 *
 * `distribuicao` é obrigatória e não tem default porque as duas réguas devolvem
 * números muito distantes para o MESMO corpo — com as medidas de partida dela, a
 * diferença passa de 15 pontos percentuais. Um default deixaria essa escolha
 * parecendo detalhe de implementação; ela é a decisão mais consequente do módulo,
 * então quem chama declara qual corpo está medindo.
 *
 * A escolha do app é "androide" (ver DISTRIBUICAO_GORDURA_ATUAL em objetivo.ts).
 * A razão: sem estrogênio a gordura dela fica no abdome — é o que a Silhueta, os
 * marcos e os horizontes afirmam em prosa. Medir um corpo androide com a régua
 * ginoide não devolve um número mais gentil, devolve um número errado para cima,
 * que infla o tamanho aparente do problema, distorce a conta do déficit e faz a
 * fase 1 parecer muito mais longa do que é.
 */
export function estimateBodyFatNavy({
  heightCm,
  neckCm,
  waistCm,
  hipCm,
  distribuicao,
}: NavyInput): number | null {
  if (!heightCm || !neckCm || !waistCm) return null;
  if (heightCm <= 0) return null;

  // O quadril só entra na régua ginoide. Exigi-lo na androide faria a tela ficar
  // sem número por falta de uma medida que a conta nem usa.
  const sum = distribuicao === "ginoide" ? (hipCm ? waistCm + hipCm - neckCm : 0) : waistCm - neckCm;
  if (sum <= 0) return null;

  const pct =
    distribuicao === "ginoide"
      ? 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.221 * Math.log10(heightCm)) - 450
      : 495 / (1.0324 - 0.19077 * Math.log10(sum) + 0.15456 * Math.log10(heightCm)) - 450;

  if (!Number.isFinite(pct)) return null;
  return Math.round(pct * 10) / 10;
}

export type BodyFatBand = "essencial" | "atleta" | "fitness" | "media" | "alta";

/** Faixas femininas (referência ACE). Texto de apoio, não meta dura. */
export function classifyBodyFat(pct: number): BodyFatBand {
  if (pct < 14) return "essencial";
  if (pct < 21) return "atleta";
  if (pct < 25) return "fitness";
  if (pct < 32) return "media";
  return "alta";
}

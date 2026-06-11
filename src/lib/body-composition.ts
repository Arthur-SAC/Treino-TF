// src/lib/body-composition.ts
export interface NavyInput {
  heightCm?: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
}

/**
 * %BF feminino — fórmula US Navy (Hodgdon-Beckett), unidades em cm.
 * %BF = 495 / (1.29579 - 0.35004·log10(waist+hip-neck) + 0.22100·log10(height)) - 450
 */
export function estimateBodyFatNavy({ heightCm, neckCm, waistCm, hipCm }: NavyInput): number | null {
  if (!heightCm || !neckCm || !waistCm || !hipCm) return null;
  if (heightCm <= 0) return null;
  const sum = waistCm + hipCm - neckCm;
  if (sum <= 0) return null;
  const pct = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.221 * Math.log10(heightCm)) - 450;
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

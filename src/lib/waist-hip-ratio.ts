export type WhrCategory =
  | "ampulheta-forte"
  | "ampulheta-moderada"
  | "transicao"
  | "perfil-masculino";

export function calculateWhr(waistCm: number, hipCm: number): number {
  if (hipCm <= 0) return 0;
  return waistCm / hipCm;
}

export function classifyWhr(ratio: number): WhrCategory {
  if (ratio < 0.72) return "ampulheta-forte";
  if (ratio < 0.80) return "ampulheta-moderada";
  if (ratio < 0.90) return "transicao";
  return "perfil-masculino";
}

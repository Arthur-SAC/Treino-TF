import type { GrupoMuscular } from "../../src/lib/volume-muscular";

/** Faixas semanais de séries por grupo (docs/OBJETIVO.md §8.3). Valem para o
 *  topo da fase 1 (variação) e para toda a fase 2 — um lugar só, pra régua da
 *  fase 1 e a da fase 2 nunca divergirem. */
export const FAIXA_VARIACAO: Record<GrupoMuscular, [number, number]> = {
  "gluteo-max": [18, 22], "gluteo-medio": [15, 21], quadriceps: [12, 16], adutor: [6, 6],
  posterior: [6, 8], peito: [9, 12], costas: [9, 12], biceps: [6, 6], triceps: [6, 6],
};

export const FAIXA = FAIXA_VARIACAO;

export function foraDaFaixa(v: Record<GrupoMuscular, number>): string[] {
  return (Object.keys(FAIXA) as GrupoMuscular[])
    .filter((g) => v[g] < FAIXA[g][0] || v[g] > FAIXA[g][1])
    .map((g) => `${g}: ${v[g]} (faixa ${FAIXA[g].join("-")})`);
}

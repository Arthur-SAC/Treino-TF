import { CYCLES, type CycleId } from "../data/cycles-seed";

export interface ProximaParte {
  proximoId: CycleId | null;
  proximoNome: string | null;
  feitos: number;
  threshold: number;
  faltam: number;
  /** 0..1 */
  progresso: number;
}

export function proximaParte(
  activeCycle: CycleId,
  totalSessoes: number,
  cycleStart: number,
): ProximaParte {
  const i = CYCLES.findIndex((c) => c.id === activeCycle);
  const atual = CYCLES[i < 0 ? 0 : i];
  const prox = i >= 0 ? CYCLES[i + 1] : undefined;
  const feitos = Math.max(0, totalSessoes - cycleStart);
  const threshold = atual.threshold;
  return {
    proximoId: prox?.id ?? null,
    proximoNome: prox?.name ?? null,
    feitos,
    threshold,
    faltam: Math.max(0, threshold - feitos),
    progresso: Math.min(1, feitos / threshold),
  };
}

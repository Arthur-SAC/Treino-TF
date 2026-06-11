import type { CycleId } from "../data/cycles-seed";
import type { Trend } from "./measurement-trend";

const NEXT: Record<CycleId, CycleId | null> = {
  adaptacao: "variacao",
  variacao: "hipertrofia",
  hipertrofia: "refinamento",
  refinamento: "manutencao",
  manutencao: null,
};

export interface CycleAdviceInput {
  activeCycle: CycleId;
  sessionsInCycle: number;
  threshold: number;
  whr: number | null;
  targetWhr: number;
  waistTrend: Trend;
  hipTrend: Trend;
  waistGuardTriggered: boolean;
}

export interface CycleAdvice {
  recommend: boolean;
  toCycle: CycleId;
  reason: string;
}

export function recommendCycleChange(i: CycleAdviceInput): CycleAdvice | null {
  const to = NEXT[i.activeCycle];
  if (!to) return null;
  const floorReached = i.sessionsInCycle >= i.threshold;

  if (i.activeCycle === "variacao") {
    const atTarget = i.whr !== null && i.whr <= i.targetWhr;
    const plateau = i.waistTrend.dir === "stable" && i.waistTrend.points >= 2;
    if (floorReached && (atTarget || plateau)) {
      const why = atTarget
        ? `sua cintura atingiu o alvo de WHR (${i.targetWhr.toFixed(2)})`
        : "sua cintura estabilizou — o déficit deu o que tinha pra dar";
      return { recommend: true, toCycle: to, reason: `Hora de crescer o glúteo: ${why}. Bora pra hipertrofia (superávit).` };
    }
    return null;
  }

  if (i.activeCycle === "hipertrofia") {
    if (i.waistGuardTriggered) {
      return { recommend: true, toCycle: to, reason: "A cintura subiu no superávit — hora de refinar e segurar a gordura. Vamos pro refinamento." };
    }
    if (floorReached && i.hipTrend.dir === "stable" && i.hipTrend.points >= 2) {
      return { recommend: true, toCycle: to, reason: "O quadril parou de crescer — hora de refinar a forma. Vamos pro refinamento." };
    }
    return null;
  }

  // adaptacao -> variacao e refinamento -> manutencao: piso de sessões
  if (floorReached) {
    return { recommend: true, toCycle: to, reason: `Você completou ${i.sessionsInCycle} sessões do ciclo. Pronta pro próximo.` };
  }
  return null;
}

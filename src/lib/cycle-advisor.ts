import type { CycleId } from "../data/cycles-seed";
import type { Trend } from "./measurement-trend";

const NEXT: Record<CycleId, CycleId | null> = {
  "entrada-1": "entrada-2",
  "entrada-2": "entrada-3",
  "entrada-3": "adaptacao",
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
  /** Cintura da medição mais recente, ou null sem medição. */
  waistCm: number | null;
  /** Cintura do fim da fase 1 (FASES em objetivo.ts) — é quando a fase 2 começa. */
  cinturaFimFase1: number;
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
    // Antes pedia WHR 0,73 — o alvo do FIM da fase 2 — pra ENTRAR na fase 2:
    // com a cintura caindo sem parar, nunca recomendaria. A fase 2 começa
    // quando a fase 1 termina (2026-09-23).
    const atTarget = i.waistCm !== null && i.waistCm <= i.cinturaFimFase1;
    const plateau = i.waistTrend.dir === "stable" && i.waistTrend.points >= 2;
    if (floorReached && (atTarget || plateau)) {
      const why = atTarget
        ? `sua cintura chegou a ${i.cinturaFimFase1} — fim da fase 1`
        : "sua cintura estabilizou — o déficit deu o que tinha pra dar";
      // Sem prometer superávit: quem decide a meta alimentar é `resolveGoal`,
      // e ele só a libera com a cintura abaixo do limiar.
      return { recommend: true, toCycle: to, reason: `Hora de crescer o glúteo: ${why}. Bora pra hipertrofia — a comida acompanha: sobe pra superávit quando a cintura permitir, e até lá o glúteo cresce em manutenção.` };
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

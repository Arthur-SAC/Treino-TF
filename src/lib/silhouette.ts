// src/lib/silhouette.ts
export type CycleGoal = "deficit" | "manutencao" | "superavit";

const round1 = (n: number) => Math.round(n * 10) / 10;

export function shoulderHipRatio(shouldersCm: number, hipCm: number): number | null {
  if (!shouldersCm || !hipCm || hipCm <= 0) return null;
  return shouldersCm / hipCm;
}

export interface WhrGap {
  waistDeltaCm: number; // cm a tirar da cintura (mantendo quadril)
  hipDeltaCm: number; // cm a somar ao quadril (mantendo cintura)
}

export function whrGap(current: number, target: number, waistCm: number, hipCm: number): WhrGap {
  if (current <= target) return { waistDeltaCm: 0, hipDeltaCm: 0 };
  const waistDeltaCm = Math.max(0, waistCm - target * hipCm);
  const hipDeltaCm = Math.max(0, waistCm / target - hipCm);
  return { waistDeltaCm: round1(waistDeltaCm), hipDeltaCm: round1(hipDeltaCm) };
}

export interface ShoulderHipGap {
  hipDeltaCm: number; // cm a somar ao quadril pra baixar a razão até o alvo
}

export function shoulderHipGap(
  currentRatio: number,
  target: number,
  shouldersCm: number,
  hipCm: number,
): ShoulderHipGap {
  if (currentRatio <= target) return { hipDeltaCm: 0 };
  const hipDeltaCm = Math.max(0, shouldersCm / target - hipCm);
  return { hipDeltaCm: round1(hipDeltaCm) };
}

export interface LeverGuidance {
  focus: "cintura" | "quadril" | "manter";
  why: string;
}

export function leverGuidance(cycleGoal: CycleGoal): LeverGuidance {
  if (cycleGoal === "deficit")
    return {
      focus: "cintura",
      why: "Ciclo em déficit: a alavanca é baixar a cintura (gordura abdominal) com dieta + transverso. Mantenha o volume de glúteo, mas o ganho de silhueta agora vem de afinar.",
    };
  if (cycleGoal === "superavit")
    return {
      focus: "quadril",
      why: "Ciclo em superávit: a alavanca é crescer quadril/glúteo. Vigie a cintura — sem TRH, o superávit também deposita gordura na barriga.",
    };
  return {
    focus: "manter",
    why: "Ciclo de manutenção: segure a forma e meça. Nenhuma alavanca forte agora.",
  };
}

export interface WaistGuardInput {
  cycleGoal: CycleGoal;
  waistStartCm: number;
  waistNowCm: number;
}

export interface WaistGuard {
  triggered: boolean;
  deltaCm: number;
}

const WAIST_GUARD_THRESHOLD_CM = 1.5;

export function waistGuard({ cycleGoal, waistStartCm, waistNowCm }: WaistGuardInput): WaistGuard {
  const deltaCm = round1(waistNowCm - waistStartCm);
  const triggered = cycleGoal === "superavit" && deltaCm >= WAIST_GUARD_THRESHOLD_CM;
  return { triggered, deltaCm };
}

export type SessionFeedback = "easy" | "medium" | "hard";

export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  completedAllReps: boolean;
  category?: string;
}

const HOLD_LIGHT_CATEGORIES = new Set(["peitoral", "postura", "costas"]);

export function isHoldLight(category: string): boolean {
  return HOLD_LIGHT_CATEGORIES.has(category);
}

export function suggestNextLoad({ lastLoad, feedback, completedAllReps, category }: ProgressionInput): number {
  if (category && isHoldLight(category)) {
    // manter leve: nunca sobe; só recua se não completou as reps
    return completedAllReps ? lastLoad : Math.max(0, lastLoad - 1);
  }
  if (!completedAllReps) {
    return Math.max(0, lastLoad - 1);
  }
  if (feedback === "easy") {
    if (lastLoad < 5) return lastLoad + 0.5;
    if (lastLoad < 20) return lastLoad + 2;
    return lastLoad + 2.5;
  }
  if (feedback === "medium") {
    return lastLoad + 1;
  }
  return lastLoad; // hard
}

const MAX_HOLD_SEC = 60;

/** Progressão por tempo de isometria (ex.: vacuum/transverso). */
export function suggestNextHoldTime(lastSec: number, feedback: SessionFeedback): number {
  if (feedback === "easy") return Math.min(MAX_HOLD_SEC, lastSec + 5);
  if (feedback === "medium") return Math.min(MAX_HOLD_SEC, lastSec + 2);
  return lastSec; // hard → mantém
}

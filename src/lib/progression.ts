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

/** Exercício medido por TEMPO (cardio, aquecimento, isometria) — sem reps nem
 *  carga. Detecta pelo alvo de repetições do template ("5-7min", "30-45s"). */
export function isTimeBased(repsTarget: string): boolean {
  const t = repsTarget.toLowerCase();
  return /min/.test(t) || /\d\s*s\b/.test(t);
}

export interface LastPerformance {
  date: string;
  sets: Array<{ reps: number; weight: number }>;
  feedback: SessionFeedback;
}

/** Acha a última vez que o exercício foi registrado (com séries). Espera a lista
 *  de sessões já ordenada da mais recente pra mais antiga. */
export function findLastPerformance(
  sessions: Array<{
    date: string;
    difficultySelf?: SessionFeedback;
    exercises: Array<{ exerciseId: string; sets: Array<{ reps: number; weight: number }> }>;
  }>,
  exerciseId: string,
): LastPerformance | null {
  for (const s of sessions) {
    const found = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (found && found.sets.length > 0) {
      return {
        date: s.date,
        sets: found.sets.map((x) => ({ reps: x.reps, weight: x.weight })),
        feedback: s.difficultySelf ?? "medium",
      };
    }
  }
  return null;
}

const MAX_HOLD_SEC = 60;

/** Progressão por tempo de isometria (ex.: vacuum/transverso). */
export function suggestNextHoldTime(lastSec: number, feedback: SessionFeedback): number {
  if (feedback === "easy") return Math.min(MAX_HOLD_SEC, lastSec + 5);
  if (feedback === "medium") return Math.min(MAX_HOLD_SEC, lastSec + 2);
  return lastSec; // hard → mantém
}

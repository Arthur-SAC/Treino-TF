export type SessionFeedback = "easy" | "medium" | "hard";

export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  completedAllReps: boolean;
}

export function suggestNextLoad({ lastLoad, feedback, completedAllReps }: ProgressionInput): number {
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

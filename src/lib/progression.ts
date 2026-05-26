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
    const increment = lastLoad < 5 ? 0.5 : 1;
    return lastLoad + increment;
  }
  return lastLoad;
}

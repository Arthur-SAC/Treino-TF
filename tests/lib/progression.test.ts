import { describe, it, expect } from "vitest";
import { suggestNextLoad } from "../../src/lib/progression";
import type { SessionFeedback } from "../../src/lib/progression";

describe("suggestNextLoad", () => {
  it("sobe 1kg quando fácil e completou", () => {
    const feedback: SessionFeedback = "easy";
    const next = suggestNextLoad({ lastLoad: 10, feedback, completedAllReps: true });
    expect(next).toBe(11);
  });

  it("sobe 0.5kg quando fácil e completou com carga baixa (<5kg)", () => {
    const next = suggestNextLoad({ lastLoad: 4, feedback: "easy", completedAllReps: true });
    expect(next).toBe(4.5);
  });

  it("mantém quando médio e completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "medium", completedAllReps: true });
    expect(next).toBe(10);
  });

  it("mantém quando difícil e completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: true });
    expect(next).toBe(10);
  });

  it("desce 1kg quando não completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false });
    expect(next).toBe(9);
  });

  it("nunca desce abaixo de 0", () => {
    const next = suggestNextLoad({ lastLoad: 0.5, feedback: "hard", completedAllReps: false });
    expect(next).toBe(0);
  });

  it("aceita feedback 'easy' mesmo sem completar e não sobe (regra de segurança)", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: false });
    expect(next).toBe(9);
  });
});

import { describe, it, expect } from "vitest";
import { suggestNextLoad, suggestNextHoldTime, isHoldLight } from "../../src/lib/progression";

describe("suggestNextLoad", () => {
  it("fácil + carga <5kg → +0,5", () => {
    expect(suggestNextLoad({ lastLoad: 4, feedback: "easy", completedAllReps: true })).toBe(4.5);
  });
  it("fácil + carga 5–20 → +2", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true })).toBe(12);
  });
  it("fácil + carga >=20 → +2,5", () => {
    expect(suggestNextLoad({ lastLoad: 20, feedback: "easy", completedAllReps: true })).toBe(22.5);
  });
  it("médio + completou → +1 (mantém momentum)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "medium", completedAllReps: true })).toBe(11);
  });
  it("difícil + completou → mantém", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: true })).toBe(10);
  });
  it("não completou → -1 (piso 0)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false })).toBe(9);
    expect(suggestNextLoad({ lastLoad: 0.5, feedback: "hard", completedAllReps: false })).toBe(0);
  });
  it("não completou tem prioridade sobre 'easy'", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: false })).toBe(9);
  });
});

describe("suggestNextHoldTime", () => {
  it("sobe 5s no easy", () => {
    expect(suggestNextHoldTime(30, "easy")).toBe(35);
  });
  it("respeita o teto de 60s", () => {
    expect(suggestNextHoldTime(58, "easy")).toBe(60);
  });
  it("sobe 2s no medium", () => {
    expect(suggestNextHoldTime(40, "medium")).toBe(42);
  });
  it("mantém no hard", () => {
    expect(suggestNextHoldTime(40, "hard")).toBe(40);
  });
});

describe("progressão consciente da categoria", () => {
  it("isHoldLight marca peitoral/postura/costas", () => {
    expect(isHoldLight("peitoral")).toBe(true);
    expect(isHoldLight("postura")).toBe(true);
    expect(isHoldLight("costas")).toBe(true);
    expect(isHoldLight("gluteo")).toBe(false);
  });
  it("hold-light não sobe carga mesmo no easy", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "peitoral" })).toBe(10);
  });
  it("hold-light recua se não completou as reps", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false, category: "postura" })).toBe(9);
  });
  it("gluteo segue a lógica normal", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "gluteo" })).toBe(12);
  });
  it("sem categoria segue a lógica normal (retrocompat)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true })).toBe(12);
  });
});

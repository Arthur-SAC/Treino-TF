import { describe, it, expect } from "vitest";
import { suggestNextLoad, suggestNextHoldTime, isHoldLight, isTimeBased, findLastPerformance } from "../../src/lib/progression";

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

describe("isTimeBased", () => {
  it("detecta exercícios por tempo (minutos/segundos)", () => {
    expect(isTimeBased("5-7min")).toBe(true);
    expect(isTimeBased("5min")).toBe(true);
    expect(isTimeBased("1min cada")).toBe(true);
    expect(isTimeBased("30-45s")).toBe(true);
    expect(isTimeBased("2min")).toBe(true);
  });
  it("não marca exercícios de repetição", () => {
    expect(isTimeBased("12")).toBe(false);
    expect(isTimeBased("10 cada")).toBe(false);
    expect(isTimeBased("15 (LEVE)")).toBe(false);
    expect(isTimeBased("15-20")).toBe(false);
    expect(isTimeBased("8 + pausa")).toBe(false);
  });
});

describe("findLastPerformance", () => {
  const sessions = [
    { date: "2026-06-18", difficultySelf: "medium" as const, exercises: [{ exerciseId: "hip-thrust", sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }] }] },
    { date: "2026-06-11", difficultySelf: "easy" as const, exercises: [{ exerciseId: "hip-thrust", sets: [{ reps: 10, weight: 35 }] }] },
    { date: "2026-06-10", difficultySelf: "hard" as const, exercises: [{ exerciseId: "agacha", sets: [{ reps: 8, weight: 0 }] }] },
  ];
  it("retorna a sessão mais recente com o exercício (lista já vem ordenada desc)", () => {
    const r = findLastPerformance(sessions, "hip-thrust");
    expect(r?.date).toBe("2026-06-18");
    expect(r?.sets).toEqual([{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }]);
    expect(r?.feedback).toBe("medium");
  });
  it("ignora sessões sem o exercício ou com sets vazios", () => {
    const withEmpty = [{ date: "2026-06-19", exercises: [{ exerciseId: "hip-thrust", sets: [] }] }, ...sessions];
    expect(findLastPerformance(withEmpty, "hip-thrust")?.date).toBe("2026-06-18");
  });
  it("retorna null se nunca foi feito", () => {
    expect(findLastPerformance(sessions, "inexistente")).toBeNull();
  });
});

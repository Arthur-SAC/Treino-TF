import { describe, it, expect } from "vitest";
import { suggestNextLoad, suggestNextHoldTime, isHoldLight, isTimeBased, findLastPerformance, avaliarSeries, incrementoDoEquipamento } from "../../src/lib/progression";

// Regras de 2026-09-23 (auditoria): o incremento é o do equipamento, "médio"
// só sobe quando todas as séries bateram o topo da faixa, e completar é bater o
// MÍNIMO da faixa em toda série (antes, qualquer rep > 0 contava).
describe("suggestNextLoad", () => {
  const base = { feedback: "medium" as const, completedAllReps: true, hitTopOfRange: false, equipment: ["halteres"] };
  it("fácil → sobe um incremento do equipamento (halter +2)", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 10, feedback: "easy" })).toBe(12);
  });
  it("máquina e leg press sobem uma placa (+5)", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 40, feedback: "easy", equipment: ["leg-press"] })).toBe(45);
    expect(suggestNextLoad({ ...base, lastLoad: 20, feedback: "easy", equipment: ["multiestacao"] })).toBe(25);
  });
  it("caneleira sobe 1", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 2, feedback: "easy", equipment: ["caneleira"] })).toBe(3);
  });
  it("médio só sobe se bateu o topo da faixa em toda série", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 10 })).toBe(10);
    expect(suggestNextLoad({ ...base, lastLoad: 10, hitTopOfRange: true })).toBe(12);
  });
  it("difícil mantém", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 10, feedback: "hard", hitTopOfRange: true })).toBe(10);
  });
  it("não completou desce um incremento (piso 0), mesmo com 'fácil'", () => {
    expect(suggestNextLoad({ ...base, lastLoad: 10, feedback: "easy", completedAllReps: false })).toBe(8);
    expect(suggestNextLoad({ ...base, lastLoad: 1, completedAllReps: false })).toBe(0);
  });
  it("peito e costas progridem — só a postura fica leve", () => {
    expect(isHoldLight("peitoral")).toBe(false);
    expect(isHoldLight("costas")).toBe(false);
    expect(isHoldLight("postura")).toBe(true);
    expect(suggestNextLoad({ ...base, lastLoad: 6, feedback: "easy", category: "postura" })).toBe(6);
  });
});

describe("carga zero e peso corporal (revisão da auditoria)", () => {
  it("peso corporal não tem passo de carga", () => {
    expect(incrementoDoEquipamento(["peso-corporal"])).toBe(0);
    expect(incrementoDoEquipamento(["colchonete"])).toBe(0);
    expect(incrementoDoEquipamento(["nenhum"])).toBe(0);
  });
  it("saindo do 'sem peso', a sugestão é a carga inicial do exercício, não +2", () => {
    expect(suggestNextLoad({ lastLoad: 0, feedback: "easy", completedAllReps: true, equipment: ["barra", "anilhas", "banco"], startLoadKg: 20 })).toBe(20);
  });
});

describe("avaliarSeries", () => {
  it("completou = toda série no mínimo da faixa; topo = toda série no máximo", () => {
    expect(avaliarSeries([{ reps: 12 }, { reps: 10 }], "10-12")).toEqual({ completou: true, topo: false });
    expect(avaliarSeries([{ reps: 12 }, { reps: 12 }], "10-12")).toEqual({ completou: true, topo: true });
    expect(avaliarSeries([{ reps: 12 }, { reps: 8 }], "10-12")).toEqual({ completou: false, topo: false });
  });
  it("entende '12 (LEVE)', '15 cada' e faixa sem número", () => {
    expect(avaliarSeries([{ reps: 12 }], "12 (LEVE)").topo).toBe(true);
    expect(avaliarSeries([{ reps: 15 }], "15 cada").completou).toBe(true);
    expect(avaliarSeries([{ reps: 3 }], "até a falha").completou).toBe(true);
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
  // Desde 2026-09-23 só a postura é hold-light (peito e costas progridem).
  it("isHoldLight marca só a postura", () => {
    expect(isHoldLight("postura")).toBe(true);
    expect(isHoldLight("peitoral")).toBe(false);
    expect(isHoldLight("gluteo")).toBe(false);
  });
  it("hold-light não sobe carga mesmo no easy", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "postura" })).toBe(10);
  });
  it("hold-light recua um incremento se não completou as reps", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false, category: "postura" })).toBe(8);
  });
  it("gluteo segue a lógica normal", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "gluteo" })).toBe(12);
  });
  it("sem categoria segue a lógica normal (retrocompat)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true })).toBe(12);
  });
});

describe("isTimeBased", () => {
  // Revisão da auditoria: carregamento é o exercício de "levantar a noiva" —
  // precisa registrar carga. Metros NÃO são "por tempo".
  it("carregamento em metros registra carga (não é 'por tempo')", () => {
    expect(isTimeBased("30m")).toBe(false);
    expect(isTimeBased("20-30m")).toBe(false);
  });
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

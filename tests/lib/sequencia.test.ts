import { describe, it, expect } from "vitest";
import { estadoSequencia, deveMostrarQueda } from "../../src/lib/sequencia";

const d = (n: number) => `2026-11-${String(n).padStart(2, "0")}`;
const ds = (...n: number[]) => n.map(d);

describe("estadoSequencia", () => {
  it("desde vazio dá tudo zero", () => {
    expect(estadoSequencia(ds(9, 10), "", d(11))).toEqual({ atual: 0, quebra: null, anterior: 0, diasPerdidos: 0 });
  });
  it("3 dias seguidos", () => {
    expect(estadoSequencia(ds(9, 10, 11), d(9), d(11)).atual).toBe(3);
  });
  it("hoje sem treino é pendente", () => {
    const e = estadoSequencia(ds(9, 10, 11), d(9), d(12));
    expect(e.atual).toBe(3);
    expect(e.quebra).toBeNull();
  });
  it("fim de semana não quebra", () => {
    const e = estadoSequencia(ds(9, 10, 11, 12, 13), d(9), d(16));
    expect(e.atual).toBe(5);
    expect(e.quebra).toBeNull();
  });
  it("sábado não conta", () => {
    expect(estadoSequencia(ds(9, 10, 11, 12, 13, 14), d(9), d(16)).atual).toBe(5);
  });
  it("dia perdido quebra", () => {
    expect(estadoSequencia(ds(9, 10, 11), d(9), d(13))).toEqual({ atual: 0, quebra: d(12), anterior: 3, diasPerdidos: 1 });
  });
  it("volta a treinar depois da quebra", () => {
    const e = estadoSequencia(ds(9, 10, 11, 13), d(9), d(13));
    expect(e.atual).toBe(1);
    expect(e.quebra).toBe(d(12));
    expect(e.anterior).toBe(3);
  });
  it("dois dias perdidos", () => {
    const e = estadoSequencia(ds(9, 10, 11), d(9), d(16));
    expect(e.diasPerdidos).toBe(2);
    expect(e.quebra).toBe(d(12));
  });
  it("antes do marco não conta e não quebra", () => {
    expect(estadoSequencia(["2026-11-02", "2026-11-03", d(9)], d(9), d(9)).atual).toBe(1);
  });
  it("datas repetidas contam uma vez", () => {
    expect(estadoSequencia(ds(9, 9, 9), d(9), d(9)).atual).toBe(1);
  });
});

describe("deveMostrarQueda", () => {
  const e = { atual: 0, quebra: "2026-11-12", anterior: 3, diasPerdidos: 1 };
  it("mostra quando não vista", () => expect(deveMostrarQueda(e, "")).toBe(true));
  it("não mostra se já vista", () => expect(deveMostrarQueda(e, "2026-11-12")).toBe(false));
  it("não mostra com anterior 0", () => expect(deveMostrarQueda({ ...e, anterior: 0 }, "")).toBe(false));
  it("não mostra sem quebra", () => expect(deveMostrarQueda({ ...e, quebra: null }, "")).toBe(false));
});

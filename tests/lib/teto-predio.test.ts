import { describe, it, expect } from "vitest";
import { noTeto, progressoTeto, taticasNoTeto, ehUnilateral, EXERCICIOS_CHAVE } from "../../src/lib/teto-predio";
import { DEFAULTS } from "../../src/lib/settings-helpers";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("teto do prédio", () => {
  it("só está no teto quando há teto e a sugestão passa dele", () => {
    expect(noTeto(30, undefined)).toBe(false);
    expect(noTeto(30, 30)).toBe(false);
    expect(noTeto(32, 30)).toBe(true);
  });

  it("progresso conta só os exercícios-chave", () => {
    expect(progressoTeto({ "rosca-martelo": 12 })).toEqual({ noTeto: 0, total: 4, todos: false });
    const todos = Object.fromEntries(EXERCICIOS_CHAVE.map((id) => [id, 40]));
    expect(progressoTeto(todos)).toEqual({ noTeto: 4, total: 4, todos: true });
  });

  it("os exercícios-chave existem no catálogo", () => {
    for (const id of EXERCICIOS_CHAVE) expect(EXERCISES.some((e) => e.id === id)).toBe(true);
  });

  it("táticas: as três sempre; a unilateral só pra exercício bilateral", () => {
    expect(taticasNoTeto("10-12")).toHaveLength(4);
    expect(taticasNoTeto("10-12 cada")).toHaveLength(3);
    expect(taticasNoTeto("10-12").join(" ")).toMatch(/2 s/);
  });

  it("abdutora: uma perna só não existe na máquina, então só as três táticas", () => {
    expect(taticasNoTeto("15-20", "abdutor-maquina")).toHaveLength(3);
    expect(taticasNoTeto("10-12", "hip-thrust-barra")).toHaveLength(4);
  });

  it("unilateral = 'cada', menos as trocas da prancha", () => {
    expect(ehUnilateral("12 cada")).toBe(true);
    expect(ehUnilateral("10-12 cada")).toBe(true);
    expect(ehUnilateral("6 trocas cada lado")).toBe(false);
    expect(ehUnilateral("10-12")).toBe(false);
  });

  it("padrões: sem teto e sem lado", () => {
    expect(DEFAULTS.tetoPredio).toEqual({});
    expect(DEFAULTS.ladoFraco).toBe("");
  });
});

// Decisão dela (2026-10-02): mesmo com o teto batido, a troca de academia só
// vem na fase 2 — cintura em 84 ou menos. Antes disso, táticas no prédio.
import { horaDaSmartfit, CINTURA_PRA_SMARTFIT } from "../../src/lib/teto-predio";

describe("hora da Smartfit", () => {
  const todos = Object.fromEntries(EXERCICIOS_CHAVE.map((id) => [id, 40]));
  it("os quatro no teto e a cintura na fase 2 → sim", () => {
    expect(horaDaSmartfit(todos, CINTURA_PRA_SMARTFIT)).toBe(true);
    expect(horaDaSmartfit(todos, CINTURA_PRA_SMARTFIT - 1)).toBe(true);
  });
  it("teto batido com a cintura acima de 84 → ainda não", () => {
    expect(horaDaSmartfit(todos, CINTURA_PRA_SMARTFIT + 0.5)).toBe(false);
  });
  it("sem medida de cintura → ainda não", () => {
    expect(horaDaSmartfit(todos, undefined)).toBe(false);
  });
  it("cintura boa mas falta teto → não", () => {
    expect(horaDaSmartfit({ "hip-thrust-barra": 40 }, 80)).toBe(false);
  });
  it("a cintura vem do objetivo (fim da fase 1)", () => {
    expect(CINTURA_PRA_SMARTFIT).toBe(84);
  });
});

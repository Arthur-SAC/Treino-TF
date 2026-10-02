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

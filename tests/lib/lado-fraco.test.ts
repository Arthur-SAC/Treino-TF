import { describe, it, expect } from "vitest";
import { ehUnilateral, temSerieExtraDoLadoFraco, pedeEmpurrarIgual } from "../../src/lib/lado-fraco";
import { EXERCISES } from "../../src/data/exercises-seed";
import { DEFAULTS } from "../../src/lib/settings-helpers";

describe("lado fraco", () => {
  it("unilateral = 'cada', menos as trocas da prancha", () => {
    expect(ehUnilateral("12 cada")).toBe(true);
    expect(ehUnilateral("10-12 cada")).toBe(true);
    expect(ehUnilateral("6 trocas cada lado")).toBe(false);
    expect(ehUnilateral("10-12")).toBe(false);
  });

  it("série extra só nos isolados de glúteo de um lado", () => {
    expect(temSerieExtraDoLadoFraco("coice-gluteo-polia", "12 cada")).toBe(true);
    expect(temSerieExtraDoLadoFraco("abducao-quadril-polia", "15 cada")).toBe(true);
    expect(temSerieExtraDoLadoFraco("agachamento-bulgaro", "10 cada")).toBe(false);
    expect(temSerieExtraDoLadoFraco("abdutor-maquina", "15-20")).toBe(false);
  });

  it("empurrar igual só no glúteo com as duas pernas", () => {
    expect(pedeEmpurrarIgual("hip-thrust-maquina", "10-12")).toBe(true);
    expect(pedeEmpurrarIgual("smith-squat", "10-12")).toBe(true);
    expect(pedeEmpurrarIgual("hip-thrust-unilateral", "10 cada")).toBe(false);
    expect(pedeEmpurrarIgual("supino-inclinado-maquina", "10-12")).toBe(false);
  });

  it("todo id das listas existe no catálogo", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const id of ["coice-gluteo-polia", "kickback", "kickback-cabo", "coice-maquina",
      "abducao-quadril-polia", "abdutor-band-em-pe", "abdutor-cabo-em-pe", "abdutor-deitada",
      "clamshell", "hip-thrust-maquina", "hip-thrust-barra", "smith-squat"]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("padrão: sem lado", () => {
    expect(DEFAULTS.ladoFraco).toBe("");
  });
});

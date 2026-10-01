import { describe, it, expect } from "vitest";
import { deficitSemanalKcal, ritmoComNoitesFora, DEFICIT_SEMANAL_KCAL } from "../../src/lib/comer-fora";
import { comerForaDoModo, COMER_FORA } from "../../src/data/comer-fora-seed";

describe("comer fora pelo modo das caminhadas", () => {
  it("sem modo, a conta é a de antes", () => {
    expect(deficitSemanalKcal()).toBe(DEFICIT_SEMANAL_KCAL);
    expect(COMER_FORA).toEqual(comerForaDoModo("caminhada"));
  });

  it("pausada encolhe o déficit e três noites fora zeram a perda", () => {
    expect(deficitSemanalKcal("pausada")).toBeLessThan(deficitSemanalKcal("caminhada"));
    expect(ritmoComNoitesFora(3, "pausada").kgPorSemana).toBe(0);
  });

  it("em pausada a tela não promete emagrecer em todos os cenários e diz o porquê", () => {
    const texto = JSON.stringify(comerForaDoModo("pausada"));
    expect(texto).not.toMatch(/continua emagrecendo em todos os cenários/);
    expect(texto).toMatch(/caminhada pausada/i);
    // A verba inteira passa do déficit: "100% mais devagar" seria jeito torto
    // de dizer que a perda zerou.
    expect(texto).not.toMatch(/100% mais devagar/);
    expect(texto).toMatch(/Três noites: zera a perda da semana/);
  });

  it("com caminhada, a frase original continua", () => {
    expect(JSON.stringify(comerForaDoModo("caminhada"))).toMatch(/continua emagrecendo em todos os cenários/);
  });
});

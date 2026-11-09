import { describe, it, expect } from "vitest";
import { contraste, PALETA } from "../../src/lib/contraste";

describe("paleta A: contraste", () => {
  it("razão WCAG: branco x preto ≈ 21", () => {
    expect(contraste("#ffffff", "#000000")).toBeCloseTo(21, 0);
  });
  it("texto no fundo >= 4.5", () => {
    expect(contraste(PALETA.texto, PALETA.fundo)).toBeGreaterThanOrEqual(4.5);
  });
  it("texto2 no fundo >= 4.5", () => {
    expect(contraste(PALETA.texto2, PALETA.fundo)).toBeGreaterThanOrEqual(4.5);
  });
  it("verm2 no fundo >= 4.5", () => {
    expect(contraste(PALETA.verm2, PALETA.fundo)).toBeGreaterThanOrEqual(4.5);
  });
  it("vital no card >= 4.5", () => {
    expect(contraste(PALETA.vital, PALETA.card)).toBeGreaterThanOrEqual(4.5);
  });
  it("branco sobre verm2 (card do treino) >= 4.5", () => {
    expect(contraste("#ffffff", PALETA.verm2)).toBeGreaterThanOrEqual(4.5);
  });
  it("branco sobre feito (ícone) >= 3", () => {
    expect(contraste("#ffffff", PALETA.feito)).toBeGreaterThanOrEqual(3);
  });
  it("branco sobre verm (T do ícone, glifo grande) >= 3", () => {
    expect(contraste("#ffffff", PALETA.verm)).toBeGreaterThanOrEqual(3);
  });
});

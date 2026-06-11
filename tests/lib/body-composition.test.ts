// tests/lib/body-composition.test.ts
import { describe, it, expect } from "vitest";
import { estimateBodyFatNavy, classifyBodyFat } from "../../src/lib/body-composition";

describe("estimateBodyFatNavy", () => {
  it("estima %BF feminino (Hodgdon-Beckett métrico)", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 165, neckCm: 33, waistCm: 70, hipCm: 100 }),
    ).toBe(26.9);
  });

  it("retorna null se faltar alguma medida", () => {
    expect(estimateBodyFatNavy({ heightCm: 165, waistCm: 70, hipCm: 100 })).toBeNull();
    expect(estimateBodyFatNavy({ heightCm: 0, neckCm: 33, waistCm: 70, hipCm: 100 })).toBeNull();
  });

  it("retorna null se waist+hip-neck <= 0", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 165, neckCm: 200, waistCm: 70, hipCm: 100 }),
    ).toBeNull();
  });
});

describe("classifyBodyFat", () => {
  it.each<[number, string]>([
    [12, "essencial"],
    [18, "atleta"],
    [23, "fitness"],
    [28, "media"],
    [35, "alta"],
  ])("classifica %f como %s", (pct, band) => {
    expect(classifyBodyFat(pct)).toBe(band);
  });
});

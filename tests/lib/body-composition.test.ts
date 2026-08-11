// tests/lib/body-composition.test.ts
import { describe, it, expect } from "vitest";
import { estimateBodyFatNavy, classifyBodyFat } from "../../src/lib/body-composition";
import { DISTRIBUICAO_GORDURA_ATUAL, MEDIDAS_PARTIDA } from "../../src/lib/objetivo";
import { BODY_GOAL_MILESTONES } from "../../src/data/milestones-seed";
import { HORIZONTES } from "../../src/data/horizontes-seed";

const PARTIDA = {
  heightCm: Math.round(MEDIDAS_PARTIDA.alturaM * 100),
  neckCm: MEDIDAS_PARTIDA.pescocoCm,
  waistCm: MEDIDAS_PARTIDA.cinturaCm,
  hipCm: MEDIDAS_PARTIDA.quadrilCm,
};

describe("estimateBodyFatNavy", () => {
  it("estima %BF pela régua ginoide (Hodgdon-Beckett métrico, com quadril)", () => {
    expect(
      estimateBodyFatNavy({
        heightCm: 165,
        neckCm: 33,
        waistCm: 70,
        hipCm: 100,
        distribuicao: "ginoide",
      }),
    ).toBe(26.9);
  });

  it("estima %BF pela régua androide (cintura − pescoço, sem quadril)", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 173, neckCm: 40, waistCm: 99, distribuicao: "androide" }),
    ).toBe(25.7);
  });

  it("as duas réguas divergem em mais de 15 pontos no mesmo corpo — por isso a escolha é explícita", () => {
    const androide = estimateBodyFatNavy({ ...PARTIDA, distribuicao: "androide" })!;
    const ginoide = estimateBodyFatNavy({ ...PARTIDA, distribuicao: "ginoide" })!;
    expect(ginoide - androide).toBeGreaterThan(15);
  });

  it("a régua androide não precisa do quadril, que ela nem usa na conta", () => {
    const comQuadril = estimateBodyFatNavy({ ...PARTIDA, distribuicao: "androide" });
    const semQuadril = estimateBodyFatNavy({
      heightCm: PARTIDA.heightCm,
      neckCm: PARTIDA.neckCm,
      waistCm: PARTIDA.waistCm,
      distribuicao: "androide",
    });
    expect(semQuadril).toBe(comQuadril);
  });

  it("a régua ginoide sem quadril não tem como responder", () => {
    expect(
      estimateBodyFatNavy({
        heightCm: 165,
        neckCm: 33,
        waistCm: 70,
        distribuicao: "ginoide",
      }),
    ).toBeNull();
  });

  it("retorna null se faltar alguma medida", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 165, waistCm: 70, hipCm: 100, distribuicao: "ginoide" }),
    ).toBeNull();
    expect(
      estimateBodyFatNavy({
        heightCm: 0,
        neckCm: 33,
        waistCm: 70,
        hipCm: 100,
        distribuicao: "ginoide",
      }),
    ).toBeNull();
  });

  it("retorna null se a soma de circunferências <= 0", () => {
    expect(
      estimateBodyFatNavy({
        heightCm: 165,
        neckCm: 200,
        waistCm: 70,
        hipCm: 100,
        distribuicao: "ginoide",
      }),
    ).toBeNull();
    expect(
      estimateBodyFatNavy({ heightCm: 165, neckCm: 200, waistCm: 70, distribuicao: "androide" }),
    ).toBeNull();
  });
});

// Regra herdada de objetivo.ts: quando a prosa cita uma FAIXA em cima de um
// número calculado, um teste amarra os dois — senão texto e dado derivam em
// silêncio, que foi exatamente como os "~28%" sobreviveram por três meses.
describe("a %BF citada nos textos contém a %BF que o app calcula", () => {
  const FAIXA = [25, 30];

  it("a estimativa das medidas de partida cai dentro de 25-30%", () => {
    const pct = estimateBodyFatNavy({ ...PARTIDA, distribuicao: DISTRIBUICAO_GORDURA_ATUAL })!;
    expect(pct).toBeGreaterThanOrEqual(FAIXA[0]);
    expect(pct).toBeLessThanOrEqual(FAIXA[1]);
  });

  it("marcos e horizontes citam a faixa, não o ponto solto de antes", () => {
    const marcos = JSON.stringify(BODY_GOAL_MILESTONES);
    const horizontes = JSON.stringify(HORIZONTES);
    expect(marcos).toContain("25-30%");
    expect(horizontes).toContain("25-30%");
    expect(marcos).not.toContain("28%");
    expect(horizontes).not.toContain("28% de gordura");
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

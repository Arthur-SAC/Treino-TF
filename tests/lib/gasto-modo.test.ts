import { describe, it, expect } from "vitest";
import { CONSUMO, KCAL_CAMINHADA_DIA, gastoEstimado } from "../../src/lib/objetivo";
import { projetar } from "../../src/lib/partida";
import { DEFAULTS } from "../../src/lib/settings-helpers";

const P = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };

describe("gasto pelo modo das caminhadas", () => {
  it("caminhada e esteira gastam o mesmo; pausada perde a caminhada nas duas pontas", () => {
    const base: [number, number] = [CONSUMO.gastoEstimadoKcalMin, CONSUMO.gastoEstimadoKcalMax];
    expect(gastoEstimado("caminhada")).toEqual(base);
    expect(gastoEstimado("esteira")).toEqual(base);
    expect(gastoEstimado("pausada")).toEqual([base[0] - KCAL_CAMINHADA_DIA, base[1] - KCAL_CAMINHADA_DIA]);
  });

  it("a projeção em pausada é mais lenta e termina depois", () => {
    const andando = projetar(P, 173, "caminhada")!;
    const parada = projetar(P, 173, "pausada")!;
    expect(parada.ritmoKgSemana[0]).toBeLessThan(andando.ritmoKgSemana[0]);
    expect(parada.ritmoKgSemana[1]).toBeLessThan(andando.ritmoKgSemana[1]);
    expect(parada.fimFase1[1] > andando.fimFase1[1]).toBe(true);
  });

  it("sem modo, a projeção continua a de antes (caminhada)", () => {
    expect(projetar(P, 173)).toEqual(projetar(P, 173, "caminhada"));
  });

  it("o padrão do setting é caminhada — quem nunca mexeu continua igual", () => {
    expect(DEFAULTS.modoCaminhada).toBe("caminhada");
  });
});

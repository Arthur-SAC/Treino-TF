import { describe, it, expect } from "vitest";
import {
  MEDIDAS_PARTIDA, FASES, CONSUMO, MARCOS_CINTURA, CINTURA_PISO_CM,
  razaoCinturaQuadril, razaoOmbroQuadril, PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2,
  RECOMECO_DATA, PCT_GORDURA_FIM_FASE1,
} from "../../src/lib/objetivo";

describe("derivadas das medidas de partida", () => {
  it("cintura÷quadril de partida é 0,87", () => {
    expect(razaoCinturaQuadril(MEDIDAS_PARTIDA.cinturaCm, MEDIDAS_PARTIDA.quadrilCm)).toBe(0.87);
  });

  it("ombro÷quadril é 1,06 — já é faixa feminina, o ombro nunca foi o gargalo", () => {
    expect(razaoOmbroQuadril(MEDIDAS_PARTIDA.ombrosCm, MEDIDAS_PARTIDA.quadrilCm)).toBe(1.06);
  });
});

describe("fases", () => {
  const fase1 = FASES.find((f) => f.id === "fase-1")!;
  const fase2 = FASES.find((f) => f.id === "fase-2")!;

  it("a fase 1 seca: cintura e peso caem em relação à partida", () => {
    expect(fase1.cinturaCm).toBeLessThan(MEDIDAS_PARTIDA.cinturaCm);
    expect(fase1.pesoKgMax).toBeLessThan(MEDIDAS_PARTIDA.pesoKg);
  });

  it("na fase 2 a balança SOBE de propósito", () => {
    expect(fase2.pesoKgMin).toBeGreaterThan(fase1.pesoKgMax);
  });

  it("o quadril termina no mesmo número da partida, feito de músculo", () => {
    expect(fase2.quadrilCm).toBe(MEDIDAS_PARTIDA.quadrilCm);
  });

  it("o piso de cintura respeita a caixa torácica — nunca abaixo de 80", () => {
    for (const f of FASES) expect(f.cinturaCm).toBeGreaterThanOrEqual(CINTURA_PISO_CM);
  });

  it("a razão melhora fase a fase", () => {
    expect(fase2.whrProvavel).toBeLessThan(fase1.whrProvavel);
  });

  it("a fase 2 declara as DUAS faixas — provável e execução excelente", () => {
    expect(fase2.whrExcelente).toBeDefined();
    expect(fase2.whrExcelente!).toBeLessThan(fase2.whrProvavel);
  });

  it("as fases se encadeiam sem buraco nem sobreposição", () => {
    expect(fase2.mesInicio).toBe(fase1.mesFim);
  });

  it("os alvos de medida produzem a razão de execução excelente — é essa a regra que amarra os dois campos", () => {
    for (const f of FASES) {
      const esperado = f.whrExcelente ?? f.whrProvavel;
      expect({ fase: f.id, razao: razaoCinturaQuadril(f.cinturaCm, f.quadrilCm) })
        .toEqual({ fase: f.id, razao: esperado });
    }
  });
});

describe("projeção de ombro÷quadril (fase 2)", () => {
  const fase2 = FASES.find((f) => f.id === "fase-2")!;

  it("é ~1,00 — ombro projetado (~114) sobre o quadril reconstruído da fase 2 (114)", () => {
    expect(PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2).toBe(razaoOmbroQuadril(114, fase2.quadrilCm));
    expect(PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2).toBeCloseTo(1.0, 2);
  });
});

describe("consumo", () => {
  it("a meta é déficit contra o gasto estimado", () => {
    expect(CONSUMO.metaKcal).toBeLessThan(CONSUMO.gastoEstimadoKcalMin);
  });

  it("proteína ≥ 1,8 g por kg do peso-alvo da fase 1 — é o que protege o músculo", () => {
    const alvo = FASES.find((f) => f.id === "fase-1")!.pesoKgMax;
    expect(CONSUMO.proteinaGMin / alvo).toBeGreaterThanOrEqual(1.8);
  });

  it("existe verba diária de besteira declarada", () => {
    expect(CONSUMO.discricionariaKcal).toBeGreaterThan(0);
  });
});

describe("marcos de cintura", () => {
  it("o primeiro marco é a trava do superávit (88)", () => {
    expect(MARCOS_CINTURA[0].cinturaCm).toBe(88);
  });

  it("os marcos descem e as datas sobem", () => {
    for (let i = 1; i < MARCOS_CINTURA.length; i++) {
      expect(MARCOS_CINTURA[i].cinturaCm).toBeLessThan(MARCOS_CINTURA[i - 1].cinturaCm);
      expect(MARCOS_CINTURA[i].mesMin).toBeGreaterThan(MARCOS_CINTURA[i - 1].mesMin);
    }
  });

  it("o último marco fecha na cintura da fase 1", () => {
    const ultimo = MARCOS_CINTURA[MARCOS_CINTURA.length - 1];
    expect(ultimo.cinturaCm).toBe(FASES.find((f) => f.id === "fase-1")!.cinturaCm);
  });
});

describe("recomeço e fase 3 (2026-09-23)", () => {
  it("a data do recomeço é 23/09/2026", () => {
    expect(RECOMECO_DATA).toBe("2026-09-23");
  });
  it("o gasto conta a caminhada de 5 km nos sete dias", () => {
    expect([CONSUMO.gastoEstimadoKcalMin, CONSUMO.gastoEstimadoKcalMax]).toEqual([2700, 2900]);
  });
  it("existe a fase 3 (marcar de leve), encadeada depois da fase 2", () => {
    const f2 = FASES.find((f) => f.id === "fase-2")!;
    const f3 = FASES.find((f) => f.id === "fase-3")!;
    expect(f3.mesInicio).toBe(f2.mesFim);
    expect(f3.pesoKgMax).toBeLessThan(f2.pesoKgMax);
  });
  it("a faixa de gordura do fim da fase 1 reproduz os 80-82 kg da partida de maio", () => {
    const magra = MEDIDAS_PARTIDA.pesoKg * (1 - 0.257);
    expect(Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[0]))).toBe(80);
    expect(Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[1]))).toBe(82);
  });
});

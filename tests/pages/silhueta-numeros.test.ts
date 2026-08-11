import { describe, it, expect } from "vitest";
import {
  FASES,
  MEDIDAS_PARTIDA,
  razaoCinturaQuadril,
  razaoOmbroQuadril,
} from "../../src/lib/objetivo";

// A Silhueta é a tela que mais AFIRMA números sobre o objetivo. Ela é lida como
// texto porque o que precisa ser travado é a copy: o teto de 0,83–0,85 que ficou
// nela por três meses era prosa, não cálculo, e nenhum teste de render pegaria.
const FONTE = Object.values(
  import.meta.glob("../../src/pages/body/Silhouette.tsx", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,
)[0];

const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const limites = (faixa: string) => faixa.split("–").map((n) => Number(n.replace(",", ".")));

describe("os números da Silhueta batem com objetivo.ts", () => {
  it("a tela foi lida (o pior resultado aqui seria um teste verde sobre string vazia)", () => {
    expect(FONTE?.length ?? 0).toBeGreaterThan(1000);
  });

  it("cita a faixa dupla de WHR, e os pontos do módulo caem dentro dela", () => {
    expect(FONTE).toContain("0,75–0,78");
    expect(FONTE).toContain("0,72–0,74");

    const [provMin, provMax] = limites("0,75–0,78");
    const [excMin, excMax] = limites("0,72–0,74");
    expect(FASE_2.whrProvavel).toBeGreaterThanOrEqual(provMin);
    expect(FASE_2.whrProvavel).toBeLessThanOrEqual(provMax);
    expect(FASE_2.whrExcelente!).toBeGreaterThanOrEqual(excMin);
    expect(FASE_2.whrExcelente!).toBeLessThanOrEqual(excMax);
  });

  it("o ponto de partida citado (0,87) é a razão real da medição de 13/05", () => {
    expect(razaoCinturaQuadril(MEDIDAS_PARTIDA.cinturaCm, MEDIDAS_PARTIDA.quadrilCm)).toBe(0.87);
    expect(FONTE).toContain("0,87");
  });

  it("não sobrou o teto antigo de 0,83–0,85, que era o número da branch escrito ao contrário", () => {
    // 0,85 continua permitido: é a fronteira de referência das faixas femininas.
    // O que não pode voltar é 0,83 como TETO — ele só existia naquela frase.
    expect(FONTE).not.toContain("0,83");
    expect(FONTE).not.toMatch(/teto realista/i);
  });

  it("diz que a razão ombro÷quadril de hoje já é faixa feminina", () => {
    const shr = razaoOmbroQuadril(MEDIDAS_PARTIDA.ombrosCm, MEDIDAS_PARTIDA.quadrilCm);
    expect(shr).toBe(1.06);
    expect(FONTE).toContain("1,06");
    expect(FONTE).toContain("faixa feminina");
    // O texto antigo prometia feminilidade só abaixo de 1,0 — o que declarava
    // masculina a razão que ela já tem.
    expect(FONTE).not.toMatch(/Abaixo de 1,0/);
  });

  it("nomeia a régua de %BF e a condição que a trocaria", () => {
    expect(FONTE).toContain("gordura abdominal");
    expect(FONTE).toMatch(/estrogênio.+migrar/s);
    // O texto anterior explicava a diferença entre as duas fórmulas porque a tela
    // rodava a errada. Agora ela roda a certa e não precisa se desculpar.
    expect(FONTE).not.toMatch(/fórmula feminina/i);
    expect(FONTE).not.toContain("~28%");
  });

  it("não exibe dívida de quadril: a razão melhora pelas duas pontas", () => {
    expect(FONTE).not.toContain("shoulderHipGap");
    expect(FONTE).toContain("duas pontas");
  });
});

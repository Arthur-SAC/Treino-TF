import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = JSON.stringify(HORIZONTES);

describe("horizontes: duas trilhas, não uma escada esperando a TRH", () => {
  it("tem as quatro seções previstas", () => {
    expect(HORIZONTES.map((s) => s.id)).toEqual([
      "trilha-vestida", "trilha-cama", "cirurgia", "linha-do-tempo",
    ]);
  });

  it("não trata a TRH como etapa agendada", () => {
    expect(texto).not.toMatch(/in[íi]cio da TRH/i);
    expect(texto).not.toMatch(/come[çc]a a TRH/i);
    expect(texto).not.toMatch(/depois da TRH/i);
    expect(texto).not.toMatch(/quando a TRH/i);
  });

  it("nomeia o que é inalcançável com a palavra 'impossível', não 'difícil'", () => {
    const vestida = HORIZONTES.find((s) => s.id === "trilha-vestida")!;
    expect(JSON.stringify(vestida)).toMatch(/imposs[íi]vel/i);
  });

  it("a trilha da cama diz que a configuração de hoje FAVORECE metade dos objetivos", () => {
    const cama = HORIZONTES.find((s) => s.id === "trilha-cama")!;
    expect(JSON.stringify(cama)).toMatch(/testosterona/i);
  });

  it("cita os números reais das medidas e das fases", () => {
    expect(texto).toContain(String(MEDIDAS_PARTIDA.cinturaCm));
    expect(texto).toContain(String(MEDIDAS_PARTIDA.quadrilCm));
    expect(texto).toContain(String(FASES[0].cinturaCm));
  });

  it("declara a faixa dupla de WHR na trilha do corpo vestida, não um número só", () => {
    const vestida = HORIZONTES.find((s) => s.id === "trilha-vestida")!;
    const tipDaRazao = vestida.tips.find((t) => t.includes("0,87"));
    expect(tipDaRazao).toBeDefined();
    expect(tipDaRazao!).toMatch(/0,75-0,78/);
    expect(tipDaRazao!).toMatch(/0,72-0,74/);
  });

  it("a linha do tempo não ancora prazo em idade — o ritmo é adesão, não relógio", () => {
    const linha = JSON.stringify(HORIZONTES.find((s) => s.id === "linha-do-tempo")!);
    expect(linha).not.toMatch(/~\s*\d{2}\s*:/);
    expect(linha).not.toMatch(/\b(aos|dos)\s+\d{2}\b/i);
    expect(linha).not.toMatch(/\b\d{2}\s*anos\b/i);
  });

  it("o BBL vem com o risco de mortalidade escrito", () => {
    const cir = HORIZONTES.find((s) => s.id === "cirurgia")!;
    expect(JSON.stringify(cir)).toMatch(/mortalidade|embolia/i);
  });

  it("nenhum texto reintroduz faixa no quadril-alvo, que é número único", () => {
    const alvo = String(FASES.find((f) => f.id === "fase-2")!.quadrilCm);
    expect(texto).not.toMatch(new RegExp(`${alvo}\\s*-\\s*\\d+`));
  });
});

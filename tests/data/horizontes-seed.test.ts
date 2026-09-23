import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = JSON.stringify(HORIZONTES);

describe("horizontes: duas trilhas, não uma escada esperando a TRH", () => {
  // A linha do tempo saiu daqui em 2026-09-23: virou função da partida dela
  // (src/lib/linha-do-tempo.ts), montada na página. Entrou a seção do peito.
  it("tem as cinco seções estáticas previstas", () => {
    expect(HORIZONTES.map((s) => s.id)).toEqual([
      "trilha-vestida", "peito", "trilha-cama", "cirurgia", "flexibilidade",
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

  it("o BBL vem com o risco de mortalidade escrito", () => {
    const cir = HORIZONTES.find((s) => s.id === "cirurgia")!;
    expect(JSON.stringify(cir)).toMatch(/mortalidade|embolia/i);
  });

  it("nenhum texto reintroduz faixa no quadril-alvo, que é número único", () => {
    const alvo = String(FASES.find((f) => f.id === "fase-2")!.quadrilCm);
    expect(texto).not.toMatch(new RegExp(`${alvo}\\s*-\\s*\\d+`));
  });

  it("a trilha vestida descreve a Chun-Li macia com glúteo destacado", () => {
    const v = JSON.stringify(HORIZONTES.find((s) => s.id === "trilha-vestida")!);
    expect(v).toMatch(/Chun-Li/);
    expect(v).toMatch(/destacad/i);
  });

  it("o peito diz o que dá sem hormônio e chama mama de impossível sem implante ou TRH", () => {
    const p = JSON.stringify(HORIZONTES.find((s) => s.id === "peito")!);
    expect(p).toMatch(/imposs[íi]vel/i);
    expect(p).toMatch(/implante/i);
  });

  it("a cirurgia dá os dois tetos e marca o fim da fase discreta como decisão dela", () => {
    const c = JSON.stringify(HORIZONTES.find((s) => s.id === "cirurgia")!);
    expect(c).toMatch(/0,62/);
    expect(c).toMatch(/0,72/);
    expect(c).toMatch(/discreta/i);
  });
});

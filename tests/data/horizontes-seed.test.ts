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

  it("declara a faixa dupla de WHR, não um número só", () => {
    expect(texto).toMatch(/0,7[0-9].*0,7[0-9]/);
  });

  it("a linha do tempo não ancora nada em idade", () => {
    const linha = HORIZONTES.find((s) => s.id === "linha-do-tempo")!;
    expect(JSON.stringify(linha)).not.toMatch(/~?2[89]:/);
  });

  it("o BBL vem com o risco de mortalidade escrito", () => {
    const cir = HORIZONTES.find((s) => s.id === "cirurgia")!;
    expect(JSON.stringify(cir)).toMatch(/mortalidade|embolia/i);
  });
});

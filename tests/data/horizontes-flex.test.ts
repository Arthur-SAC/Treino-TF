import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";
import { HORIZONTE_FLEX } from "../../src/lib/flex-progression";

const secao = () => HORIZONTES.find((s) => s.id === "flexibilidade");

describe("horizonte de flexibilidade", () => {
  it("existe uma seção sobre flexibilidade", () => {
    expect(secao()).toBeDefined();
  });

  it("diz que espacate NÃO é necessário — e o módulo concorda", () => {
    expect(HORIZONTE_FLEX.espacateNecessario).toBe(false);
    expect(JSON.stringify(secao()).toLowerCase()).toMatch(/n[ãa]o (é|e) necess[áa]rio/);
  });

  it("nomeia que o espacate lateral depende de anatomia, não de esforço", () => {
    expect(JSON.stringify(secao()).toLowerCase()).toMatch(/anatomia|acet[áa]bulo/);
  });

  it("cita os prazos reais do módulo, não números inventados", () => {
    const texto = JSON.stringify(secao());
    expect(texto).toContain(String(HORIZONTE_FLEX.primeiraMudancaSemanas[0]));
    expect(texto).toContain(String(HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]));
  });

  it("não promete o que a flexibilidade não entrega — nada sobre silhueta", () => {
    expect(JSON.stringify(secao()).toLowerCase()).not.toMatch(/afina|emagrec|cintura mais fina/);
  });
});

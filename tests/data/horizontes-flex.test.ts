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

// O horizonte da flexibilidade é dito DUAS vezes na mesma tela: a trilha da
// cama já falava dele antes desta frente existir, e a seção nova o declara em
// detalhe. Duas escritas do mesmo prazo divergem em silêncio — e o que ela lê
// são dois números diferentes para a mesma coisa, na mesma página.
describe("o prazo da flexibilidade é o mesmo nas duas seções que o citam", () => {
  const cama = () => HORIZONTES.find((s) => s.id === "trilha-cama")!;

  /** Os prazos em meses citados num texto, como pares "N a M". */
  const prazosEmMeses = (texto: string) =>
    [...texto.matchAll(/(\d+)\s*a\s*(\d+)\s*meses/gi)].map((m) => `${m[1]}-${m[2]}`);

  it("a trilha da cama cita o mesmo intervalo que a seção de flexibilidade", () => {
    const tipDaCama = cama().tips.find((t) => /flexibilidade/i.test(t));
    expect(tipDaCama).toBeDefined();

    const naCama = prazosEmMeses(tipDaCama!);
    const naSecao = prazosEmMeses(
      secao()!.tips.find((t) => /posi[çc][õo]es/i.test(t))!,
    );
    expect(naCama).not.toEqual([]);
    expect(naCama).toEqual(naSecao);
  });

  it("e esse intervalo é o do módulo, não um número escrito à mão", () => {
    const esperado = `${HORIZONTE_FLEX.posicoesQueElaQuerMeses[0]}-${HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]}`;
    const tipDaCama = cama().tips.find((t) => /flexibilidade/i.test(t))!;
    expect(prazosEmMeses(tipDaCama)).toEqual([esperado]);
  });

  it("nenhuma outra seção contradiz o prazo — se cita meses de flexibilidade, cita o mesmo", () => {
    const esperado = `${HORIZONTE_FLEX.posicoesQueElaQuerMeses[0]}-${HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]}`;
    const espacate = `${HORIZONTE_FLEX.espacateFrontalMeses[0]}-${HORIZONTE_FLEX.espacateFrontalMeses[1]}`;
    const divergentes = HORIZONTES.flatMap((s) =>
      s.tips
        .filter((t) => /flexibilidade|espacate|posi[çc][õo]es/i.test(t))
        .flatMap(prazosEmMeses)
        .filter((p) => p !== esperado && p !== espacate)
        .map((p) => `${s.id}: ${p}`),
    );
    expect(divergentes).toEqual([]);
  });
});

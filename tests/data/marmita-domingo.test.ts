import { describe, it, expect } from "vitest";
import { ROTEIRO_DOMINGO, MARMITA_TETO_MIN } from "../../src/data/marmita-domingo-seed";

// Decisão dela, 2026-08-11: ~1h30 de domingo, 2 ou 3 panelas em paralelo. Não é
// o teto ambicioso de 3h de propósito — domingo longo demais vira domingo
// pulado, e domingo pulado quebra a semana inteira. O que o teto mede é o tempo
// DELA de pé na cozinha, não o tempo de panela: panela que cozinha sozinha não
// custa domingo.
describe("o roteiro de domingo cabe no domingo dela", () => {
  it("o tempo de mão na massa somado não passa de 1h30", () => {
    const total = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);
    expect({ total, teto: MARMITA_TETO_MIN, cabe: total <= MARMITA_TETO_MIN })
      .toEqual({ total, teto: MARMITA_TETO_MIN, cabe: true });
  });

  // Sem paralelismo, 1h30 não entrega proteína em lote, carboidrato e feijão.
  // O que faz o roteiro caber é o que cozinha sem ela olhando.
  it("mais tempo cozinha sozinho do que ocupa ela", () => {
    const sozinho = ROTEIRO_DOMINGO.reduce((s, e) => s + e.sozinhoMin, 0);
    const ocupada = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);
    expect(sozinho).toBeGreaterThan(ocupada);
  });

  it("as etapas estão em ordem, sem repetir número e sem buraco", () => {
    const ordens = ROTEIRO_DOMINGO.map((e) => e.ordem);
    expect(ordens).toEqual([...ordens].sort((a, b) => a - b));
    expect(new Set(ordens).size).toBe(ordens.length);
    expect(ordens).toEqual(ordens.map((_, i) => i));
  });

  it("toda etapa diz o que rende — roteiro sem rendimento não vira marmita", () => {
    const mudas = ROTEIRO_DOMINGO.filter((e) => !e.rende.trim() || !e.comoFazer.trim()).map((e) => e.id);
    expect(mudas).toEqual([]);
  });

  // O molho do feijão de corda é de 2h. Se ele não estiver na véspera, o
  // domingo estoura antes de começar — e é a etapa que o app precisa lembrar
  // no sábado, não no domingo de manhã.
  it("a etapa 0 acontece no sábado à noite", () => {
    expect(ROTEIRO_DOMINGO[0].titulo.toLowerCase()).toContain("sábado");
    expect(ROTEIRO_DOMINGO[0].maoNaMassaMin).toBeLessThanOrEqual(5);
  });

  // O lote de domingo é o que sustenta o `effort: "lote-domingo"` declarado nas
  // refeições. Se o roteiro não produz proteína em lote, a etiqueta mente.
  it("o roteiro produz proteína em lote", () => {
    const texto = ROTEIRO_DOMINGO.map((e) => `${e.titulo} ${e.rende}`).join(" ").toLowerCase();
    expect(texto).toMatch(/frango/);
    expect(texto).toMatch(/ovo/);
    expect(texto).toMatch(/atum/);
  });
});

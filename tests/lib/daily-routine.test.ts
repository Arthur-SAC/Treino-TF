import { describe, it, expect } from "vitest";
import { CARE_ITEMS, careItemsFor, PRESENCE_ITEMS, presenceSuggestionForDay } from "../../src/lib/daily-routine";

describe("careItemsFor", () => {
  it("manhã traz cabelo/maquiagem/look (sem skincare)", () => {
    const ids = careItemsFor("morning").map((c) => c.id);
    expect(ids).toEqual(["cabelo-finalizacao", "maquiagem", "estilo-look"]);
  });

  it("noite traz clareamento/cabelo/unhas/depilação (sem skincare)", () => {
    const ids = careItemsFor("night").map((c) => c.id);
    expect(ids).toEqual(["clareamento", "cabelo-tratamento", "unhas", "depilacao"]);
  });

  it("todo item tem rota e label, e nenhum é skincare", () => {
    for (const c of CARE_ITEMS) {
      expect(c.to.startsWith("/beleza")).toBe(true);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.id).not.toContain("skincare");
    }
  });
});

describe("presença", () => {
  it("tem pelo menos postura, gingado e uma sequência de intimidade", () => {
    const ids = PRESENCE_ITEMS.map((p) => p.id);
    expect(ids).toContain("postura-silhueta-diaria");
    expect(ids).toContain("sensual-andar-gingado");
    expect(ids.some((id) => id.startsWith("intimidade-"))).toBe(true);
  });

  it("sugestão é determinística e fica dentro da lista", () => {
    for (let d = 0; d < 30; d++) {
      const s = presenceSuggestionForDay(d);
      expect(PRESENCE_ITEMS).toContainEqual(s);
    }
    // O ciclo tem o tamanho da lista, não da semana.
    expect(presenceSuggestionForDay(0)).toEqual(presenceSuggestionForDay(PRESENCE_ITEMS.length));
  });

  // A função rodava sobre o DIA DA SEMANA (0-6). Com sete itens funcionava por
  // coincidência; no oitavo, o índice 7 nunca seria alcançado e a sequência
  // existiria no app sem nunca aparecer — modo de falha nº 2 da lista de
  // "conteúdo que não chega até ela", que já custou seis correções perdidas.
  // Esta rede é o que impede a lista de crescer e esconder conteúdo de novo.
  it("toda sugestão de presença é alcançável — nenhuma fica invisível", () => {
    const alcancados = new Set(
      Array.from({ length: PRESENCE_ITEMS.length }, (_, d) => presenceSuggestionForDay(d).id),
    );
    const invisiveis = PRESENCE_ITEMS.filter((i) => !alcancados.has(i.id)).map((i) => i.id);
    expect(invisiveis).toEqual([]);
  });
});

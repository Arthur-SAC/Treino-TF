import { describe, it, expect } from "vitest";
import { CARE_ITEMS, careItemsFor } from "../../src/lib/daily-routine";

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

import { PRESENCE_ITEMS, presenceSuggestionForDay } from "../../src/lib/daily-routine";

describe("presença", () => {
  it("tem pelo menos postura, gingado e uma sequência de intimidade", () => {
    const ids = PRESENCE_ITEMS.map((p) => p.id);
    expect(ids).toContain("postura-silhueta-diaria");
    expect(ids).toContain("sensual-andar-gingado");
    expect(ids.some((id) => id.startsWith("intimidade-"))).toBe(true);
  });

  it("sugestão é determinística e fica dentro da lista pra qualquer dia 0-6", () => {
    for (let d = 0; d < 7; d++) {
      const s = presenceSuggestionForDay(d);
      expect(PRESENCE_ITEMS).toContainEqual(s);
    }
    expect(presenceSuggestionForDay(0)).toEqual(presenceSuggestionForDay(7));
  });
});

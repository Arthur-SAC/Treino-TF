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

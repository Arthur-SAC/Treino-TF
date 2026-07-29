import { describe, it, expect } from "vitest";
import { MICRO_PAUSAS } from "../../src/data/micro-pausas-seed";
import { pausaDaVez } from "../../src/lib/micro-pausas";

describe("catálogo de micro-pausas", () => {
  it("tem pelo menos seis movimentos", () => {
    expect(MICRO_PAUSAS.length).toBeGreaterThanOrEqual(6);
  });

  it("todo movimento declara o quanto é discreto — o ambiente dela não é receptivo", () => {
    const sem = MICRO_PAUSAS.filter((m) => !m.discricao).map((m) => m.id);
    expect(sem).toEqual([]);
  });

  it("a maioria é invisível, pra poder ser feita na mesa", () => {
    const invisiveis = MICRO_PAUSAS.filter((m) => m.discricao === "invisivel");
    expect(invisiveis.length).toBeGreaterThanOrEqual(3);
  });

  it("todo movimento explica por que serve pro objetivo dela", () => {
    const sem = MICRO_PAUSAS.filter((m) => !m.porque).map((m) => m.id);
    expect(sem).toEqual([]);
  });
});

describe("pausaDaVez", () => {
  it("devolve de dois a três movimentos", () => {
    for (let n = 0; n < 8; n++) {
      const p = pausaDaVez(n);
      expect(p.length).toBeGreaterThanOrEqual(2);
      expect(p.length).toBeLessThanOrEqual(3);
    }
  });

  it("roda os movimentos — pausas seguidas não repetem o mesmo conjunto", () => {
    expect(pausaDaVez(0).map((m) => m.id)).not.toEqual(pausaDaVez(1).map((m) => m.id));
  });

  it("ao longo do dia, cobre todos os movimentos do catálogo", () => {
    const vistos = new Set<string>();
    for (let n = 0; n < 12; n++) pausaDaVez(n).forEach((m) => vistos.add(m.id));
    expect(vistos.size).toBe(MICRO_PAUSAS.length);
  });

  it("é estável: a mesma pausa devolve sempre o mesmo conjunto", () => {
    expect(pausaDaVez(3).map((m) => m.id)).toEqual(pausaDaVez(3).map((m) => m.id));
  });
});

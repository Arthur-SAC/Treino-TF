import { describe, it, expect } from "vitest";
import { MICRO_PAUSAS } from "../../src/data/micro-pausas-seed";
import { pausaDaVez, metaDePausas } from "../../src/lib/micro-pausas";

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

describe("metaDePausas", () => {
  it("com os padrões (9h→18h, a cada 90 min) o dia pede 6 pausas", () => {
    expect(metaDePausas(9, 18, 90)).toBe(6);
  });

  it("expediente maior ou intervalo menor pedem mais pausas", () => {
    expect(metaDePausas(7, 16, 60)).toBe(9);
    expect(metaDePausas(9, 18, 45)).toBe(12);
  });

  it("arredonda pra baixo — não cobra uma pausa que não cabe no expediente", () => {
    expect(metaDePausas(9, 18, 120)).toBe(4); // 540 / 120 = 4,5
  });

  it("configuração torta nunca zera o alvo (senão o contador nasce completo)", () => {
    expect(metaDePausas(9, 9, 90)).toBe(1);
    expect(metaDePausas(18, 9, 90)).toBe(1);
    expect(metaDePausas(9, 18, 0)).toBe(1);
  });
});

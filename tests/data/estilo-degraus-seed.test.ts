import { describe, it, expect } from "vitest";
import { ITENS_ESTILO } from "../../src/data/estilo-degraus-seed";

describe("seed do Estilo em degraus", () => {
  it("todo item cabe no orçamento", () => {
    for (const i of ITENS_ESTILO) expect(i.precoMax).toBeLessThanOrEqual(100);
  });
  it("degrau 1 tem 7 itens na ordem da spec", () =>
    expect(
      ITENS_ESTILO.filter((i) => i.degrau === 1)
        .sort((a, b) => a.ordem - b.ordem)
        .map((i) => i.id),
    ).toEqual([
      "casa-short-camiseta",
      "calcinhas-algodao",
      "hidratante-doce",
      "calca-cintura-alta",
      "body-splash",
      "blusa-que-cai",
      "acessorios-pequenos",
    ]));
  it("degraus 2 e 3 têm 3 itens cada", () => {
    expect(ITENS_ESTILO.filter((i) => i.degrau === 2)).toHaveLength(3);
    expect(ITENS_ESTILO.filter((i) => i.degrau === 3)).toHaveLength(3);
  });
  it("nenhum texto sugere rosa, sutiã no degrau 1, emagrecer ou TRH", () => {
    for (const i of ITENS_ESTILO) {
      const t = [i.nome, i.praQue, i.onde, i.dica ?? "", ...i.cores].join(" ");
      expect(t).not.toMatch(/\brosa|\bpink|emagrec|\bTRH\b|enquanto a/i);
      if (i.degrau === 1) expect(t).not.toMatch(/suti[ãa]/i);
    }
  });
  it("ids únicos", () =>
    expect(new Set(ITENS_ESTILO.map((i) => i.id)).size).toBe(ITENS_ESTILO.length));
});

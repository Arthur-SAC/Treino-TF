import { describe, it, expect } from "vitest";
import { GUIA_TAMANHOS } from "../../src/data/tamanhos-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = GUIA_TAMANHOS.map((g) => `${g.titulo} ${g.corpo}`).join("\n");

describe("guia de tamanho e compra", () => {
  // Cueca é vendida por cintura, calcinha por quadril, e ela tem 15 cm de
  // diferença entre as duas com coxa grossa. Comprar pela cintura entrega peça
  // que aperta a coxa — e peça que aperta a coxa achata a bunda.
  it("diz para comprar pelo quadril e pela coxa, nunca pela cintura", () => {
    expect(texto).toMatch(/quadril/i);
    expect(texto).toMatch(/coxa/i);
    expect(texto).toMatch(/nunca pela cintura|não pela cintura/i);
  });

  it("avisa que a tabela muda por marca", () => {
    expect(texto).toMatch(/marca/i);
  });

  // O aviso mais caro: o tamanho tem data de validade. Cintura 99 → 84 e
  // quadril 114 → 106 na fase 1, e o quadril volta a 114 na fase 2.
  it("avisa para não comprar enxoval completo agora", () => {
    expect(texto).toMatch(/2 ou 3 peças|poucas peças|enxoval/i);
  });

  // Os números vêm de objetivo.ts. Se um dia o alvo mudar lá, o guia acompanha
  // sozinho — e este teste é o que garante que ninguém digitou o número aqui.
  it("os números de medida saem de objetivo.ts, não estão digitados no seed", () => {
    const fase1 = FASES.find((f) => f.id === "fase-1")!;
    const fase2 = FASES.find((f) => f.id === "fase-2")!;
    expect(texto).toContain(String(MEDIDAS_PARTIDA.quadrilCm));
    expect(texto).toContain(String(MEDIDAS_PARTIDA.cinturaCm));
    expect(texto).toContain(String(fase1.cinturaCm));
    expect(texto).toContain(String(fase2.quadrilCm));
  });

  it("toda entrada tem título e corpo", () => {
    const vazias = GUIA_TAMANHOS.filter((g) => !g.titulo.trim() || !g.corpo.trim()).map((g) => g.id);
    expect(vazias).toEqual([]);
  });
});

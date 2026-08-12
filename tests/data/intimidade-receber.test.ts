import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { PROGRESSAO_PELVICA } from "../../src/lib/pelvic-progression";

const seq = () => SEQUENCES.find((s) => s.id === "intimidade-receber-maos");
const texto = () => {
  const s = seq()!;
  return `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;
};

describe("receber por mão e dedos", () => {
  it("a sequência existe e é de intimidade", () => {
    expect(seq()).toBeDefined();
    expect(seq()!.category).toBe("intimidade");
  });

  // É a via que a noiva quer e aceita: carne dos dois lados, sensação mútua —
  // coisa que strap-on nenhum entrega, e é por isso que ela recusou o strap-on.
  it("nomeia a sensação mútua como a razão da via", () => {
    expect(texto()).toMatch(/nas duas|m[úu]tua|as duas sentem/i);
  });

  it("manda lubrificante em quantidade que parece exagero", () => {
    expect(texto()).toMatch(/lubrificante/i);
    expect(texto()).toMatch(/exagero|mais do que parece/i);
  });

  // A habilidade que sustenta tudo é o relaxamento voluntário do assoalho —
  // que é a fase 2 da frente 2. Esta frente CONSOME aquilo, não redefine.
  it("aponta a soltura do assoalho pélvico como pré-requisito, sem redefini-la", () => {
    expect(texto()).toMatch(/soltura|relaxa(r|mento)/i);
    // O id citado tem que ser um da progressão real, não um inventado no texto:
    // ponteiro quebrado em prosa não estoura, só manda ela pro lugar errado.
    const citados = PROGRESSAO_PELVICA.filter((id) => texto().includes(id));
    expect(citados.length).toBeGreaterThanOrEqual(1);
  });

  it("progride em escada e dá o horizonte em meses, não em sessões", () => {
    expect(texto()).toMatch(/meses/i);
    expect(texto()).toMatch(/um dedo/i);
  });

  // Fisting é horizonte distante, nomeado como tal. Nomear evita que ela
  // descubra por conta própria que existe e tente pular etapas.
  it("nomeia fisting como horizonte distante, não como próximo passo", () => {
    const frases = texto().split(/[.;]/).filter((f) => /fisting/i.test(f));
    expect(frases.length).toBeGreaterThanOrEqual(1);
    for (const f of frases) {
      expect({ f: f.trim(), distante: /distante|anos|não é o próximo|nao e o proximo|longe/i.test(f) })
        .toEqual({ f: f.trim(), distante: true });
    }
  });

  it("não propõe strap-on em lugar nenhum", () => {
    expect(texto()).not.toMatch(/strap-?on/i);
  });
});

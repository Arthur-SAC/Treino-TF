import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const seq = (id: string) => SEQUENCES.find((s) => s.id === id)!;
const texto = (id: string) => JSON.stringify(seq(id));
const ANDAR = ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"];

describe("apresentação — o que conversamos em 2026-09-30/10-01", () => {
  it("o 8 com o quadril existe, é de apresentação e tem as três partes", () => {
    const s = seq("corporal-oito-quadril");
    expect(s.category).toBe("apresentacao");
    expect(s.moves.length).toBeGreaterThanOrEqual(4);
    expect(texto("corporal-oito-quadril")).toMatch(/[Dd]eslizar/);
    expect(texto("corporal-oito-quadril")).toMatch(/[Gg]irar/);
  });

  // Pelve desnivelada: pisar NA linha (passarela) acentua a assimetria.
  // Proíbe a afirmação; onde "linha" aparece, tem que vir com "sem cruzar".
  it("nenhuma sequência de andar manda pisar na linha ou cruzar os pés", () => {
    for (const id of ANDAR) {
      const t = texto(id);
      expect({ id, naLinha: /\bna linha\b|em cima da linha|pé na linha/i.test(t) }).toEqual({ id, naLinha: false });
      if (/linha/i.test(t)) expect({ id, semCruzar: /sem cruzar/i.test(t) }).toEqual({ id, semCruzar: true });
    }
  });

  // Rede do andar (dívida 4): as três frases são o "pisar na linha" por outro nome.
  it("nenhuma sequência de andar usa 'sobre a linha', 'na frente do outro' ou 'linha única'", () => {
    for (const id of ANDAR) {
      expect({ id, proibido: /sobre a linha|na frente do outro|linha única/i.test(texto(id)) }).toEqual({ id, proibido: false });
    }
  });

  it("sentar não manda 'nunca abertas' nem cruzar no joelho como padrão, e fala em blocos e em trocar", () => {
    const t = texto("corporal-postura-sentar");
    expect(t).not.toMatch(/nunca abertas/i);
    expect(t).not.toMatch(/cruza uma perna sobre a outra no joelho/i);
    expect(t).toMatch(/10[–-]15 min/);
    expect(t).toMatch(/20[–-]30 min/);
  });

  it("andar ensina joelho macio e passo curto", () => {
    const t = texto("corporal-caminhada");
    expect(t).toMatch(/passo curto/i);
    expect(t).toMatch(/joelho/i);
  });
});

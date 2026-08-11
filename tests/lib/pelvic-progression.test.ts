import { describe, it, expect } from "vitest";
import { pelvicDoDia, PELVIC_ORDEM } from "../../src/lib/pelvic-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A usuária cumpre o papel masculino na relação e quer vigor, dureza e
// resistência. O assoalho pélvico é o que MANTÉM a rigidez (comprime as veias
// pra o sangue não sair) e é o mecanismo do controle ejaculatório. O app tinha
// as 8 sequências e nenhuma delas era alcançável pela rotina.
//
// A ordem importa: sem identificar o músculo PC primeiro, todo o resto é
// contração de glúteo e abdômen achando que é assoalho pélvico.

describe("PELVIC_ORDEM", () => {
  it("cobre todas as sequências de assoalho pélvico do catálogo", () => {
    const doCatalogo = SEQUENCES.filter((s) => s.category === "pelvic").map((s) => s.id).sort();
    expect([...PELVIC_ORDEM].sort()).toEqual(doCatalogo);
  });

  it("começa pela identificação do músculo — sem isso o resto não funciona", () => {
    expect(PELVIC_ORDEM[0]).toBe("pelvic-identificacao");
  });

  it("o Kegel clássico vem antes das variações avançadas", () => {
    expect(PELVIC_ORDEM.indexOf("pelvic-kegel-classico")).toBeLessThan(
      PELVIC_ORDEM.indexOf("pelvic-escala-cinco-niveis"),
    );
  });
});

describe("pelvicDoDia", () => {
  it("nos primeiros dias, insiste na identificação", () => {
    for (const n of [0, 1, 2, 3, 4]) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-identificacao");
    }
  });

  it("depois de achar o músculo, passa pro Kegel clássico e fica ali um tempo", () => {
    for (const n of [5, 8, 11]) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-kegel-classico");
    }
  });

  it("com base construída, roda as variações avançadas", () => {
    const avancadas = new Set<string>();
    for (let n = 12; n < 30; n++) avancadas.add(pelvicDoDia(n).sequenceId);
    expect(avancadas.has("pelvic-identificacao")).toBe(false);
    expect(avancadas.size).toBeGreaterThanOrEqual(6);
  });

  it("é estável e pura: a mesma contagem devolve sempre o mesmo", () => {
    expect(pelvicDoDia(17)).toEqual(pelvicDoDia(17));
  });

  it("toda etapa devolve um id que existe no catálogo", () => {
    const ids = new Set(SEQUENCES.map((s) => s.id));
    for (let n = 0; n < 40; n++) {
      expect({ n, existe: ids.has(pelvicDoDia(n).sequenceId) }).toEqual({ n, existe: true });
    }
  });

  it("toda etapa explica em que fase ela está — senão vira exercício cego", () => {
    for (const n of [0, 6, 20]) {
      expect(pelvicDoDia(n).etapa.length).toBeGreaterThan(3);
    }
  });

  it("contagem negativa ou absurda não quebra", () => {
    expect(pelvicDoDia(-1).sequenceId).toBe("pelvic-identificacao");
    expect(pelvicDoDia(99999).sequenceId).toBeTruthy();
  });
});

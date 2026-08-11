import { describe, it, expect } from "vitest";
import { pelvicDoDia, PELVIC_ORDEM, ROTACAO, ATE_ROTACAO } from "../../src/lib/pelvic-progression";
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

  // A antiga regra "depois da identificação, fica um tempo no Kegel clássico"
  // foi substituída pela fase 2 de soltura — ver "a soltura entra na fase 2,
  // antes das variações", abaixo, que cobre esses mesmos índices.

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

describe("a soltura entra na fase 2, antes das variações", () => {
  it("as 5 primeiras práticas são identificação da contração", () => {
    for (let n = 0; n < 5; n++) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-identificacao");
    }
  });

  it("da 6ª à 10ª, treina achar a soltura", () => {
    for (let n = 5; n < 10; n++) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-soltura-identificacao");
    }
  });

  it("a fase 3 alterna Kegel clássico e alternância", () => {
    const ids = [];
    for (let n = 10; n < 17; n++) ids.push(pelvicDoDia(n).sequenceId);
    expect(new Set(ids)).toEqual(new Set(["pelvic-kegel-classico", "pelvic-alternancia"]));
  });

  it("a rotação da fase 4 inclui start-stop e preparo pra receber", () => {
    const ids = new Set<string>();
    for (let n = 17; n < 60; n++) ids.add(pelvicDoDia(n).sequenceId);
    expect(ids.has("pelvic-start-stop")).toBe(true);
    expect(ids.has("pelvic-receber-preparo")).toBe(true);
  });

  it("todas as sequências da rotação são alcançáveis — id duplicado engoliria uma e ninguém veria", () => {
    const inicio = ATE_ROTACAO;
    const ids = new Set<string>();
    for (let n = inicio; n < inicio + ROTACAO.length; n++) {
      ids.add(pelvicDoDia(n).sequenceId);
    }
    expect(ids).toEqual(new Set(ROTACAO));
    expect(ids.size).toBe(ROTACAO.length);
  });

  it("a rotação nunca volta pra identificação — base não se refaz", () => {
    for (let n = 17; n < 60; n++) {
      expect(pelvicDoDia(n).sequenceId).not.toBe("pelvic-identificacao");
      expect(pelvicDoDia(n).sequenceId).not.toBe("pelvic-soltura-identificacao");
    }
  });

  it("cada fase se anuncia — exercício cego não constrói nada", () => {
    for (const n of [0, 6, 12, 20]) {
      expect(pelvicDoDia(n).etapa.length).toBeGreaterThan(10);
    }
  });
});

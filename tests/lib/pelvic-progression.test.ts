import { describe, it, expect } from "vitest";
import {
  pelvicDoDia,
  ofertasDaVitalidade,
  PELVIC_ORDEM,
  ROTACAO,
  ATE_ROTACAO,
  OFERTA_VITALIDADE,
} from "../../src/lib/pelvic-progression";
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

  // O item diário do Hoje diz "Assoalho pélvico · 5 min · invisível, dá pra
  // fazer sentada" e cai às 10h, no trabalho. `pelvic-start-stop` (15 min,
  // masturbação, lubrificante) e `pelvic-receber-preparo` (10 min, entrada de
  // dedo) não cabem nessa promessa — servi-los por trás dela é mentira em cima
  // de exposição. Os dois saem pela página Vitalidade.
  it("a rotação do Hoje nunca serve start-stop nem preparo pra receber", () => {
    for (let n = 0; n < 200; n++) {
      const id = pelvicDoDia(n).sequenceId;
      expect({ n, id: OFERTA_VITALIDADE.includes(id as (typeof OFERTA_VITALIDADE)[number]) })
        .toEqual({ n, id: false });
    }
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

// Fecha o círculo que o teste do catálogo abria pela metade: ele provava que
// `PELVIC_ORDEM` cobre toda sequência `pelvic` do catálogo, e o teste da
// rotação provava que tudo em `ROTACAO` é alcançável — mas nada provava que
// tudo em `PELVIC_ORDEM` está em ALGUMA rota. Uma sequência nova entraria na
// ordem (o catálogo cobra), contaria em `contarPraticasPelvicas` movendo as
// fases, e nunca seria servida a ninguém.
describe("toda sequência tem um caminho até ela", () => {
  it("a união das duas rotas (Hoje + Vitalidade) é exatamente PELVIC_ORDEM", () => {
    const servidas = new Set<string>();
    // Uma volta inteira da rotação depois da fase 4 cobre todas as fases.
    for (let n = 0; n < ATE_ROTACAO + ROTACAO.length; n++) {
      servidas.add(pelvicDoDia(n).sequenceId);
    }
    for (const oferta of ofertasDaVitalidade(999, 0)) servidas.add(oferta.sequenceId);

    expect([...servidas].sort()).toEqual([...PELVIC_ORDEM].sort());
  });

  it("as duas rotas não se sobrepõem — nada é servido pelos dois caminhos", () => {
    const doHoje = new Set<string>();
    for (let n = 0; n < ATE_ROTACAO + ROTACAO.length; n++) doHoje.add(pelvicDoDia(n).sequenceId);
    for (const id of OFERTA_VITALIDADE) expect(doHoje.has(id)).toBe(false);
  });

  it("a oferta da Vitalidade é exatamente OFERTA_VITALIDADE — sem sequência escondida", () => {
    expect(ofertasDaVitalidade(999, 0).map((o) => o.sequenceId)).toEqual([...OFERTA_VITALIDADE]);
  });
});

// O alvo que a tela declara desde o primeiro dia é "2 a 3 vezes por semana,
// com pelo menos uma sendo start-stop". Na rotação da fase 4, o start-stop só
// aparecia na 18ª prática e depois 1 vez a cada 9 dias — a promessa era
// inalcançável por uns quatro meses. Oferecido por aqui, ele existe desde o
// dia 1 e a tela mostra se a semana já teve a dele.
describe("ofertasDaVitalidade", () => {
  it("start-stop está disponível desde a primeira prática — o alvo vale desde o dia 1", () => {
    const [startStop] = ofertasDaVitalidade(0, 0);
    expect(startStop.sequenceId).toBe("pelvic-start-stop");
    expect(startStop.disponivel).toBe(true);
  });

  it("diz que a semana ainda não teve sessão, e que ela não quebra o streak", () => {
    const [startStop] = ofertasDaVitalidade(30, 0);
    expect(startStop.nota).toMatch(/nenhuma nos últimos 7 dias/i);
    expect(startStop.nota).toMatch(/não quebra o streak/i);
  });

  it("conta as sessões da semana em vez de repetir o alvo no vazio", () => {
    expect(ofertasDaVitalidade(30, 1)[0].nota).toMatch(/1 sessão nos últimos 7 dias/i);
    expect(ofertasDaVitalidade(30, 2)[0].nota).toMatch(/2 sessões nos últimos 7 dias/i);
  });

  it("preparo pra receber só abre depois da fase 2 — soltar é o pré-requisito clínico", () => {
    const antes = ofertasDaVitalidade(9, 0)[1];
    const depois = ofertasDaVitalidade(10, 0)[1];
    expect(antes.sequenceId).toBe("pelvic-receber-preparo");
    expect(antes.disponivel).toBe(false);
    expect(antes.nota).toMatch(/9\/10/);
    expect(depois.disponivel).toBe(true);
  });

  it("contagem negativa ou absurda não quebra", () => {
    expect(ofertasDaVitalidade(-3, -1)[0].disponivel).toBe(true);
    expect(ofertasDaVitalidade(Number.NaN, Number.NaN)[1].disponivel).toBe(false);
  });
});

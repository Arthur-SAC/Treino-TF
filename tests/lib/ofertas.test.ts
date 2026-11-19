import { describe, it, expect } from "vitest";
import {
  ofertaDaVez, contagemLiberada, ESPERA_RECUSA_DIAS, unirRecusadas, unirFasesAceitas, unirFasesAceitasDesde,
  type EntradaOfertas,
} from "../../src/lib/ofertas";
import { unirDesbloqueios } from "../../src/lib/backup-io";
import { DESBLOQUEIOS } from "../../src/lib/desbloqueios";
import { ATE_FLEX_FASE_2, ATE_FLEX_FASE_3 } from "../../src/lib/flex-progression";
import { ATE_FASE_3, ATE_ROTACAO, SESSOES_DE_SOLTURA } from "../../src/lib/pelvic-progression";
import { ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4 } from "../../src/lib/rebolado-progression";
import { ATE_GINGADO } from "../../src/lib/postura-progression";
import { DEFAULTS } from "../../src/lib/settings-helpers";

const F1 = { flexManha: 1, flexNoite: 1, pelvica: 1, rebolado: 1, postura: 1 };
const ZERO = { flexManha: 0, flexNoite: 0, pelvica: 0, rebolado: 0, postura: 0 };
const todosAbertos = Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, "2026-11-01"]));

function base(p: Partial<EntradaOfertas> = {}): EntradaOfertas {
  return {
    hoje: "2026-11-19", ciclo: null, sequencia: 0, ja: {}, recusadas: {},
    contagens: ZERO, fasesAceitas: F1, fasesAceitasDesde: {}, ...p,
  };
}
const ciclo = { recommend: true, toCycle: "entrada-2" as const, reason: "bateu o piso" };

describe("ofertaDaVez", () => {
  it("nada a oferecer: null", () => {
    expect(ofertaDaVez(base())).toBeNull();
  });

  it("ciclo com recommend vence desbloqueio; id estável por ciclo-alvo", () => {
    const o = ofertaDaVez(base({ ciclo, sequencia: 30 }));
    expect(o).toMatchObject({ tipo: "ciclo", id: "ciclo:entrada-2", para: "entrada-2", praQue: "bateu o piso" });
  });

  it("ciclo sem recommend não oferece", () => {
    expect(ofertaDaVez(base({ ciclo: { ...ciclo, recommend: false } }))).toBeNull();
  });

  it("desbloqueio por patamar vence fase", () => {
    const o = ofertaDaVez(base({ sequencia: 5, contagens: { ...ZERO, flexManha: 40 } }));
    expect(o).toMatchObject({ tipo: "desbloqueio", id: "manha-completa" });
  });

  it("patamar alcançado e já aberto não oferece; fechado oferece", () => {
    const aberto = { "manha-completa": "2026-11-01", "assoalho-1": "2026-11-01" };
    expect(ofertaDaVez(base({ sequencia: 5, ja: aberto }))).toBeNull();
    expect(ofertaDaVez(base({ sequencia: 5, ja: { "manha-completa": "2026-11-01" } })))
      .toMatchObject({ tipo: "desbloqueio", id: "assoalho-1" });
  });

  it("[RF 5] backup antigo restaurado: ja unido não oferece o que já está aberto", () => {
    const aqui = { "manha-completa": "2026-11-10", "assoalho-1": "2026-11-10", "skincare-2": "2026-11-12", sentar: "2026-11-12", danca: "2026-11-12" };
    const backup = { "manha-completa": "2026-11-02" };
    const ja = unirDesbloqueios(aqui, backup);
    expect(ofertaDaVez(base({ sequencia: 10, ja }))).toBeNull();
  });

  it("nunca oferece alongamento-noite", () => {
    const sem = Object.fromEntries(DESBLOQUEIOS.filter((d) => d.id !== "alongamento-noite").map((d) => [d.id, "x"]));
    expect(ofertaDaVez(base({ sequencia: 99, ja: sem }))).toBeNull();
    // fechado e com patamar alcançado, ainda assim nunca vira oferta
    for (let s = 0; s <= 30; s++) {
      const o = ofertaDaVez(base({ sequencia: s, ja: {} }));
      expect(o && o.id).not.toBe("alongamento-noite");
    }
  });

  it("recusada há 3 dias pula pra próxima da fila; há 7 volta", () => {
    const r3 = ofertaDaVez(base({ sequencia: 5, recusadas: { "manha-completa": "2026-11-16" } }));
    expect(r3).toMatchObject({ id: "assoalho-1" });
    const r7 = ofertaDaVez(base({ sequencia: 5, recusadas: { "manha-completa": "2026-11-12" } }));
    expect(r7).toMatchObject({ id: "manha-completa" });
    expect(ESPERA_RECUSA_DIAS).toBe(7);
  });

  it("recusada hoje e chamada de novo no mesmo dia não volta (nem com hora no ISO)", () => {
    const e = base({ sequencia: 5, ja: { "assoalho-1": "x" }, recusadas: { "manha-completa": "2026-11-19T10:00:00.000Z" } });
    expect(ofertaDaVez(e)).toBeNull();
    expect(ofertaDaVez(e)).toBeNull();
  });

  it("dentro da mesma parte nunca pula: voz-2 não sai com voz-1 fechada", () => {
    const ja = { ...todosAbertos } as Record<string, string>;
    delete ja["voz-1"]; delete ja["voz-2"];
    expect(ofertaDaVez(base({ sequencia: 25, ja }))).toMatchObject({ id: "voz-1" });
    // voz-1 recusada: voz-2 continua esperando, não passa na frente
    expect(ofertaDaVez(base({ sequencia: 25, ja, recusadas: { "voz-1": "2026-11-19" } }))).toBeNull();
  });

  it("recusa de um não bloqueia partes diferentes", () => {
    const o = ofertaDaVez(base({ sequencia: 10, ja: { "manha-completa": "x", "assoalho-1": "x" }, recusadas: { "skincare-2": "2026-11-19" } }));
    expect(o).toMatchObject({ id: "sentar" });
  });

  it("fase: contagem alcança a próxima fase e a aceita segura", () => {
    const o = ofertaDaVez(base({ contagens: { ...ZERO, flexNoite: ATE_FLEX_FASE_2 } }));
    expect(o).toMatchObject({ tipo: "fase", trilha: "flexNoite", fase: 2, id: "fase:flexNoite-2" });
    expect(ofertaDaVez(base({ contagens: { ...ZERO, flexNoite: ATE_FLEX_FASE_2 - 1 } }))).toBeNull();
    expect(ofertaDaVez(base({ contagens: { ...ZERO, flexNoite: ATE_FLEX_FASE_2 }, fasesAceitas: { ...F1, flexNoite: 2 } }))).toBeNull();
  });

  it("fase recusada pula por 7 dias; ciclo recusado só vale pro mesmo alvo", () => {
    const c = { ...ZERO, postura: ATE_GINGADO };
    const ja = { postura: "x" };
    expect(ofertaDaVez(base({ ja, contagens: c, recusadas: { "fase:postura-2": "2026-11-18" } }))).toBeNull();
    expect(ofertaDaVez(base({ ja, contagens: c, recusadas: { "fase:postura-2": "2026-11-12" } }))).toMatchObject({ trilha: "postura", fase: 2 });
    expect(ofertaDaVez(base({ ciclo, recusadas: { "ciclo:entrada-2": "2026-11-19" } }))).toBeNull();
    expect(ofertaDaVez(base({ ciclo: { ...ciclo, toCycle: "entrada-3" }, recusadas: { "ciclo:entrada-2": "2026-11-19" } })))
      .toMatchObject({ id: "ciclo:entrada-3" });
  });
});

describe("contagemLiberada (ATE_* = práticas em que a fase seguinte COMEÇA)", () => {
  it("flexNoite: fase 1 segura em ATE_FLEX_FASE_2 - 1; fase 2 aceita libera", () => {
    expect(contagemLiberada("flexNoite", 40, F1)).toBe(ATE_FLEX_FASE_2 - 1);
    expect(contagemLiberada("flexNoite", 40, { ...F1, flexNoite: 2 })).toBe(40);
    expect(contagemLiberada("flexNoite", 100, { ...F1, flexNoite: 2 })).toBe(ATE_FLEX_FASE_3 - 1);
    expect(contagemLiberada("flexNoite", 100, { ...F1, flexNoite: 3 })).toBe(100);
    expect(contagemLiberada("flexManha", 10, F1)).toBe(10);
  });
  it("pelvica: fase 2 em 5 (ATE_FASE_3 - SESSOES_DE_SOLTURA), 3 em ATE_FASE_3, 4 em ATE_ROTACAO", () => {
    const ate2 = ATE_FASE_3 - SESSOES_DE_SOLTURA;
    expect(contagemLiberada("pelvica", 30, F1)).toBe(ate2 - 1);
    expect(contagemLiberada("pelvica", 30, { ...F1, pelvica: 2 })).toBe(ATE_FASE_3 - 1);
    expect(contagemLiberada("pelvica", 30, { ...F1, pelvica: 3 })).toBe(ATE_ROTACAO - 1);
    expect(contagemLiberada("pelvica", 30, { ...F1, pelvica: 4 })).toBe(30);
  });
  it("rebolado: 12 / 30 / 60", () => {
    expect(contagemLiberada("rebolado", 99, F1)).toBe(ATE_REBOLADO_FASE_2 - 1);
    expect(contagemLiberada("rebolado", 99, { ...F1, rebolado: 2 })).toBe(ATE_REBOLADO_FASE_3 - 1);
    expect(contagemLiberada("rebolado", 99, { ...F1, rebolado: 3 })).toBe(ATE_REBOLADO_FASE_4 - 1);
    expect(contagemLiberada("rebolado", 99, { ...F1, rebolado: 4 })).toBe(99);
  });
  it("postura: gingado em ATE_GINGADO", () => {
    expect(contagemLiberada("postura", 20, F1)).toBe(ATE_GINGADO - 1);
    expect(contagemLiberada("postura", 20, { ...F1, postura: 2 })).toBe(20);
  });
  it("abaixo do corte não muda nada", () => {
    expect(contagemLiberada("postura", 3, F1)).toBe(3);
  });
});

describe("settings e backup", () => {
  it("defaults", () => {
    expect(DEFAULTS.ofertasRecusadas).toEqual({});
    expect(DEFAULTS.fasesAceitas).toEqual(F1);
  });
  it("unirRecusadas: data mais recente por id", () => {
    expect(unirRecusadas({ a: "2026-11-05", b: "2026-11-01" }, { a: "2026-11-09", c: "2026-11-02" }))
      .toEqual({ a: "2026-11-09", b: "2026-11-01", c: "2026-11-02" });
  });
  it("unirFasesAceitas: maior por trilha", () => {
    expect(unirFasesAceitas({ ...F1, pelvica: 3 }, { ...F1, pelvica: 2, rebolado: 4 }))
      .toEqual({ ...F1, pelvica: 3, rebolado: 4 });
  });
});

// Revisão final 2026-11-19, item 1: aceitar tarde não pode pular a fase. A
// contagem crua sobe enquanto a fase está cortada; a fase aceita começa do
// início dela (contagem no aceite = `fasesAceitasDesde`).
describe("fase aceita começa do início dela", () => {
  const ate2 = ATE_FASE_3 - SESSOES_DE_SOLTURA;

  it("assoalho: recusa com 5, aceita com 12 -> primeira sessão da fase 2", () => {
    const aceitas = { ...F1, pelvica: 2 };
    expect(contagemLiberada("pelvica", 12, aceitas, { pelvica: 12 })).toBe(ate2);
    // cada prática nova depois do aceite anda uma sessão dentro da fase 2
    expect(contagemLiberada("pelvica", 13, aceitas, { pelvica: 12 })).toBe(ate2 + 1);
    // e o corte da fase 3 continua valendo
    expect(contagemLiberada("pelvica", 40, aceitas, { pelvica: 12 })).toBe(ATE_FASE_3 - 1);
  });

  it("sem `desde` gravado vale o início da fase aceita (comportamento de antes)", () => {
    expect(contagemLiberada("pelvica", 7, { ...F1, pelvica: 2 }, {})).toBe(7);
    expect(contagemLiberada("flexNoite", 40, { ...F1, flexNoite: 2 })).toBe(40);
  });

  it("vale pra flex, rebolado e postura", () => {
    expect(contagemLiberada("flexNoite", ATE_FLEX_FASE_2 + 9, { ...F1, flexNoite: 2 }, { flexNoite: ATE_FLEX_FASE_2 + 9 })).toBe(ATE_FLEX_FASE_2);
    expect(contagemLiberada("rebolado", ATE_REBOLADO_FASE_2 + 4, { ...F1, rebolado: 2 }, { rebolado: ATE_REBOLADO_FASE_2 + 4 })).toBe(ATE_REBOLADO_FASE_2);
    expect(contagemLiberada("postura", ATE_GINGADO + 6, { ...F1, postura: 2 }, { postura: ATE_GINGADO + 6 })).toBe(ATE_GINGADO);
  });

  it("a próxima fase só é oferecida quando a contagem LIBERADA chega ao início dela", () => {
    const ja = { "assoalho-1": "x", "assoalho-2": "x" };
    const aceitas = { ...F1, pelvica: 2 };
    // aceitou a fase 2 com 12 práticas cruas: a fase 3 (início ATE_FASE_3) não sai com 12
    expect(ofertaDaVez(base({ ja, contagens: { ...ZERO, pelvica: 12 }, fasesAceitas: aceitas, fasesAceitasDesde: { pelvica: 12 } }))).toBeNull();
    // sai quando as sessões dentro da fase 2 completam (12 + SESSOES_DE_SOLTURA)
    expect(ofertaDaVez(base({ ja, contagens: { ...ZERO, pelvica: 12 + SESSOES_DE_SOLTURA }, fasesAceitas: aceitas, fasesAceitasDesde: { pelvica: 12 } })))
      .toMatchObject({ tipo: "fase", trilha: "pelvica", fase: 3 });
  });

  it("backup: `desde` acompanha a trilha cuja fase venceu; empate, o maior", () => {
    const r = unirFasesAceitasDesde(
      { ...F1, pelvica: 3, rebolado: 2 }, { pelvica: 14, rebolado: 20 },
      { ...F1, pelvica: 2, rebolado: 2 }, { pelvica: 6, rebolado: 25 },
    );
    expect(r.pelvica).toBe(14);
    expect(r.rebolado).toBe(25);
    // lado sem `desde` vale o início da fase dele
    const s = unirFasesAceitasDesde({ ...F1, postura: 2 }, {}, { ...F1 }, { postura: 99 });
    expect(s.postura).toBe(ATE_GINGADO);
  });
});

// Item 2: oferta de fase só com a parte que serve a trilha aberta.
describe("oferta de fase precisa do desbloqueio da trilha", () => {
  const ate2 = ATE_FASE_3 - SESSOES_DE_SOLTURA;
  it("assoalho fase 2 não sai com assoalho-2 trancado", () => {
    expect(ofertaDaVez(base({ ja: { "assoalho-1": "x" }, contagens: { ...ZERO, pelvica: ate2 } }))).toBeNull();
    expect(ofertaDaVez(base({ ja: { "assoalho-1": "x", "assoalho-2": "x" }, contagens: { ...ZERO, pelvica: ate2 } })))
      .toMatchObject({ trilha: "pelvica", fase: 2 });
  });
  it("rebolado pede danca; postura pede postura; manhã pede manha-completa; noite já está aberta", () => {
    expect(ofertaDaVez(base({ contagens: { ...ZERO, rebolado: ATE_REBOLADO_FASE_2 } }))).toBeNull();
    expect(ofertaDaVez(base({ ja: { danca: "x" }, contagens: { ...ZERO, rebolado: ATE_REBOLADO_FASE_2 } }))).toMatchObject({ trilha: "rebolado" });
    expect(ofertaDaVez(base({ contagens: { ...ZERO, postura: ATE_GINGADO } }))).toBeNull();
    expect(ofertaDaVez(base({ ja: { postura: "x" }, contagens: { ...ZERO, postura: ATE_GINGADO } }))).toMatchObject({ trilha: "postura" });
    expect(ofertaDaVez(base({ contagens: { ...ZERO, flexManha: ATE_FLEX_FASE_2 } }))).toBeNull();
    expect(ofertaDaVez(base({ ja: { "manha-completa": "x" }, contagens: { ...ZERO, flexManha: ATE_FLEX_FASE_2 } }))).toMatchObject({ trilha: "flexManha" });
    expect(ofertaDaVez(base({ contagens: { ...ZERO, flexNoite: ATE_FLEX_FASE_2 } }))).toMatchObject({ trilha: "flexNoite" });
  });
});

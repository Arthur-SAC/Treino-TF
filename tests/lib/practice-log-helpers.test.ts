import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import {
  contarPraticasDaProgressao,
  contarPraticasDaSequencia,
  contarPraticasRecentes,
} from "../../src/lib/practice-log-helpers";
import { OFERTA_VITALIDADE, SEQUENCIA_DE_SOLTURA } from "../../src/lib/pelvic-progression";

beforeEach(async () => {
  await db.practiceLogs.clear();
});

describe("contarPraticasDaProgressao", () => {
  it("conta só as sequências de assoalho pélvico concluídas", async () => {
    await db.practiceLogs.add({ date: "2026-08-10", sequenceId: "pelvic-identificacao", completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-alternancia", completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-identificacao", completed: false });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "corporal-postura-sentar", completed: true });
    expect(await contarPraticasDaProgressao()).toBe(2);
  });

  // O laço que fechava sozinho: o start-stop está disponível desde o dia 1 na
  // página Vitalidade e entrava nesta conta. Dez sessões dele empurravam o
  // item do Hoje pra fase 3 — identificação e soltura puladas inteiras — e
  // abriam o preparo pra receber, que é o que dói sem soltura.
  it("nenhuma sequência da página Vitalidade move a progressão", async () => {
    for (const id of OFERTA_VITALIDADE) {
      for (let i = 0; i < 10; i++) {
        await db.practiceLogs.add({ date: "2026-08-11", sequenceId: id, completed: true });
      }
    }
    expect(await contarPraticasDaProgressao()).toBe(0);
  });
});

describe("contarPraticasDaSequencia", () => {
  it("conta as concluídas da sequência pedida, sem janela de tempo", async () => {
    await db.practiceLogs.add({ date: "2026-01-02", sequenceId: SEQUENCIA_DE_SOLTURA, completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: SEQUENCIA_DE_SOLTURA, completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: SEQUENCIA_DE_SOLTURA, completed: false });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-identificacao", completed: true });
    expect(await contarPraticasDaSequencia(SEQUENCIA_DE_SOLTURA)).toBe(2);
  });
});

// O alvo declarado da Vitalidade é "pelo menos uma sessão de start-stop por
// semana". Sem medir contra o registro real, a tela repetiria o alvo sem
// nunca saber se ele aconteceu.
describe("contarPraticasRecentes", () => {
  it("conta as sessões da sequência dentro da janela de 7 dias", async () => {
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-start-stop", completed: true });
    await db.practiceLogs.add({ date: "2026-08-06", sequenceId: "pelvic-start-stop", completed: true });
    expect(await contarPraticasRecentes("pelvic-start-stop", "2026-08-11")).toBe(2);
  });

  it("sessão mais velha que a janela não conta — a semana passada já passou", async () => {
    await db.practiceLogs.add({ date: "2026-08-01", sequenceId: "pelvic-start-stop", completed: true });
    expect(await contarPraticasRecentes("pelvic-start-stop", "2026-08-11")).toBe(0);
  });

  it("ignora outra sequência e sessão não concluída", async () => {
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-kegel-rapido", completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-start-stop", completed: false });
    expect(await contarPraticasRecentes("pelvic-start-stop", "2026-08-11")).toBe(0);
  });
});

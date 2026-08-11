import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { contarPraticasPelvicas, contarPraticasRecentes } from "../../src/lib/practice-log-helpers";

beforeEach(async () => {
  await db.practiceLogs.clear();
});

describe("contarPraticasPelvicas", () => {
  it("conta só as sequências de assoalho pélvico concluídas", async () => {
    await db.practiceLogs.add({ date: "2026-08-10", sequenceId: "pelvic-identificacao", completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-alternancia", completed: true });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "pelvic-identificacao", completed: false });
    await db.practiceLogs.add({ date: "2026-08-11", sequenceId: "corporal-postura-sentar", completed: true });
    expect(await contarPraticasPelvicas()).toBe(2);
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

import { describe, it, expect, beforeEach } from "vitest";
import { efeitoDaAcao, TIPOS_DE_ACAO } from "../../src/lib/lembretes/acao";
import { marcarFeito } from "../../src/hooks/useRoutineChecks";
import { db } from "../../src/lib/db";

const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

describe("efeitoDaAcao", () => {
  it("Feito marca o dia do lembrete, não hoje", () => {
    expect(efeitoDaAcao("feito", { dia: "2026-10-01", itemId: "alongamento-noite", rota: "/" }))
      .toEqual({ tipo: "marcar", dia: "2026-10-01", itemId: "alongamento-noite" });
  });
  it("Bebi soma 200 ml no dia do lembrete", () => {
    expect(efeitoDaAcao("bebi", { dia: "2026-10-01", rota: "/" })).toEqual({ tipo: "agua", dia: "2026-10-01", ml: 200 });
  });
  it("Deitei registra o sono no dia do lembrete", () => {
    expect(efeitoDaAcao("deitei", { dia: "2026-10-01", rota: "/" })).toEqual({ tipo: "sono", dia: "2026-10-01" });
  });
  it("toque simples abre a rota", () => {
    expect(efeitoDaAcao("tap", { rota: "/corpo/medidas" })).toEqual({ tipo: "abrir", rota: "/corpo/medidas" });
  });
  it("notificação antiga, sem extra, não faz nada", () => {
    expect(efeitoDaAcao("tap", undefined)).toBeNull();
    expect(efeitoDaAcao("feito", {})).toBeNull();
    expect(efeitoDaAcao("bebi", {})).toBeNull();
    expect(efeitoDaAcao("deitei", {})).toBeNull();
  });
});

describe("TIPOS_DE_ACAO", () => {
  it("rótulos não expõem nada na tela de bloqueio", () => {
    const rotulos = TIPOS_DE_ACAO.flatMap((t) => t.acoes.map((a) => a.title));
    expect(rotulos).toEqual(["Feito", "Bebi 200 ml", "Deitei"]);
    for (const r of rotulos) expect(r).not.toMatch(EXPOE);
  });
});

describe("marcarFeito", () => {
  beforeEach(async () => { await db.routineChecks.clear(); });
  it("é idempotente: duas vezes continua um registro feito", async () => {
    await marcarFeito("2026-10-01", "alongamento-noite");
    await marcarFeito("2026-10-01", "alongamento-noite");
    const todos = await db.routineChecks.toArray();
    expect(todos).toEqual([{ date: "2026-10-01", itemId: "alongamento-noite", done: true }]);
  });
});

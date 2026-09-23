import { describe, it, expect } from "vitest";
import { SHORTCUTS } from "../../src/components/ShortcutsGrid";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { NOTIFICACAO_NOITE } from "../../src/lib/notification-scheduler";

// Lê fonte como texto pelo Vite (?raw) — o tsconfig do projeto não tem tipos do Node.
const MANIFEST = Object.values(import.meta.glob("../../vite.config.ts", { query: "?raw", import: "default", eager: true }))[0] as string;
const MOVIMENTO = Object.values(import.meta.glob("../../src/pages/workout/MovementHome.tsx", { query: "?raw", import: "default", eager: true }))[0] as string;

// Auditoria de 2026-09-23: o Hoje fica aberto na tela, a notificação aparece na
// tela de bloqueio e o nome do app aparece no instalador — tudo isso é visível
// pra quem olhar o celular dela, num ambiente que não é receptivo. Mesma regra
// da aba "Vitalidade": o rótulo nunca descreve o que tem dentro.
const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

describe("rótulos visíveis não expõem a transição nem a intimidade", () => {
  it("os atalhos do Hoje", () => {
    const expostos = SHORTCUTS.filter((s) => EXPOE.test(`${s.label} ${s.sub}`)).map((s) => s.label);
    expect(expostos).toEqual([]);
  });

  it("os itens da rotina do Hoje, nos sete dias", () => {
    const expostos = [0, 1, 2, 3, 4, 5, 6].flatMap((dow) =>
      buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items)
        .filter((i) => EXPOE.test(`${i.label} ${i.subtitle ?? ""}`))
        .map((i) => `${dow}: ${i.id}`),
    );
    expect(expostos).toEqual([]);
  });

  it("a notificação da noite, que aparece na tela de bloqueio", () => {
    expect(`${NOTIFICACAO_NOITE.titulo} ${NOTIFICACAO_NOITE.corpo}`).not.toMatch(EXPOE);
  });

  it("o nome e a descrição do app no instalador", () => {
    const campos = [...MANIFEST.matchAll(/(?:name|short_name|description):\s*"([^"]*)"/g)].map((m) => m[1]);
    expect(campos.length).toBeGreaterThan(0);
    expect(campos.filter((c) => EXPOE.test(c))).toEqual([]);
  });

  it("os títulos de seção do Movimento — é o destino do card da manhã", () => {
    const titulos = [...MOVIMENTO.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map((m) => m[1]);
    expect(titulos.length).toBeGreaterThan(0);
    expect(titulos.filter((t) => /safad/i.test(t))).toEqual([]);
  });

  it("o atalho da Vitalidade abre a aba Vitalidade, não a rota antiga da Trilha", () => {
    expect(SHORTCUTS.find((s) => s.label === "Vitalidade")?.to).toBe("/vitalidade");
  });
});

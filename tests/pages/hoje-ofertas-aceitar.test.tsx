// Revisão final 2026-11-19 (itens 4, 7, 9 e 10): o "Aceitar" do card "Pronta
// pra próxima" pra ciclo e pra fase, o destaque sem a conversa de ciclo, a
// oferta que não pisca enquanto as configurações carregam e o horário da oferta
// pela noite já ajustada. O conselho de ciclo é falso aqui (o critério real
// tem os próprios testes): o que se testa é a tela.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { db } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { PROGRESSAO_PELVICA, ATE_FASE_3, SESSOES_DE_SOLTURA, pelvicDoDia, rotuloPelvicoDoDia } from "../../src/lib/pelvic-progression";
import { Today } from "../../src/pages/Today";
import { desbloquearTudo } from "../helpers/desbloquear";
import type { CycleAdvice } from "../../src/lib/cycle-advisor";

const conselho = vi.hoisted(() => ({ atual: null as CycleAdvice | null }));
vi.mock("../../src/hooks/useCycleAdvice", () => ({ useCycleAdvice: () => conselho.atual }));

const HOJE = "2026-11-18"; // quarta

beforeEach(async () => {
  conselho.atual = null;
  vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 10, 18, 9, 0) });
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.settings.put({ key: "sequenciaDesde", value: HOJE });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

afterEach(() => {
  vi.useRealTimers();
});

function abrir() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Today />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function praticasPelvicas(n: number) {
  await db.practiceLogs.bulkAdd(
    Array.from({ length: n }, () => ({ date: "2026-10-01", sequenceId: PROGRESSAO_PELVICA[0], completed: true, durationMin: 5 })) as never,
  );
}

/** Tudo aberto e todas as fases aceitas, menos o assoalho, que fica na 1. */
async function tudoMenosAssoalho() {
  await desbloquearTudo();
  await setSetting("fasesAceitas", { flexManha: 3, flexNoite: 3, pelvica: 1, rebolado: 4, postura: 2 });
}

describe("Aceitar o ciclo", () => {
  it("troca activeCycle e zera a contagem do ciclo no total de sessões", async () => {
    conselho.atual = { recommend: true, toCycle: "variacao", reason: "Você já fez o piso de sessões." };
    await db.workoutSessions.bulkAdd(
      ["2026-11-02", "2026-11-03", "2026-11-04"].map((date) => ({ date, templateId: "t", exercises: [], durationMin: 40 })),
    );
    abrir();
    expect(await screen.findByText("Próximo ciclo do treino")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));
    await waitFor(async () => expect(await getSetting("activeCycle")).toBe("variacao"));
    expect(await getSetting("cycleStartSessionCount")).toBe(3);
  });

  // Item 4: a oferta já cobre o ciclo; o destaque não repete (nem ignora o "Agora não").
  it("com o conselho de ciclo, o destaque não fala de ciclo", async () => {
    conselho.atual = { recommend: true, toCycle: "variacao", reason: "Você já fez o piso de sessões." };
    abrir();
    await screen.findByText("Próximo ciclo do treino");
    expect(screen.queryByText(/Hora de avançar o ciclo/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(() => expect(screen.queryByText("Pronta pra próxima")).not.toBeInTheDocument());
    expect(screen.queryByText(/Hora de avançar o ciclo/)).not.toBeInTheDocument();
  });
});

describe("Aceitar a fase", () => {
  it("assoalho recusado com 5 e aceito com 12: grava a fase e o desde, e o dia começa a fase 2", async () => {
    await tudoMenosAssoalho();
    await praticasPelvicas(12);
    abrir();
    expect(await screen.findByText("Assoalho pélvico: fase 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));
    await waitFor(async () => expect((await getSetting("fasesAceitas")).pelvica).toBe(2));
    expect((await getSetting("fasesAceitasDesde")).pelvica).toBe(12);
    // Primeira sessão da fase 2, não a última soltura.
    const inicio = rotuloPelvicoDoDia(pelvicDoDia(ATE_FASE_3 - SESSOES_DE_SOLTURA));
    await waitFor(() => expect(screen.getByText(inicio.subtitle)).toBeInTheDocument());
  });
});

/** Atrasa a leitura destas chaves: o resto do Hoje carrega antes delas, que
 *  é exatamente a janela em que o padrão ficava no lugar do valor salvo. */
function atrasarLeitura(chaves: string[]) {
  const original = db.settings.get.bind(db.settings);
  return vi.spyOn(db.settings, "get").mockImplementation(((k: unknown) => {
    if (typeof k === "string" && chaves.includes(k)) {
      return new Promise((r) => setTimeout(r, 40)).then(() => original(k));
    }
    return original(k as never);
  }) as never);
}

/** Vigia o documento desde o render: viu o card alguma vez? */
function vigiarCard(): { viu: () => boolean; parar: () => void } {
  let viu = false;
  const olhar = () => { if (document.body.textContent?.includes("Pronta pra próxima")) viu = true; };
  const obs = new MutationObserver(olhar);
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  return { viu: () => (olhar(), viu), parar: () => obs.disconnect() };
}

describe("a oferta espera as configurações carregarem (item 9)", () => {
  it("fase já aceita não pisca enquanto fasesAceitas carrega", async () => {
    await tudoMenosAssoalho();
    await setSetting("fasesAceitas", { flexManha: 3, flexNoite: 3, pelvica: 2, rebolado: 4, postura: 2 });
    await praticasPelvicas(ATE_FASE_3 - SESSOES_DE_SOLTURA);
    const espiao = atrasarLeitura(["fasesAceitas", "fasesAceitasDesde"]);
    const v = vigiarCard();
    abrir();
    await screen.findByText("Dormir");
    await new Promise((r) => setTimeout(r, 120));
    v.parar();
    espiao.mockRestore();
    expect(v.viu()).toBe(false);
  });

  it("oferta recusada hoje não pisca enquanto ofertasRecusadas carrega", async () => {
    await tudoMenosAssoalho();
    await praticasPelvicas(ATE_FASE_3 - SESSOES_DE_SOLTURA);
    await setSetting("ofertasRecusadas", { "fase:pelvica-2": HOJE });
    const espiao = atrasarLeitura(["ofertasRecusadas"]);
    const v = vigiarCard();
    abrir();
    await screen.findByText("Dormir");
    await new Promise((r) => setTimeout(r, 120));
    v.parar();
    espiao.mockRestore();
    expect(v.viu()).toBe(false);
  });
});

describe("horário da oferta pela noite ajustada (item 10)", () => {
  it("assoalho nível 1 com o alongamento da noite ajustado pras 20:40: entra às 21h01", async () => {
    // patamar 5: 5 dias úteis seguidos antes de hoje
    await setSetting("sequenciaDesde", "2026-11-11");
    await db.workoutSessions.bulkAdd(
      ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-16", "2026-11-17"].map((date) => ({
        date, templateId: "t", exercises: [], durationMin: 40,
      })),
    );
    await setSetting("desbloqueios", { "manha-completa": "2026-11-01", "alongamento-noite": "2026-11-01" });
    await setSetting("routineTimes", { "alongamento-noite": "20:40" });
    abrir();
    const card = (await screen.findByText("Assoalho pélvico nível 1")).closest("section") as HTMLElement;
    // 20:40 + 21 min de alongamento = 21:01 (a tabela diz 21:05)
    expect(within(card).getByText("às 21h01")).toBeInTheDocument();
  });
});

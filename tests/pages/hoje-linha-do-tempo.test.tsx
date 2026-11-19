// O Hoje em linha do tempo (spec 2026-11-19): uma lista só na ordem das horas,
// os blocos dela em roxo sem caixinha, o card "Pronta pra próxima" no topo e o
// "como fazer" da sequência abrindo na frente da tela em vez de navegar.
// O dia fica fixo numa quarta (só o Date é falso: timers falsos quebram o Dexie).
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { db } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { NUCLEO_IDS } from "../../src/lib/nucleo";
import { Today } from "../../src/pages/Today";
import { desbloquearTudo } from "../helpers/desbloquear";

const HOJE = "2026-11-18"; // quarta

beforeEach(async () => {
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
        <Route path="/treino/movimento/:id" element={<p>Tela do movimento</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const antes = (a: HTMLElement, b: HTMLElement) =>
  !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

/** 5 dias úteis seguidos antes de hoje: a sequência chega no patamar 5. */
async function sequenciaDe5() {
  await setSetting("sequenciaDesde", "2026-11-11");
  await db.workoutSessions.bulkAdd(
    ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-16", "2026-11-17"].map((date) => ({
      date, templateId: "t", exercises: [], durationMin: 40,
    })),
  );
}

describe("Hoje — uma lista só, na ordem das horas", () => {
  it("café, almoço, jantar e dormir aparecem nessa ordem, numa lista só", async () => {
    abrir();
    const lista = await screen.findByRole("list", { name: "Linha do tempo" });
    const cafe = within(lista).getByText("Café · montar marmita");
    const almoco = within(lista).getByText("Almoço");
    const jantar = within(lista).getByText(/^Jantar/);
    const dormir = within(lista).getByText("Dormir");
    expect(antes(cafe, almoco)).toBe(true);
    expect(antes(almoco, jantar)).toBe(true);
    expect(antes(jantar, dormir)).toBe(true);
    expect(screen.queryByText("Extras")).not.toBeInTheDocument();
  });

  it("o horário ajustado por ela decide a posição [RF 3]", async () => {
    await setSetting("routineTimes", { jantar: "11:00" });
    abrir();
    const lista = await screen.findByRole("list", { name: "Linha do tempo" });
    await waitFor(() => {
      expect(antes(within(lista).getByText(/^Jantar/), within(lista).getByText("Almoço"))).toBe(true);
    });
  });

  it("água continua visível, e o bloco Esta semana também [RF 2]", async () => {
    abrir();
    expect(await screen.findByText("Água")).toBeInTheDocument();
    expect(screen.getByText("Domingo · marmita da semana")).toBeInTheDocument();
  });

  it("o tempo com ela aparece sem caixinha e marcado como dela", async () => {
    abrir();
    const comEla = await screen.findByText("Noite livre");
    const linha = comEla.closest("[data-dela]");
    expect(linha).not.toBeNull();
    expect(within(linha as HTMLElement).queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /Noite livre/ })).toBeNull();
  });

  it("a contagem do núcleo continua, sem a caixa separada", async () => {
    abrir();
    const rotina = await screen.findByRole("list", { name: "Linha do tempo" });
    await within(rotina).findByText("Dormir");
    const total = Array.from(rotina.querySelectorAll("[data-item]"))
      .filter((el) => NUCLEO_IDS.has(el.getAttribute("data-item") ?? "")).length;
    expect(total).toBeGreaterThan(0);
    expect(screen.getByText(`0 de ${total}`)).toBeInTheDocument();
    expect(screen.getByText(/O que decide o seu prazo/)).toBeInTheDocument();
  });

  it("o treino continua levando pra tela da sessão", async () => {
    await db.workoutTemplates.put({ id: "t-qua", name: "Treino de quarta", dayOfWeek: 3, durationMin: 40, cycle: "adaptacao", exercises: [] });
    abrir();
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Treino do dia" }).getAttribute("href")).toBe("/treino/sessao/t-qua");
    });
  });
});

describe("Hoje — o alongamento abre na frente da tela", () => {
  it("tocar no alongamento abre a sequência em cima do Hoje, sem navegar", async () => {
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: /^Alongamento manhã/ }));
    const janela = await waitFor(() => {
      const el = document.body.querySelector(":scope > .fixed");
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(await within(janela).findByRole("button", { name: "Concluir" })).toBeInTheDocument();
    expect(screen.queryByText("Tela do movimento")).not.toBeInTheDocument();
  });

  it("Concluir grava a prática e marca o item", async () => {
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: /^Alongamento manhã/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Concluir" }));
    await waitFor(async () => {
      const logs = await db.practiceLogs.where("date").equals(HOJE).toArray();
      expect(logs.map((l) => l.sequenceId)).toEqual(["manha-curta-vacuum"]);
    });
    await waitFor(() => expect(document.body.querySelector(":scope > .fixed")).toBeNull());
    await waitFor(() => expect(screen.getByRole("checkbox", { name: /^marcar Alongamento manhã/ })).toBeChecked());
  });
});

describe("Hoje — Pronta pra próxima", () => {
  it("sem critério batido, não aparece", async () => {
    abrir();
    await screen.findByText("Dormir");
    expect(screen.queryByText("Pronta pra próxima")).not.toBeInTheDocument();
  });

  it("com a sequência no patamar, aparece no topo, antes da lista", async () => {
    await sequenciaDe5();
    abrir();
    const titulo = await screen.findByText("Pronta pra próxima");
    expect(screen.getByText("Alongamento da manhã completo")).toBeInTheDocument();
    expect(antes(titulo, screen.getByRole("list", { name: "Linha do tempo" }))).toBe(true);
  });

  it("Aceitar grava o desbloqueio com a data de hoje", async () => {
    await sequenciaDe5();
    abrir();
    await screen.findByText("Alongamento da manhã completo");
    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));
    await waitFor(async () => expect(await getSetting("desbloqueios")).toEqual({ "manha-completa": HOJE }));
  });

  it("Agora não grava a recusa e o card some (nenhum outro aviso hoje)", async () => {
    await sequenciaDe5();
    abrir();
    await screen.findByText("Alongamento da manhã completo");
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(async () => expect(await getSetting("ofertasRecusadas")).toEqual({ "manha-completa": HOJE }));
    await waitFor(() => expect(screen.queryByText("Pronta pra próxima")).not.toBeInTheDocument());
    expect(await getSetting("desbloqueios")).toEqual({});
  });

  it("parte da noite mostra o rodízio", async () => {
    await sequenciaDe5();
    await setSetting("desbloqueios", { "manha-completa": "2026-11-01" });
    abrir();
    expect(await screen.findByText("Assoalho pélvico nível 1")).toBeInTheDocument();
    expect(screen.getByText(/^Entra seg, ter, qua, qui e dom/)).toBeInTheDocument();
  });
});

describe("Hoje — o bloco da noite cabe em 30 min", () => {
  // Quarta com tudo aberto: skincare 3 min às 20h45, o alongamento logo depois
  // (21 min) e sobram 6 min pro rodízio — na quarta, o assoalho.
  it("o alongamento vem logo depois do skincare e só o item do rodízio da quarta entra", async () => {
    await desbloquearTudo();
    abrir();
    const along = await screen.findByRole("button", { name: /^Alongamento noite/ });
    expect(within(along).getByText("20h48")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /^Assoalho pélvico/ })).toBeInTheDocument();
    expect(screen.queryByText(/^Postura/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Voz/)).not.toBeInTheDocument();
  });
});

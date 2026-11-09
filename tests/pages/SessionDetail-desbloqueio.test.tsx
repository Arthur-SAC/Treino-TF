// Desbloqueio acontece (spec 2026-11-09, seção 8): finalizar o treino que bate
// o patamar mostra a vitória e, depois dela, uma placa "Parabéns" por item novo,
// na ordem da tabela. O dia fica fixo numa segunda (hojeISO mockado) porque fim
// de semana não conta na sequência e fake timers quebram o Dexie.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const HOJE = "2026-11-09"; // segunda
vi.mock("../../src/lib/today-date", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../src/lib/today-date")>();
  return { ...real, hojeISO: (d?: Date) => (d ? real.hojeISO(d) : HOJE) };
});

import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { Today } from "../../src/pages/Today";
import { PlacasProvider, aplicarDesbloqueios } from "../../src/hooks/usePlacas";
import { db, type Exercise, type WorkoutTemplate } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";

const mk = (id: string, name: string): Exercise => ({
  id, name, category: "gluteo", equipment: ["peso-corporal"], difficulty: "iniciante",
  description: "x", commonMistakes: [], exposureLevel: 2,
});

const tpl: WorkoutTemplate = {
  id: "t-desb", name: "Treino de teste", dayOfWeek: 1, durationMin: 40,
  exercises: [{ exerciseId: "ponte", sets: 1, repsTarget: "10-12", restSec: 0 }],
};

// Os 4 dias úteis antes da segunda 09/11.
const ANTERIORES = ["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];

async function abrirEFinalizar() {
  render(
    <MemoryRouter initialEntries={["/treino/sessao/t-desb"]}>
      <PlacasProvider>
        <Routes>
          <Route path="/treino/sessao/:templateId" element={<SessionDetail />} />
          <Route path="/" element={<p>Tela do Hoje</p>} />
        </Routes>
      </PlacasProvider>
    </MemoryRouter>,
  );
  await screen.findByText("Ponte");
  fireEvent.change(screen.getAllByPlaceholderText("reps")[0], { target: { value: "12" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar exercício" }));
  fireEvent.click(await screen.findByRole("button", { name: /Finalizar treino \(1/ }));
}

describe("SessionDetail — desbloqueio ao bater o patamar", () => {
  beforeEach(async () => {
    await db.exercises.put(mk("ponte", "Ponte"));
    await db.workoutTemplates.put({ ...tpl, exercises: tpl.exercises.map((e) => ({ ...e })) });
    await setSetting("sequenciaDesde", "2026-11-02");
    await db.workoutSessions.bulkAdd(ANTERIORES.map((date) => ({ date, templateId: "t", exercises: [], durationMin: 40 })));
  });

  it("vitória, depois manhã completa, depois assoalho nível 1, e grava as duas chaves com a data de hoje", async () => {
    await abrirEFinalizar();
    expect(await screen.findByText("Treino concluído")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar pro Hoje" }));

    expect(await screen.findByText("Parabéns, Alongamento da manhã completo desbloqueado")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("às 06:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

    expect(await screen.findByText("Parabéns, Assoalho pélvico nível 1 desbloqueado")).toBeInTheDocument();
    expect(screen.getByText("às 21:20")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    expect(await getSetting("desbloqueios")).toEqual({ "manha-completa": HOJE, "assoalho-1": HOJE });
  });

  it("no modo esteira, o horário vem da rotina do modo (assoalho às 21:45)", async () => {
    await setSetting("modoCaminhada", "esteira");
    await abrirEFinalizar();
    fireEvent.click(await screen.findByRole("button", { name: "Voltar pro Hoje" }));
    fireEvent.click(await screen.findByRole("button", { name: "Entendi" }));
    expect(await screen.findByText("Parabéns, Assoalho pélvico nível 1 desbloqueado")).toBeInTheDocument();
    expect(screen.getByText("às 21:45")).toBeInTheDocument();
  });
});

describe("save point", () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.routineChecks.clear();
    await db.mealPlans.clear();
    await db.settings.put({ key: "activeCycle", value: "adaptacao" });
    await db.mealPlans.add({ ...INITIAL_PLAN });
  });

  it("com skincare-2 aberto e sequência 0, nada tranca de novo e o Hoje mostra o Skincare noite", async () => {
    await setSetting("sequenciaDesde", "2026-10-01");
    await setSetting("desbloqueios", { "skincare-2": "2026-10-20" });
    expect(await aplicarDesbloqueios(0, HOJE)).toEqual([]);
    expect(await getSetting("desbloqueios")).toEqual({ "skincare-2": "2026-10-20" });

    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Skincare noite · 3 min")).toBeInTheDocument();
  });
});

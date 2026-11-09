import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { PlacasProvider } from "../../src/hooks/usePlacas";
import { db, type Exercise, type WorkoutTemplate } from "../../src/lib/db";
import { setSetting } from "../../src/lib/settings-helpers";
import { hojeISO } from "../../src/lib/today-date";

const mk = (id: string, name: string): Exercise => ({
  id, name, category: "gluteo", equipment: ["peso-corporal"], difficulty: "iniciante",
  description: "x", commonMistakes: [], exposureLevel: 2,
});

const tpl: WorkoutTemplate = {
  id: "t-vitoria", name: "Treino de teste", dayOfWeek: 1, durationMin: 40,
  exercises: [{ exerciseId: "ponte", sets: 1, repsTarget: "10-12", restSec: 0 }],
};

const matchMediaOriginal = window.matchMedia;

function reduzMovimento() {
  window.matchMedia = ((q: string) => ({
    matches: q.includes("prefers-reduced-motion"),
    media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

async function abrirEFinalizar() {
  render(
    <MemoryRouter initialEntries={["/treino/sessao/t-vitoria"]}>
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

beforeEach(async () => {
  await db.exercises.put(mk("ponte", "Ponte"));
  await db.workoutTemplates.put({ ...tpl, exercises: tpl.exercises.map((e) => ({ ...e })) });
  await setSetting("sequenciaDesde", hojeISO());
});

afterEach(() => {
  window.matchMedia = matchMediaOriginal;
});

describe("SessionDetail — placa de vitória ao finalizar", () => {
  it("finalizar mostra Treino concluído com a sequência em 1 e volta pro Hoje", async () => {
    await abrirEFinalizar();
    expect(await screen.findByText("Treino concluído")).toBeInTheDocument();
    expect(await screen.findByText("1")).toBeInTheDocument();
    expect(await screen.findByText("Tela do Hoje")).toBeInTheDocument();
  });

  it("com movimento reduzido, o número final aparece direto", async () => {
    reduzMovimento();
    await abrirEFinalizar();
    expect(await screen.findByText("Treino concluído")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("0")).toBeNull();
  });
});

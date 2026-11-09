import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { db, type Exercise, type WorkoutTemplate } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { hojeISO } from "../../src/lib/today-date";

const mk = (id: string, name: string): Exercise => ({
  id, name, category: "gluteo", equipment: ["peso-corporal"], difficulty: "iniciante",
  description: "x", commonMistakes: [], exposureLevel: 2,
});

const tpl: WorkoutTemplate = {
  id: "t-troca", name: "Treino de teste", dayOfWeek: 1, durationMin: 40,
  exercises: [
    { exerciseId: "abdutor-maquina", sets: 1, repsTarget: "15-20", restSec: 0, block: "maquina", substitutoId: "abducao-quadril-polia", notes: "Nota do aparelho original" },
    { exerciseId: "hip-thrust-maquina", sets: 1, repsTarget: "10-12", restSec: 0, block: "solo" },
  ],
};

async function abrir() {
  render(
    <MemoryRouter initialEntries={["/treino/sessao/t-troca"]}>
      <Routes><Route path="/treino/sessao/:templateId" element={<SessionDetail />} /></Routes>
    </MemoryRouter>,
  );
  await screen.findByText("Abdutora");
}

beforeEach(async () => {
  await db.settings.clear();
  await db.workoutSessions.clear();
  await db.exercises.clear();
  await db.workoutTemplates.clear();
  await db.exercises.bulkPut([
    mk("abdutor-maquina", "Abdutora"),
    mk("abducao-quadril-polia", "Abdução na polia"),
    mk("hip-thrust-maquina", "Hip thrust máquina"),
  ]);
  await db.workoutTemplates.put(tpl);
});

describe("SessionDetail — Ocupado e Não tem aqui", () => {
  it("Ocupado troca o nome pelo substituto e salva com o exerciseId do substituto", async () => {
    await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Ocupado" }));
    expect(await screen.findByText("Abdução na polia")).toBeInTheDocument();
    expect(screen.queryByText("Abdutora")).toBeNull();
    // unilateral herdado: o alvo vale pra cada lado
    expect(screen.getByText(/15-20 cada/)).toBeInTheDocument();
    fireEvent.change(screen.getAllByPlaceholderText("reps")[0], { target: { value: "15" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Salvar exercício" })[0]);
    await waitFor(async () => {
      const rows = await db.workoutSessions.toArray();
      expect(rows[0]?.exercises.map((e) => e.exerciseId)).toEqual(["abducao-quadril-polia"]);
    });
  });

  it("Ocupado não grava nada em settings e dá pra voltar pro original", async () => {
    await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Ocupado" }));
    await screen.findByText("Abdução na polia");
    expect(await getSetting("aparelhosAusentes")).toEqual([]);
    expect(await db.settings.get("aparelhosAusentes")).toBeUndefined();
    // no substituto por Ocupado não oferece Ocupado/Não tem aqui de novo
    expect(screen.queryByRole("button", { name: "Não tem aqui" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Voltar pro Abdutora" }));
    expect(await screen.findByText("Abdutora")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ocupado" })).toBeInTheDocument();
  });

  it("não mostra as notas do original no substituto", async () => {
    await abrir();
    expect(screen.getByText("Nota do aparelho original")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ocupado" }));
    await screen.findByText("Abdução na polia");
    expect(screen.queryByText("Nota do aparelho original")).toBeNull();
  });

  it("Não tem aqui grava o id em aparelhosAusentes e o template passa a mostrar o substituto", async () => {
    await abrir();
    fireEvent.click(screen.getByRole("button", { name: "Não tem aqui" }));
    expect(await screen.findByText("Abdução na polia")).toBeInTheDocument();
    expect(await getSetting("aparelhosAusentes")).toEqual(["abdutor-maquina"]);
    expect(screen.queryByText("Nota do aparelho original")).toBeNull();
  });

  it("no substituto aplicado por ausência não aparece Não tem aqui nem Ocupado", async () => {
    await setSetting("aparelhosAusentes", ["abdutor-maquina"]);
    render(
      <MemoryRouter initialEntries={["/treino/sessao/t-troca"]}>
        <Routes><Route path="/treino/sessao/:templateId" element={<SessionDetail />} /></Routes>
      </MemoryRouter>,
    );
    await screen.findByText("Abdução na polia");
    expect(screen.queryByRole("button", { name: "Não tem aqui" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ocupado" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Voltar pro/ })).toBeNull();
  });

  it("sessão salva com o substituto, reaberta, mostra o item como registrado", async () => {
    await db.workoutSessions.put({
      date: hojeISO(), templateId: "t-troca", durationMin: 40,
      exercises: [{ exerciseId: "abducao-quadril-polia", sets: [{ reps: 15, weight: 0 }] }],
    });
    render(
      <MemoryRouter initialEntries={["/treino/sessao/t-troca"]}>
        <Routes><Route path="/treino/sessao/:templateId" element={<SessionDetail />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Registrado/)).toBeInTheDocument();
    expect(screen.getByText(/Abdução na polia ✓/)).toBeInTheDocument();
  });
});

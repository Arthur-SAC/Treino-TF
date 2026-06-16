import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";

const todayISO = new Date().toISOString().slice(0, 10);
const todayDow = new Date().getDay();

describe("Today — cards de treino", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
  });

  it("mostra os cards de Presença e Caminhada/cardio zona 2", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Presença & intimidade")).toBeInTheDocument());
    expect(screen.getByText("Caminhada / cardio zona 2")).toBeInTheDocument();
  });

  it("o botão +10 min registra caminhada no dailyLog", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Caminhada / cardio zona 2")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /\+10 min/i }));
    await waitFor(async () => {
      const log = await db.dailyLog.get(todayISO);
      expect(log?.walkMin).toBe(10);
    });
  });

  it("exibe o propósito (purpose) do treino do dia quando há template", async () => {
    await db.workoutTemplates.put({
      id: "test-seg-gluteo",
      name: "Glúteo A (teste)",
      dayOfWeek: todayDow,
      durationMin: 50,
      cycle: "adaptacao",
      purpose: "Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum.",
      exercises: [],
    });
    await db.settings.put({ key: "activeCycle", value: "adaptacao" });

    render(<MemoryRouter><Today /></MemoryRouter>);
    const matches = await screen.findAllByText(/glúteo|cintura|quadril/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});

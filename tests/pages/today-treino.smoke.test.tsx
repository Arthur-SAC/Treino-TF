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

  it("mostra o item de treino do dia e o Seu tempo na rotina", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Treino do dia")).toBeInTheDocument());
    expect(screen.getByText(/Seu tempo/i)).toBeInTheDocument();
  });

  it("o botão +200 ml registra água no dailyLog", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("button", { name: /\+200 ml/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /\+200 ml/i }));
    await waitFor(async () => {
      const log = await db.dailyLog.get(todayISO);
      expect(log?.waterMl).toBe(200);
    });
  });

  it("exibe o treino do dia quando há template", async () => {
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
    const matches = await screen.findAllByText(/Glúteo A \(teste\)/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";
import { hojeISO } from "../../src/lib/today-date";

const todayISO = hojeISO();
const todayDow = new Date().getDay();

describe("Today — cards de treino", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
  });

  // Ancorado em itens presentes todo dia (Água/Seu tempo) — o item "Treino do dia"
  // só existe em dia de semana, então é coberto pelo teste de template abaixo.
  it("mostra itens estáveis da rotina (Água e Seu tempo)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Seu tempo/i)).toBeInTheDocument());
    expect(screen.getByText("Água")).toBeInTheDocument();
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

    // Em dia de semana, o item "Treino do dia" leva direto pra sessão do dia
    // (não pra aba Treino genérica).
    if (todayDow >= 1 && todayDow <= 5) {
      const link = screen.getByRole("link", { name: "Treino do dia" });
      expect(link.getAttribute("href")).toContain("/treino/sessao/test-seg-gluteo");
    }
  });
});

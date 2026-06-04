import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";

const todayISO = new Date().toISOString().slice(0, 10);

describe("Today — cards de treino", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
  });

  it("mostra os cards Postura e Caminhada", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Postura")).toBeInTheDocument());
    expect(screen.getByText("Caminhada")).toBeInTheDocument();
  });

  it("o botão +10 min registra caminhada no dailyLog", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Caminhada")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /\+10 min/i }));
    await waitFor(async () => {
      const log = await db.dailyLog.get(todayISO);
      expect(log?.walkMin).toBe(10);
    });
  });
});

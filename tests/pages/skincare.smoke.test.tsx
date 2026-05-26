import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SkincareHome } from "../../src/pages/beauty/SkincareHome";
import { db } from "../../src/lib/db";
import { seedBeauty } from "../../src/lib/beauty-seed";

beforeEach(async () => {
  await seedBeauty();
});

describe("Skincare smoke", () => {
  it("marca rotina como feita e registra no log", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/pele-cabelo/skincare"]}>
        <Routes>
          <Route path="/beleza/pele-cabelo/skincare" element={<SkincareHome />} />
        </Routes>
      </MemoryRouter>,
    );
    // Espera rotinas carregarem
    await waitFor(() => expect(screen.getByText(/Rosto · manhã/)).toBeInTheDocument());

    // Encontra todos os botões de checkbox (aria-label "Não feito")
    const buttons = await screen.findAllByLabelText("Não feito");
    fireEvent.click(buttons[0]);

    // Espera o log persistir
    await waitFor(async () => {
      const logs = await db.skincareLogs.toArray();
      const today = new Date().toISOString().slice(0, 10);
      const completed = logs.filter((l) => l.completed && l.date === today);
      expect(completed.length).toBeGreaterThanOrEqual(1);
    });
  });
});

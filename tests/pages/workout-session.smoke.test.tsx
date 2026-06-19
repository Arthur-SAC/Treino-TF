import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";

beforeEach(async () => {
  await seedDatabase();
});

describe("Workout session smoke", () => {
  it("registra uma sessão e ela vai pro DB", async () => {
    render(
      <MemoryRouter initialEntries={["/treino/sessao/seg-gluteo-mobilidade"]}>
        <Routes>
          <Route path="/treino/sessao/:templateId" element={<SessionDetail />} />
          <Route path="/treino" element={<div>treino home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText(/Glúteo A/)).toBeInTheDocument());
    expect(await screen.findByText(/Antes de começar/i)).toBeInTheDocument();

    // O primeiro exercício é cardio (por tempo): agora é só "Marcar feito", sem reps/peso
    const marcarFeito = await screen.findAllByRole("button", { name: /marcar feito/i });
    fireEvent.click(marcarFeito[0]);

    await waitFor(() => expect(screen.getByText(/Cardio leve .esteira ou bike. ✓/)).toBeInTheDocument());

    // Finaliza a sessão
    fireEvent.click(screen.getByRole("button", { name: /finalizar treino/i }));

    await waitFor(async () => {
      const sessions = await db.workoutSessions.toArray();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].templateId).toBe("seg-gluteo-mobilidade");
      expect(sessions[0].exercises).toHaveLength(1);
    });
  });
});

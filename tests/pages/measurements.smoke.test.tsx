import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Measurements } from "../../src/pages/body/Measurements";
import { db } from "../../src/lib/db";

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/corpo/medidas"]}>
      <Routes>
        <Route path="/corpo/medidas" element={<Measurements />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Measurements smoke", () => {
  it("salva uma medida e ela aparece no histórico", async () => {
    renderWithRouter();
    const findInput = (labelText: string) => {
      const labels = screen.getAllByText(labelText);
      const label = labels[labels.length - 1];
      const wrapper = label.parentElement!;
      return wrapper.querySelector("input") as HTMLInputElement;
    };
    fireEvent.change(findInput("Cintura"), { target: { value: "99" } });
    fireEvent.change(findInput("Quadril"), { target: { value: "114" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar medida/i }));
    await waitFor(() => {
      expect(screen.getByText(/Cintura: 99,0 cm/)).toBeInTheDocument();
      expect(screen.getByText(/Quadril: 114,0 cm/)).toBeInTheDocument();
      expect(screen.getByText(/WHR 0\.87/)).toBeInTheDocument();
    });
    const stored = await db.measurements.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].waistCm).toBe(99);
    expect(stored[0].hipCm).toBe(114);
  });

  // Revisão da entrega 2: a primeira medição vira a partida, e sem apagar um
  // erro de digitação ficava pra sempre. A lista também não mostrava peso nem
  // pescoço — justamente os campos que decidem a partida.
  describe("apagar medida", () => {
    beforeEach(async () => {
      await db.measurements.clear();
    });

    it("mostra peso e pescoço e apaga a medida depois de confirmar", async () => {
      await db.measurements.add({ date: "2026-09-24", weightKg: 96, waistCm: 40, neckCm: 99 } as never);
      const confirmar = vi.fn(() => true);
      window.confirm = confirmar;
      renderWithRouter();
      await waitFor(() => expect(screen.getByText(/Peso: 96/)).toBeInTheDocument());
      expect(screen.getByText(/Pescoço: 99,0 cm/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /apagar medida de/i }));
      await waitFor(async () => expect(await db.measurements.count()).toBe(0));
      expect(confirmar).toHaveBeenCalled();
    });

    it("não apaga se ela cancelar", async () => {
      await db.measurements.add({ date: "2026-09-24", weightKg: 96, waistCm: 99, neckCm: 40 } as never);
      window.confirm = vi.fn(() => false);
      renderWithRouter();
      await waitFor(() => expect(screen.getByText(/Peso: 96/)).toBeInTheDocument());
      fireEvent.click(screen.getByRole("button", { name: /apagar medida de/i }));
      expect(await db.measurements.count()).toBe(1);
    });
  });
});

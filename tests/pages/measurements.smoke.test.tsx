import { describe, it, expect } from "vitest";
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
});

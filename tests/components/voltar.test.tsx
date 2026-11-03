import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Voltar } from "../../src/components/Voltar";

// Sem histórico (abriu pelo lembrete, recarregou a página) o "voltar" não pode
// sumir nem levar pra lugar nenhum: cai no destino dado, com o nome dele.
describe("Voltar", () => {
  it("sem histórico, mostra o destino e leva até ele", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/voz"]}>
        <Routes>
          <Route path="/beleza/voz" element={<Voltar para="/guia" rotulo="Guia" />} />
          <Route path="/guia" element={<p>índice do guia</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Guia/ }));
    expect(await screen.findByText("índice do guia")).toBeInTheDocument();
  });
});

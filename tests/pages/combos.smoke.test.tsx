import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CombosView } from "../../src/pages/beauty/style/CombosView";
import { seedStyle } from "../../src/lib/style-seed";

beforeEach(async () => {
  await seedStyle();
});

describe("Combinações smoke", () => {
  it("renderiza combinações e filtra por contexto", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/combinacoes"]}>
        <Routes>
          <Route path="/beleza/estilo/combinacoes" element={<CombosView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Trabalho neutro")).toBeInTheDocument());
    // combinação livre aparece em "Todas"
    expect(screen.getByText("Noite com a noiva")).toBeInTheDocument();

    // filtra por Discreto → some a livre
    fireEvent.click(screen.getByRole("button", { name: "Discreto" }));
    await waitFor(() => expect(screen.queryByText("Noite com a noiva")).not.toBeInTheDocument());
    expect(screen.getByText("Trabalho neutro")).toBeInTheDocument();
  });
});

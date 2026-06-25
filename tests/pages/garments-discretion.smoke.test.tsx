import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { GarmentsView } from "../../src/pages/beauty/style/GarmentsView";
import { seedStyle } from "../../src/lib/style-seed";

beforeEach(async () => {
  await seedStyle();
});

describe("Peças — filtro discrição", () => {
  it("filtra por Discreto e mostra peça discreta", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/pecas"]}>
        <Routes>
          <Route path="/beleza/estilo/pecas" element={<GarmentsView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument());

    // saia rodada é "livre" → aparece em Todas
    expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument();

    // filtra Discreto → some a saia, fica a calça
    fireEvent.click(screen.getByRole("button", { name: "Discreto" }));
    await waitFor(() => expect(screen.queryByText("Saia rodada (godê / circle skirt)")).not.toBeInTheDocument());
    expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument();
  });
});

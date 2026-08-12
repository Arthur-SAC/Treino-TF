import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { GarmentsView } from "../../src/pages/beauty/style/GarmentsView";
import { seedStyle } from "../../src/lib/style-seed";

beforeEach(async () => {
  await seedStyle();
});

describe("Peças — filtro por modo", () => {
  it("filtra por Público e some o que é de casa", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/pecas"]}>
        <Routes>
          <Route path="/beleza/estilo/pecas" element={<GarmentsView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument());

    // a saia rodada é de casa → aparece quando o filtro está em "Todos"
    expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Público" }));
    await waitFor(() => expect(screen.queryByText("Saia rodada (godê / circle skirt)")).not.toBeInTheDocument());
    expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument();
  });

  // O modo Casa deixou de ser o balaio "livre", que juntava casa e íntimo: as
  // peças íntimas têm tela própria e não podem vazar pra cá.
  it("filtra por Casa e nenhuma peça íntima aparece", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/pecas"]}>
        <Routes>
          <Route path="/beleza/estilo/pecas" element={<GarmentsView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Casa" }));
    await waitFor(() =>
      expect(screen.queryByText("Calça de alfaiataria de cintura alta")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument();
    expect(screen.queryByText("Body de renda")).not.toBeInTheDocument();
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SkincarePlay } from "../../src/pages/beauty/SkincarePlay";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.skincareRoutines.clear();
});

describe("SkincarePlay smoke", () => {
  it("abre a rotina guiada no primeiro passo", async () => {
    const id = await db.skincareRoutines.add({
      name: "Rosto manhã",
      time: "morning",
      target: "face",
      steps: [
        { productName: "Sabonete facial", technique: "Massagem 30s", waitMin: 0 },
        { productName: "Vitamina C", technique: "4 gotas", waitMin: 2 },
      ],
    } as never);

    render(
      <MemoryRouter initialEntries={[`/beleza/pele-cabelo/skincare/${id}/tocar`]}>
        <Routes>
          <Route path="/beleza/pele-cabelo/skincare/:id/tocar" element={<SkincarePlay />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Rotina guiada")).toBeInTheDocument();
      expect(screen.getByText("Sabonete facial")).toBeInTheDocument();
    });
  });
});

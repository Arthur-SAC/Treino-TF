import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ComboDetail } from "../../src/pages/beauty/style/ComboDetail";
import { db, type Outfit } from "../../src/lib/db";

let id: number;

beforeEach(async () => {
  id = await db.outfits.add({
    name: "Combo teste",
    context: "discreto",
    occasion: "casual",
    pieces: ["calça cintura alta", "camiseta encorpada"],
    whyItWorks: "marca a cintura",
    silhouetteNote: "disfarça a barriga",
    status: "ideia",
  } as Outfit);
});

describe("ComboDetail smoke", () => {
  it("mostra a combinação e avança o status", async () => {
    render(
      <MemoryRouter initialEntries={[`/beleza/estilo/combinacoes/${id}`]}>
        <Routes>
          <Route path="/beleza/estilo/combinacoes/:id" element={<ComboDetail />} />
          <Route path="/beleza/estilo/combinacoes" element={<div>lista</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Combo teste")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Comprando" }));
    await waitFor(async () => {
      const updated = await db.outfits.get(id);
      expect(updated?.status).toBe("comprando");
    });
  });
});

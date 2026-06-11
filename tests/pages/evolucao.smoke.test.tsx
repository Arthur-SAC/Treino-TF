import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { EvolucaoView } from "../../src/pages/path/EvolucaoView";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.voicePracticeLogs.clear();
  await db.milestones.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/trilha/evolucao"]}>
      <Routes>
        <Route path="/trilha/evolucao" element={<EvolucaoView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EvolucaoView smoke", () => {
  it("renderiza o painel de evolução", async () => {
    await db.milestones.add({ datePlanned: "2026-06-01", title: "X", category: "voz", dateCompleted: "2026-06-02" } as never);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Evolução · últimos 30 dias/)).toBeInTheDocument();
      expect(screen.getByText(/Marcos concluídos/)).toBeInTheDocument();
    });
  });
});

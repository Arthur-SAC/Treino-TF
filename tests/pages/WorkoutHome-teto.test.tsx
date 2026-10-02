import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { WorkoutHome } from "../../src/pages/workout/WorkoutHome";

beforeEach(async () => {
  await db.settings.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
});

describe("WorkoutHome: progresso do teto do prédio", () => {
  it("com 2 exercícios no teto, mostra 2 de 4", async () => {
    await db.settings.put({ key: "tetoPredio", value: { "hip-thrust-barra": 100, "abdutor-maquina": 80 } });
    render(<MemoryRouter><WorkoutHome /></MemoryRouter>);
    expect(await screen.findByText(/Teto do prédio: 2 de 4/)).toBeInTheDocument();
  });

  it("com 0 no teto, não mostra a linha", async () => {
    render(<MemoryRouter><WorkoutHome /></MemoryRouter>);
    await screen.findByRole("heading", { name: "Treino" });
    await screen.findByText("Plano semanal");
    await new Promise((r) => setTimeout(r, 100));
    await waitFor(() => expect(screen.queryByText(/Teto do prédio/)).not.toBeInTheDocument());
  });
});

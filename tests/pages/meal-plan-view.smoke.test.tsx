import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { MealPlanView } from "../../src/pages/path/MealPlanView";

describe("MealPlanView", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.mealPlans.add(INITIAL_PLAN as never);
  });

  it("mostra macros, variantes e botão de exportar", async () => {
    render(<MemoryRouter><MealPlanView /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("2200")).toBeInTheDocument());
    expect(screen.getByText(/Caf[eé]/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar dieta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar pdf/i })).toBeInTheDocument();
  });
});

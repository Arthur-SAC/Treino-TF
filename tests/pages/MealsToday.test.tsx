import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { MealsToday } from "../../src/pages/path/MealsToday";

beforeEach(async () => {
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

describe("MealsToday", () => {
  it("mostra o modo de preparo (receita) da refeição", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    // a receita da variante padrão do café contém "Bate os ovos"
    expect(await screen.findByText(/Bate os ovos/i)).toBeInTheDocument();
  });
});

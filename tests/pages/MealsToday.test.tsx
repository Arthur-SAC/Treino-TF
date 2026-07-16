import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  it("abre o modo de preparo num card por cima com a receita", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    // a receita não aparece até abrir o card
    const botoes = await screen.findAllByRole("button", { name: /ver modo de preparo/i });
    fireEvent.click(botoes[0]); // café é a primeira refeição
    // a receita da variante padrão do café contém "Bate os ovos"
    expect(await screen.findByText(/Bate os ovos/i)).toBeInTheDocument();
  });

  it("não mostra a receita antes de abrir o card", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    await screen.findAllByRole("button", { name: /ver modo de preparo/i });
    expect(screen.queryByText(/Bate os ovos/i)).not.toBeInTheDocument();
  });
});

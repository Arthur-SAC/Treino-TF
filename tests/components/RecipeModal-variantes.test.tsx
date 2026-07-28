import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../src/lib/db";
import { seedPath } from "../../src/lib/path-seed";
import { RecipeModal } from "../../src/components/RecipeModal";

beforeEach(async () => {
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.settings.clear();
  await seedPath();
});

describe("RecipeModal — as três opções", () => {
  it("mostra as três variantes da refeição, com o rótulo de cada uma", async () => {
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    expect(opcoes).toHaveLength(3);
  });

  it("escolher uma variante grava a refeição do dia", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    const meals = await db.meals.toArray();
    const lanche = meals.find((m) => m.mealType === "lanche");
    expect(lanche).toBeDefined();
    expect(lanche!.foods.length).toBeGreaterThan(0);
  });

  it("escolher uma segunda vez atualiza o mesmo registro, sem duplicar", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    await user.click(opcoes[2]);
    const meals = await db.meals.toArray();
    const lanches = meals.filter((m) => m.mealType === "lanche");
    expect(lanches).toHaveLength(1);
  });

  it("mostra o modo de preparo dos itens da variante escolhida", async () => {
    render(<RecipeModal mealType="cafe" onClose={() => {}} />);
    expect(await screen.findByText(/modo de preparo/i)).toBeInTheDocument();
  });
});

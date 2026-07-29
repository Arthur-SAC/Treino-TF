import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../src/lib/db";
import { seedPath } from "../../src/lib/path-seed";
import { getActiveMealPlan } from "../../src/lib/meal-plan";
import { RecipeModal } from "../../src/components/RecipeModal";
import { hojeISO } from "../../src/lib/today-date";

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

  it("só expandir uma variante não grava nada", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    // expandiu (o modo de preparo da opção aparece), mas nada foi gravado
    await screen.findByRole("button", { name: /escolhi essa/i });
    const meals = await db.meals.toArray();
    expect(meals.find((m) => m.mealType === "lanche")).toBeUndefined();
  });

  it("expandir e confirmar 'Escolhi essa' grava a refeição do dia", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    await user.click(await screen.findByRole("button", { name: /escolhi essa/i }));
    const meals = await db.meals.toArray();
    const lanche = meals.find((m) => m.mealType === "lanche");
    expect(lanche).toBeDefined();
    expect(lanche!.foods.length).toBeGreaterThan(0);
  });

  it("confirmar uma segunda vez (outra opção) atualiza o mesmo registro, sem duplicar", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    let opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    await user.click(await screen.findByRole("button", { name: /escolhi essa/i }));

    opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[2]);
    await user.click(await screen.findByRole("button", { name: /escolhi essa/i }));

    const meals = await db.meals.toArray();
    const lanches = meals.filter((m) => m.mealType === "lanche");
    expect(lanches).toHaveLength(1);
  });

  it("mostra o modo de preparo dos itens da variante escolhida", async () => {
    render(<RecipeModal mealType="cafe" onClose={() => {}} />);
    expect(await screen.findByText(/modo de preparo/i)).toBeInTheDocument();
  });

  it("clicar em 'Escolhi essa' na variante já escolhida (checked: true) não regrava nem reseta o checked", async () => {
    // Estado inicial: a refeição de hoje já foi marcada como comida, com os
    // foods da primeira variante — exatamente como ficaria depois de um
    // "toggleMeal" em MealsToday ou de uma confirmação anterior no modal.
    const plan = await getActiveMealPlan();
    const slot = plan!.slots.find((s) => s.mealType === "lanche")!;
    const variantJaEscolhida = slot.variants[0];
    await db.meals.add({
      date: hojeISO(),
      mealType: "lanche",
      foods: variantJaEscolhida.foods,
      checked: true,
    });

    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);

    // A variante já escolhida abre expandida por padrão, então o botão de
    // confirmação dela já está visível sem precisar tocar no cabeçalho.
    const botaoConfirmar = await screen.findByRole("button", { name: /escolhi essa|escolhida hoje/i });
    await user.click(botaoConfirmar);

    const meals = await db.meals.toArray();
    const lanches = meals.filter((m) => m.mealType === "lanche");
    expect(lanches).toHaveLength(1);
    expect(lanches[0].checked).toBe(true);
  });
});

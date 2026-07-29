import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { EFFORT_LABEL } from "../../src/lib/meal-plan";
import { hojeISO } from "../../src/lib/today-date";
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
    const botoes = await screen.findAllByRole("button", { name: /modo de preparo/i });
    fireEvent.click(botoes[0]); // café é a primeira refeição
    // a receita da variante padrão do café contém "Bate os ovos"
    expect(await screen.findByText(/Bate os ovos/i)).toBeInTheDocument();
  });

  it("não mostra a receita antes de abrir o card", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    await screen.findAllByRole("button", { name: /modo de preparo/i });
    expect(screen.queryByText(/Bate os ovos/i)).not.toBeInTheDocument();
  });

  // A queixa original era um item que promete uma coisa e grava outra: marcar
  // a refeição sem ter escolhido variante gravava `plan.defaultMeals[i]` — a
  // opção 1 — sem dizer que era ela.
  it("diz qual opção está no card, e que é sugestão enquanto ela não escolheu", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    const sugestoes = await screen.findAllByText(/· sugestão/);
    expect(sugestoes).toHaveLength(4);
  });

  it("traz o selo de esforço, como as outras duas telas de refeição", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    await screen.findAllByText(/· sugestão/);
    const plan = INITIAL_PLAN;
    const esforcos = plan.slots.map((s) => s.variants[0].effort).filter(Boolean);
    expect(esforcos.length).toBeGreaterThan(0);
    for (const e of new Set(esforcos)) {
      expect(screen.getAllByText(EFFORT_LABEL[e!]).length).toBeGreaterThan(0);
    }
  });

  it("marcar grava exatamente os foods que o card mostra (a opção 1 do slot, não `defaultMeals` por índice)", async () => {
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    const caixas = await screen.findAllByLabelText("Não feito");
    fireEvent.click(caixas[0]); // café
    await waitFor(async () => {
      const gravada = (await db.meals.toArray()).find((m) => m.mealType === "cafe");
      expect(gravada?.foods).toEqual(INITIAL_PLAN.slots[0].variants[0].foods);
      expect(gravada?.checked).toBe(true);
    });
  });

  it("quando ela já escolheu uma opção, o card mostra o rótulo dela e some o 'sugestão'", async () => {
    const escolhida = INITIAL_PLAN.slots[2].variants[1]; // opção 2 do lanche
    await db.meals.add({ date: hojeISO(), mealType: "lanche", foods: escolhida.foods, checked: false });
    render(<MemoryRouter><MealsToday /></MemoryRouter>);
    expect(await screen.findByText(escolhida.label)).toBeInTheDocument();
    expect(screen.queryByText(`${escolhida.label} · sugestão`)).not.toBeInTheDocument();
  });
});

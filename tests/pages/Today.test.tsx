import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";

beforeEach(async () => {
  await db.routineChecks.clear();
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

describe("Today (backbone)", () => {
  it("renderiza os blocos da rotina do dia", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  it("mostra o item Seu tempo (desenho + leitura)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Seu tempo/i)).toBeInTheDocument();
  });

  it("abre a receita da refeição direto no Hoje (sem ir pra outra aba)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    const cafe = await screen.findByRole("button", { name: "Café + whey · montar marmita" });
    fireEvent.click(cafe);
    // a receita do café localizado (cuscuz sem manteiga) abre no próprio card
    expect((await screen.findAllByText(/Cuscuz de milho/i)).length).toBeGreaterThan(0);
  });
});

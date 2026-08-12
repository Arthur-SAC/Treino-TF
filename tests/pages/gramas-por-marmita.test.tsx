import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { MealPlanView } from "../../src/pages/path/MealPlanView";

// Ela monta as marmitas de almoço e jantar no domingo, na balança. Os gramas
// sempre existiram no dado (`qtyG`), mas a tela mostrava só o nome do alimento
// e o modo de preparo — para pesar a marmita ela teria que adivinhar a porção
// ou abrir o código. Dado que existe e não chega até ela é a mesma classe de
// falha que esta reforma vem perseguindo desde o começo.
describe("gramas de cada alimento na tela do plano", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.settings.clear();
    await db.measurements.clear();
    await db.mealPlans.add({ ...INITIAL_PLAN } as never);
  });

  it("mostra a porção em gramas mesmo dos alimentos cujo nome não traz a grama", async () => {
    render(
      <MemoryRouter>
        <MealPlanView />
      </MemoryRouter>,
    );
    // Espera o useLiveQuery liquidar: ler o DOM antes disso observa o primeiro
    // estado e passa verde com a implementação quebrada.
    await waitFor(() => expect(screen.getByText(/Plano padrão/)).toBeInTheDocument());

    const almoco1 = INITIAL_PLAN.slots.find((s) => s.mealType === "almoco")!.variants[0];
    await userEvent.click(screen.getByRole("button", { name: new RegExp(almoco1.label.slice(0, 20)) }));

    // O alvo é justamente o alimento cujo NOME não diz a porção — "Salada de
    // folhas e tomate", 150g. Testar pelo frango não provaria nada: o nome dele
    // já é "Frango grelhado (180g)", então o número apareceria na tela mesmo
    // sem a implementação existir.
    const mudos = almoco1.foods.filter((f) => !f.name.includes(String(f.qtyG)));
    expect(mudos.length).toBeGreaterThan(0);
    for (const f of mudos) {
      await waitFor(() =>
        expect(screen.getAllByText(new RegExp(`\\b${f.qtyG}\\s*g\\b`)).length).toBeGreaterThan(0),
      );
    }
  });
});

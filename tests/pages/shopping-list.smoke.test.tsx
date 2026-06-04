import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { ShoppingList } from "../../src/pages/path/ShoppingList";

describe("ShoppingList", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.mealPlans.add(INITIAL_PLAN as never);
  });

  it("mostra itens agregados por categoria", async () => {
    render(<MemoryRouter><ShoppingList /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Ovos/i)).toBeInTheDocument());
    expect(screen.getByText(/prote[ií]na/i)).toBeInTheDocument();
  });
});

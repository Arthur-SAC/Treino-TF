import { describe, it, expect } from "vitest";
import { renderDietMarkdown, renderDietHtml, assertNeutral, FORBIDDEN_TERMS } from "../../src/lib/diet-export";
import { buildShoppingList } from "../../src/lib/shopping-list";
import type { MealPlan } from "../../src/lib/db";

const plan: MealPlan = {
  name: "Plano amazona transição feminizante", // nome "sujo" de propósito
  goal: "deficit",
  kcalDaily: 2200,
  proteinG: 180,
  carbG: 210,
  fatG: 70,
  defaultMeals: [],
  slots: [
    {
      mealType: "cafe",
      targetKcal: 500,
      variants: [
        {
          id: "cafe-1", label: "Opção 1 · Ovos",
          foods: [{ name: "Ovos mexidos", qtyG: 165, kcal: 230, proteinG: 18,
            preparation: "Mexe na frigideira 3 min." }],
          ingredients: [{ item: "Ovos", qty: 3, unit: "un", category: "proteina" }],
        },
      ],
    },
  ],
};

describe("assertNeutral", () => {
  it("returns the original text unchanged for clean input", () => {
    const clean = "Plano alimentar — emagrecimento\nOvos mexidos — 230 kcal";
    expect(assertNeutral(clean)).toBe(clean);
  });

  it("throws when input contains a forbidden term", () => {
    expect(() => assertNeutral("dieta feminina pra transição")).toThrow(
      /diet export leaked a forbidden term/i,
    );
  });
});

describe("renderDietMarkdown", () => {
  const md = renderDietMarkdown(plan, buildShoppingList(plan));

  it("NÃO vaza nenhum termo de transição (mesmo se o nome do plano tiver)", () => {
    const lower = md.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      expect(lower).not.toContain(term);
    }
  });

  it("usa título neutro de emagrecimento", () => {
    expect(md).toContain("Plano alimentar");
    expect(md.toLowerCase()).toContain("emagrec");
  });

  it("inclui os períodos, receitas e a lista de compras", () => {
    expect(md).toContain("Café da manhã");
    expect(md).toContain("Ovos mexidos");
    expect(md).toContain("Mexe na frigideira"); // receita/preparo
    expect(md).toContain("Lista de compras");
    expect(md).toContain("Ovos"); // ingrediente
  });
});

describe("renderDietHtml", () => {
  const html = renderDietHtml(plan, buildShoppingList(plan));

  it("NÃO vaza nenhum termo de transição no HTML", () => {
    const lower = html.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      expect(lower).not.toContain(term);
    }
  });

  it("contém <h1> e o título neutro", () => {
    expect(html).toContain("<h1>");
    expect(html).toContain("Plano alimentar");
  });

  it("escapa & nos conteúdos injetados em tags HTML", () => {
    const planWithAmpersand: MealPlan = {
      ...plan,
      slots: [
        {
          mealType: "cafe",
          targetKcal: 500,
          variants: [
            {
              id: "cafe-amp",
              label: "Opção & teste",
              foods: [{ name: "Pão integral", qtyG: 50, kcal: 130, proteinG: 4 }],
              ingredients: [],
            },
          ],
        },
      ],
    };
    const ampHtml = renderDietHtml(planWithAmpersand, buildShoppingList(planWithAmpersand));
    expect(ampHtml).toContain("&amp;");
    expect(ampHtml).not.toContain("& teste");
  });
});

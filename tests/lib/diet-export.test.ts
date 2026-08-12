import { describe, it, expect } from "vitest";
import { renderDietMarkdown, renderDietHtml, assertNeutral, FORBIDDEN_TERMS } from "../../src/lib/diet-export";
import { buildShoppingList, buildWeeklyShoppingList } from "../../src/lib/shopping-list";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
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

// A tela de compras passou a fechar a semana inteira, mas o PDF e o markdown
// exportados continuavam levando a lista de uma rodada só — e é o PDF que ela
// leva pro mercado. Duas quantidades diferentes pro mesmo item, saindo do mesmo
// app, é exatamente a classe de contradição que esta reforma existe pra tirar.
describe("o que sai exportado é o mesmo que a tela mostra", () => {
  it("o alimento leva a porção pesada, não só o nome e as kcal", () => {
    const md = renderDietMarkdown(
      { ...INITIAL_PLAN, id: 1 } as MealPlan,
      buildWeeklyShoppingList({ ...INITIAL_PLAN, id: 1 } as MealPlan),
    );
    const almoco1 = INITIAL_PLAN.slots.find((s) => s.mealType === "almoco")!.variants[0];
    // O alvo é o alimento cujo NOME não diz a porção — testar pelo frango
    // ("Frango grelhado (180g)") aprovaria a ausência da implementação.
    const mudo = almoco1.foods.find((f) => !f.name.includes(String(f.qtyG)))!;
    expect(md).toContain(`${mudo.name} — ${mudo.qtyG} g`);
  });

  it("a lista de compras exportada é a da semana, a mesma da tela", () => {
    const plano = { ...INITIAL_PLAN, id: 1 } as MealPlan;
    const semana = buildWeeklyShoppingList(plano);
    const md = renderDietMarkdown(plano, semana);
    for (const item of semana) {
      expect(md).toContain(`${item.item} — ${item.qty} ${item.unit}`);
    }
  });
});

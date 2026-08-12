import { describe, it, expect } from "vitest";
import { buildWeeklyShoppingList, PORCOES_POR_SEMANA } from "../../src/lib/shopping-list";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import type { MealPlan } from "../../src/lib/db";

const plano = { ...INITIAL_PLAN, id: 1 } as MealPlan;

// A lista antiga somava uma porção de cada variante e mandava "multiplicar
// conforme a semana" — ou seja, deixava a conta pra ela fazer de cabeça no
// corredor do mercado, com o carrinho na mão. Refeição tem 3 ou 5 opções por
// período, então o multiplicador nem é o mesmo entre as categorias: é 7/3 no
// almoço e 7/5 no café. Ninguém faz isso em pé.
describe("lista de compras da semana", () => {
  it("cobre uma refeição de cada período por dia da semana", () => {
    expect(PORCOES_POR_SEMANA).toBe(7);
  });

  it("compra mais do que a lista de uma rodada só — a semana tem 7 dias", () => {
    const semana = buildWeeklyShoppingList(plano);
    const ovos = semana.find((i) => i.item === "Ovos")!;
    // Café tem 5 opções; 3 delas levam ovo. Uma rodada só cobriria 5 cafés.
    expect(ovos.qtyExata).toBeGreaterThan(7);
  });

  it("arredonda pra cima — no mercado não se compra 2,3 ovos", () => {
    const semana = buildWeeklyShoppingList(plano);
    for (const i of semana) {
      expect(Number.isInteger(i.qty)).toBe(true);
      expect(i.qty).toBeGreaterThanOrEqual(i.qtyExata);
    }
  });

  it("arredonda peso e volume em múltiplos de 50 — é como o produto é vendido", () => {
    const semana = buildWeeklyShoppingList(plano);
    const porPeso = semana.filter((i) => i.unit === "g" || i.unit === "ml");
    expect(porPeso.length).toBeGreaterThan(0);
    expect(porPeso.filter((i) => i.qty % 50 !== 0)).toEqual([]);
  });

  it("traz os ingredientes do cardápio novo", () => {
    const itens = buildWeeklyShoppingList(plano).map((i) => i.item.toLowerCase());
    expect(itens.some((i) => i.includes("atum"))).toBe(true);
    expect(itens.some((i) => i.includes("castanha de caju"))).toBe(true);
    expect(itens.some((i) => i.includes("feijão de corda"))).toBe(true);
  });

  it("continua ordenada por categoria e item, como a lista de uma rodada", () => {
    const semana = buildWeeklyShoppingList(plano);
    const chaves = semana.map((i) => `${i.category}|${i.item}`);
    expect(chaves).toEqual([...chaves].sort());
  });
});

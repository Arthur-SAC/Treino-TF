import type { MealPlan } from "../lib/db";

// 2200 kcal — superávit leve pra ganho gradual de glúteo + tônus geral
// Proteína 1.8g/kg pra ~70kg = ~126g, arredondado pra 130g
// Gordura 25% das kcal = ~60g
// Carbo: resto = ~280g
export const INITIAL_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano padrão · ganho de glúteo gradual",
  kcalDaily: 2200,
  proteinG: 130,
  carbG: 280,
  fatG: 60,
  defaultMeals: [
    // Café
    [
      { name: "Ovos (2 unidades)", qtyG: 100, kcal: 155, proteinG: 13, carbG: 1, fatG: 11 },
      { name: "Pão integral (2 fatias)", qtyG: 50, kcal: 130, proteinG: 5, carbG: 24, fatG: 2 },
      { name: "Banana (1 unidade)", qtyG: 120, kcal: 105, proteinG: 1, carbG: 27, fatG: 0 },
      { name: "Café preto", qtyG: 200, kcal: 2, proteinG: 0, carbG: 0, fatG: 0 },
    ],
    // Almoço
    [
      { name: "Frango grelhado (150g)", qtyG: 150, kcal: 250, proteinG: 47, carbG: 0, fatG: 5 },
      { name: "Arroz integral (1 xícara cozido)", qtyG: 200, kcal: 215, proteinG: 5, carbG: 45, fatG: 2 },
      { name: "Feijão (1 concha)", qtyG: 100, kcal: 95, proteinG: 7, carbG: 16, fatG: 0 },
      { name: "Salada verde + azeite (1 colher)", qtyG: 150, kcal: 130, proteinG: 2, carbG: 5, fatG: 12 },
    ],
    // Lanche
    [
      { name: "Whey protein (1 scoop)", qtyG: 30, kcal: 120, proteinG: 24, carbG: 3, fatG: 1 },
      { name: "Aveia (3 colheres)", qtyG: 30, kcal: 115, proteinG: 4, carbG: 20, fatG: 2 },
      { name: "Leite (200ml)", qtyG: 200, kcal: 100, proteinG: 7, carbG: 9, fatG: 4 },
    ],
    // Jantar
    [
      { name: "Salmão grelhado (150g)", qtyG: 150, kcal: 310, proteinG: 32, carbG: 0, fatG: 20 },
      { name: "Batata doce assada", qtyG: 150, kcal: 130, proteinG: 2, carbG: 30, fatG: 0 },
      { name: "Brócolis cozido", qtyG: 100, kcal: 35, proteinG: 3, carbG: 7, fatG: 0 },
    ],
  ],
};

import type { MealPlan, MealSlot } from "../lib/db";
import { deriveDefaultMeals } from "../lib/meal-plan";

// 2200 kcal pra déficit moderado — 96kg, 27 anos, 1,73m
// Proteína ~180g · Gordura ~70g · Carbo ~210g · ~0,5-0,7 kg/semana
// Receitas brasileiras baratas e práticas (<20min). Variante 0 = base do dia.
const SLOTS: MealSlot[] = [
  // ─── CAFÉ DA MANHÃ (~500 kcal) ────────────────────────────────────────────
  {
    mealType: "cafe",
    targetKcal: 500,
    variants: [
      {
        id: "cafe-1",
        label: "Opção 1 · Ovos mexidos & pão integral",
        foods: [
          {
            name: "Ovos mexidos (3 un)",
            qtyG: 165,
            kcal: 230,
            proteinG: 18,
            carbG: 1,
            fatG: 16,
            preparation:
              "Bate os ovos com pitada de sal. Frigideira antiaderente em fogo médio-baixo com 1 cc de azeite. Mexe constantemente ~3 min até ficar cremoso e úmido.",
          },
          {
            name: "Pão integral (2 fatias)",
            qtyG: 60,
            kcal: 160,
            proteinG: 6,
            carbG: 28,
            fatG: 2,
            preparation:
              "Tosta na frigideira seca 1 min cada lado até dourar levemente.",
          },
          {
            name: "Banana média",
            qtyG: 120,
            kcal: 100,
            proteinG: 1,
            carbG: 24,
            fatG: 0,
            preparation: "Come ao natural ou amassada em cima do pão.",
          },
          {
            name: "Café preto sem açúcar",
            qtyG: 200,
            kcal: 2,
            proteinG: 0,
            carbG: 0,
            fatG: 0,
            preparation: "Coa normal, sem açúcar.",
          },
        ],
        ingredients: [
          { item: "Ovos", qty: 3, unit: "un", category: "proteina" },
          { item: "Pão integral", qty: 60, unit: "g", category: "carboidrato" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Azeite", qty: 5, unit: "ml", category: "gordura" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "cafe-2",
        label: "Opção 2 · Tapioca com ovo e queijo",
        foods: [
          {
            name: "Tapioca (2 unidades, ~70g goma)",
            qtyG: 70,
            kcal: 220,
            proteinG: 1,
            carbG: 54,
            fatG: 0,
            preparation:
              "Espalha ~35g de goma hidratada em frigideira antiaderente quente. Espera firmar (~2 min), vira delicadamente, recheie e dobre.",
          },
          {
            name: "Ovo mexido (2 un) com queijo branco (30g)",
            qtyG: 140,
            kcal: 220,
            proteinG: 20,
            carbG: 1,
            fatG: 14,
            preparation:
              "Bate 2 ovos com sal, adiciona queijo branco amassado. Frigideira antiaderente, mexe em fogo médio ~2 min. Recheia a tapioca.",
          },
          {
            name: "Café preto sem açúcar",
            qtyG: 200,
            kcal: 2,
            proteinG: 0,
            carbG: 0,
            fatG: 0,
            preparation: "Coa normal, sem açúcar.",
          },
        ],
        ingredients: [
          { item: "Goma de tapioca", qty: 70, unit: "g", category: "carboidrato" },
          { item: "Ovos", qty: 2, unit: "un", category: "proteina" },
          { item: "Queijo branco", qty: 30, unit: "g", category: "laticinio" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "cafe-3",
        label: "Opção 3 · Aveia, whey, banana & leite",
        foods: [
          {
            name: "Aveia em flocos (5 colheres de sopa)",
            qtyG: 50,
            kcal: 188,
            proteinG: 7,
            carbG: 34,
            fatG: 4,
            preparation:
              "Pode comer crua na vitamina ou cozinhar 3 min com leite e canela (mingau).",
          },
          {
            name: "Whey protein (1 scoop)",
            qtyG: 30,
            kcal: 120,
            proteinG: 24,
            carbG: 3,
            fatG: 1,
            preparation:
              "Dissolve na vitamina ou no leite morno se preferir mingau proteico.",
          },
          {
            name: "Banana média",
            qtyG: 120,
            kcal: 100,
            proteinG: 1,
            carbG: 24,
            fatG: 0,
            preparation: "Bate no liquidificador com os outros ingredientes.",
          },
          {
            name: "Leite desnatado (200ml)",
            qtyG: 200,
            kcal: 70,
            proteinG: 7,
            carbG: 10,
            fatG: 0,
            preparation:
              "Base da vitamina. Bate tudo no liquidificador com gelo — pronto em 30s.",
          },
        ],
        ingredients: [
          { item: "Aveia em flocos", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Leite desnatado", qty: 200, unit: "ml", category: "laticinio" },
        ],
      },
    ],
  },

  // ─── ALMOÇO (~650 kcal) ───────────────────────────────────────────────────
  {
    mealType: "almoco",
    targetKcal: 650,
    variants: [
      {
        id: "almoco-1",
        label: "Opção 1 · Frango grelhado, arroz integral & feijão",
        foods: [
          {
            name: "Frango grelhado (180g)",
            qtyG: 180,
            kcal: 297,
            proteinG: 56,
            carbG: 0,
            fatG: 7,
            preparation:
              "Tempera com sal, pimenta, alho amassado e suco de limão. Marina 10 min. Frigideira em fogo alto com 1/2 cc de azeite, grelha 4-5 min cada lado. Não fura com garfo.",
          },
          {
            name: "Arroz integral cozido (150g)",
            qtyG: 150,
            kcal: 163,
            proteinG: 3,
            carbG: 34,
            fatG: 1,
            preparation:
              "Refoga alho em 1 cc de azeite, adiciona arroz, cobre com água (2:1). Fogo baixo, tampado, 25-30 min.",
          },
          {
            name: "Feijão carioca (1 concha, 100g)",
            qtyG: 100,
            kcal: 95,
            proteinG: 7,
            carbG: 16,
            fatG: 1,
            preparation:
              "Pressão: feijão de molho 4h + alho + cebola + louro. 20-25 min após pegar pressão. Sal só no final.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 40,
            proteinG: 2,
            carbG: 7,
            fatG: 0,
            preparation:
              "Lava folhas (molho de vinagre 10 min), pica tomate em cubos, pepino em rodelas. Mistura na hora.",
          },
          {
            name: "Azeite extra-virgem (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Rega a salada na hora de servir com suco de limão.",
          },
        ],
        ingredients: [
          { item: "Peito de frango", qty: 180, unit: "g", category: "proteina" },
          { item: "Arroz integral", qty: 80, unit: "g", category: "carboidrato" },
          { item: "Feijão carioca", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Pepino", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "almoco-2",
        label: "Opção 2 · Carne moída patinho, arroz & abóbora",
        foods: [
          {
            name: "Carne moída patinho (150g)",
            qtyG: 150,
            kcal: 242,
            proteinG: 35,
            carbG: 0,
            fatG: 12,
            preparation:
              "Refoga 1/2 cebola + 2 dentes alho em 1 cs de azeite. Adiciona carne, sal, pimenta, 1 cs molho de tomate. Mexe ~7 min até dourar e secar.",
          },
          {
            name: "Arroz branco cozido (150g)",
            qtyG: 150,
            kcal: 195,
            proteinG: 4,
            carbG: 43,
            fatG: 0,
            preparation:
              "Refoga alho, adiciona arroz, cobre com água (2:1). Fogo baixo tampado ~18 min.",
          },
          {
            name: "Abóbora cabotiá cozida (150g)",
            qtyG: 150,
            kcal: 68,
            proteinG: 2,
            carbG: 16,
            fatG: 0,
            preparation:
              "Corta em cubos, cozinha no vapor 10 min ou na pressão 5 min. Tempera com azeite, sal e noz-moscada.",
          },
          {
            name: "Salada de folhas",
            qtyG: 100,
            kcal: 25,
            proteinG: 1,
            carbG: 5,
            fatG: 0,
            preparation: "Folhas lavadas com molho de limão e sal.",
          },
          {
            name: "Azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Rega a salada e a abóbora.",
          },
        ],
        ingredients: [
          { item: "Carne moída patinho", qty: 150, unit: "g", category: "proteina" },
          { item: "Arroz branco", qty: 80, unit: "g", category: "carboidrato" },
          { item: "Abóbora cabotiá", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 18, unit: "ml", category: "gordura" },
          { item: "Molho de tomate", qty: 15, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "almoco-3",
        label: "Opção 3 · Atum em lata, macarrão integral & brócolis",
        foods: [
          {
            name: "Atum em lata ao natural (150g drenado, ~1,2 lata)",
            qtyG: 150,
            kcal: 165,
            proteinG: 35,
            carbG: 0,
            fatG: 2,
            preparation:
              "Abre e escorre. Mistura com azeite, limão, sal e pimenta. Serve sobre o macarrão.",
          },
          {
            name: "Macarrão integral cozido (230g)",
            qtyG: 230,
            kcal: 326,
            proteinG: 14,
            carbG: 64,
            fatG: 2,
            preparation:
              "Cozinha al dente em água com sal (~8-10 min). Escorre e mistura com azeite e ervas.",
          },
          {
            name: "Brócolis no vapor (150g)",
            qtyG: 150,
            kcal: 50,
            proteinG: 4,
            carbG: 10,
            fatG: 0,
            preparation:
              "Buquês menores sobre peneira com 1 dedo de água, tampa, 5 min em fogo médio. Tempera com alho, azeite e sal.",
          },
          {
            name: "Azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Mistura no macarrão e no brócolis.",
          },
        ],
        ingredients: [
          { item: "Atum em lata ao natural", qty: 150, unit: "g", category: "proteina" },
          { item: "Macarrão integral", qty: 100, unit: "g", category: "carboidrato" },
          { item: "Brócolis", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
    ],
  },

  // ─── LANCHE (~350 kcal) ───────────────────────────────────────────────────
  {
    mealType: "lanche",
    targetKcal: 350,
    variants: [
      {
        id: "lanche-1",
        label: "Opção 1 · Whey, banana, aveia & leite",
        foods: [
          {
            name: "Whey protein (1 scoop)",
            qtyG: 30,
            kcal: 120,
            proteinG: 24,
            carbG: 3,
            fatG: 1,
            preparation:
              "Bate no liquidificador com banana, aveia, leite e gelo. Vitamina pronta em 30s.",
          },
          {
            name: "Banana média",
            qtyG: 120,
            kcal: 100,
            proteinG: 1,
            carbG: 24,
            fatG: 0,
            preparation: "Coloca inteira no liquidificador. Mais madura = mais doce.",
          },
          {
            name: "Aveia em flocos (3 colheres de sopa)",
            qtyG: 30,
            kcal: 113,
            proteinG: 4,
            carbG: 20,
            fatG: 2,
            preparation: "Coloca no liquidificador junto com os outros ingredientes.",
          },
          {
            name: "Leite desnatado (200ml)",
            qtyG: 200,
            kcal: 70,
            proteinG: 7,
            carbG: 10,
            fatG: 0,
            preparation: "Base da vitamina.",
          },
        ],
        ingredients: [
          { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Aveia em flocos", qty: 30, unit: "g", category: "carboidrato" },
          { item: "Leite desnatado", qty: 200, unit: "ml", category: "laticinio" },
        ],
      },
      {
        id: "lanche-2",
        label: "Opção 2 · Iogurte natural, granola & mel",
        foods: [
          {
            name: "Iogurte grego/proteico (170g)",
            qtyG: 170,
            kcal: 150,
            proteinG: 25,
            carbG: 7,
            fatG: 4,
            preparation:
              "Serve num bowl. Adiciona granola e mel por cima na hora de comer para manter crocância.",
          },
          {
            name: "Granola sem açúcar (30g)",
            qtyG: 30,
            kcal: 130,
            proteinG: 3,
            carbG: 22,
            fatG: 4,
            preparation: "Coloca sobre o iogurte na hora de comer.",
          },
          {
            name: "Mel (1 colher de chá)",
            qtyG: 8,
            kcal: 25,
            proteinG: 0,
            carbG: 7,
            fatG: 0,
            preparation: "Regue por cima. Opcional se a granola já for doce.",
          },
          {
            name: "Banana (1/2 unidade)",
            qtyG: 60,
            kcal: 50,
            proteinG: 1,
            carbG: 12,
            fatG: 0,
            preparation: "Fatiada por cima do iogurte.",
          },
        ],
        ingredients: [
          { item: "Iogurte grego/proteico", qty: 170, unit: "g", category: "laticinio" },
          { item: "Granola", qty: 30, unit: "g", category: "mercearia" },
          { item: "Mel", qty: 8, unit: "g", category: "mercearia" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "lanche-3",
        label: "Opção 3 · Ovos cozidos, fruta & castanhas",
        foods: [
          {
            name: "Ovos cozidos (2 un)",
            qtyG: 110,
            kcal: 155,
            proteinG: 13,
            carbG: 1,
            fatG: 11,
            preparation:
              "Água fervendo, coloca os ovos, 10 min para gema dura. Esfria em água fria, descasca.",
          },
          {
            name: "Castanhas-do-pará (20g, ~4 un)",
            qtyG: 20,
            kcal: 131,
            proteinG: 3,
            carbG: 2,
            fatG: 13,
            preparation: "Come ao natural ao lado dos ovos.",
          },
          {
            name: "Maçã média",
            qtyG: 130,
            kcal: 67,
            proteinG: 0,
            carbG: 17,
            fatG: 0,
            preparation: "Come com casca (mais fibra). Lava bem antes.",
          },
        ],
        ingredients: [
          { item: "Ovos", qty: 2, unit: "un", category: "proteina" },
          { item: "Castanhas-do-pará", qty: 20, unit: "g", category: "gordura" },
          { item: "Maçã", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
    ],
  },

  // ─── JANTAR (~700 kcal) ───────────────────────────────────────────────────
  {
    mealType: "jantar",
    targetKcal: 700,
    variants: [
      {
        id: "jantar-1",
        label: "Opção 1 · Carne moída patinho, batata doce & brócolis",
        foods: [
          {
            name: "Carne moída patinho (180g)",
            qtyG: 180,
            kcal: 290,
            proteinG: 42,
            carbG: 0,
            fatG: 15,
            preparation:
              "Refoga cebola + alho em azeite, adiciona carne, sal, pimenta, molho de tomate. Mexe ~7 min até secar.",
          },
          {
            name: "Batata doce assada (270g)",
            qtyG: 270,
            kcal: 238,
            proteinG: 4,
            carbG: 54,
            fatG: 0,
            preparation:
              "Corta em rodelas de 1,5 cm com casca, tempera com azeite + sal + pimenta. Forno 200°C por 25-30 min, vira na metade.",
          },
          {
            name: "Brócolis no vapor (150g)",
            qtyG: 150,
            kcal: 50,
            proteinG: 4,
            carbG: 10,
            fatG: 0,
            preparation:
              "Peneira sobre panela com 1 dedo de água, tampa, 5 min fogo médio. Tempera com alho, azeite e sal.",
          },
          {
            name: "Salada verde + azeite (1 cs)",
            qtyG: 100,
            kcal: 100,
            proteinG: 1,
            carbG: 3,
            fatG: 10,
            preparation:
              "Folhas lavadas regadas com 1 cs de azeite e suco de limão.",
          },
        ],
        ingredients: [
          { item: "Carne moída patinho", qty: 180, unit: "g", category: "proteina" },
          { item: "Batata doce", qty: 270, unit: "g", category: "carboidrato" },
          { item: "Brócolis", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 18, unit: "ml", category: "gordura" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "jantar-2",
        label: "Opção 2 · Omelete de 4 ovos com queijo & pão integral",
        foods: [
          {
            name: "Omelete de 4 ovos com queijo branco (40g)",
            qtyG: 260,
            kcal: 380,
            proteinG: 32,
            carbG: 2,
            fatG: 27,
            preparation:
              "Bate 4 ovos com sal, pimenta e salsinha. Frigideira antiaderente em fogo médio com 1 cc de azeite. Despeja, cobre com queijo branco fatiado, dobra quando as bordas firmar (~3 min).",
          },
          {
            name: "Pão integral (2 fatias)",
            qtyG: 60,
            kcal: 160,
            proteinG: 6,
            carbG: 28,
            fatG: 2,
            preparation: "Tosta na frigideira seca 1 min cada lado.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 50,
            proteinG: 2,
            carbG: 9,
            fatG: 0,
            preparation:
              "Alface, rúcula, tomate cereja. Tempera com limão, sal e 1/2 cc de azeite.",
          },
          {
            name: "Azeite (1/2 cs)",
            qtyG: 6,
            kcal: 53,
            proteinG: 0,
            carbG: 0,
            fatG: 6,
            preparation: "Rega a salada.",
          },
        ],
        ingredients: [
          { item: "Ovos", qty: 4, unit: "un", category: "proteina" },
          { item: "Queijo branco", qty: 40, unit: "g", category: "laticinio" },
          { item: "Pão integral", qty: 60, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 9, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "jantar-3",
        label: "Opção 3 · Frango desfiado, arroz & legumes no vapor",
        foods: [
          {
            name: "Frango desfiado (180g)",
            qtyG: 180,
            kcal: 297,
            proteinG: 56,
            carbG: 0,
            fatG: 7,
            preparation:
              "Cozinha o peito em água com sal e alho ~20 min na pressão. Deixa esfriar, desfaz com dois garfos. Refoga com cebola, alho, tomate e pimenta.",
          },
          {
            name: "Arroz branco cozido (165g)",
            qtyG: 165,
            kcal: 214,
            proteinG: 4,
            carbG: 47,
            fatG: 0,
            preparation: "Refoga alho, adiciona arroz, cobre 2:1. Fogo baixo tampado ~18 min.",
          },
          {
            name: "Legumes no vapor (cenoura + chuchu, 200g)",
            qtyG: 200,
            kcal: 70,
            proteinG: 2,
            carbG: 15,
            fatG: 0,
            preparation:
              "Corta cenoura em rodelas e chuchu em cubos. Vapor 8-10 min. Tempera com sal, pimenta e ervas.",
          },
          {
            name: "Azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Rega os legumes e o arroz.",
          },
        ],
        ingredients: [
          { item: "Peito de frango", qty: 180, unit: "g", category: "proteina" },
          { item: "Arroz branco", qty: 88, unit: "g", category: "carboidrato" },
          { item: "Cenoura", qty: 100, unit: "g", category: "hortifruti" },
          { item: "Chuchu", qty: 100, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
        ],
      },
    ],
  },
];

export const INITIAL_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano padrão · emagrecimento (2200 kcal)",
  goal: "deficit",
  kcalDaily: 2200,
  proteinG: 180,
  carbG: 210,
  fatG: 70,
  slots: SLOTS,
  defaultMeals: deriveDefaultMeals(SLOTS),
};

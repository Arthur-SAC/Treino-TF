import type { MealPlan, MealSlot, MealVariant, Ingredient } from "../lib/db";
import { deriveDefaultMeals } from "../lib/meal-plan";

// 2200 kcal pra déficit moderado — 96kg, 27 anos, 1,73m
// Proteína ~180g · Gordura ~70g · Carbo ~210g · ~0,5-0,7 kg/semana
// Comida barata e local de Aracaju/Nordeste (feira, não academia). Variante 0 = base do dia.
const SLOTS: MealSlot[] = [
  // ─── CAFÉ DA MANHÃ (~500 kcal) ────────────────────────────────────────────
  {
    mealType: "cafe",
    targetKcal: 500,
    variants: [
      {
        id: "cafe-1",
        label: "Opção 1 · Cuscuz de milho, ovo mexido & whey",
        effort: "5-min",
        foods: [
          {
            name: "Cuscuz de milho (sem manteiga)",
            qtyG: 150,
            kcal: 230,
            proteinG: 5,
            carbG: 48,
            fatG: 3,
            preparation:
              "Hidrata 1 xícara de flocão de milho com ½ xícara de água morna e uma pitada de sal, descansa 5 min. Cozinha na cuscuzeira (ou no micro-ondas, ~4 min). Finaliza com um fio de azeite — nunca manteiga.",
          },
          {
            name: "Ovo mexido (2 un)",
            qtyG: 110,
            kcal: 160,
            proteinG: 13,
            carbG: 1,
            fatG: 12,
            preparation:
              "Bate os ovos com pitada de sal. Frigideira antiaderente em fogo médio-baixo com um fio de azeite. Mexe constantemente ~3 min até ficar cremoso e úmido.",
          },
          {
            name: "Whey protein batido com banana",
            qtyG: 180,
            kcal: 160,
            proteinG: 24,
            carbG: 12,
            fatG: 1,
            preparation:
              "Bate no liquidificador (ou shaker) 1 scoop de whey com água ou leite + banana. Pronto em 30s.",
          },
        ],
        ingredients: [
          { item: "Flocão de milho (cuscuz)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Ovos", qty: 2, unit: "un", category: "proteina" },
          { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Azeite", qty: 8, unit: "ml", category: "gordura" },
        ],
      },
      {
        id: "cafe-2",
        label: "Opção 2 · Tapioca, ovo & queijo coalho",
        effort: "5-min",
        foods: [
          {
            name: "Tapioca (2 unidades, ~70g goma)",
            qtyG: 70,
            kcal: 220,
            proteinG: 1,
            carbG: 54,
            fatG: 0,
            preparation:
              "Espalha ~35g de goma hidratada em frigideira antiaderente quente. Espera firmar (~2 min), vira delicadamente, recheia e dobra.",
          },
          {
            name: "Ovo mexido (2 un) com queijo coalho (30g)",
            qtyG: 140,
            kcal: 250,
            proteinG: 20,
            carbG: 1,
            fatG: 19,
            preparation:
              "Bate 2 ovos com sal, junta queijo coalho picado em cubinhos pequenos. Frigideira antiaderente, mexe em fogo médio ~2-3 min até o queijo amolecer. Recheia a tapioca.",
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
          { item: "Queijo coalho", qty: 30, unit: "g", category: "laticinio" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "cafe-3",
        label: "Opção 3 · Vitamina de whey, banana & aveia",
        effort: "5-min",
        foods: [
          {
            name: "Aveia em flocos (5 colheres de sopa)",
            qtyG: 50,
            kcal: 188,
            proteinG: 7,
            carbG: 34,
            fatG: 4,
            preparation:
              "Coloca no liquidificador junto com o resto. Se sobrar aveia solta, pode cozinhar 3 min com leite e canela em vez de bater.",
          },
          {
            name: "Whey protein (1 scoop)",
            qtyG: 30,
            kcal: 120,
            proteinG: 24,
            carbG: 3,
            fatG: 1,
            preparation:
              "Bate no liquidificador com o leite, a banana e a aveia. Vitamina pronta em 30s.",
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
            name: "Leite (200ml)",
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
          { item: "Leite", qty: 200, unit: "ml", category: "laticinio" },
        ],
      },
      // Opções 4 e 5 migraram do lanche das 16h: eram leves demais em gordura
      // pra caber antes do treino (caminhada + treino logo em seguida), mas a
      // gordura não atrapalha de manhã — e ela tem cuscuzeira e frigideira em
      // casa nesse horário. Conteúdo idêntico ao original, só rótulo e número
      // de opção ajustados.
      {
        id: "cafe-4",
        label: "Opção 4 · Banana & ovos cozidos",
        // Ovo cozido é o prato mais loteável que existe — 10 min de fervura
        // não bate com o bucket "5-min", mas bate com "lote-domingo": cozinha
        // a semana toda de uma vez e guarda na geladeira.
        effort: "lote-domingo",
        foods: [
          {
            name: "Banana (2 unidades médias)",
            qtyG: 240,
            kcal: 200,
            proteinG: 2,
            carbG: 48,
            fatG: 0,
            preparation: "Come ao natural — uma antes e outra depois do treino, se preferir dividir.",
          },
          {
            name: "Ovos cozidos (2 un)",
            qtyG: 110,
            kcal: 155,
            proteinG: 13,
            carbG: 1,
            fatG: 11,
            preparation:
              "Água fervendo, coloca os ovos, 10 min para gema dura. Esfria em água fria, descasca. Dá pra cozinhar o lote de ovos da semana de uma vez no domingo e guardar na geladeira — de manhã é só descascar.",
          },
        ],
        ingredients: [
          { item: "Banana", qty: 2, unit: "un", category: "hortifruti" },
          { item: "Ovos", qty: 2, unit: "un", category: "proteina" },
        ],
      },
      {
        id: "cafe-5",
        label: "Opção 5 · Tapioca com ovo & queijo coalho",
        effort: "5-min",
        foods: [
          {
            name: "Tapioca (2 unidades, ~70g goma)",
            qtyG: 70,
            kcal: 220,
            proteinG: 1,
            carbG: 54,
            fatG: 0,
            preparation:
              "Espalha ~35g de goma hidratada em frigideira antiaderente quente. Espera firmar (~2 min), vira delicadamente, recheia e dobra.",
          },
          {
            name: "Ovo mexido (1 un) com queijo coalho (15g)",
            qtyG: 70,
            kcal: 140,
            proteinG: 9,
            carbG: 1,
            fatG: 10,
            preparation:
              "Bate 1 ovo com sal, junta queijo coalho picado. Frigideira antiaderente, mexe ~2 min. Recheia a tapioca.",
          },
        ],
        ingredients: [
          { item: "Goma de tapioca", qty: 70, unit: "g", category: "carboidrato" },
          { item: "Ovos", qty: 1, unit: "un", category: "proteina" },
          { item: "Queijo coalho", qty: 15, unit: "g", category: "laticinio" },
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
        label: "Opção 1 · Frango grelhado, arroz & feijão de corda",
        effort: "lote-domingo",
        foods: [
          {
            name: "Frango grelhado (180g)",
            qtyG: 180,
            kcal: 297,
            proteinG: 56,
            carbG: 0,
            fatG: 7,
            preparation:
              "Tempera com sal, pimenta, alho amassado e suco de limão. Marina 10 min. Frigideira em fogo alto com fio de azeite, grelha 4-5 min cada lado. Coxa desossada é mais barata que o peito e serve igual.",
          },
          {
            name: "Arroz cozido (150g)",
            qtyG: 150,
            kcal: 163,
            proteinG: 3,
            carbG: 34,
            fatG: 1,
            preparation:
              "Refoga alho em azeite, adiciona o arroz, cobre com água (2:1). Fogo baixo, tampado, ~18 min.",
          },
          {
            name: "Feijão de corda / macassar (1 concha, 100g)",
            qtyG: 100,
            kcal: 95,
            proteinG: 7,
            carbG: 16,
            fatG: 1,
            preparation:
              "Pressão: feijão de corda de molho 2h + alho + cebola + louro. 15-20 min após pegar pressão (cozinha mais rápido que o carioca). Sal só no final.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 40,
            proteinG: 2,
            carbG: 7,
            fatG: 0,
            preparation:
              "Lava as folhas (molho de vinagre 10 min), pica tomate em cubos e cebola em rodelas finas. Mistura na hora.",
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
          { item: "Coxa de frango (ou peito)", qty: 180, unit: "g", category: "proteina" },
          { item: "Arroz", qty: 80, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 30, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "almoco-2",
        label: "Opção 2 · Carne moída, macaxeira & jerimum",
        effort: "lote-domingo",
        foods: [
          {
            name: "Carne moída patinho (150g)",
            qtyG: 150,
            kcal: 242,
            proteinG: 35,
            carbG: 0,
            fatG: 12,
            preparation:
              "Refoga 1/2 cebola + 2 dentes de alho em azeite. Adiciona a carne, sal, pimenta, 1 cs de molho de tomate. Mexe ~7 min até dourar e secar.",
          },
          {
            name: "Macaxeira cozida (170g)",
            qtyG: 170,
            kcal: 212,
            proteinG: 2,
            carbG: 51,
            fatG: 0,
            preparation:
              "Descasca e corta a macaxeira em pedaços. Cozinha em água com sal ~20-25 min até ficar macia (espeta com garfo pra testar). Escorre e tempera com um fio de azeite.",
          },
          {
            name: "Jerimum (abóbora) cozido (150g)",
            qtyG: 150,
            kcal: 68,
            proteinG: 2,
            carbG: 16,
            fatG: 0,
            preparation:
              "Corta o jerimum em cubos, cozinha no vapor 10 min ou na pressão 5 min. Tempera com azeite, sal e noz-moscada.",
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
            preparation: "Rega a salada e o jerimum.",
          },
        ],
        ingredients: [
          { item: "Carne moída patinho", qty: 150, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 170, unit: "g", category: "carboidrato" },
          { item: "Jerimum (abóbora)", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 18, unit: "ml", category: "gordura" },
          { item: "Molho de tomate", qty: 15, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "almoco-3",
        label: "Opção 3 · Peixe (tainha ou sardinha), arroz & quiabo",
        effort: "lote-domingo",
        foods: [
          {
            name: "Peixe assado — tainha ou sardinha (200g)",
            qtyG: 200,
            kcal: 300,
            proteinG: 42,
            carbG: 0,
            fatG: 13,
            preparation:
              "Tempera o peixe limpo com sal, limão, alho e coentro. Forno 200°C por 20-25 min, ou grelha na frigideira 5-6 min cada lado. Tainha e sardinha são as opções mais em conta na feira.",
          },
          {
            name: "Arroz cozido (150g)",
            qtyG: 150,
            kcal: 195,
            proteinG: 4,
            carbG: 43,
            fatG: 0,
            preparation:
              "Refoga alho, adiciona o arroz, cobre com água (2:1). Fogo baixo tampado ~18 min.",
          },
          {
            name: "Quiabo refogado (150g)",
            qtyG: 150,
            kcal: 55,
            proteinG: 3,
            carbG: 11,
            fatG: 0,
            preparation:
              "Corta o quiabo em rodelas e refoga rápido em fogo alto com um fio de azeite e um pouco de vinagre (corta a baba). Mexe pouco, 5-7 min.",
          },
          {
            name: "Azeite (1/2 cs)",
            qtyG: 6,
            kcal: 53,
            proteinG: 0,
            carbG: 0,
            fatG: 6,
            preparation: "Finaliza o quiabo e o peixe.",
          },
        ],
        ingredients: [
          { item: "Tainha ou sardinha", qty: 200, unit: "g", category: "proteina" },
          { item: "Arroz", qty: 80, unit: "g", category: "carboidrato" },
          { item: "Quiabo", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 6, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
    ],
  },

  // ─── LANCHE (~350 kcal) ───────────────────────────────────────────────────
  // Ela come às 16h, caminha 1h com os cães e treina 17h45 — logo em seguida.
  // Todas as opções ficam em ≤5g de gordura (gordura pesa exatamente nessa
  // janela) e evitam excesso de integral/castanha (fibra também pesa aqui).
  {
    mealType: "lanche",
    targetKcal: 350,
    variants: [
      {
        id: "lanche-1",
        label: "Opção 1 · Iogurte, banana & aveia",
        effort: "zero-preparo",
        foods: [
          {
            name: "Iogurte natural desnatado (170g)",
            qtyG: 170,
            kcal: 68,
            proteinG: 7,
            carbG: 10,
            fatG: 0,
            preparation: "Direto do pote, gelado — sem preparo.",
          },
          {
            name: "Banana média",
            qtyG: 150,
            kcal: 125,
            proteinG: 1,
            carbG: 32,
            fatG: 0,
            preparation: "Ao natural, picada por cima do iogurte ou à parte.",
          },
          {
            name: "Aveia em flocos (3 colheres de sopa)",
            qtyG: 40,
            kcal: 150,
            proteinG: 6,
            carbG: 27,
            fatG: 3,
            preparation: "Polvilha por cima do iogurte na hora de comer — sem cozinhar.",
          },
        ],
        ingredients: [
          { item: "Iogurte natural desnatado", qty: 170, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Aveia em flocos", qty: 40, unit: "g", category: "carboidrato" },
        ],
      },
      {
        id: "lanche-2",
        label: "Opção 2 · Pão com peito de peru & banana",
        effort: "zero-preparo",
        foods: [
          {
            name: "Pão de forma (2 fatias)",
            qtyG: 50,
            kcal: 130,
            proteinG: 4,
            carbG: 24,
            fatG: 2,
            preparation: "Direto do pacote — sem preparo, ou 1 min na torradeira se preferir.",
          },
          {
            name: "Peito de peru fatiado (6 fatias)",
            qtyG: 90,
            // 17P + 2C + 2G = 68 + 8 + 18 = 94 kcal. Estava 83, e o buraco de
            // 11 kcal derrubava a opção 2 do lanche pra 338 contra o alvo 350.
            kcal: 94,
            proteinG: 17,
            carbG: 2,
            fatG: 2,
            preparation: "Frios fatiados, direto da geladeira — de casa ou do trabalho.",
          },
          {
            name: "Banana média",
            qtyG: 150,
            kcal: 125,
            proteinG: 1,
            carbG: 32,
            fatG: 0,
            preparation: "Ao natural.",
          },
        ],
        ingredients: [
          { item: "Pão de forma", qty: 2, unit: "fatias", category: "carboidrato" },
          { item: "Peito de peru fatiado", qty: 90, unit: "g", category: "proteina" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "lanche-3",
        label: "Opção 3 · Cuscuz pequeno & banana",
        effort: "5-min",
        foods: [
          {
            name: "Cuscuz de milho pequeno (sem manteiga)",
            qtyG: 180,
            kcal: 276,
            proteinG: 6,
            carbG: 58,
            fatG: 4,
            preparation:
              "Hidrata 60g de flocão com água morna e sal de manhã, descansa 5 min, cozinha na cuscuzeira (ou micro-ondas ~4 min). Leva pronto e frio pro trabalho — come em temperatura ambiente.",
          },
          {
            name: "Banana média",
            qtyG: 120,
            kcal: 100,
            proteinG: 1,
            carbG: 24,
            fatG: 0,
            preparation: "Ao natural.",
          },
        ],
        ingredients: [
          { item: "Flocão de milho (cuscuz)", qty: 60, unit: "g", category: "carboidrato" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
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
        label: "Opção 1 · Frango desfiado, macaxeira & legumes",
        effort: "lote-domingo",
        foods: [
          {
            name: "Frango desfiado (180g)",
            qtyG: 180,
            kcal: 297,
            proteinG: 56,
            carbG: 0,
            fatG: 7,
            preparation:
              "Cozinha o frango em água com sal e alho ~20 min na pressão (ou 15 min fervendo). Deixa esfriar, desfia com dois garfos. Refoga com cebola, alho, tomate e pimenta.",
          },
          {
            name: "Macaxeira cozida (200g)",
            qtyG: 200,
            kcal: 250,
            proteinG: 2,
            carbG: 60,
            fatG: 0,
            preparation:
              "Descasca, corta em pedaços, cozinha em água com sal ~20-25 min até ficar macia. Escorre e tempera com um fio de azeite.",
          },
          {
            name: "Legumes refogados — jerimum & quiabo (150g)",
            qtyG: 150,
            kcal: 55,
            proteinG: 2,
            carbG: 12,
            fatG: 0,
            preparation:
              "Corta o jerimum em cubos e o quiabo em rodelas, refoga em fogo médio com alho e um fio de azeite, ~10 min.",
          },
          {
            name: "Azeite (1/2 cs)",
            qtyG: 6,
            kcal: 53,
            proteinG: 0,
            carbG: 0,
            fatG: 6,
            preparation: "Finaliza os legumes e a macaxeira.",
          },
        ],
        ingredients: [
          { item: "Peito de frango", qty: 180, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 200, unit: "g", category: "carboidrato" },
          { item: "Jerimum (abóbora)", qty: 100, unit: "g", category: "hortifruti" },
          { item: "Quiabo", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 6, unit: "ml", category: "gordura" },
        ],
      },
      {
        id: "jantar-2",
        label: "Opção 2 · Omelete com queijo coalho & cuscuz de milho",
        effort: "5-min",
        foods: [
          {
            name: "Omelete de 4 ovos com queijo coalho (40g)",
            qtyG: 260,
            kcal: 390,
            proteinG: 33,
            carbG: 1,
            fatG: 28,
            preparation:
              "Bate 4 ovos com sal, pimenta e salsinha. Frigideira antiaderente em fogo médio com fio de azeite. Despeja, espalha o queijo coalho picado por cima, dobra quando as bordas firmarem (~3 min).",
          },
          {
            name: "Cuscuz de milho (sem manteiga, 120g cozido)",
            qtyG: 120,
            kcal: 185,
            proteinG: 4,
            carbG: 38,
            fatG: 2,
            preparation:
              "Hidrata o flocão com água morna e sal, descansa 5 min, cozinha na cuscuzeira (ou micro-ondas ~4 min). Finaliza com um fio de azeite — nunca manteiga.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 50,
            proteinG: 2,
            carbG: 9,
            fatG: 0,
            preparation:
              "Alface, rúcula e tomate. Tempera com limão, sal e um fio de azeite.",
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
          { item: "Queijo coalho", qty: 40, unit: "g", category: "laticinio" },
          { item: "Flocão de milho (cuscuz)", qty: 40, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 9, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "jantar-3",
        label: "Opção 3 · Peixe, jerimum & salada",
        effort: "lote-domingo",
        foods: [
          {
            name: "Peixe assado — tainha ou sardinha (220g)",
            qtyG: 220,
            kcal: 330,
            proteinG: 46,
            carbG: 0,
            fatG: 14,
            preparation:
              "Tempera com sal, limão, alho e coentro. Forno 200°C por 20-25 min, ou grelha na frigideira 5-6 min cada lado.",
          },
          {
            name: "Arroz cozido (120g)",
            qtyG: 120,
            kcal: 156,
            proteinG: 3,
            carbG: 34,
            fatG: 0,
            preparation:
              "Refoga alho, adiciona o arroz, cobre com água (2:1). Fogo baixo tampado ~18 min.",
          },
          {
            name: "Jerimum (abóbora) refogado (150g)",
            qtyG: 150,
            kcal: 68,
            proteinG: 2,
            carbG: 16,
            fatG: 0,
            preparation:
              "Corta em cubos, refoga com um fio de azeite, alho e sal, ~10 min em fogo médio.",
          },
          {
            name: "Salada verde + azeite (1 cs)",
            qtyG: 100,
            kcal: 100,
            proteinG: 1,
            carbG: 3,
            fatG: 10,
            preparation:
              "Folhas lavadas regadas com azeite e suco de limão.",
          },
        ],
        ingredients: [
          { item: "Tainha ou sardinha", qty: 220, unit: "g", category: "proteina" },
          { item: "Arroz", qty: 64, unit: "g", category: "carboidrato" },
          { item: "Jerimum (abóbora)", qty: 150, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 10, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
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

// ═══════════════════════════════════════════════════════════════════════════
// PLANOS POR FASE — mesma base de receitas + acréscimos práticos (porções
// inteiras, sem quantidade quebrada). O app escolhe o plano pelo ciclo ativo:
// adaptação/variação → déficit · refinamento/manutenção → manutenção ·
// hipertrofia → superávit leve (fase de crescer o glúteo).
// ═══════════════════════════════════════════════════════════════════════════

type Boost = { foods: MealVariant["foods"]; ingredients: Ingredient[] };

/** Acrescenta foods + ingredients a TODAS as variantes dos slots indicados e
 *  ajusta o targetKcal. Assim, qualquer opção escolhida já vem com o acréscimo. */
function boostSlots(slots: MealSlot[], boostByMeal: Partial<Record<MealSlot["mealType"], Boost>>): MealSlot[] {
  return slots.map((slot) => {
    const boost = boostByMeal[slot.mealType];
    if (!boost) return slot;
    const addKcal = boost.foods.reduce((s, f) => s + f.kcal, 0);
    return {
      ...slot,
      targetKcal: slot.targetKcal + addKcal,
      variants: slot.variants.map((v) => ({
        ...v,
        foods: [...v.foods, ...boost.foods],
        ingredients: [...v.ingredients, ...boost.ingredients],
      })),
    };
  });
}

// Manutenção: +~250 kcal (refinamento e fase final)
const MAINTENANCE_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  almoco: {
    foods: [{ name: "Arroz extra da fase (+50g cozido)", qtyG: 50, kcal: 65, proteinG: 1, carbG: 14, fatG: 0, preparation: "Mais ~1 colher e meia de arroz no almoço — a fase pede um pouco mais de energia." }],
    ingredients: [{ item: "Arroz integral", qty: 25, unit: "g", category: "carboidrato" }],
  },
  lanche: {
    foods: [{ name: "Fruta extra da fase (1 banana)", qtyG: 120, kcal: 100, proteinG: 1, carbG: 24, fatG: 0, preparation: "Come junto com o lanche." }],
    ingredients: [{ item: "Banana", qty: 1, unit: "un", category: "hortifruti" }],
  },
  jantar: {
    foods: [{ name: "Carboidrato extra da fase (+60g arroz/batata)", qtyG: 60, kcal: 85, proteinG: 2, carbG: 18, fatG: 0, preparation: "Aumenta a porção de carbo do jantar." }],
    ingredients: [{ item: "Arroz branco", qty: 30, unit: "g", category: "carboidrato" }],
  },
};

// Superávit leve: +~500 kcal (hipertrofia — fase de crescer o glúteo)
const SURPLUS_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [{ name: "Whey extra da fase (1 scoop)", qtyG: 30, kcal: 120, proteinG: 24, carbG: 3, fatG: 1, preparation: "Bate junto na vitamina ou dissolve no leite/água." }],
    ingredients: [{ item: "Whey protein", qty: 30, unit: "g", category: "laticinio" }],
  },
  lanche: {
    // Sem pasta de amendoim aqui de propósito: mesmo na fase de crescer o
    // glúteo, o lanche continua sendo o pré-treino (caminhada + treino logo
    // depois) — o acréscimo de energia vem de carboidrato, não de gordura.
    foods: [
      { name: "Fruta extra da fase (1 banana)", qtyG: 120, kcal: 100, proteinG: 1, carbG: 24, fatG: 0, preparation: "Come junto com o lanche." },
      { name: "Mel (1 colher de sopa)", qtyG: 20, kcal: 61, proteinG: 0, carbG: 17, fatG: 0, preparation: "Regado no iogurte, no pão ou no cuscuz — extra da fase." },
    ],
    ingredients: [
      { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
      { item: "Mel", qty: 20, unit: "g", category: "mercearia" },
    ],
  },
  almoco: {
    foods: [{ name: "Arroz extra da fase (+75g cozido)", qtyG: 75, kcal: 98, proteinG: 2, carbG: 21, fatG: 0, preparation: "Porção maior de arroz pra sustentar o ganho de glúteo." }],
    ingredients: [{ item: "Arroz integral", qty: 38, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Batata doce extra da fase (+70g)", qtyG: 70, kcal: 100, proteinG: 2, carbG: 23, fatG: 0, preparation: "Cozida ou no vapor, junto com o jantar." }],
    ingredients: [{ item: "Batata doce", qty: 70, unit: "g", category: "carboidrato" }],
  },
};

const MAINTENANCE_SLOTS = boostSlots(SLOTS, MAINTENANCE_BOOST);
const SURPLUS_SLOTS = boostSlots(SLOTS, SURPLUS_BOOST);

export const MAINTENANCE_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · manutenção (2450 kcal)",
  goal: "manutencao",
  kcalDaily: 2450,
  proteinG: 185,
  carbG: 266,
  fatG: 70,
  slots: MAINTENANCE_SLOTS,
  defaultMeals: deriveDefaultMeals(MAINTENANCE_SLOTS),
};

export const SURPLUS_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · superávit leve (2700 kcal)",
  goal: "superavit",
  kcalDaily: 2700,
  proteinG: 213,
  carbG: 284,
  fatG: 79,
  slots: SURPLUS_SLOTS,
  defaultMeals: deriveDefaultMeals(SURPLUS_SLOTS),
};

export const ALL_MEAL_PLANS: Omit<MealPlan, "id">[] = [INITIAL_PLAN, MAINTENANCE_PLAN, SURPLUS_PLAN];

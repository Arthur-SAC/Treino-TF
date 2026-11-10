import type { MealPlan, MealSlot, MealVariant, Ingredient } from "../lib/db";
import { deriveDefaultMeals } from "../lib/meal-plan";

// 2200 kcal pra déficit moderado — 96kg, 27 anos, 1,73m (spec Chun-Li macia,
// 2026-09-23). Contra o gasto real de 2.700-2.900 (CONSUMO em objetivo.ts) dá
// ~500-700 de déficit: ela escolheu 2.200 e não 2.000 porque déficit maior
// derruba testosterona, e firmeza, libido e força são metade dos objetivos.
// Proteína ~193g · Gordura ~55g · Carbo ~231g · ~0,45-0,6 kg/semana (refeito em 2026-11-10)
// Comida barata e local de Aracaju/Nordeste (feira, não academia). Variante 0 = base do dia.
/** Piso de proteína de CADA opção, por refeição. A soma dos quatro é
 *  CONSUMO.proteinaGMin — é isso que faz o piso do dia valer para qualquer
 *  combinação de opções, e não só para a combinação que o app já mostra.
 *
 *  Por que precisou existir: o cardápio tem 3 a 5 opções por refeição, e já
 *  havia rede para a CALORIA de cada uma (tests/data/variantes-proximas-do-alvo
 *  .test.ts, ±10% do alvo do slot) porque trocar de opção custava 100 kcal em
 *  silêncio. Não havia a rede equivalente para a proteína, e o único teste que
 *  a olhava conferia a variante 0 de cada slot — a combinação mais rica do
 *  cardápio, que passava sempre. Com isso, um dia inteiramente dentro do plano
 *  podia entregar 125g em vez dos 150g declarados: café 21 + almoço 44 +
 *  lanche 21 + jantar 39. Mesmas 2300 kcal, 83g de proteína a menos, e nada
 *  na tela dizia.
 *
 *  Ela está num déficit de 400-600 kcal treinando cinco vezes por semana, e a
 *  massa magra (~71 kg) é o número que sustenta o plano inteiro — o alvo antigo
 *  de 65 kg foi descartado justamente por ficar abaixo dela. Proteína é o que
 *  protege isso, e um buraco silencioso aqui sai como músculo perdido meses
 *  depois, sem nada que aponte a causa. */
export const PROTEINA_PISO_POR_REFEICAO: Record<MealSlot["mealType"], number> = {
  cafe: 30,
  almoco: 45,
  lanche: 30,
  jantar: 45,
};

/** Piso de gordura do DIA, como percentual da energia. Não é preferência de
 *  sabor: abaixo de ~20% das calorias em gordura a produção hormonal cai, e é
 *  a mesma afirmação que o plano de manutenção já fazia em comentário desde a
 *  frente 5 — sem nada que a cobrasse.
 *
 *  O buraco que isso deixava: das 135 combinações possíveis de opções do
 *  cardápio de déficit, 9 caíam abaixo de 20% e 24 abaixo de 22%. A pior dava
 *  17,7% (45 g), e vinha de escolhas que parecem as mais "certinhas" do
 *  cardápio — a vitamina de whey no café e o frango com legumes no jantar,
 *  as duas opções mais magras. Hoje a pior combinação dá 21,4%.
 *
 *  Vale para o dia inteiro, e não por refeição, porque o lanche tem teto
 *  próprio de 5 g (é pré-treino) e nunca poderia cumprir um piso. */
export const GORDURA_PISO_PCT = 20;

// Cardápio refeito em 2026-11-10 a pedido dela ("recalcular tudo pensando no
// resultado mais rápido e melhor"). As 2.200 kcal ficam — foi ela quem escolheu
// contra 2.000, pela testosterona. O que mudou é a distribuição:
//
// 1. Proteína de ~211 g para ~190 g. O objetivo pede 150-160 g
//    (CONSUMO.proteinaGMin); o excedente não protegia mais músculo, só tirava
//    o lugar do carboidrato que alimenta o treino.
// 2. O carboidrato foi para perto do treino: o lanche das 15h30 passou a ~500
//    kcal com ~77 g de carboidrato (antecede 4 km a pé e a força), e o café,
//    que antecede uma manhã sentada, ficou com menos.
// 3. Duas opções por refeição (o jantar tem três), cada uma com os DIAS em que
//    ela entra (`dias`): o Hoje mostra a do dia e a lista de compras conta a
//    semana montada, não uma divisão por igual.
// 4. Patinho só nos almoços de glúteo (seg/qua/sex): é o almoço com mais
//    carboidrato e ferro, e carne vermelha todo dia passaria do recomendado.
// 5. Sardinha DE LATA no jantar de terça e quinta (decisão dela: sempre a
//    enlatada). É o único peixe do cardápio — o ômega-3 da semana.
// 6. A fruta com vitamina C entrou no almoço, contada nas 2.200 — antes saía
//    da verba de 250 kcal.
const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];

const ACEROLA = {
  // Não é enfeite: vitamina C junto da refeição multiplica a absorção do ferro
  // do feijão (não-heme), que é a fonte de ferro dos dias sem carne vermelha.
  name: "Acerola (100 g) — ou caju, goiaba ou laranja",
  qtyG: 100,
  kcal: 33,
  proteinG: 0,
  carbG: 8,
  fatG: 0,
  preparation:
    "Inteira, ou suco batido na hora sem açúcar e sem coar — beba em até 30 min. Polpa congelada serve e é a mais barata. Trocas: caju 100 g, goiaba 100 g ou laranja 150 g. Café ou chá preto ficam 1 h longe do almoço: atrapalham o ferro.",
};

const SLOTS: MealSlot[] = [
  // ─── CAFÉ DA MANHÃ (~450 kcal) ────────────────────────────────────────────
  // Antecede uma manhã sentada: proteína e gordura, pouco carboidrato.
  {
    mealType: "cafe",
    targetKcal: 450,
    variants: [
      {
        id: "cafe-1",
        recomendada: true,
        dias: TODOS_OS_DIAS,
        label: "Opção 1 · Ovos mexidos, cuscuz & whey",
        effort: "5-min",
        foods: [
          {
            name: "Ovos mexidos (3 un) com fio de azeite",
            qtyG: 150,
            kcal: 243,
            proteinG: 19,
            carbG: 1,
            fatG: 18,
            preparation:
              "Bate os ovos (3) com uma pitada de sal. Frigideira antiaderente em fogo médio-baixo com um fio de azeite (uma colher de chá rasa). Mexe sem parar por 2-3 min, até ficar cremoso.",
          },
          {
            name: "Cuscuz de milho (80g cozido, sem manteiga)",
            qtyG: 80,
            kcal: 123,
            proteinG: 3,
            carbG: 26,
            fatG: 2,
            preparation:
              "Hidrata 27 g de flocão com água morna e uma pitada de sal, descansa 5 min. Cuscuzeira por 10 min, ou micro-ondas por 3-4 min. Nunca manteiga.",
          },
          {
            name: "Whey protein (20 g de pó) batido com água",
            qtyG: 20,
            kcal: 80,
            proteinG: 16,
            carbG: 2,
            fatG: 1,
            preparation: "Dissolve no shaker com água gelada. 30 segundos.",
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
          { item: "Flocão de milho (cuscuz)", qty: 27, unit: "g", category: "carboidrato" },
          { item: "Whey protein", qty: 20, unit: "g", category: "laticinio" },
          { item: "Azeite", qty: 3, unit: "ml", category: "gordura" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "cafe-2",
        label: "Opção 2 · Ovos cozidos & vitamina de whey",
        // Ovo cozido é o prato mais loteável que existe: 10 min de fervura de
        // uma vez, na véspera ou no domingo, e de manhã é só descascar.
        effort: "lote-domingo",
        foods: [
          {
            name: "Ovos cozidos (2 un)",
            qtyG: 110,
            kcal: 155,
            proteinG: 13,
            carbG: 1,
            fatG: 11,
            preparation:
              "Água fervendo, coloca os ovos, 10 min para gema dura. Esfria em água fria. Com casca, duram 5 dias na geladeira — dá pra cozinhar vários de uma vez.",
          },
          {
            name: "Leite desnatado (200ml)",
            qtyG: 200,
            kcal: 70,
            proteinG: 7,
            carbG: 10,
            fatG: 0,
            preparation: "Base da vitamina. Bate tudo no liquidificador com gelo, 30 segundos.",
          },
          {
            name: "Whey protein (20 g de pó)",
            qtyG: 20,
            kcal: 80,
            proteinG: 16,
            carbG: 2,
            fatG: 1,
            preparation: "Vai no liquidificador junto com o leite e a banana.",
          },
          {
            name: "Banana pequena",
            qtyG: 100,
            kcal: 84,
            proteinG: 1,
            carbG: 20,
            fatG: 0,
            preparation: "Bate junto na vitamina.",
          },
          {
            // Selênio. Duas unidades bastam e são o teto — em excesso faz mal.
            name: "Castanha-do-pará (2 unidades)",
            qtyG: 8,
            kcal: 53,
            proteinG: 1,
            carbG: 1,
            fatG: 5,
            preparation: "Ao natural. Duas e só duas por dia — é o teto seguro.",
          },
        ],
        ingredients: [
          { item: "Ovos", qty: 2, unit: "un", category: "proteina" },
          { item: "Leite", qty: 200, unit: "ml", category: "laticinio" },
          { item: "Whey protein", qty: 20, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Castanha-do-pará", qty: 2, unit: "un", category: "mercearia" },
        ],
      },
    ],
  },

  // ─── ALMOÇO (~630 kcal) ───────────────────────────────────────────────────
  {
    mealType: "almoco",
    targetKcal: 630,
    variants: [
      {
        id: "almoco-1",
        recomendada: true,
        // Dias de braço e costas (ter/qui) e o fim de semana.
        dias: [0, 2, 4, 6],
        label: "Opção 1 · Frango grelhado, arroz & feijão de corda",
        effort: "lote-domingo",
        foods: [
          {
            name: "Frango grelhado (150g já grelhado)",
            qtyG: 150,
            kcal: 248,
            proteinG: 47,
            carbG: 0,
            fatG: 6,
            preparation:
              "A grama é DEPOIS de grelhar: 200 g crus viram os 150 g do prato. Tempera com sal, alho amassado e limão, 10 min. Frigideira em fogo alto com fio de azeite, 4-5 min de cada lado. Números de PEITO — coxa tem bem mais gordura na mesma porção.",
          },
          {
            name: "Arroz cozido (150g)",
            qtyG: 150,
            kcal: 163,
            proteinG: 3,
            carbG: 34,
            fatG: 0,
            preparation:
              "Do lote de domingo. Refoga alho, adiciona o arroz, cobre com água (2:1). Fogo baixo tampado ~18 min.",
          },
          {
            name: "Feijão de corda / macassar (1 concha, 100g cozido)",
            qtyG: 100,
            kcal: 95,
            proteinG: 7,
            carbG: 16,
            fatG: 1,
            preparation: "Do lote de domingo — esquenta junto com o arroz.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 40,
            proteinG: 2,
            carbG: 7,
            fatG: 0,
            preparation:
              "Folhas lavadas (molho de vinagre 10 min), tomate em cubos e cebola em rodelas finas. Em pote separado, tempera na hora.",
          },
          {
            name: "Azeite extra-virgem (1/2 cs)",
            qtyG: 6,
            kcal: 53,
            proteinG: 0,
            carbG: 0,
            fatG: 6,
            preparation: "Rega a salada na hora, com limão.",
          },
          ACEROLA,
        ],
        ingredients: [
          // 200 crus rendem os 150 grelhados: carne perde ~25% de água no fogo.
          { item: "Peito de frango", qty: 200, unit: "g", category: "proteina" },
          { item: "Arroz", qty: 80, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 30, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 6, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Acerola (ou polpa congelada)", qty: 100, unit: "g", category: "hortifruti" },
        ],
      },
      {
        id: "almoco-2",
        // Dias de glúteo: o almoço com mais carboidrato e ferro, e a beterraba.
        dias: [1, 3, 5],
        label: "Opção 2 · Patinho, macaxeira & beterraba",
        effort: "lote-domingo",
        foods: [
          {
            name: "Carne moída patinho (150g já refogada)",
            qtyG: 150,
            kcal: 242,
            proteinG: 35,
            carbG: 0,
            fatG: 12,
            preparation:
              "Do lote de domingo: 195 g crus viram os 150 g. Refoga 1/2 cebola + 2 dentes de alho, junta a carne, sal, pimenta e 1 cs de molho de tomate. Fogo alto ~8-10 min, até a água secar. Sem azeite no prato: o patinho já traz a gordura.",
          },
          {
            name: "Macaxeira cozida (150g)",
            qtyG: 150,
            kcal: 187,
            proteinG: 2,
            carbG: 45,
            fatG: 0,
            preparation:
              "Do lote de domingo. Descasca, corta, cozinha em água com sal 20-25 min até o garfo entrar fácil. Tira o fio do meio.",
          },
          {
            name: "Feijão de corda / macassar (1 concha, 100g cozido)",
            qtyG: 100,
            kcal: 95,
            proteinG: 7,
            carbG: 16,
            fatG: 1,
            preparation: "Do lote de domingo — esquenta junto com o resto.",
          },
          {
            name: "Beterraba cozida (100g)",
            qtyG: 100,
            kcal: 45,
            proteinG: 1,
            carbG: 11,
            fatG: 0,
            preparation:
              "Do lote de domingo, em cubos. Pote SEPARADO: beterraba tinge tudo de rosa. Vem nos dias de treino de perna de propósito.",
          },
          {
            name: "Salada de folhas",
            qtyG: 100,
            kcal: 25,
            proteinG: 1,
            carbG: 5,
            fatG: 0,
            preparation: "Folhas lavadas com limão e sal.",
          },
          ACEROLA,
        ],
        ingredients: [
          { item: "Carne moída patinho", qty: 195, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 150, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Beterraba", qty: 120, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Molho de tomate", qty: 15, unit: "g", category: "mercearia" },
          { item: "Acerola (ou polpa congelada)", qty: 100, unit: "g", category: "hortifruti" },
        ],
      },
    ],
  },

  // ─── LANCHE (~500 kcal) ───────────────────────────────────────────────────
  // Ela come às 15h30, caminha ~4 km até a Smart Fit, treina às 17h, volta a pé
  // e passeia com os cães — tudo depois deste lanche e antes do jantar. Duas
  // regras saem daí, e nenhuma é preferência:
  //
  // 1. ≤5g de gordura em toda opção: gordura atrasa o esvaziamento gástrico e
  //    pesa exatamente nessa janela.
  // 2. ≥30g de proteína em toda opção (PROTEINA_PISO_POR_REFEICAO): lanche
  //    fraco em proteína descontrola o jantar, o ponto de falha real dela.
  //
  // É a maior refeição de carboidrato do dia desde 2026-11-10: é ela que
  // sustenta a caminhada e o treino.
  {
    mealType: "lanche",
    targetKcal: 500,
    variants: [
      {
        id: "lanche-1",
        recomendada: true,
        dias: TODOS_OS_DIAS,
        label: "Opção 1 · Iogurte com whey, aveia, banana & melancia",
        effort: "zero-preparo",
        foods: [
          {
            name: "Iogurte natural desnatado (170g)",
            qtyG: 170,
            kcal: 68,
            proteinG: 7,
            carbG: 10,
            fatG: 0,
            preparation: "Direto do pote, gelado. Sem geladeira no trabalho: bolsa térmica com gelo reutilizável.",
          },
          {
            name: "Whey protein (30 g de pó) & aveia em flocos (40 g)",
            qtyG: 70,
            kcal: 270,
            proteinG: 30,
            carbG: 27,
            fatG: 3,
            preparation:
              "Leva o pó e a aveia já medidos num potinho. Na hora, joga por cima do iogurte e mexe — sem cozinhar, sem liquidificador.",
          },
          {
            name: "Banana média",
            qtyG: 120,
            kcal: 100,
            proteinG: 1,
            carbG: 24,
            fatG: 0,
            preparation: "Ao natural, picada por cima do iogurte ou à parte.",
          },
          {
            // Barata em Aracaju e na mesma direção da beterraba, com efeito
            // pequeno (ver o guia de vitalidade). Água junto, no calor.
            name: "Melancia (250g, sem casca)",
            qtyG: 250,
            kcal: 75,
            proteinG: 1,
            carbG: 19,
            fatG: 0,
            preparation: "Cortada em cubos num pote fechado — dura 3 dias na geladeira, então corta duas vezes na semana. Come gelada.",
          },
        ],
        ingredients: [
          { item: "Iogurte natural desnatado", qty: 170, unit: "g", category: "laticinio" },
          { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
          { item: "Aveia em flocos", qty: 40, unit: "g", category: "carboidrato" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Melancia", qty: 250, unit: "g", category: "hortifruti" },
        ],
      },
      {
        id: "lanche-2",
        label: "Opção 2 · Pão com patê de atum & banana",
        // Atum: no máximo 2-3 vezes por semana, por causa do mercúrio. Por isso
        // não tem dia fixo — é a troca pra quando enjoar do iogurte.
        effort: "5-min",
        foods: [
          {
            name: "Pão de forma (3 fatias)",
            qtyG: 75,
            kcal: 195,
            proteinG: 6,
            carbG: 36,
            fatG: 3,
            preparation: "Direto do pacote, ou 1 min na torradeira.",
          },
          {
            // Iogurte no lugar de maionese: maionese sozinha colocaria ~10 g de
            // gordura num lanche com teto de 5 g.
            name: "Patê de atum caseiro (1 lata escorrida + iogurte)",
            qtyG: 130,
            kcal: 125,
            proteinG: 27,
            carbG: 2,
            fatG: 1,
            preparation:
              "UMA LATA INTEIRA por lanche — é dela que vem a proteína. Escorre bem a lata de atum em água e amassa com 2 colheres de sopa de iogurte natural, suco de meio limão, cebolinha, sal e pimenta. Faz na véspera; dura até 3 dias na geladeira em pote fechado. No máximo 2-3 vezes por semana (mercúrio).",
          },
          {
            name: "Banana (2 pequenas)",
            qtyG: 160,
            kcal: 134,
            proteinG: 2,
            carbG: 32,
            fatG: 0,
            preparation: "Ao natural.",
          },
          {
            name: "Iogurte natural desnatado (100g)",
            qtyG: 100,
            kcal: 40,
            proteinG: 4,
            carbG: 6,
            fatG: 0,
            preparation: "Direto do pote, gelado.",
          },
        ],
        ingredients: [
          { item: "Pão de forma", qty: 3, unit: "fatias", category: "carboidrato" },
          { item: "Atum em água (lata)", qty: 140, unit: "g", category: "proteina" },
          { item: "Iogurte natural desnatado", qty: 130, unit: "g", category: "laticinio" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Cebolinha", qty: 5, unit: "g", category: "hortifruti" },
          { item: "Banana", qty: 2, unit: "un", category: "hortifruti" },
        ],
      },
    ],
  },

  // ─── JANTAR (~620 kcal) ───────────────────────────────────────────────────
  // Depois do treino, às 20h. Sexta e sábado ela costuma jantar fora; o
  // cardápio ainda conta esses dias (sobra vai pro congelador da semana
  // seguinte — faltar comida na quinta custa mais caro que sobrar).
  {
    mealType: "jantar",
    targetKcal: 620,
    variants: [
      {
        id: "jantar-1",
        recomendada: true,
        dias: [0, 1, 3, 5, 6],
        label: "Opção 1 · Frango desfiado, macaxeira & legumes",
        effort: "lote-domingo",
        foods: [
          {
            name: "Frango desfiado (170g)",
            qtyG: 170,
            kcal: 281,
            proteinG: 53,
            carbG: 0,
            fatG: 7,
            preparation:
              "Do lote de domingo: 230 g crus viram 170 g. Cozinha em água com sal e alho ~20 min na pressão, desfia com dois garfos e refoga com cebola, alho e tomate.",
          },
          {
            name: "Macaxeira cozida (150g)",
            qtyG: 150,
            kcal: 187,
            proteinG: 2,
            carbG: 45,
            fatG: 0,
            preparation: "Do lote de domingo. Esquenta 2 min e tempera com o azeite.",
          },
          {
            name: "Legumes refogados — beterraba & quiabo (150g)",
            qtyG: 150,
            kcal: 55,
            proteinG: 2,
            carbG: 12,
            fatG: 0,
            preparation:
              "A beterraba já sai cozida do lote: corta em cubos. O quiabo em rodelas, refogado em fogo médio com alho ~8 min. Junta a beterraba no fim, só pra aquecer.",
          },
          {
            name: "Azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Finaliza os legumes e a macaxeira. Fio generoso, não gota — é a gordura que segura o piso do dia.",
          },
        ],
        ingredients: [
          { item: "Peito de frango", qty: 230, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 150, unit: "g", category: "carboidrato" },
          { item: "Beterraba", qty: 120, unit: "g", category: "hortifruti" },
          { item: "Quiabo", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
        ],
      },
      {
        id: "jantar-2",
        // Terça e quinta, os dias de braço e costas. Decisão dela: sempre a
        // sardinha de lata. Ômega-3 barato e o cálcio da espinha.
        dias: [2, 4],
        label: "Opção 2 · Sardinha de lata acebolada, arroz & feijão",
        effort: "5-min",
        foods: [
          {
            // 2 latas em óleo, escorridas (~84 g drenados cada). Valores de
            // sardinha em óleo drenada; variam um pouco por marca.
            name: "Sardinha em óleo (2 latas escorridas, ~170g)",
            qtyG: 170,
            kcal: 354,
            proteinG: 42,
            carbG: 0,
            fatG: 20,
            preparation:
              "Escorre BEM o óleo das 2 latas. Frigideira quente sem óleo: cebola e tomate em rodelas por 3 min, junta a sardinha e deixa 2 min só pra aquecer. Limão e coentro no fim. Sem sal — a lata já tem. Os ~170 g são o peso depois de escorrer: confira o peso drenado no rótulo (~84 g por lata).",
          },
          {
            name: "Arroz cozido (160g)",
            qtyG: 160,
            kcal: 173,
            proteinG: 3,
            carbG: 37,
            fatG: 0,
            preparation: "Do lote de domingo — 2 min no micro-ondas.",
          },
          {
            name: "Feijão de corda / macassar (meia concha, 50g cozido)",
            qtyG: 50,
            kcal: 48,
            proteinG: 4,
            carbG: 8,
            fatG: 0,
            preparation: "Do lote de domingo — esquenta junto com o arroz.",
          },
          {
            name: "Tomate e cebola acebolados (150g)",
            qtyG: 150,
            kcal: 40,
            proteinG: 1,
            carbG: 8,
            fatG: 0,
            preparation: "Vão na frigideira junto com a sardinha, em rodelas.",
          },
        ],
        ingredients: [
          { item: "Sardinha em óleo (lata)", qty: 2, unit: "un", category: "proteina" },
          { item: "Arroz", qty: 85, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 25, unit: "g", category: "carboidrato" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 70, unit: "g", category: "hortifruti" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Coentro", qty: 5, unit: "g", category: "hortifruti" },
        ],
      },
      {
        id: "jantar-3",
        label: "Opção 3 · Omelete com frango & cuscuz",
        effort: "5-min",
        foods: [
          {
            name: "Omelete de 4 ovos",
            qtyG: 200,
            kcal: 288,
            proteinG: 25,
            carbG: 1,
            fatG: 20,
            preparation:
              "Bate 4 ovos com sal, pimenta e salsinha. Frigideira antiaderente com tampa, fogo baixo, 5-6 min; vira e deixa mais 1 min.",
          },
          {
            name: "Frango desfiado do lote (50g)",
            qtyG: 50,
            kcal: 83,
            proteinG: 15,
            carbG: 0,
            fatG: 2,
            preparation: "Do pote do lote de domingo — vai dentro da omelete ou do lado.",
          },
          {
            name: "Cuscuz de milho (100g cozido, sem manteiga)",
            qtyG: 100,
            kcal: 153,
            proteinG: 4,
            carbG: 32,
            fatG: 1,
            preparation: "Hidrata 34 g de flocão com água morna e sal, 5 min; cuscuzeira 10 min ou micro-ondas 4 min.",
          },
          {
            name: "Salada de folhas e tomate",
            qtyG: 150,
            kcal: 50,
            proteinG: 2,
            carbG: 9,
            fatG: 0,
            preparation: "Alface e tomate com limão e sal.",
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
          { item: "Peito de frango", qty: 67, unit: "g", category: "proteina" },
          { item: "Flocão de milho (cuscuz)", qty: 34, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Azeite", qty: 6, unit: "ml", category: "gordura" },
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
  // Batem com a soma real da variante 0 (ver tests/data/meal-plan-coerencia.test.ts):
  // 2216 kcal, 193g proteína, 231g carbo, 55g gordura (cardápio refeito em
  // 2026-11-10: proteína desceu de 211 pra perto do objetivo e o carboidrato
  // foi pro lanche pré-treino). Histórico: a queda de 2300 para
  // 2200 (2026-09-23) saiu do carboidrato do lanche e do jantar — proteína e
  // gordura ficaram onde estavam.
  proteinG: 193,
  carbG: 231,
  fatG: 55,
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

// Manutenção: +550 kcal sobre a base de 2200, fechando 2750. Recalibrado em
// 2026-09-23 (spec Chun-Li macia): o gasto real dela é 2.600-2.800 — a
// caminhada de 5 km não era diária desde maio, como o app supunha, e o 3000
// anterior (contra 2.900-3.100) seria superávit disfarçado. 2750 fica dentro
// de 5% do gasto médio, que é o que a palavra "manutenção" significa
// (tests/data/meal-plan-coerencia.test.ts). Ela troca pra este plano quando a
// cintura chegar a 88 — a fase de construir glúteo e coxa.
//
// A soma dos quatro acréscimos tem que dar 550 EXATOS — boostSlots soma o mesmo
// valor ao targetKcal do slot e a cada variante dele, e a invariante testada é
// que a soma dos alvos seja o kcalDaily declarado.
const MAINTENANCE_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [{ name: "Castanha de caju da fase (27g, um punhado cheio)", qtyG: 27, kcal: 150, proteinG: 5, carbG: 8, fatG: 12, preparation: "Ao natural, junto do café — sem preparo." }],
    ingredients: [{ item: "Castanha de caju", qty: 27, unit: "g", category: "mercearia" }],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+65g arroz, +65g feijão)", qtyG: 130, kcal: 150, proteinG: 6, carbG: 28, fatG: 1, preparation: "Porção maior dos dois — os dois já saem prontos do lote de domingo." }],
    ingredients: [
      { item: "Arroz", qty: 35, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 33, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    foods: [{ name: "Macaxeira cozida do lote (80g)", qtyG: 80, kcal: 100, proteinG: 1, carbG: 24, fatG: 0, preparation: "Cozida no domingo, comida fria mesmo — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 80, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Arroz extra da fase (+38g cozido) & azeite (1 cs)", qtyG: 50, kcal: 150, proteinG: 1, carbG: 11, fatG: 11, preparation: "Um pouco mais de arroz e um fio generoso de azeite por cima do prato." }],
    ingredients: [
      { item: "Arroz", qty: 20, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};

// Superávit leve: +750 kcal sobre a base de 2200, fechando 2950 — acima do teto
// do gasto estimado (2800), que é o que faz a palavra "superávit" ser verdade,
// e só ~150-350 acima dele: superávit grande a 96 kg vira barriga, não glúteo.
//
// O whey do café não é enfeite nem pode ser trocado por outra fonte: o nome
// precisa casar com /whey extra da fase/i em TODA variante do café — é o que
// tests/lib/phase-nutrition.test.ts cobra. Soma dos acréscimos: 750 exatos.
const SURPLUS_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [
      { name: "Whey extra da fase (30 g de pó)", qtyG: 30, kcal: 120, proteinG: 24, carbG: 3, fatG: 1, preparation: "Bate junto na vitamina ou dissolve no leite/água." },
      { name: "Castanha de caju da fase (20g)", qtyG: 20, kcal: 110, proteinG: 4, carbG: 6, fatG: 9, preparation: "Ao natural, junto do café." },
    ],
    ingredients: [
      { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
      { item: "Castanha de caju", qty: 20, unit: "g", category: "mercearia" },
    ],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+90g arroz, +100g feijão)", qtyG: 190, kcal: 200, proteinG: 9, carbG: 39, fatG: 1, preparation: "Porção maior dos dois pra sustentar o ganho de glúteo e coxa." }],
    ingredients: [
      { item: "Arroz", qty: 48, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    foods: [{ name: "Macaxeira cozida do lote (120g)", qtyG: 120, kcal: 150, proteinG: 1, carbG: 36, fatG: 0, preparation: "Cozida no domingo, comida fria — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 120, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Batata doce extra da fase (80g) & azeite (1 cs)", qtyG: 92, kcal: 170, proteinG: 1, carbG: 16, fatG: 11, preparation: "Cozida ou no vapor, junto com o jantar, com um fio generoso de azeite." }],
    ingredients: [
      { item: "Batata doce", qty: 80, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};

const MAINTENANCE_SLOTS = boostSlots(SLOTS, MAINTENANCE_BOOST);
const SURPLUS_SLOTS = boostSlots(SLOTS, SURPLUS_BOOST);

export const MAINTENANCE_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · manutenção (2750 kcal)",
  goal: "manutencao",
  kcalDaily: 2750,
  // Soma real da variante 0 com o boost: 2766 kcal, 206g proteína, 302g carbo,
  // 81g gordura. A gordura não é sobra de conta: abaixo de ~20% das kcal ela
  // derruba testosterona, e é a testosterona que sustenta metade dos objetivos
  // desta fase (ver a frente 2).
  proteinG: 206,
  carbG: 302,
  fatG: 79,
  slots: MAINTENANCE_SLOTS,
  defaultMeals: deriveDefaultMeals(MAINTENANCE_SLOTS),
};

export const SURPLUS_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · superávit leve (2950 kcal)",
  goal: "superavit",
  kcalDaily: 2950,
  // Soma real da variante 0 com o boost: 2966 kcal, 232g proteína, 331g carbo,
  // 77g gordura.
  proteinG: 232,
  carbG: 331,
  fatG: 77,
  slots: SURPLUS_SLOTS,
  defaultMeals: deriveDefaultMeals(SURPLUS_SLOTS),
};

export const ALL_MEAL_PLANS: Omit<MealPlan, "id">[] = [INITIAL_PLAN, MAINTENANCE_PLAN, SURPLUS_PLAN];

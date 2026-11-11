import type { MealPlan, MealSlot, MealVariant, Ingredient } from "../lib/db";
import { deriveDefaultMeals } from "../lib/meal-plan";

// 2200 kcal pra déficit moderado — 96kg, 27 anos, 1,73m (spec Chun-Li macia,
// 2026-09-23). Contra o gasto real de 2.700-2.900 (CONSUMO em objetivo.ts) dá
// ~500-700 de déficit: ela escolheu 2.200 e não 2.000 porque déficit maior
// derruba testosterona, e firmeza, libido e força são metade dos objetivos.
// Proteína ~169g · Gordura ~56g · Carbo ~253g · ~0,45-0,6 kg/semana (econômico, 2026-11-11)
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

// Cardápio econômico (2026-11-11). Ela pediu pra caber em ~R$ 500-600 por mês:
// "ganho pouco dinheiro". As 2.200 kcal ficam (decisão dela, pela
// testosterona) e nenhuma refeição encolheu — o que mudou foi DE ONDE vem a
// comida:
//
// 1. Sem whey e sem iogurte. Proteína vem de frango (a mais barata por grama),
//    ovo, feijão e soja texturizada (PTS) misturada no frango e na carne moída —
//    a PTS é a proteína mais barata do mercado (~R$ 0,03/g).
// 2. Patinho virou acém moído com soja, nos mesmos 3 almoços (seg/qua/sex).
// 3. Sardinha de lata continua ter/qui (decisão dela: sempre a enlatada), mas
//    1 lata por jantar, completada com ovo. Ainda é o ômega-3 da semana.
// 4. Óleo de soja/canola no lugar do azeite. Azeite fica opcional na salada.
// 5. Fruta com vitamina C da feira (goiaba, caju, acerola, laranja — a que
//    estiver barata) no lugar da polpa de acerola fixa.
// 6. Proteína do dia ~169 g: menos que os ~190 de antes, ainda acima do alvo de
//    150-160. Frango é barato, então a folga custa pouco.
// 7. Cada opção diz os DIAS em que entra (`dias`): o Hoje mostra a do dia e a
//    lista de compras conta a semana montada.
const TODOS_OS_DIAS = [0, 1, 2, 3, 4, 5, 6];

const FRUTA_C = {
  // Não é enfeite: vitamina C junto da refeição multiplica a absorção do ferro
  // do feijão (não-heme), que é a fonte de ferro dos dias sem carne vermelha.
  name: "Fruta com vitamina C (100 g) — goiaba, caju, acerola ou 1 laranja",
  qtyG: 100,
  kcal: 50,
  proteinG: 1,
  carbG: 12,
  fatG: 0,
  preparation:
    "A que estiver mais barata na feira na semana. Inteira, ou suco batido na hora sem açúcar e sem coar. Café ou chá preto ficam 1 h longe do almoço: atrapalham o ferro.",
};
const FRUTA_C_INGREDIENTE: Ingredient = {
  item: "Fruta com vitamina C (goiaba, caju, acerola ou laranja)",
  qty: 100,
  unit: "g",
  category: "hortifruti",
};

const SLOTS: MealSlot[] = [
  // ─── CAFÉ DA MANHÃ (~450 kcal) ────────────────────────────────────────────
  {
    mealType: "cafe",
    targetKcal: 450,
    variants: [
      {
        id: "cafe-1",
        recomendada: true,
        dias: TODOS_OS_DIAS,
        label: "Opção 1 · Cuscuz com ovo mexido & frango desfiado",
        effort: "5-min",
        foods: [
          {
            name: "Ovos mexidos (3 un) com fio de óleo",
            qtyG: 150,
            kcal: 243,
            proteinG: 19,
            carbG: 1,
            fatG: 18,
            preparation:
              "Bate os ovos (3) com uma pitada de sal. Frigideira antiaderente em fogo médio-baixo com um fio de óleo (uma colher de chá rasa). Mexe sem parar por 2-3 min, até ficar cremoso.",
          },
          {
            name: "Cuscuz de milho (100g cozido, sem manteiga)",
            qtyG: 100,
            kcal: 154,
            proteinG: 4,
            carbG: 32,
            fatG: 1,
            preparation:
              "Hidrata 34 g de flocão com água morna e uma pitada de sal, descansa 5 min. Cuscuzeira por 10 min, ou micro-ondas por 3-4 min.",
          },
          {
            name: "Frango desfiado do lote (40g)",
            qtyG: 40,
            kcal: 66,
            proteinG: 12,
            carbG: 0,
            fatG: 2,
            preparation: "Do pote do lote de domingo. Esquenta junto com o ovo no fim, ou vai frio por cima do cuscuz.",
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
          { item: "Flocão de milho (cuscuz)", qty: 34, unit: "g", category: "carboidrato" },
          // 54 crus rendem os 40 desfiados.
          { item: "Peito de frango", qty: 54, unit: "g", category: "proteina" },
          { item: "Óleo de soja (ou canola)", qty: 3, unit: "ml", category: "gordura" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
        ],
      },
      {
        id: "cafe-2",
        label: "Opção 2 · Ovos cozidos & pão com frango",
        // Ovo cozido é o prato mais loteável que existe: 10 min de fervura de
        // uma vez, na véspera ou no domingo, e de manhã é só descascar.
        effort: "lote-domingo",
        foods: [
          {
            name: "Ovos cozidos (3 un)",
            qtyG: 150,
            kcal: 216,
            proteinG: 19,
            carbG: 1,
            fatG: 15,
            preparation:
              "Água fervendo, coloca os ovos, 10 min para gema dura. Esfria em água fria. Com casca, duram 5 dias na geladeira — dá pra cozinhar vários de uma vez.",
          },
          {
            name: "Pão francês (1 un)",
            qtyG: 50,
            kcal: 150,
            proteinG: 5,
            carbG: 29,
            fatG: 2,
            preparation: "Abre e recheia com o frango. Na chapa 1 min, se quiser quente.",
          },
          {
            name: "Frango desfiado do lote (30g)",
            qtyG: 30,
            kcal: 50,
            proteinG: 9,
            carbG: 0,
            fatG: 1,
            preparation: "Do pote do lote de domingo, dentro do pão.",
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
          { item: "Pão francês", qty: 1, unit: "un", category: "carboidrato" },
          { item: "Peito de frango", qty: 40, unit: "g", category: "proteina" },
          { item: "Castanha-do-pará", qty: 2, unit: "un", category: "mercearia" },
          { item: "Café", qty: 10, unit: "g", category: "mercearia" },
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
            name: "Frango grelhado (130g já grelhado)",
            qtyG: 130,
            kcal: 215,
            proteinG: 41,
            carbG: 0,
            fatG: 5,
            preparation:
              "A grama é DEPOIS de grelhar: 175 g crus viram os 130 g do prato. Tempera com sal, alho amassado e limão, 10 min. Frigideira em fogo alto com fio de óleo, 4-5 min de cada lado. Números de PEITO — coxa tem bem mais gordura na mesma porção.",
          },
          {
            name: "Arroz cozido (110g)",
            qtyG: 110,
            kcal: 120,
            proteinG: 2,
            carbG: 25,
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
            // 1 cs inteira: é o óleo que segura o piso de gordura do dia
            // (hormônio) num cardápio de carne magra.
            name: "Óleo de soja ou azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Rega a salada e o arroz na hora, com limão. Azeite é melhor no cru, se couber no mês; óleo serve.",
          },
          FRUTA_C,
        ],
        ingredients: [
          // 175 crus rendem os 130 grelhados: carne perde ~25% de água no fogo.
          { item: "Peito de frango", qty: 175, unit: "g", category: "proteina" },
          { item: "Arroz", qty: 60, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 80, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 30, unit: "g", category: "hortifruti" },
          { item: "Óleo de soja (ou canola)", qty: 12, unit: "ml", category: "gordura" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
          FRUTA_C_INGREDIENTE,
        ],
      },
      {
        id: "almoco-2",
        // Dias de perna: o almoço com mais carboidrato e ferro, e a beterraba.
        dias: [1, 3, 5],
        label: "Opção 2 · Carne moída com soja, macaxeira & beterraba",
        effort: "lote-domingo",
        foods: [
          {
            name: "Carne moída de acém (80g já refogada)",
            qtyG: 80,
            kcal: 172,
            proteinG: 21,
            carbG: 0,
            fatG: 10,
            preparation:
              "Do lote de domingo: 105 g crus viram os 80 g. Refoga 1/2 cebola + 2 dentes de alho, junta a carne, sal, pimenta e 1 cs de molho de tomate. Fogo alto ~8-10 min, até a água secar. Pede pro açougue moer o acém na hora.",
          },
          {
            name: "Soja texturizada hidratada (90g — 30 g seca), refogada junto",
            qtyG: 90,
            kcal: 99,
            proteinG: 15,
            carbG: 9,
            fatG: 0,
            preparation:
              "Hidrata a soja seca em água quente com sal por 10 min, espreme bem com a mão e junta na panela da carne. Pega o gosto do tempero e ninguém percebe a diferença no prato.",
          },
          {
            name: "Macaxeira cozida (100g)",
            qtyG: 100,
            kcal: 125,
            proteinG: 1,
            carbG: 30,
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
            name: "Salada de folhas com óleo (1/2 cs)",
            qtyG: 106,
            kcal: 78,
            proteinG: 1,
            carbG: 5,
            fatG: 6,
            preparation: "Folhas lavadas com limão, sal e o fio de óleo ou azeite.",
          },
          FRUTA_C,
        ],
        ingredients: [
          { item: "Carne moída de acém", qty: 105, unit: "g", category: "proteina" },
          { item: "Soja texturizada (PTS)", qty: 30, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 100, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
          { item: "Beterraba", qty: 120, unit: "g", category: "hortifruti" },
          { item: "Alface", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Molho de tomate", qty: 15, unit: "g", category: "mercearia" },
          { item: "Óleo de soja (ou canola)", qty: 6, unit: "ml", category: "gordura" },
          FRUTA_C_INGREDIENTE,
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
  // É a maior refeição de carboidrato do dia: é ela que sustenta a caminhada e
  // o treino. Desde 2026-11-11 é comida de marmita, sem whey nem iogurte.
  {
    mealType: "lanche",
    targetKcal: 500,
    variants: [
      {
        id: "lanche-1",
        recomendada: true,
        dias: TODOS_OS_DIAS,
        label: "Opção 1 · Cuscuz recheado com frango, banana & melancia",
        effort: "lote-domingo",
        foods: [
          {
            name: "Cuscuz de milho (130g cozido)",
            qtyG: 130,
            kcal: 200,
            proteinG: 5,
            carbG: 42,
            fatG: 1,
            preparation:
              "Hidrata 44 g de flocão com água morna e sal, 5 min; cuscuzeira 10 min ou micro-ondas 4 min. Faz de manhã junto com o do café e leva no pote.",
          },
          {
            name: "Frango desfiado do lote (50g)",
            qtyG: 50,
            kcal: 83,
            proteinG: 16,
            carbG: 0,
            fatG: 2,
            preparation:
              "Sai pronto do lote de domingo, já refogado junto com a soja. Por cima do cuscuz, no mesmo pote. Come frio ou 1 min no micro-ondas do trabalho.",
          },
          {
            name: "Soja texturizada hidratada (60g — 20 g seca), refogada junto",
            qtyG: 60,
            kcal: 66,
            proteinG: 10,
            carbG: 6,
            fatG: 0,
            preparation: "Vem misturada no frango desfiado do lote — no pote é uma coisa só.",
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
          {
            // Barata em Aracaju e na mesma direção da beterraba, com efeito
            // pequeno (ver o guia de vitalidade). Água junto, no calor.
            name: "Melancia (250g, sem casca)",
            qtyG: 250,
            kcal: 75,
            proteinG: 1,
            carbG: 19,
            fatG: 0,
            preparation: "Cortada em cubos num pote fechado — dura uns 4 dias na geladeira, então corta duas vezes na semana. Come gelada.",
          },
        ],
        ingredients: [
          { item: "Flocão de milho (cuscuz)", qty: 44, unit: "g", category: "carboidrato" },
          // 68 crus rendem os 50 desfiados.
          { item: "Peito de frango", qty: 68, unit: "g", category: "proteina" },
          { item: "Soja texturizada (PTS)", qty: 20, unit: "g", category: "proteina" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Melancia", qty: 250, unit: "g", category: "hortifruti" },
        ],
      },
      {
        id: "lanche-2",
        label: "Opção 2 · Pão francês com frango & banana",
        // Troca livre, quando enjoar do cuscuz.
        effort: "5-min",
        foods: [
          {
            name: "Pão francês (2 un)",
            qtyG: 100,
            kcal: 300,
            proteinG: 9,
            carbG: 58,
            fatG: 3,
            preparation: "Da padaria do dia, ou congelado e 2 min na chapa/forno.",
          },
          {
            name: "Frango desfiado do lote (50g)",
            qtyG: 50,
            kcal: 83,
            proteinG: 16,
            carbG: 0,
            fatG: 2,
            preparation: "Do mesmo pote do lote de domingo. Divide entre os dois pães.",
          },
          {
            name: "Soja texturizada hidratada (45g — 15 g seca), refogada junto",
            qtyG: 45,
            kcal: 50,
            proteinG: 8,
            carbG: 5,
            fatG: 0,
            preparation: "Vem misturada no frango desfiado do lote.",
          },
          {
            name: "Banana pequena",
            qtyG: 100,
            kcal: 84,
            proteinG: 1,
            carbG: 20,
            fatG: 0,
            preparation: "Ao natural.",
          },
        ],
        ingredients: [
          { item: "Pão francês", qty: 2, unit: "un", category: "carboidrato" },
          { item: "Peito de frango", qty: 68, unit: "g", category: "proteina" },
          { item: "Soja texturizada (PTS)", qty: 15, unit: "g", category: "proteina" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
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
        label: "Opção 1 · Frango desfiado com soja, macaxeira & legumes",
        effort: "lote-domingo",
        foods: [
          {
            name: "Frango desfiado (110g)",
            qtyG: 110,
            kcal: 182,
            proteinG: 34,
            carbG: 0,
            fatG: 4,
            preparation:
              "Do lote de domingo: 150 g crus viram 110 g. Cozinha em água com sal e alho ~20 min na pressão, desfia com dois garfos e refoga com cebola, alho e tomate.",
          },
          {
            name: "Soja texturizada hidratada (60g — 20 g seca), refogada junto",
            qtyG: 60,
            kcal: 66,
            proteinG: 10,
            carbG: 6,
            fatG: 0,
            preparation: "Já vai misturada no refogado do frango no domingo — no prato vira uma coisa só.",
          },
          {
            name: "Macaxeira cozida (170g)",
            qtyG: 170,
            kcal: 212,
            proteinG: 2,
            carbG: 51,
            fatG: 0,
            preparation: "Do lote de domingo. Esquenta 2 min e tempera com o óleo.",
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
            name: "Óleo ou azeite (1 cs)",
            qtyG: 12,
            kcal: 100,
            proteinG: 0,
            carbG: 0,
            fatG: 11,
            preparation: "Finaliza os legumes e a macaxeira. Fio generoso, não gota — é a gordura que segura o piso do dia.",
          },
        ],
        ingredients: [
          { item: "Peito de frango", qty: 150, unit: "g", category: "proteina" },
          { item: "Soja texturizada (PTS)", qty: 20, unit: "g", category: "proteina" },
          { item: "Macaxeira (aipim)", qty: 170, unit: "g", category: "carboidrato" },
          { item: "Beterraba", qty: 120, unit: "g", category: "hortifruti" },
          { item: "Quiabo", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Cebola", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Alho", qty: 10, unit: "g", category: "hortifruti" },
          { item: "Tomate", qty: 50, unit: "g", category: "hortifruti" },
          { item: "Óleo de soja (ou canola)", qty: 12, unit: "ml", category: "gordura" },
        ],
      },
      {
        id: "jantar-2",
        // Terça e quinta, os dias de braço e costas. Decisão dela: sempre a
        // sardinha de lata. Ômega-3 barato e o cálcio da espinha. Uma lata só
        // desde 2026-11-11 (custo); o ovo completa a proteína.
        dias: [2, 4],
        label: "Opção 2 · Sardinha de lata com ovo, arroz & feijão",
        effort: "5-min",
        foods: [
          {
            // 1 lata em óleo, escorrida (~84 g drenados). Valores de sardinha
            // em óleo drenada; variam um pouco por marca.
            name: "Sardinha em óleo (1 lata escorrida, ~84g)",
            qtyG: 84,
            kcal: 177,
            proteinG: 21,
            carbG: 0,
            fatG: 10,
            preparation:
              "Escorre BEM o óleo da lata. Frigideira quente sem óleo: cebola e tomate em rodelas por 3 min, junta a sardinha e deixa 2 min só pra aquecer. Limão e coentro no fim. Sem sal — a lata já tem. Os ~84 g são o peso depois de escorrer.",
          },
          {
            name: "Ovos mexidos na mesma frigideira (3 un)",
            qtyG: 150,
            kcal: 216,
            proteinG: 19,
            carbG: 1,
            fatG: 15,
            preparation: "Depois da sardinha, quebra os ovos na mesma frigideira e mexe 2 min — sem óleo extra, o da sardinha basta.",
          },
          {
            name: "Arroz cozido (120g)",
            qtyG: 120,
            kcal: 130,
            proteinG: 2,
            carbG: 28,
            fatG: 0,
            preparation: "Do lote de domingo — 2 min no micro-ondas.",
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
          { item: "Sardinha em óleo (lata)", qty: 1, unit: "un", category: "proteina" },
          { item: "Ovos", qty: 3, unit: "un", category: "proteina" },
          { item: "Arroz", qty: 64, unit: "g", category: "carboidrato" },
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
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
            name: "Óleo ou azeite (1/2 cs)",
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
          { item: "Óleo de soja (ou canola)", qty: 6, unit: "ml", category: "gordura" },
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
  // 2224 kcal, 169g proteína, 253g carbo, 56g gordura (cardápio econômico de
  // 2026-11-11: sem whey, iogurte e patinho; antes 193 g de proteína).
  // Histórico: 2026-11-10 o carboidrato foi pro lanche pré-treino; 2026-09-23
  // a queda de 2300 para 2200 saiu do carboidrato do lanche e do jantar.
  proteinG: 169,
  carbG: 253,
  fatG: 56,
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
  // Soma real da variante 0 com o boost: 2774 kcal, 182g proteína, 324g carbo,
  // 80g gordura. A gordura não é sobra de conta: abaixo de ~20% das kcal ela
  // derruba testosterona, e é a testosterona que sustenta metade dos objetivos
  // desta fase (ver a frente 2).
  proteinG: 182,
  carbG: 324,
  fatG: 80,
  slots: MAINTENANCE_SLOTS,
  defaultMeals: deriveDefaultMeals(MAINTENANCE_SLOTS),
};

export const SURPLUS_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · superávit leve (2950 kcal)",
  goal: "superavit",
  kcalDaily: 2950,
  // Soma real da variante 0 com o boost: 2974 kcal, 208g proteína, 353g carbo,
  // 78g gordura.
  proteinG: 208,
  carbG: 353,
  fatG: 78,
  slots: SURPLUS_SLOTS,
  defaultMeals: deriveDefaultMeals(SURPLUS_SLOTS),
};

export const ALL_MEAL_PLANS: Omit<MealPlan, "id">[] = [INITIAL_PLAN, MAINTENANCE_PLAN, SURPLUS_PLAN];

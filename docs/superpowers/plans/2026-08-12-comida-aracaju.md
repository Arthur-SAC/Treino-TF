# Frente 5 — Comida de verdade em Aracaju · plano de implementação

> **Para agentes:** este plano é executado tarefa a tarefa, com verificação entre
> cada uma. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Goal:** trocar o ultraprocessado do cardápio por comida local de Sergipe, dar
proteína de verdade ao lanche das 15h30, transformar a "Marmita da semana" num
roteiro com ordem de execução, e pagar a dívida calórica de manutenção e
superávit registrada na frente 1.

**Architecture:** sem módulo novo de regra. `src/data/meal-plan-seed.ts` continua
sendo a fonte única do cardápio, com a mesma forma (`SLOTS` → `variants` →
`foods` + `ingredients`), e os planos de fase continuam nascendo de `boostSlots`.
Entra um seed novo e puro (`src/data/marmita-domingo-seed.ts`) com o roteiro de
domingo, servido por uma página própria. A versão do seed de plano alimentar sai
de dentro de `path-seed.ts` para ser exportada e travada por teste, como já
acontece com exercícios e templates.

**Tech Stack:** TypeScript · React 18 · React Router · Dexie (IndexedDB) ·
Vitest + Testing Library · Tailwind.

## Global Constraints

Valem para **todas** as tarefas, sem exceção:

- Texto e comentário em **pt-BR com acentuação correta**. Nunca ASCII no lugar de acento.
- Comentário de código explica o **porquê**, não o quê.
- Módulos em `src/lib/` e seeds em `src/data/` são **puros**: sem `db`, sem `new Date()`.
- **Nenhum texto trata a terapia hormonal como etapa futura agendada**
  (`tests/data/sem-trh-agendada.test.ts` varre todo o `src/`).
- **Nenhuma promessa sem evidência.** A castanha de caju é *uma* fonte de zinco
  entre as que já estão no plano (carne, ovo, peixe) — o texto nunca a vende como
  alavanca isolada de volume seminal.
- Falar **sem amenizar**: acolhimento vem de precisão.
- `npm run test` verde e `npm run build` limpo são condição de commit.
- Rede de teste **mira a afirmação, não a palavra**: o teste de ultraprocessado
  varre `foods[].name` e `ingredients[].item` dos planos — **nunca prosa de tela**.
  Prosa que *nega* ("saiu o peito de peru") tem que continuar podendo existir.
- **Se um teste deste plano falhar contra o conteúdo do plano, pare e reporte.**
  Não "conserte" o teste. Nas quatro vezes anteriores o plano estava errado.

---

## Números fechados (referência de todas as tarefas)

A aritmética já foi feita. Estes são os valores finais — não recalcule, confira.

### Invariantes que não podem quebrar

| Invariante | Valor |
|---|---|
| `INITIAL_PLAN.kcalDaily` | `CONSUMO.metaKcal` = **2300** (não muda) |
| soma dos `targetKcal` da base | 550 + 700 + 350 + 700 = **2300** (não muda) |
| soma dos `targetKcal` = `kcalDaily` | nos **três** planos |
| comida real da variante 0 | dentro de **3%** do `kcalDaily` |
| proteína da variante 0 (déficit) | ≥ `CONSUMO.proteinaGMin` (150) |
| gordura total de **toda** variante de lanche | ≤ **5 g** (ela treina logo depois) |
| desvio de **toda** variante vs `targetKcal` | ≤ **10%** (aperta o guard de 15%) |

### Variantes da base depois desta frente (plano de déficit)

| Variante | kcal | alvo | desvio | o que muda |
|---|---|---|---|---|
| cafe-1 | 565 | 550 | 2,7% | — |
| cafe-2 | 555 | 550 | 0,9% | **+ castanha de caju 15 g (83 kcal)** |
| cafe-3 | 561 | 550 | 2,0% | **+ castanha de caju 15 g (83 kcal)** |
| cafe-4 | 553 | 550 | 0,5% | **+ castanha de caju 10 g (56 kcal)** |
| cafe-5 | 543 | 550 | 1,3% | — |
| almoco-1 | 717 | 700 | 2,4% | — |
| almoco-2 | 695 | 700 | 0,7% | **+ feijão de corda 50 g (48 kcal)** |
| almoco-3 | 698 | 700 | 0,3% | **+ feijão de corda 100 g (95 kcal)** |
| lanche-1 | 365 | 350 | 4,3% | **aveia 40 g → aveia 20 g + whey 20 g** |
| lanche-2 | 355 | 350 | 1,4% | **peito de peru → patê de atum caseiro** |
| lanche-3 | 348 | 350 | 0,6% | **cuscuz 180 g → 110 g + whey 20 g** |
| jantar-1 | 688 | 700 | 1,7% | — |
| jantar-2 | 678 | 700 | 3,1% | — |
| jantar-3 | 702 | 700 | 0,3% | **+ feijão de corda 50 g (48 kcal)** |

Pior desvio: **4,3%**. O guard de 10% fica com folga real.

### Macros declarados (recalculados a partir da variante 0)

| Plano | kcalDaily | comida real da variante 0 | proteinG | carbG | fatG |
|---|---|---|---|---|---|
| déficit | 2300 (inalterado) | 2335 (1,5%) | **203** | **260** | **53** |
| manutenção | **3000** (era 2450) | 3035 (1,2%) | **220** | **365** | **77** |
| superávit | **3300** (era 2700) | 3335 (1,1%) | **247** | **405** | **80** |

### Boosts de fase (a soma tem que bater exata)

`boostSlots` soma `addKcal` ao `targetKcal` do slot **e** a todas as variantes
dele. Base 2300 + boost = `kcalDaily`.

**MAINTENANCE_BOOST — soma exatamente 700:**

| slot | kcal | item |
|---|---|---|
| cafe | 150 | Castanha de caju da fase (27 g) — 5 P · 8 C · 12 G |
| almoco | 200 | Arroz & feijão de corda extra da fase — 9 P · 39 C · 1 G |
| lanche | 150 | Macaxeira cozida do lote (120 g) — 1 P · 36 C · **0 G** |
| jantar | 200 | Arroz extra (92 g cozido) & azeite (1 cs) — 2 P · 22 C · 11 G |

**SURPLUS_BOOST — soma exatamente 1000:**

| slot | kcal | item |
|---|---|---|
| cafe | 120 + 180 | Whey extra da fase (1 scoop) — 24 P · 3 C · 1 G · **+** Castanha de caju da fase (32 g) — 6 P · 10 C · 14 G |
| almoco | 250 | Arroz & feijão de corda extra da fase — 11 P · 49 C · 1 G |
| lanche | 200 | Macaxeira cozida do lote (160 g) — 1 P · 48 C · **0 G** |
| jantar | 250 | Batata doce extra (105 g) & azeite (1 cs) — 2 P · 35 C · 11 G |

**Duas travas que já quebraram este arquivo antes:**

1. O boost do **lanche** é carboidrato puro, gordura **0 g**. A base do lanche já
   tem 3-4 g e o teto testado é 5 g — qualquer gordura no boost derruba
   `refeicoes-praticidade.test.ts` nos planos de fase.
2. O boost do **café do superávit** tem que conter um alimento cujo nome case com
   `/whey extra da fase/i` — `tests/lib/phase-nutrition.test.ts:39` cobra isso em
   **toda** variante do café.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `src/data/meal-plan-seed.ts` | cardápio (fonte única) | modificar |
| `src/data/marmita-domingo-seed.ts` | roteiro de domingo, puro | **criar** |
| `src/pages/path/MarmitaDomingo.tsx` | tela do roteiro | **criar** |
| `src/main.tsx` | rota `/trilha/alimentacao/domingo` | modificar |
| `src/pages/path/MealPlanView.tsx` | link para o roteiro | modificar |
| `src/lib/today-routine.ts` | itens de domingo apontam pro roteiro | modificar |
| `src/lib/path-seed.ts` | exporta e bumpa `MEAL_PLAN_VERSION` | modificar |
| `tests/data/sem-ultraprocessado.test.ts` | rede do banido | **criar** |
| `tests/data/variantes-proximas-do-alvo.test.ts` | guard de 10% | **criar** |
| `tests/data/esforco-semana.test.ts` | nada exige fogão em dia de semana | **criar** |
| `tests/data/marmita-domingo.test.ts` | roteiro cabe em 1h30 e tem paralelismo | **criar** |
| `tests/pages/marmita-domingo.smoke.test.tsx` | a tela serve o roteiro | **criar** |
| `tests/data/meal-plan-seed.test.ts` | remove o teste do peito de peru | modificar |
| `tests/data/meal-plan-coerencia.test.ts` | passa a cobrar a calibragem contra o gasto real | modificar |
| `tests/lib/seeds-chegam-no-aparelho.test.ts` | chegada do plano alimentar | modificar |

---

## Task 1: o lanche das 15h30 ganha proteína de verdade e perde o ultraprocessado

**Files:**
- Modify: `src/data/meal-plan-seed.ts` (slot `lanche`, linhas ~466-584)
- Modify: `tests/data/meal-plan-seed.test.ts` (remove o teste do peito de peru)
- Test: `tests/data/sem-ultraprocessado.test.ts` (criar)

**Interfaces:**
- Consumes: `MealSlot`, `MealVariant`, `Ingredient` de `src/lib/db`; `ALL_MEAL_PLANS` do próprio seed.
- Produces: as três variantes de lanche com ≥21 g de proteína cada e sem alimento
  da lista banida. Tasks 2 e 4 dependem de `lanche-1` já valer 365 kcal.

- [ ] **Step 1: escrever o teste que falha — a lista banida**

Criar `tests/data/sem-ultraprocessado.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// Esta rede varre NOME DE ALIMENTO e NOME DE INGREDIENTE dos planos — nunca
// prosa de tela. A distinção é deliberada e já custou caro quatro vezes neste
// projeto: teste que proíbe uma palavra também proíbe negá-la, e uma varredura
// de `src/` apagaria a frase honesta "saiu o peito de peru do lanche" junto com
// o alimento. Aqui a afirmação proibida é servir o alimento, não citá-lo.
const BANIDOS = [
  "peito de peru",
  "presunto",
  "mortadela",
  "salsicha",
  "linguiça",
  "nugget",
  "hambúrguer congelado",
  "macarrão instantâneo",
  "empanado",
];

// Pão de forma e whey ficam de fora da lista de propósito. Pão de forma é o que
// torna o lanche do trabalho portátil e sem cheiro, e whey é suplemento de
// proteína isolada — nenhum dos dois é a categoria que esta frente combate
// (carne processada e prato pronto de micro-ondas).

const nomes = ALL_MEAL_PLANS.flatMap((p) =>
  p.slots.flatMap((s) =>
    s.variants.flatMap((v) => [
      ...v.foods.map((f) => ({ plano: p.name, opcao: v.id, texto: f.name })),
      ...v.ingredients.map((i) => ({ plano: p.name, opcao: v.id, texto: i.item })),
    ]),
  ),
);

describe("o cardápio não serve ultraprocessado", () => {
  it("nenhum alimento nem ingrediente, em nenhum plano, está na lista banida", () => {
    const achados = nomes.filter(({ texto }) =>
      BANIDOS.some((b) => texto.toLowerCase().includes(b)),
    );
    expect(achados).toEqual([]);
  });

  it("o lanche do trabalho tem proteína de verdade — ele segura 5 km, 1h de cães e o treino", () => {
    const fracos = ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === "lanche")
        .flatMap((s) =>
          s.variants.map((v) => ({
            plano: p.name,
            opcao: v.id,
            proteina: v.foods.reduce((t, f) => t + (f.proteinG ?? 0), 0),
          })),
        ),
    ).filter((x) => x.proteina < 20);
    expect(fracos).toEqual([]);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/sem-ultraprocessado.test.ts
```

Esperado: **FAIL** nos dois testes — o primeiro acusa `Peito de peru fatiado`
(alimento e ingrediente, nos três planos); o segundo acusa `lanche-1` (14 g) e
`lanche-3` (7 g).

- [ ] **Step 3: reescrever as três variantes do lanche**

Em `src/data/meal-plan-seed.ts`, substituir **inteiramente** as três variantes do
slot `lanche` (mantendo `targetKcal: 350`). Substituir também o comentário do
bloco do slot, que hoje justifica evitar castanha:

```ts
  // ─── LANCHE (~350 kcal) ───────────────────────────────────────────────────
  // Ela come às 15h30, caminha 5 km do trabalho pra casa, passeia 1h com os cães
  // e treina 18h15 — tudo depois deste lanche e antes do jantar. Duas regras
  // saem daí, e nenhuma é preferência:
  //
  // 1. ≤5g de gordura em toda opção. Gordura atrasa o esvaziamento gástrico e
  //    pesa exatamente nessa janela — por isso a castanha de caju que esta
  //    frente trouxe para o cardápio entra no CAFÉ, nunca aqui.
  // 2. ≥20g de proteína em toda opção. Antes desta frente, duas das três
  //    opções entregavam 14g e 7g: o lanche parecia cumprido e o jantar
  //    descontrolava às 19h30, que é o ponto de falha real dela.
  {
    mealType: "lanche",
    targetKcal: 350,
    variants: [
      {
        id: "lanche-1",
        label: "Opção 1 · Iogurte com whey, banana & aveia",
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
            name: "Banana grande",
            qtyG: 170,
            kcal: 142,
            proteinG: 1,
            carbG: 36,
            fatG: 0,
            preparation: "Ao natural, picada por cima do iogurte ou à parte.",
          },
          {
            // Metade da aveia que havia aqui trocada por whey: a opção somava
            // 14g de proteína num lanche que precisa segurar 5 km a pé, 1h de
            // cães e o treino. Mesma kcal, o dobro de proteína, mesmo zero
            // preparo — o pó vai no potinho de casa e mistura na hora.
            name: "Whey protein (1/2 scoop) & aveia em flocos (2 colheres de sopa)",
            qtyG: 40,
            kcal: 155,
            proteinG: 19,
            carbG: 16,
            fatG: 3,
            preparation:
              "Leva o pó já medido num potinho. Na hora, joga por cima do iogurte e mexe — sem cozinhar, sem liquidificador.",
          },
        ],
        ingredients: [
          { item: "Iogurte natural desnatado", qty: 170, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Aveia em flocos", qty: 20, unit: "g", category: "carboidrato" },
          { item: "Whey protein", qty: 20, unit: "g", category: "laticinio" },
        ],
      },
      {
        id: "lanche-2",
        label: "Opção 2 · Pão com patê de atum caseiro & banana",
        // Era zero-preparo com peito de peru fatiado. O patê é feito no domingo
        // e dura os três primeiros dias da semana na geladeira — dia útil
        // continua sendo só montar.
        effort: "lote-domingo",
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
            // Substitui o peito de peru, que era o único ultraprocessado do
            // cardápio e o pedido explícito dela. Iogurte no lugar de maionese
            // não é purismo: maionese sozinha colocaria ~10g de gordura num
            // lanche com teto de 5g.
            name: "Patê de atum caseiro (1 lata escorrida + iogurte)",
            qtyG: 130,
            kcal: 125,
            proteinG: 27,
            carbG: 2,
            fatG: 1,
            preparation:
              "Escorre bem uma lata de atum em água. Amassa com garfo junto de 2 colheres de sopa de iogurte natural, suco de meio limão, cebolinha picada, sal e pimenta. Rende 3 porções e dura 3 dias na geladeira — faz no domingo, num pote fechado.",
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
          { item: "Pão de forma", qty: 2, unit: "fatias", category: "carboidrato" },
          { item: "Atum em água (lata)", qty: 100, unit: "g", category: "proteina" },
          { item: "Iogurte natural desnatado", qty: 30, unit: "g", category: "laticinio" },
          { item: "Limão", qty: 1, unit: "un", category: "hortifruti" },
          { item: "Cebolinha", qty: 5, unit: "g", category: "hortifruti" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      {
        id: "lanche-3",
        label: "Opção 3 · Cuscuz pequeno com whey & banana",
        effort: "5-min",
        foods: [
          {
            // Era 180g de cuscuz sozinho: 276 kcal de carboidrato quase puro,
            // 6g de proteína. Porção menor abre espaço pro whey sem passar do
            // alvo do slot.
            name: "Cuscuz de milho pequeno (sem manteiga)",
            qtyG: 110,
            kcal: 168,
            proteinG: 4,
            carbG: 35,
            fatG: 2,
            preparation:
              "Hidrata 37g de flocão com água morna e sal de manhã, descansa 5 min, cozinha na cuscuzeira (ou micro-ondas ~4 min). Leva pronto e frio pro trabalho — come em temperatura ambiente.",
          },
          {
            name: "Whey protein (1/2 scoop) batido com água",
            qtyG: 20,
            kcal: 80,
            proteinG: 16,
            carbG: 2,
            fatG: 1,
            preparation:
              "Pó medido de casa no shaker. No trabalho, só água e chacoalha — 20 segundos.",
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
          { item: "Flocão de milho (cuscuz)", qty: 37, unit: "g", category: "carboidrato" },
          { item: "Whey protein", qty: 20, unit: "g", category: "laticinio" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
    ],
  },
```

- [ ] **Step 4: remover o teste do peito de peru**

Em `tests/data/meal-plan-seed.test.ts`, apagar o bloco das linhas 98-102 (`it("as
kcal do peito de peru batem com os próprios macros", ...)`) inteiro. Ele mede um
alimento que deixou de existir.

No mesmo arquivo, ajustar o comentário das linhas 42-45 (que cita o peito de peru
como histórico) para:

```ts
  // As três opções do lanche têm que ser intercambiáveis: escolher a 2 em vez
  // da 1 não pode custar o dia. O caso que originou este teste foi um alimento
  // cujas kcal declaradas não batiam com os próprios macros e derrubava a opção
  // 2 pra 338 contra o alvo 350; a frente 5 tirou esse alimento do cardápio, e
  // a proteção contra o desvio continua.
```

- [ ] **Step 5: atualizar os macros declarados do plano de déficit**

`INITIAL_PLAN` (linha ~764). `kcalDaily` **não muda** — só os macros, que agora
descrevem a variante 0 nova (a troca de aveia por whey no `lanche-1` sobe a
proteína e desce o carboidrato):

```ts
export const INITIAL_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano padrão · emagrecimento (2300 kcal)",
  goal: "deficit",
  kcalDaily: 2300,
  // Batem com a soma real da variante 0 (ver tests/data/meal-plan-coerencia.test.ts):
  // 2335 kcal, 203g proteína, 260g carbo, 53g gordura. A proteína subiu de 190
  // com a troca de metade da aveia do lanche por whey.
  proteinG: 203,
  carbG: 260,
  fatG: 53,
  slots: SLOTS,
  defaultMeals: deriveDefaultMeals(SLOTS),
};
```

- [ ] **Step 6: rodar a suíte de dados**

```
npx vitest run tests/data/ tests/lib/phase-nutrition.test.ts
```

Esperado: **PASS**. Se `meal-plan-seed.test.ts` reclamar de proteína ou faixa de
kcal, **pare e reporte** — os números acima foram fechados contra as invariantes.

- [ ] **Step 7: provar por mutação que a rede morde**

Trocar `"Atum em água (lata)"` por `"Peito de peru fatiado"` no `ingredients` de
`lanche-2`, rodar `npx vitest run tests/data/sem-ultraprocessado.test.ts`,
confirmar **FAIL**, e reverter. Depois baixar a proteína do patê para `10` e
confirmar que o segundo teste falha; reverter.

- [ ] **Step 8: commit**

```bash
git add src/data/meal-plan-seed.ts tests/data/sem-ultraprocessado.test.ts tests/data/meal-plan-seed.test.ts
git commit -m "feat(comida): o lanche das 15h30 perde o ultraprocessado e ganha proteína"
```

---

## Task 2: castanha de caju e feijão de corda entram, e as variantes desviadas voltam pro alvo

**Files:**
- Modify: `src/data/meal-plan-seed.ts` (variantes `cafe-2`, `cafe-3`, `cafe-4`, `almoco-2`, `almoco-3`, `jantar-3`)
- Test: `tests/data/variantes-proximas-do-alvo.test.ts` (criar)

**Interfaces:**
- Consumes: as variantes do lanche já corrigidas na Task 1.
- Produces: nenhuma variante de nenhum plano acima de 10% de desvio; castanha de
  caju presente em ≥3 variantes de café e em nenhuma de lanche.

- [ ] **Step 1: escrever o teste que falha**

Criar `tests/data/variantes-proximas-do-alvo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// Aperta pra 10% o guard de ±15% que vive em meal-plan-seed.test.ts. Os 15%
// eram margem herdada da frente 1, e sete variantes estavam ocupando a faixa
// dos 12-15% — trocar de opção custava até 100 kcal do dia sem nada avisar.
// Esta frente reaproxima essas variantes ao trocar alimentos, e o guard mais
// apertado é o que impede a folga de voltar sozinha.
describe("trocar de opção não muda o dia", () => {
  it("nenhuma variante, em nenhum plano, desvia mais de 10% do alvo do seu slot", () => {
    const violacoes = ALL_MEAL_PLANS.flatMap((plano) =>
      plano.slots.flatMap((slot) =>
        slot.variants.map((v) => {
          const kcal = v.foods.reduce((s, f) => s + f.kcal, 0);
          const desvio = Math.abs(kcal - slot.targetKcal) / slot.targetKcal;
          return {
            plano: plano.name,
            opcao: v.id,
            kcal,
            alvo: slot.targetKcal,
            desvio: `${(desvio * 100).toFixed(1)}%`,
            passa: desvio <= 0.1,
          };
        }),
      ),
    ).filter((r) => !r.passa);
    expect(violacoes).toEqual([]);
  });
});

describe("a castanha de caju entra pelo lugar certo", () => {
  const comCaju = (mealType: string) =>
    ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === mealType)
        .flatMap((s) => s.variants.filter((v) => v.foods.some((f) => /castanha de caju/i.test(f.name)))),
    );

  it("está no café, que é a refeição sem pressa e sem treino em seguida", () => {
    expect(comCaju("cafe").length).toBeGreaterThanOrEqual(3);
  });

  // Não é preferência de sabor: o lanche tem teto de 5g de gordura porque ela
  // caminha 5 km e treina logo depois, e 15g de caju sozinhos são ~7g.
  it("não está em nenhuma opção de lanche", () => {
    expect(comCaju("lanche").map((v) => v.id)).toEqual([]);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/variantes-proximas-do-alvo.test.ts
```

Esperado: **FAIL**. O primeiro teste acusa `cafe-2` (14,2%), `cafe-3` (13,1%) e
`almoco-3` (13,9%) no plano de déficit, e os mesmos com desvio menor nos planos de
fase. Os dois testes de caju falham (nenhuma ocorrência ainda).

- [ ] **Step 3: adicionar castanha de caju às opções 2, 3 e 4 do café**

Em `cafe-2`, depois do café preto, acrescentar ao array `foods`:

```ts
          {
            // A opção 2 somava 472 kcal contra um alvo de 550 — 14,2% de
            // desvio, o pior do cardápio: escolher tapioca em vez de cuscuz
            // custava 78 kcal do dia sem nada avisar. O caju fecha a conta e é
            // produto de Sergipe, barato na feira. É uma fonte de zinco entre as
            // que já estão no plano (carne, ovo, peixe) — não substitui nenhuma.
            name: "Castanha de caju (15g, um punhado pequeno)",
            qtyG: 15,
            kcal: 83,
            proteinG: 3,
            carbG: 5,
            fatG: 7,
            preparation: "Ao natural, do lado do café — sem preparo nenhum.",
          },
```

e ao `ingredients`:

```ts
          { item: "Castanha de caju", qty: 15, unit: "g", category: "mercearia" },
```

Em `cafe-3` (a vitamina), acrescentar ao `foods`:

```ts
          {
            // Fecha os 72 kcal que faltavam pro alvo do slot (a opção somava
            // 478 contra 550). Batida junto, ainda engrossa a vitamina.
            name: "Castanha de caju (15g, um punhado pequeno)",
            qtyG: 15,
            kcal: 83,
            proteinG: 3,
            carbG: 5,
            fatG: 7,
            preparation:
              "Bate junto com o resto — deixa a vitamina mais cremosa — ou come do lado, se preferir a textura.",
          },
```

e ao `ingredients`:

```ts
          { item: "Castanha de caju", qty: 15, unit: "g", category: "mercearia" },
```

Em `cafe-4` (banana & ovos cozidos), acrescentar ao `foods`:

```ts
          {
            // 10g em vez de 15: esta opção estava a 53 kcal do alvo, menos
            // desviada que a 2 e a 3.
            name: "Castanha de caju (10g)",
            qtyG: 10,
            kcal: 56,
            proteinG: 2,
            carbG: 3,
            fatG: 4,
            preparation: "Ao natural — nada pra preparar.",
          },
```

e ao `ingredients`:

```ts
          { item: "Castanha de caju", qty: 10, unit: "g", category: "mercearia" },
```

- [ ] **Step 4: dar peso ao feijão de corda no almoço e no jantar**

Em `almoco-2` (carne moída, macaxeira & jerimum), acrescentar ao `foods`:

```ts
          {
            // O feijão de corda é o carboidrato mais barato e mais local do
            // cardápio, e sai da mesma panela de pressão do domingo. Aqui ele
            // fecha os 53 kcal que faltavam pro alvo do slot.
            name: "Feijão de corda / macassar (meia concha, 50g)",
            qtyG: 50,
            kcal: 48,
            proteinG: 4,
            carbG: 8,
            fatG: 0,
            preparation: "Do lote de domingo — esquenta junto com o resto do prato.",
          },
```

e ao `ingredients`:

```ts
          { item: "Feijão de corda (macassar)", qty: 25, unit: "g", category: "carboidrato" },
```

Em `almoco-3` (peixe, arroz & quiabo), acrescentar ao `foods`:

```ts
          {
            // Esta opção somava 603 kcal contra o alvo de 700 — 13,9% de
            // desvio. Uma concha de feijão de corda fecha quase exato, e é o
            // acompanhamento que já vem pronto do lote de domingo.
            name: "Feijão de corda / macassar (1 concha, 100g)",
            qtyG: 100,
            kcal: 95,
            proteinG: 7,
            carbG: 16,
            fatG: 1,
            preparation: "Do lote de domingo — esquenta junto com o arroz.",
          },
```

e ao `ingredients`:

```ts
          { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
```

Em `jantar-3` (peixe, jerimum & salada), acrescentar ao `foods`:

```ts
          {
            name: "Feijão de corda / macassar (meia concha, 50g)",
            qtyG: 50,
            kcal: 48,
            proteinG: 4,
            carbG: 8,
            fatG: 0,
            preparation: "Do lote de domingo — esquenta junto.",
          },
```

e ao `ingredients`:

```ts
          { item: "Feijão de corda (macassar)", qty: 25, unit: "g", category: "carboidrato" },
```

- [ ] **Step 5: rodar e confirmar que passa**

```
npx vitest run tests/data/
```

Esperado: **PASS** em tudo. O pior desvio passa a ser 4,3% (`lanche-1`).

- [ ] **Step 6: provar por mutação**

Subir o cuscuz do `cafe-1` de 245 para 350 kcal, rodar
`npx vitest run tests/data/variantes-proximas-do-alvo.test.ts`, confirmar **FAIL**
com desvio de 22,7%, e reverter.

- [ ] **Step 7: commit**

```bash
git add src/data/meal-plan-seed.ts tests/data/variantes-proximas-do-alvo.test.ts
git commit -m "feat(comida): castanha de caju e feijão de corda fecham o desvio das variantes"
```

---

## Task 3: nada exige fogão em dia de semana

**Files:**
- Test: `tests/data/esforco-semana.test.ts` (criar)
- Modify: `src/data/meal-plan-seed.ts` — apenas se algum `effort` estiver fora da lista

**Interfaces:**
- Consumes: as variantes das Tasks 1 e 2.
- Produces: garantia de que lanche e jantar só declaram `zero-preparo`, `5-min` ou
  `lote-domingo`.

- [ ] **Step 1: escrever o teste**

Criar `tests/data/esforco-semana.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// As duas refeições que decidem o resultado são o lanche das 15h30 e o jantar
// das 19h30 — os dois pontos de falha dela, ambos déficit agudo depois de
// esforço, não fraqueza. Plano que pede decisão com fome perde; plano que pede
// receita com fome perde mais rápido ainda. Por isso o esforço declarado dessas
// duas refeições é rede de teste, não etiqueta decorativa.
const ACEITOS = ["zero-preparo", "5-min", "lote-domingo"] as const;

describe("dia de semana é montar e esquentar", () => {
  it("toda opção de lanche e de jantar, em todo plano, declara um esforço de dia útil", () => {
    const fora = ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === "lanche" || s.mealType === "jantar")
        .flatMap((s) =>
          s.variants.map((v) => ({ plano: p.name, refeicao: s.mealType, opcao: v.id, effort: v.effort })),
        ),
    ).filter((x) => !x.effort || !(ACEITOS as readonly string[]).includes(x.effort));
    expect(fora).toEqual([]);
  });

  it("o jantar nunca depende só de improviso — ao menos uma opção sai pronta do lote de domingo", () => {
    const semLote = ALL_MEAL_PLANS.filter(
      (p) =>
        !p.slots
          .find((s) => s.mealType === "jantar")!
          .variants.some((v) => v.effort === "lote-domingo"),
    ).map((p) => p.name);
    expect(semLote).toEqual([]);
  });
});
```

- [ ] **Step 2: rodar**

```
npx vitest run tests/data/esforco-semana.test.ts
```

Esperado: **PASS** já na primeira execução — o cardápio depois das Tasks 1 e 2 já
cumpre. Se falhar, corrija o `effort` da variante acusada em
`src/data/meal-plan-seed.ts` (nunca a lista `ACEITOS`).

- [ ] **Step 3: provar por mutação que a rede morde**

Trocar o `effort` de `jantar-2` para `"air-fryer"`, rodar de novo, confirmar
**FAIL**, e reverter.

- [ ] **Step 4: commit**

```bash
git add tests/data/esforco-semana.test.ts
git commit -m "test(comida): trava que nenhuma refeição de dia útil exige receita"
```

---

## Task 4: manutenção e superávit param de mentir

**Files:**
- Modify: `src/data/meal-plan-seed.ts` (`MAINTENANCE_BOOST`, `SURPLUS_BOOST`, `MAINTENANCE_PLAN`, `SURPLUS_PLAN`, e o bloco de comentário da dívida)
- Modify: `tests/data/meal-plan-coerencia.test.ts` (passa a cobrar a calibragem)

**Interfaces:**
- Consumes: `boostSlots(slots, boostByMeal)` (já existe, linha ~788), `CONSUMO` de
  `src/lib/objetivo.ts`.
- Produces: `MAINTENANCE_PLAN.kcalDaily === 3000`, `SURPLUS_PLAN.kcalDaily === 3300`,
  com a soma dos `targetKcal` batendo exata nos dois.

- [ ] **Step 1: escrever o teste que falha**

Em `tests/data/meal-plan-coerencia.test.ts`, acrescentar ao final do arquivo:

```ts
// A dívida que a frente 1 registrou e esta frente paga: manutenção (2450) e
// superávit (2700) foram calculados contra um gasto estimado de ~2700 kcal,
// antes de CONSUMO.gastoEstimadoKcalMin/Max contar a caminhada de 5 km. Com ela
// contada, o gasto real é 2900-3100 — e o plano chamado "manutenção" era um
// déficit de ~550 kcal. Ela troca pra ele quando a cintura chegar a 88 (mês
// 3-4), e construiria glúteo em déficit sem saber.
describe("manutenção e superávit são calibrados contra o gasto real", () => {
  const gastoMedio = (CONSUMO.gastoEstimadoKcalMin + CONSUMO.gastoEstimadoKcalMax) / 2;

  it("manutenção fica dentro de 5% do gasto real — é isso que a palavra significa", () => {
    const m = ALL_MEAL_PLANS.find((p) => p.goal === "manutencao")!;
    const desvio = Math.abs(m.kcalDaily - gastoMedio) / gastoMedio;
    expect({ kcalDaily: m.kcalDaily, dentroDe5pct: desvio <= 0.05 })
      .toEqual({ kcalDaily: m.kcalDaily, dentroDe5pct: true });
  });

  it("superávit fica acima do gasto real — senão não é superávit", () => {
    const s = ALL_MEAL_PLANS.find((p) => p.goal === "superavit")!;
    expect(s.kcalDaily).toBeGreaterThan(CONSUMO.gastoEstimadoKcalMax);
  });

  it("o nome de cada plano diz o mesmo número que o plano carrega", () => {
    const mentem = ALL_MEAL_PLANS.filter((p) => !p.name.includes(String(p.kcalDaily)))
      .map((p) => ({ nome: p.name, kcalDaily: p.kcalDaily }));
    expect(mentem).toEqual([]);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/meal-plan-coerencia.test.ts
```

Esperado: **FAIL** nos dois primeiros — manutenção em 2450 (desvio 18,3% contra o
gasto médio de 3000) e superávit em 2700 (abaixo de 3100).

- [ ] **Step 3: substituir os dois boosts**

Em `src/data/meal-plan-seed.ts`, substituir `MAINTENANCE_BOOST` e `SURPLUS_BOOST`
inteiros (linhas ~805-863), junto do bloco de comentário que os precede:

```ts
// Manutenção: +700 kcal sobre a base de 2300, fechando 3000. O número anterior
// (+150, fechando 2450) foi calculado contra um gasto estimado de ~2700 — antes
// de CONSUMO.gastoEstimadoKcalMin/Max (objetivo.ts) contar a caminhada de 5 km
// do trabalho pra casa. Com ela contada, o gasto real é 2900-3100, e o plano
// que se chamava "manutenção" era um déficit de ~550 kcal/dia. Ela troca pra
// este plano quando a cintura chegar a 88 (mês 3-4), que é exatamente a fase de
// construir glúteo: construir em déficit sem saber é o pior desfecho possível.
//
// A soma dos quatro acréscimos tem que dar 700 EXATOS — boostSlots soma o mesmo
// valor ao targetKcal do slot e a cada variante dele, e a invariante testada é
// que a soma dos alvos seja o kcalDaily declarado.
const MAINTENANCE_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [{ name: "Castanha de caju da fase (27g, um punhado cheio)", qtyG: 27, kcal: 150, proteinG: 5, carbG: 8, fatG: 12, preparation: "Ao natural, junto do café — sem preparo." }],
    ingredients: [{ item: "Castanha de caju", qty: 27, unit: "g", category: "mercearia" }],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+90g arroz, +100g feijão)", qtyG: 190, kcal: 200, proteinG: 9, carbG: 39, fatG: 1, preparation: "Porção maior dos dois — os dois já saem prontos do lote de domingo." }],
    ingredients: [
      { item: "Arroz", qty: 48, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    // Carboidrato puro, gordura ZERO — e isso não é estilo. A base do lanche já
    // usa 3-4g dos 5g de teto (ela caminha 5 km e treina logo depois), então
    // qualquer gordura aqui estoura o teto em toda variante de uma vez.
    foods: [{ name: "Macaxeira cozida do lote (120g)", qtyG: 120, kcal: 150, proteinG: 1, carbG: 36, fatG: 0, preparation: "Cozida no domingo, comida fria mesmo — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 120, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Arroz extra da fase (+92g cozido) & azeite (1 cs)", qtyG: 104, kcal: 200, proteinG: 2, carbG: 22, fatG: 11, preparation: "Mais arroz e um fio generoso de azeite por cima do prato." }],
    ingredients: [
      { item: "Arroz", qty: 49, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};

// Superávit leve: +1000 kcal sobre a base de 2300, fechando 3300 — acima do teto
// do gasto estimado (3100), que é o que faz a palavra "superávit" ser verdade.
// Mesma dívida do bloco acima: o número anterior (+400, fechando 2700) ficava
// ABAIXO do gasto real, ou seja, o plano de crescer glúteo era um déficit.
//
// O whey do café não é enfeite nem pode ser trocado por outra fonte: o nome
// precisa casar com /whey extra da fase/i em TODA variante do café — é o que
// tests/lib/phase-nutrition.test.ts cobra. Soma dos acréscimos: 1000 exatos.
const SURPLUS_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [
      { name: "Whey extra da fase (1 scoop)", qtyG: 30, kcal: 120, proteinG: 24, carbG: 3, fatG: 1, preparation: "Bate junto na vitamina ou dissolve no leite/água." },
      { name: "Castanha de caju da fase (32g)", qtyG: 32, kcal: 180, proteinG: 6, carbG: 10, fatG: 14, preparation: "Ao natural, junto do café." },
    ],
    ingredients: [
      { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
      { item: "Castanha de caju", qty: 32, unit: "g", category: "mercearia" },
    ],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+110g arroz, +130g feijão)", qtyG: 240, kcal: 250, proteinG: 11, carbG: 49, fatG: 1, preparation: "Porção maior dos dois pra sustentar o ganho de glúteo." }],
    ingredients: [
      { item: "Arroz", qty: 59, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 65, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    // Sem gordura aqui de propósito, mesmo na fase de crescer o glúteo: o
    // lanche continua sendo o pré-treino (5 km a pé + 1h de cães + treino logo
    // depois), e o teto de 5g de gordura do slot não relaxa por causa da fase.
    foods: [{ name: "Macaxeira cozida do lote (160g)", qtyG: 160, kcal: 200, proteinG: 1, carbG: 48, fatG: 0, preparation: "Cozida no domingo, comida fria — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 160, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Batata doce extra da fase (105g) & azeite (1 cs)", qtyG: 117, kcal: 250, proteinG: 2, carbG: 35, fatG: 11, preparation: "Cozida ou no vapor, junto com o jantar, com um fio generoso de azeite." }],
    ingredients: [
      { item: "Batata doce", qty: 105, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};
```

- [ ] **Step 4: substituir os dois planos declarados**

Remover o bloco de comentário `// DÍVIDA REGISTRADA (2026-08): ...` (linhas
~868-877) — a dívida foi paga, e mantê-lo escrito passaria a ser a mentira que ele
existia para evitar. No lugar, os dois planos:

```ts
export const MAINTENANCE_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · manutenção (3000 kcal)",
  goal: "manutencao",
  kcalDaily: 3000,
  // Soma real da variante 0 com o boost: 3035 kcal, 220g proteína, 365g carbo,
  // 77g gordura. A gordura não é sobra de conta: abaixo de ~20% das kcal ela
  // derruba testosterona, e é a testosterona que sustenta metade dos objetivos
  // desta fase (ver a frente 2).
  proteinG: 220,
  carbG: 365,
  fatG: 77,
  slots: MAINTENANCE_SLOTS,
  defaultMeals: deriveDefaultMeals(MAINTENANCE_SLOTS),
};

export const SURPLUS_PLAN: Omit<MealPlan, "id"> = {
  name: "Plano · superávit leve (3300 kcal)",
  goal: "superavit",
  kcalDaily: 3300,
  // Soma real da variante 0 com o boost: 3335 kcal, 247g proteína, 405g carbo,
  // 80g gordura.
  proteinG: 247,
  carbG: 405,
  fatG: 80,
  slots: SURPLUS_SLOTS,
  defaultMeals: deriveDefaultMeals(SURPLUS_SLOTS),
};
```

- [ ] **Step 5: rodar a suíte inteira de dados e de lib**

```
npx vitest run tests/data/ tests/lib/
```

Esperado: **PASS**. As invariantes conferidas de uma vez: soma dos alvos = 3000 e
3300; comida real dentro de 3%; gordura do lanche ≤5 g nos três planos; whey no
café do superávit; nenhuma variante acima de 10%.

Se a soma dos alvos não bater exata, **pare e reporte o delta** — não coe a
diferença em vários itens (foi o que a frente 1 teve de desfazer duas vezes).

- [ ] **Step 6: provar por mutação**

Baixar `MAINTENANCE_PLAN.kcalDaily` para 2450 sem tocar nos boosts, rodar
`npx vitest run tests/data/meal-plan-coerencia.test.ts`, confirmar **FAIL** em
três testes distintos (soma dos alvos, calibragem contra o gasto, nome que mente),
e reverter.

- [ ] **Step 7: commit**

```bash
git add src/data/meal-plan-seed.ts tests/data/meal-plan-coerencia.test.ts
git commit -m "fix(comida): manutenção e superávit calibrados contra o gasto real"
```

---

## Task 5: o domingo vira roteiro com ordem de execução

**Files:**
- Create: `src/data/marmita-domingo-seed.ts`
- Test: `tests/data/marmita-domingo.test.ts`

**Interfaces:**
- Produces (usado pelas Tasks 6 e 7):
  ```ts
  export interface EtapaMarmita {
    id: string;
    ordem: number;          // 0 = sábado à noite
    titulo: string;
    maoNaMassaMin: number;  // minutos com ela de pé na cozinha
    sozinhoMin: number;     // minutos cozinhando sem ela olhar
    comoFazer: string;
    rende: string;
  }
  export const ROTEIRO_DOMINGO: readonly EtapaMarmita[];
  export const MARMITA_TETO_MIN = 90;
  ```

- [ ] **Step 1: escrever o teste que falha**

Criar `tests/data/marmita-domingo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ROTEIRO_DOMINGO, MARMITA_TETO_MIN } from "../../src/data/marmita-domingo-seed";

// Decisão dela, 2026-08-11: ~1h30 de domingo, 2 ou 3 panelas em paralelo. Não é
// o teto ambicioso de 3h de propósito — domingo longo demais vira domingo
// pulado, e domingo pulado quebra a semana inteira. O que o teto mede é o tempo
// DELA de pé na cozinha, não o tempo de panela: panela que cozinha sozinha não
// custa domingo.
describe("o roteiro de domingo cabe no domingo dela", () => {
  it("o tempo de mão na massa somado não passa de 1h30", () => {
    const total = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);
    expect({ total, teto: MARMITA_TETO_MIN, cabe: total <= MARMITA_TETO_MIN })
      .toEqual({ total, teto: MARMITA_TETO_MIN, cabe: true });
  });

  // Sem paralelismo, 1h30 não entrega proteína em lote, carboidrato e feijão.
  // O que faz o roteiro caber é o que cozinha sem ela olhando.
  it("mais tempo cozinha sozinho do que ocupa ela", () => {
    const sozinho = ROTEIRO_DOMINGO.reduce((s, e) => s + e.sozinhoMin, 0);
    const ocupada = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);
    expect(sozinho).toBeGreaterThan(ocupada);
  });

  it("as etapas estão em ordem, sem repetir número e sem buraco", () => {
    const ordens = ROTEIRO_DOMINGO.map((e) => e.ordem);
    expect(ordens).toEqual([...ordens].sort((a, b) => a - b));
    expect(new Set(ordens).size).toBe(ordens.length);
    expect(ordens).toEqual(ordens.map((_, i) => i));
  });

  it("toda etapa diz o que rende — roteiro sem rendimento não vira marmita", () => {
    const mudas = ROTEIRO_DOMINGO.filter((e) => !e.rende.trim() || !e.comoFazer.trim()).map((e) => e.id);
    expect(mudas).toEqual([]);
  });

  // O molho do feijão de corda é de 2h. Se ele não estiver na véspera, o
  // domingo estoura antes de começar — e é a etapa que o app precisa lembrar
  // no sábado, não no domingo de manhã.
  it("a etapa 0 acontece no sábado à noite", () => {
    expect(ROTEIRO_DOMINGO[0].titulo.toLowerCase()).toContain("sábado");
    expect(ROTEIRO_DOMINGO[0].maoNaMassaMin).toBeLessThanOrEqual(5);
  });

  // O lote de domingo é o que sustenta o `effort: "lote-domingo"` declarado nas
  // refeições. Se o roteiro não produz proteína em lote, a etiqueta mente.
  it("o roteiro produz proteína em lote", () => {
    const texto = ROTEIRO_DOMINGO.map((e) => `${e.titulo} ${e.rende}`).join(" ").toLowerCase();
    expect(texto).toMatch(/frango/);
    expect(texto).toMatch(/ovo/);
    expect(texto).toMatch(/atum/);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/marmita-domingo.test.ts
```

Esperado: **FAIL** — módulo não existe.

- [ ] **Step 3: criar o seed**

Criar `src/data/marmita-domingo-seed.ts`:

```ts
// Roteiro do domingo — módulo puro, sem db e sem Date.
//
// O app já tinha um item "Marmita da semana" no domingo com um subtítulo vago
// ("Frango + ovos + feijão + macaxeira + legumes"). Item vago em dia de folga
// perde para o sofá: não diz por onde começar, e começar é a parte cara.
//
// A ordem aqui não é sugestão, é o que faz 1h30 render: o que demora mais e
// cozinha sozinho vai ao fogo primeiro, o que precisa dela fica para as janelas
// em que as panelas estão trabalhando. `maoNaMassaMin` é o tempo dela de pé;
// `sozinhoMin` é o tempo de panela, que não custa domingo.

export interface EtapaMarmita {
  id: string;
  /** 0 é a véspera. Os testes cobram sequência sem buraco. */
  ordem: number;
  titulo: string;
  /** Minutos com ela de pé na cozinha. A soma é o que respeita MARMITA_TETO_MIN. */
  maoNaMassaMin: number;
  /** Minutos cozinhando sem ela olhar — é o que faz o roteiro caber. */
  sozinhoMin: number;
  comoFazer: string;
  rende: string;
}

/** Decisão dela (2026-08-11): ~1h30 de domingo. Teto do tempo DELA, não da panela. */
export const MARMITA_TETO_MIN = 90;

export const ROTEIRO_DOMINGO: readonly EtapaMarmita[] = [
  {
    id: "vespera-feijao",
    ordem: 0,
    titulo: "Sábado à noite · feijão de corda de molho",
    maoNaMassaMin: 3,
    sozinhoMin: 480,
    comoFazer:
      "Cobre 300g de feijão de corda com água numa vasilha grande e deixa na pia até de manhã. São 3 minutos que economizam meia hora de domingo — feijão sem molho cozinha o dobro do tempo.",
    rende: "Feijão de corda pronto pra ir à pressão logo cedo — 6 a 7 conchas na semana.",
  },
  {
    id: "pressao-feijao",
    ordem: 1,
    titulo: "Feijão de corda na pressão",
    maoNaMassaMin: 5,
    sozinhoMin: 25,
    comoFazer:
      "Escorre o feijão, joga na pressão com alho, cebola, louro e água dois dedos acima. Fecha e liga em fogo alto. Quando pegar pressão, baixa e conta 18 minutos. Sal só no fim. Esta é a primeira panela porque é a que mais demora sozinha.",
    rende: "6 a 7 conchas — cobre o almoço e o jantar da semana toda.",
  },
  {
    id: "frango-lote",
    ordem: 2,
    titulo: "Frango na segunda panela",
    maoNaMassaMin: 6,
    sozinhoMin: 25,
    comoFazer:
      "Enquanto o feijão trabalha: 1 kg de frango (coxa desossada sai mais barata que o peito e serve igual) em água com sal, alho e louro. Pressão por 20 minutos, ou fervendo por 30. Não precisa olhar.",
    rende: "1 kg — desfia depois e vira o almoço e o jantar de 4 a 5 dias.",
  },
  {
    id: "ovos-lote",
    ordem: 3,
    titulo: "Ovos cozidos da semana",
    maoNaMassaMin: 4,
    sozinhoMin: 10,
    comoFazer:
      "Terceira boca do fogão: água fervendo, 12 ovos, 10 minutos cronometrados pra gema dura. Esfria em água fria e guarda com casca na geladeira — descasca só na hora.",
    rende: "12 ovos — o café da manhã de quase a semana inteira.",
  },
  {
    id: "arroz-lote",
    ordem: 4,
    titulo: "Arroz do lote",
    maoNaMassaMin: 6,
    sozinhoMin: 18,
    comoFazer:
      "Quando o feijão sair da pressão, entra o arroz: alho refogado no azeite, 3 xícaras de arroz, água na proporção 2:1, tampado em fogo baixo por 18 minutos. Não mexe.",
    rende: "Arroz de 5 a 6 refeições.",
  },
  {
    id: "macaxeira-jerimum",
    ordem: 5,
    titulo: "Macaxeira e jerimum",
    maoNaMassaMin: 12,
    sozinhoMin: 25,
    comoFazer:
      "Descasca 1 kg de macaxeira e corta em pedaços grandes — é a etapa mais braçal do dia, e é por isso que ela vem depois, quando as outras panelas já estão trabalhando sozinhas. Cozinha em água com sal por 20-25 minutos. Na panela do lado, jerimum em cubos, 10 minutos no vapor.",
    rende: "Carboidrato e legume de 4 a 5 refeições — inclusive a macaxeira fria que vai no lanche do trabalho.",
  },
  {
    id: "pate-atum",
    ordem: 6,
    titulo: "Patê de atum (sem fogo)",
    maoNaMassaMin: 6,
    sozinhoMin: 0,
    comoFazer:
      "Enquanto a macaxeira cozinha: escorre 2 latas de atum em água, amassa com garfo junto de 4 colheres de sopa de iogurte natural, suco de 1 limão, cebolinha picada, sal e pimenta. Pote fechado na geladeira.",
    rende: "6 porções — o lanche do trabalho dos 3 primeiros dias (depois disso, atum não guarda bem).",
  },
  {
    id: "desfiar-porcionar",
    ordem: 7,
    titulo: "Desfiar, esfriar e porcionar",
    maoNaMassaMin: 20,
    sozinhoMin: 0,
    comoFazer:
      "Desfia o frango com dois garfos e refoga rápido com cebola, alho e tomate. Deixa tudo esfriar destampado antes de fechar os potes — pote fechado quente vira água no fundo e estraga em dois dias. Monta as marmitas do almoço já prontas: proteína, arroz, feijão, legume.",
    rende: "As marmitas da semana montadas — dia útil vira esquentar, não cozinhar.",
  },
];
```

- [ ] **Step 4: rodar e confirmar que passa**

```
npx vitest run tests/data/marmita-domingo.test.ts
```

Esperado: **PASS**. Soma de `maoNaMassaMin` = 62 (teto 90); soma de `sozinhoMin` =
583.

- [ ] **Step 5: provar por mutação**

Subir `maoNaMassaMin` de `desfiar-porcionar` para 50 (soma = 92), confirmar
**FAIL** no primeiro teste, e reverter. Depois trocar `ordem: 3` por `ordem: 5` e
confirmar **FAIL** no teste de sequência; reverter.

- [ ] **Step 6: commit**

```bash
git add src/data/marmita-domingo-seed.ts tests/data/marmita-domingo.test.ts
git commit -m "feat(comida): o domingo vira roteiro com ordem de execução"
```

---

## Task 6: a tela do roteiro, e o domingo do Hoje apontando pra ela

**Files:**
- Create: `src/pages/path/MarmitaDomingo.tsx`
- Modify: `src/main.tsx` (rota nova, junto das linhas 129-131)
- Modify: `src/pages/path/MealPlanView.tsx` (botão para o roteiro)
- Modify: `src/lib/today-routine.ts:240,242`
- Test: `tests/pages/marmita-domingo.smoke.test.tsx`

**Interfaces:**
- Consumes: `ROTEIRO_DOMINGO`, `MARMITA_TETO_MIN` de `src/data/marmita-domingo-seed`;
  `PathTabs` de `src/components/PathTabs`.
- Produces: rota `/trilha/alimentacao/domingo`.

- [ ] **Step 1: escrever o teste que falha**

Criar `tests/pages/marmita-domingo.smoke.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MarmitaDomingo } from "../../src/pages/path/MarmitaDomingo";
import { ROTEIRO_DOMINGO } from "../../src/data/marmita-domingo-seed";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("tela do roteiro de domingo", () => {
  it("serve todas as etapas, na ordem do seed", () => {
    render(
      <MemoryRouter>
        <MarmitaDomingo />
      </MemoryRouter>,
    );
    for (const etapa of ROTEIRO_DOMINGO) {
      expect(screen.getByText(etapa.titulo)).toBeInTheDocument();
    }
  });

  it("mostra quanto tempo o domingo custa de verdade", () => {
    render(
      <MemoryRouter>
        <MarmitaDomingo />
      </MemoryRouter>,
    );
    // 62 min de mão na massa — o número que decide se ela começa ou não.
    expect(screen.getByText(/62 min/)).toBeInTheDocument();
  });
});

describe("o domingo do Hoje leva ao roteiro", () => {
  it("o item de domingo aponta pra tela do roteiro, não pro plano genérico", () => {
    const domingo = buildDayRoutine(0, 100);
    const item = domingo.blocks
      .flatMap((b) => b.items)
      .find((i) => i.id === "marmita-domingo")!;
    expect(item.to).toBe("/trilha/alimentacao/domingo");
  });

  it("o lembrete de dia útil aponta pro mesmo lugar", () => {
    const quarta = buildDayRoutine(3, 100);
    const item = quarta.blocks
      .flatMap((b) => b.items)
      .find((i) => i.id === "lembrete-domingo-marmita")!;
    expect(item.to).toBe("/trilha/alimentacao/domingo");
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/pages/marmita-domingo.smoke.test.tsx
```

Esperado: **FAIL** — o componente não existe.

- [ ] **Step 3: criar a tela**

Criar `src/pages/path/MarmitaDomingo.tsx`:

```tsx
import { Link } from "react-router-dom";
import { PathTabs } from "../../components/PathTabs";
import { ROTEIRO_DOMINGO, MARMITA_TETO_MIN } from "../../data/marmita-domingo-seed";

export function MarmitaDomingo() {
  const maoNaMassa = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-1">Domingo · o lote da semana</h2>
        <p className="text-nude text-sm leading-relaxed">
          <span className="text-nude-warm">{maoNaMassa} min</span> de pé na cozinha, dentro do teto
          de {MARMITA_TETO_MIN}. O resto é panela trabalhando sozinha — por isso a ordem importa: o
          que demora mais vai ao fogo primeiro.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          Depois deste domingo, dia de semana é montar e esquentar. É o domingo que carrega a
          semana, não a força de vontade das 19h30.
        </p>
      </div>

      <ol className="space-y-3">
        {ROTEIRO_DOMINGO.map((etapa) => (
          <li key={etapa.id} className="card">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-nude text-xs">{etapa.ordem === 0 ? "véspera" : etapa.ordem}</span>
              <h3 className="text-nude-warm font-medium flex-1">{etapa.titulo}</h3>
            </div>
            <p className="text-muted text-xs mb-1.5">
              {etapa.maoNaMassaMin} min de mão na massa
              {etapa.sozinhoMin > 0 && ` · ${etapa.sozinhoMin} min cozinhando sozinho`}
            </p>
            <p className="text-nude text-sm leading-relaxed">{etapa.comoFazer}</p>
            <p className="text-nude-warm text-xs mt-1.5">Rende: {etapa.rende}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 4: registrar a rota**

Em `src/main.tsx`, no import junto dos outros de `pages/path`, acrescentar
`MarmitaDomingo`; e logo depois da linha 131 (`lista-compras`), acrescentar:

```tsx
        { path: "trilha/alimentacao/domingo", element: <MarmitaDomingo /> },
```

- [ ] **Step 5: apontar o Hoje pro roteiro**

Em `src/lib/today-routine.ts`, substituir as linhas 240 e 242:

```ts
  if (!isSunday) semanaItems.push({ id: "lembrete-domingo-marmita", block: "semana", label: "Domingo · marmita da semana", to: "/trilha/alimentacao/domingo" });
```

```ts
    semanaItems.unshift({ id: "marmita-domingo", block: "semana", label: "Marmita da semana", subtitle: "Roteiro de 62 min com a ordem do fogo — depois dele, a semana é só esquentar", to: "/trilha/alimentacao/domingo" });
```

- [ ] **Step 6: dar entrada pro roteiro na tela de alimentação**

Em `src/pages/path/MealPlanView.tsx`, dentro da `div` de botões (linhas 130-151),
acrescentar depois do link de lista de compras:

```tsx
        <Link
          to="/trilha/alimentacao/domingo"
          className="flex-1 text-center border border-bg-border text-nude rounded-md py-2.5 text-sm"
        >
          Roteiro de domingo
        </Link>
```

- [ ] **Step 7: rodar**

```
npx vitest run tests/pages/marmita-domingo.smoke.test.tsx tests/lib/today-routine.test.ts tests/lib/rotina-fim-de-semana.test.ts tests/lib/routine-times.test.ts
```

Esperado: **PASS** em tudo.

- [ ] **Step 8: commit**

```bash
git add src/pages/path/MarmitaDomingo.tsx src/main.tsx src/pages/path/MealPlanView.tsx src/lib/today-routine.ts tests/pages/marmita-domingo.smoke.test.tsx
git commit -m "feat(comida): tela do roteiro de domingo, com o Hoje apontando pra ela"
```

---

## Task 7: o cardápio novo chega no aparelho dela

**Files:**
- Modify: `src/lib/path-seed.ts:8` (exportar e bumpar `MEAL_PLAN_VERSION`)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts`
- Test: `tests/lib/shopping-list.test.ts` (estender)

**Interfaces:**
- Consumes: `seedPath()` de `src/lib/path-seed`; `buildShoppingList` de `src/lib/shopping-list`.
- Produces: `export const MEAL_PLAN_VERSION = 9` em `src/lib/path-seed.ts`.

**Por que esta task existe:** sete vezes nesta reforma um conteúdo correto ficou
só no repositório porque o seed mudou sem bump de versão. `MEAL_PLAN_VERSION` é
hoje uma constante **privada** de `path-seed.ts`, fora do alcance de
`seeds-chegam-no-aparelho.test.ts` — a mesma configuração que deixou `seedStyle`
passar sem versão nenhuma.

- [ ] **Step 1: escrever o teste que falha**

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, ajustar o import do topo:

```ts
import { seedPath, MEAL_PLAN_VERSION } from "../../src/lib/path-seed";
```

Acrescentar `const ANTERIOR_PLANO_ALIMENTAR = MEAL_PLAN_VERSION - 1;` junto das
outras derivações (linhas 50-51), e no `describe` do pino de versão (linha 53):

```ts
  it("MEAL_PLAN_VERSION é a versão revisada nesta rodada", () => {
    expect(MEAL_PLAN_VERSION).toBe(9);
  });
```

E, ao final do arquivo, o novo bloco:

```ts
describe("plano alimentar", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.milestones.clear();
    await db.settings.clear();
  });

  it("o cardápio de Aracaju alcança quem estava na versão anterior", async () => {
    // Reconstrói o banco dela: plano já semeado, parado na versão anterior —
    // com o peito de peru no lanche e a manutenção descalibrada.
    await db.settings.put({ key: "pathSeeded", value: true });
    await db.settings.put({ key: "milestoneSeedVersion", value: 7 });
    await db.settings.put({ key: "mealPlanVersion", value: ANTERIOR_PLANO_ALIMENTAR });
    await db.mealPlans.add({
      name: "Plano · manutenção (2450 kcal)",
      goal: "manutencao",
      kcalDaily: 2450,
      proteinG: 185,
      carbG: 266,
      fatG: 70,
      slots: [],
      defaultMeals: [],
    } as never);

    await seedPath();

    const manutencao = (await db.mealPlans.toArray()).find((p) => p.goal === "manutencao")!;
    expect(manutencao.kcalDaily).toBe(3000);
    expect(manutencao.name).toContain("3000");

    // E o ultraprocessado não pode sobreviver pelo banco parado.
    const todos = await db.mealPlans.toArray();
    const nomes = todos.flatMap((p) =>
      p.slots.flatMap((s) => s.variants.flatMap((v) => v.foods.map((f) => f.name))),
    );
    expect(nomes.filter((n) => /peito de peru/i.test(n))).toEqual([]);
    expect(nomes.some((n) => /patê de atum/i.test(n))).toBe(true);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/lib/seeds-chegam-no-aparelho.test.ts
```

Esperado: **FAIL** já no import (`MEAL_PLAN_VERSION` não é exportada).

- [ ] **Step 3: exportar e bumpar a versão**

Em `src/lib/path-seed.ts`, substituir as linhas 5-8:

```ts
// Exportada (e não apenas local a este módulo) pelo mesmo motivo que
// EXERCISE_SEED_VERSION e TEMPLATE_SEED_VERSION são: o teste de chegada
// (tests/lib/seeds-chegam-no-aparelho.test.ts) precisa plantar a versão
// imediatamente anterior, e derivar "anterior = atual − 1" é a única forma de
// esse número não destoar do código com o tempo. Enquanto ela era privada, o
// plano alimentar era o único seed grande sem rede de chegada.
//
// v8 (histórico): o plano de déficit passou de 2.200 para 2.300 kcal.
// v9: o cardápio inteiro foi reescrito — saiu o peito de peru (único
// ultraprocessado), entraram patê de atum, castanha de caju e mais feijão de
// corda, o lanche das 15h30 ganhou proteína de verdade, e manutenção e
// superávit foram recalibrados de 2450/2700 para 3000/3300 contra o gasto real.
// Sem este bump, o aparelho dela continuaria servindo a manutenção que é
// déficit — exatamente na fase em que ela troca pra ele.
export const MEAL_PLAN_VERSION = 9;
```

- [ ] **Step 4: cobrar que a lista de compras acompanha**

Em `tests/lib/shopping-list.test.ts`, acrescentar ao final:

```ts
// `ingredients` tem que acompanhar `foods`: mudar alimento sem mudar o
// ingrediente correspondente faz a lista de compras divergir da receita — erro
// já cometido e pego na frente 1. A lista é o que ela leva pra feira; se o
// atum não estiver nela, o patê não existe na quarta-feira.
describe("a lista de compras acompanha o cardápio de Aracaju", () => {
  it("traz os ingredientes que esta frente introduziu e não traz os que ela tirou", () => {
    const lista = buildShoppingList({ ...INITIAL_PLAN, id: 1 } as never).map((i) => i.item.toLowerCase());
    expect(lista.some((i) => i.includes("atum"))).toBe(true);
    expect(lista.some((i) => i.includes("castanha de caju"))).toBe(true);
    expect(lista.some((i) => i.includes("feijão de corda"))).toBe(true);
    expect(lista.filter((i) => i.includes("peito de peru"))).toEqual([]);
  });
});
```

Se `INITIAL_PLAN` e `buildShoppingList` ainda não estiverem importados nesse
arquivo, acrescentar:

```ts
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
```

- [ ] **Step 5: rodar**

```
npx vitest run tests/lib/seeds-chegam-no-aparelho.test.ts tests/lib/shopping-list.test.ts
```

Esperado: **PASS**.

- [ ] **Step 6: provar por mutação — esta é a prova que mais importa**

Reverter `MEAL_PLAN_VERSION` para 8 em `src/lib/path-seed.ts`, sem tocar em mais
nada. Rodar `npx vitest run tests/lib/seeds-chegam-no-aparelho.test.ts` e
confirmar **FAIL** em dois testes: o pino da versão e a chegada do cardápio (com
o banco parado na v7, a migração não roda e a manutenção continua em 2450).
Reverter para 9.

- [ ] **Step 7: commit**

```bash
git add src/lib/path-seed.ts tests/lib/seeds-chegam-no-aparelho.test.ts tests/lib/shopping-list.test.ts
git commit -m "fix(seed): o cardápio de Aracaju chega no aparelho dela"
```

---

## Task 8: verificação final da frente

**Files:** nenhum novo — esta task é a rede de segurança da branch inteira.

- [ ] **Step 1: suíte completa**

```
npm run test
```

Esperado: **PASS** em tudo, com contagem maior que os 742 testes de antes desta
frente. Nenhum teste pulado.

- [ ] **Step 2: build limpo**

```
npm run build
```

Esperado: sem erro de TypeScript e sem warning novo.

- [ ] **Step 3: conferir a lista de dívidas**

Em `docs/CONTINUAR-AQUI.md`, na seção 9, remover as duas linhas que esta frente
paga:

- "Manutenção e superávit calóricos descalibrados (frente 5 paga)."
- "Sete variantes de refeição entre 12% e 15% de desvio (frente 5)."

E na tabela da seção 1, marcar a frente 5 como no ar com o hash do merge.

- [ ] **Step 4: commit**

```bash
git add docs/CONTINUAR-AQUI.md
git commit -m "docs: a frente 5 fecha, e as duas dívidas que ela paga saem da lista"
```

---

## Self-review contra o spec

| Requisito do spec | Onde é atendido |
|---|---|
| Decisão 1 — domingo carrega a semana, roteiro com ordem | Tasks 5 e 6 |
| Decisão 2 — sai peito de peru | Task 1 |
| Decisão 2 — entra patê de atum caseiro | Task 1 |
| Decisão 2 — entra castanha de caju | Task 2 (café, nunca lanche) |
| Decisão 2 — macaxeira, jerimum, feijão de corda ganham peso | Task 2 (feijão) e Task 4 (macaxeira nos boosts) |
| Decisão 2 — nenhum suplemento de volume sem evidência | Constraint global; o texto do caju diz "uma fonte entre as que já estão no plano" |
| Decisão 3 — lanche das 15h30 com proteína de verdade | Task 1 (≥20 g em toda opção, testado) |
| Decisão 3 — jantar pronto antes de ela chegar | Task 3 (`effort` cobrado + ao menos uma opção de lote) |
| Decisão 4 — invariantes de kcal e proteína | Tasks 1, 2 e 4; testes de coerência estendidos |
| Decisão 4 — sete variantes entre 12% e 15% | Task 2 (guard apertado para 10%; pior caso passa a 4,3%) |
| Decisão 5 — manutenção ≈3000, superávit ≈3300 | Task 4 |
| Arquitetura — bump da versão do plano alimentar | Task 7 |
| Arquitetura — `ingredients` acompanha `foods` | Tasks 1, 2 e 4; cobrado na Task 7 |
| Testes — `sem-ultraprocessado`, `variantes-proximas-do-alvo`, `esforco-semana` | Tasks 1, 2 e 3 |
| Fora de escopo — `objetivo.ts` não é alterado | Nenhuma task toca nele; a Task 4 apenas **lê** `CONSUMO` |

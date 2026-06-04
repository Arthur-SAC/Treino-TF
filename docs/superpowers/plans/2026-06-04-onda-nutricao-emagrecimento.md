# Onda Nutrição (emagrecimento + export neutro) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recalibrar o plano alimentar pra déficit (2200 kcal / 180g proteína), suportar 3 variantes por refeição com ingredientes crus, gerar lista de compras agregada e um export neutro compartilhável (sem nenhuma referência à transição).

**Architecture:** Estende o modelo `MealPlan` no Dexie com `slots` (período → variantes → foods + ingredients), mantendo `defaultMeals` como campo derivado pra não quebrar as telas existentes (`MealsToday`, `MealPlanView`, `ShoppingList`). Lógica pura nova em `lib/` (derivação, lista de compras, export) coberta por testes Vitest. Migração de dados via contador `mealPlanVersion` em `path-seed.ts` (sem bump de schema Dexie, pois nenhum campo novo é indexado).

**Tech Stack:** React 18 + TypeScript + Dexie 4 + Vitest + fake-indexeddb.

**Spec:** `docs/superpowers/specs/2026-06-04-plano-acelerado-nutricao-design.md`

---

## Pré-requisito: git

Esta pasta **não é um repositório git**. Antes de começar, rode `git init` na raiz do projeto (`Treino-TF-main/`) pra que os passos de commit funcionem. Se preferir não versionar agora, **pule todos os passos "Commit"** — eles não afetam o código.

## Comandos úteis

- Rodar um teste específico: `npx vitest run tests/<caminho>.test.ts`
- Rodar tudo: `npm run test`
- Type-check + build: `npm run build`

## Mapa de arquivos

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `src/lib/db.ts` | Tipos `Ingredient`, `MealVariant`, `MealSlot`; estende `MealPlan` | Modificar |
| `src/lib/meal-plan.ts` | `deriveDefaultMeals(slots)` — deriva `defaultMeals` das variantes | Criar |
| `src/lib/shopping-list.ts` | `buildShoppingList(plan, repeats)` — agrega ingredientes | Criar |
| `src/lib/diet-export.ts` | `renderDietMarkdown` / `renderDietHtml` neutros | Criar |
| `src/data/meal-plan-seed.ts` | Novo `INITIAL_PLAN` (2200 kcal, slots, ingredients) | Reescrever |
| `src/lib/path-seed.ts` | Bump `MEAL_PLAN_VERSION` → 3 | Modificar |
| `src/pages/path/ShoppingList.tsx` | Usar `buildShoppingList` | Modificar |
| `src/pages/path/MealPlanView.tsx` | Mostrar variantes + botão "Exportar dieta" | Modificar |
| `tests/lib/*.test.ts`, `tests/pages/*.test.tsx` | Cobertura | Criar/Modificar |

---

## Task 1: Modelo de dados (tipos novos + `MealPlan` estendido)

**Files:**
- Modify: `src/lib/db.ts` (após `interface Meal`, linhas 73-90)

- [ ] **Step 1: Adicionar os tipos novos e estender `MealPlan`**

Em `src/lib/db.ts`, logo após a `interface Meal { ... }` (termina na linha 80) e substituindo a `interface MealPlan` atual (linhas 82-90), colocar:

```ts
export type IngredientCategory =
  | "proteina"
  | "carboidrato"
  | "hortifruti"
  | "laticinio"
  | "mercearia";

export interface Ingredient {
  item: string;        // "Ovos", "Peito de frango", "Arroz integral"
  qty: number;         // quantidade numérica
  unit: string;        // "un", "g", "ml", "colher de sopa"
  category: IngredientCategory;
}

export interface MealVariant {
  id: string;                 // "cafe-1", "cafe-2"...
  label: string;              // nome neutro: "Opção 1 · Ovos & pão integral"
  foods: Meal["foods"];       // mesmo shape atual (name, qtyG, kcal, macros, preparation)
  ingredients: Ingredient[];  // ingredientes crus pra lista de compras
}

export interface MealSlot {
  mealType: Meal["mealType"]; // "cafe" | "almoco" | "lanche" | "jantar"
  targetKcal: number;
  variants: MealVariant[];    // 3 opções por período
}

export interface MealPlan {
  id?: number;
  name: string;
  goal: "deficit" | "manutencao" | "superavit";
  kcalDaily: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  slots: MealSlot[];              // fonte de verdade
  defaultMeals: Meal["foods"][];  // derivado (variante 0 de cada slot) — retrocompat
}
```

> **Nota Dexie:** NÃO adicione uma nova `this.version(...)`. Nenhum campo novo é indexado (a store `mealPlans` é só `"++id"`), então o schema do Dexie não muda. A migração de dados é feita na Task 5.

- [ ] **Step 2: Verificar o type-check**

Run: `npm run build`
Expected: vai **falhar** em `meal-plan-seed.ts` (o seed antigo não tem `slots`/`goal`). Isso é esperado — será corrigido na Task 4. Confirme que os erros são só nesse arquivo e nos consumidores, não em `db.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat(db): add MealVariant/MealSlot/Ingredient types and extend MealPlan with slots"
```

---

## Task 2: Helper `deriveDefaultMeals`

**Files:**
- Create: `src/lib/meal-plan.ts`
- Test: `tests/lib/meal-plan.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/meal-plan.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { deriveDefaultMeals } from "../../src/lib/meal-plan";
import type { MealSlot } from "../../src/lib/db";

const slots: MealSlot[] = [
  {
    mealType: "cafe",
    targetKcal: 500,
    variants: [
      { id: "cafe-1", label: "Opção 1", ingredients: [], foods: [{ name: "Ovos", qtyG: 165, kcal: 230 }] },
      { id: "cafe-2", label: "Opção 2", ingredients: [], foods: [{ name: "Tapioca", qtyG: 100, kcal: 240 }] },
    ],
  },
  {
    mealType: "almoco",
    targetKcal: 650,
    variants: [
      { id: "almoco-1", label: "Opção 1", ingredients: [], foods: [{ name: "Frango", qtyG: 180, kcal: 297 }] },
    ],
  },
];

describe("deriveDefaultMeals", () => {
  it("pega os foods da variante 0 de cada slot", () => {
    const result = deriveDefaultMeals(slots);
    expect(result).toHaveLength(2);
    expect(result[0][0].name).toBe("Ovos");
    expect(result[1][0].name).toBe("Frango");
  });

  it("retorna array vazio pra slot sem variantes", () => {
    const result = deriveDefaultMeals([{ mealType: "lanche", targetKcal: 350, variants: [] }]);
    expect(result).toEqual([[]]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/lib/meal-plan.test.ts`
Expected: FAIL — `deriveDefaultMeals is not a function` / módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/lib/meal-plan.ts`:

```ts
import type { Meal, MealSlot } from "./db";

/** Deriva `defaultMeals` (uma lista de foods por período) da variante 0 de cada slot. */
export function deriveDefaultMeals(slots: MealSlot[]): Meal["foods"][] {
  return slots.map((slot) => slot.variants[0]?.foods ?? []);
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/lib/meal-plan.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/meal-plan.ts tests/lib/meal-plan.test.ts
git commit -m "feat(meal-plan): add deriveDefaultMeals helper"
```

---

## Task 3: Lista de compras agregada

**Files:**
- Create: `src/lib/shopping-list.ts`
- Test: `tests/lib/shopping-list.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/shopping-list.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildShoppingList } from "../../src/lib/shopping-list";
import type { MealPlan } from "../../src/lib/db";

const plan: MealPlan = {
  name: "teste",
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
          id: "cafe-1", label: "o1", foods: [],
          ingredients: [
            { item: "Ovos", qty: 3, unit: "un", category: "proteina" },
            { item: "Pão integral", qty: 60, unit: "g", category: "carboidrato" },
          ],
        },
        {
          id: "cafe-2", label: "o2", foods: [],
          ingredients: [{ item: "Ovos", qty: 2, unit: "un", category: "proteina" }],
        },
      ],
    },
  ],
};

describe("buildShoppingList", () => {
  it("soma quantidades do mesmo item+unidade entre variantes", () => {
    const list = buildShoppingList(plan);
    const ovos = list.find((i) => i.item === "Ovos");
    expect(ovos?.qty).toBe(5); // 3 + 2
    expect(ovos?.unit).toBe("un");
  });

  it("multiplica pelo fator repeats", () => {
    const list = buildShoppingList(plan, 2);
    expect(list.find((i) => i.item === "Ovos")?.qty).toBe(10); // (3+2)*2
  });

  it("ordena por categoria e depois por item", () => {
    const list = buildShoppingList(plan);
    expect(list.map((i) => i.item)).toEqual(["Pão integral", "Ovos"]); // carboidrato antes de proteina
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/lib/shopping-list.test.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/lib/shopping-list.ts`:

```ts
import type { IngredientCategory, MealPlan } from "./db";

export interface ShoppingItem {
  item: string;
  qty: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Agrega os ingredientes de TODAS as variantes do plano (uma porção de cada),
 * somando por item+unidade. `repeats` escala tudo (ex: 2 = duas rodadas).
 * Representa "comprar pra cobrir uma rodada de todas as opções".
 */
export function buildShoppingList(plan: MealPlan, repeats = 1): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const slot of plan.slots) {
    for (const variant of slot.variants) {
      for (const ing of variant.ingredients) {
        const key = `${ing.item}__${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.qty += ing.qty * repeats;
        } else {
          map.set(key, {
            item: ing.item,
            qty: ing.qty * repeats,
            unit: ing.unit,
            category: ing.category,
          });
        }
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || a.item.localeCompare(b.item),
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/lib/shopping-list.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shopping-list.ts tests/lib/shopping-list.test.ts
git commit -m "feat(shopping): add buildShoppingList aggregator"
```

---

## Task 4: Novo seed do plano (2200 kcal, slots, ingredientes)

**Files:**
- Rewrite: `src/data/meal-plan-seed.ts`
- Test: `tests/data/meal-plan-seed.test.ts` (criar)

**Contrato de macros (o teste é a fonte da verdade):** o dia soma ~2200 kcal e ~180g de proteína usando a **variante 0** de cada período. Alvos por período: café ~500 · almoço ~650 · lanche ~350 · jantar ~700.

**Conteúdo (prático e barato — frango, ovo, carne moída patinho, sardinha/atum em lata, arroz, feijão, batata doce, aveia, banana, leite, whey opcional):**

| Período | Variante 0 | Variante 1 | Variante 2 |
|---|---|---|---|
| Café (~500) | Ovos mexidos (3) + pão integral (2 fatias) + banana + café | Tapioca (2) com ovo e queijo branco + café | Aveia (5 cs) + whey + banana + leite desnatado |
| Almoço (~650) | Frango grelhado (180g) + arroz integral (150g) + feijão (1 concha) + salada + azeite | Carne moída patinho (150g) + arroz (150g) + abóbora + salada | Atum em lata (1) + macarrão integral (120g cozido) + brócolis |
| Lanche (~350) | Whey (1 scoop) + banana + aveia (3 cs) | Iogurte natural (170g) + granola (30g) + mel | Ovos cozidos (2) + fruta + castanhas (15g) |
| Jantar (~700) | Carne moída/sardinha (180g) + batata doce (250g) + brócolis + salada | Omelete de 4 ovos + queijo + pão integral + salada | Frango desfiado (180g) + arroz (150g) + legumes no vapor |

Cada variante tem `foods` (com `kcal`/macros e `preparation` no estilo do seed antigo) **e** `ingredients` (crus, com `category`). Usar `deriveDefaultMeals` pra preencher `defaultMeals`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/meal-plan-seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";

describe("INITIAL_PLAN", () => {
  it("é um plano de déficit calibrado", () => {
    expect(INITIAL_PLAN.goal).toBe("deficit");
    expect(INITIAL_PLAN.kcalDaily).toBe(2200);
    expect(INITIAL_PLAN.proteinG).toBeGreaterThanOrEqual(175);
  });

  it("tem 4 períodos com 3 variantes cada, todas com ingredientes", () => {
    expect(INITIAL_PLAN.slots).toHaveLength(4);
    const types = INITIAL_PLAN.slots.map((s) => s.mealType);
    expect(types).toEqual(["cafe", "almoco", "lanche", "jantar"]);
    for (const slot of INITIAL_PLAN.slots) {
      expect(slot.variants.length).toBe(3);
      for (const v of slot.variants) {
        expect(v.foods.length).toBeGreaterThan(0);
        expect(v.ingredients.length).toBeGreaterThan(0);
      }
    }
  });

  it("a variante 0 de cada período soma ~2200 kcal e ~180g proteína no dia", () => {
    let kcal = 0;
    let protein = 0;
    for (const slot of INITIAL_PLAN.slots) {
      for (const f of slot.variants[0].foods) {
        kcal += f.kcal;
        protein += f.proteinG ?? 0;
      }
    }
    expect(kcal).toBeGreaterThanOrEqual(2100);
    expect(kcal).toBeLessThanOrEqual(2300);
    expect(protein).toBeGreaterThanOrEqual(165);
  });

  it("defaultMeals é derivado das variantes 0", () => {
    expect(INITIAL_PLAN.defaultMeals).toHaveLength(4);
    expect(INITIAL_PLAN.defaultMeals[0]).toEqual(INITIAL_PLAN.slots[0].variants[0].foods);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/data/meal-plan-seed.test.ts`
Expected: FAIL — o seed antigo não tem `slots`/`goal`/`deriveDefaultMeals`.

- [ ] **Step 3: Reescrever o seed**

Reescrever `src/data/meal-plan-seed.ts` seguindo este esqueleto (café totalmente preenchido como exemplo; preencher almoço/lanche/jantar no mesmo padrão usando a tabela acima, ajustando `kcal`/`proteinG` pra fechar os alvos do teste):

```ts
import type { MealPlan, MealSlot } from "../lib/db";
import { deriveDefaultMeals } from "../lib/meal-plan";

// 2200 kcal pra déficit moderado — 96kg, 27 anos, 1,73m
// Proteína ~180g · Gordura ~70g · Carbo ~210g · ~0,5-0,7 kg/semana
// Receitas brasileiras baratas e práticas (<20min). Variante 0 = base do dia.
const SLOTS: MealSlot[] = [
  {
    mealType: "cafe",
    targetKcal: 500,
    variants: [
      {
        id: "cafe-1",
        label: "Opção 1 · Ovos & pão integral",
        foods: [
          { name: "Ovos mexidos (3 un)", qtyG: 165, kcal: 230, proteinG: 18, carbG: 1, fatG: 16,
            preparation: "Bate os ovos com pitada de sal. Frigideira antiaderente em fogo médio-baixo com 1 cc de azeite, mexe ~3 min até cremoso." },
          { name: "Pão integral (2 fatias)", qtyG: 60, kcal: 160, proteinG: 6, carbG: 28, fatG: 2,
            preparation: "Tosta na frigideira seca 1 min cada lado." },
          { name: "Banana média", qtyG: 120, kcal: 100, proteinG: 1, carbG: 24, fatG: 0,
            preparation: "Ao natural ou amassada no pão." },
        ],
        ingredients: [
          { item: "Ovos", qty: 3, unit: "un", category: "proteina" },
          { item: "Pão integral", qty: 60, unit: "g", category: "carboidrato" },
          { item: "Banana", qty: 1, unit: "un", category: "hortifruti" },
        ],
      },
      // cafe-2, cafe-3: seguir a tabela do plano (tapioca/ovo/queijo; aveia/whey/banana/leite)
    ],
  },
  // almoco, lanche, jantar: mesmo padrão, 3 variantes cada, fechando os alvos
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
```

> Preencher TODAS as variantes (3 por período). Ajustar gramaturas/kcal até o teste de soma passar (variante 0 do dia entre 2100-2300 kcal, ≥165g proteína). Manter `preparation` curto e prático. **Não** usar nenhuma palavra ligada a transição em `name`/`label`/textos.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/data/meal-plan-seed.test.ts`
Expected: PASS (4 testes). Ajustar conteúdo se a soma de kcal/proteína estourar a faixa.

- [ ] **Step 5: Commit**

```bash
git add src/data/meal-plan-seed.ts tests/data/meal-plan-seed.test.ts
git commit -m "feat(seed): recalibrate meal plan to 2200kcal deficit with 3 variants + ingredients"
```

---

## Task 5: Migração do plano no `path-seed`

**Files:**
- Modify: `src/lib/path-seed.ts:5` (`MEAL_PLAN_VERSION`)
- Modify: `tests/lib/path-seed.test.ts`

- [ ] **Step 1: Atualizar o teste**

Em `tests/lib/path-seed.test.ts`, ajustar o teste "plano alimentar tem macros" e adicionar checagem de `slots`:

```ts
  it("plano alimentar é de déficit com slots", async () => {
    await seedPath();
    const plan = (await db.mealPlans.toArray())[0];
    expect(plan.kcalDaily).toBe(2200);
    expect(plan.proteinG).toBeGreaterThanOrEqual(175);
    expect(plan.slots).toHaveLength(4);
    expect(plan.slots[0].variants.length).toBe(3);
  });
```

(Substituir o `it("plano alimentar tem macros", ...)` existente por este.)

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/lib/path-seed.test.ts`
Expected: FAIL — `kcalDaily` ainda é 2600 OU `slots` indefinido, porque `MEAL_PLAN_VERSION` não subiu (device "antigo" não re-semeia).

- [ ] **Step 3: Subir a versão**

Em `src/lib/path-seed.ts`, linha 5, trocar:

```ts
const MEAL_PLAN_VERSION = 2;
```

por:

```ts
const MEAL_PLAN_VERSION = 3;
```

(O resto de `path-seed.ts` já faz `db.mealPlans.update(existing.id, INITIAL_PLAN)` quando a versão sobe — nenhuma outra mudança necessária.)

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/lib/path-seed.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/path-seed.ts tests/lib/path-seed.test.ts
git commit -m "feat(path-seed): bump meal plan version to 3 (deficit + slots migration)"
```

---

## Task 6: `ShoppingList.tsx` usando `buildShoppingList`

**Files:**
- Modify: `src/pages/path/ShoppingList.tsx`
- Test: `tests/pages/shopping-list.smoke.test.tsx` (criar)

- [ ] **Step 1: Escrever o smoke test que falha**

Criar `tests/pages/shopping-list.smoke.test.tsx`:

```tsx
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
    // categorias como cabeçalho
    expect(screen.getByText(/prote[ií]na/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/pages/shopping-list.smoke.test.tsx`
Expected: FAIL — a tela atual lista por `food.name` (pratos), não por ingrediente, e não tem cabeçalho de categoria.

- [ ] **Step 3: Reescrever a tela**

Substituir `src/pages/path/ShoppingList.tsx` por:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type IngredientCategory } from "../../lib/db";
import { buildShoppingList } from "../../lib/shopping-list";

const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  hortifruti: "Hortifruti",
  laticinio: "Laticínios",
  gordura: "Gorduras",
  mercearia: "Mercearia",
};

const CATEGORY_ORDER: IngredientCategory[] = [
  "proteina", "carboidrato", "hortifruti", "laticinio", "gordura", "mercearia",
];

export function ShoppingList() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const items = buildShoppingList(plan);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Lista de compras</h1>
      </div>

      <p className="text-muted text-sm mb-4">
        Cobre uma rodada de todas as opções (~3 dias de variedade). Multiplique conforme a semana.
      </p>

      <div className="space-y-3">
        {CATEGORY_ORDER.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className="card">
              <h2 className="text-nude-warm font-medium mb-2">{CATEGORY_LABEL[cat]}</h2>
              <ul className="space-y-2 text-sm">
                {catItems.map((i) => (
                  <li key={`${i.item}-${i.unit}`} className="flex justify-between">
                    <span className="text-nude-warm">{i.item}</span>
                    <span className="text-muted text-xs">{i.qty} {i.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/pages/shopping-list.smoke.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/path/ShoppingList.tsx tests/pages/shopping-list.smoke.test.tsx
git commit -m "feat(shopping): render aggregated ingredient list grouped by category"
```

---

## Task 7: Export neutro (`lib/diet-export.ts`)

**Files:**
- Create: `src/lib/diet-export.ts`
- Test: `tests/lib/diet-export.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/diet-export.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderDietMarkdown, FORBIDDEN_TERMS } from "../../src/lib/diet-export";
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
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/lib/diet-export.test.ts`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

Criar `src/lib/diet-export.ts`:

```ts
import type { Meal, MealPlan } from "./db";
import type { ShoppingItem } from "./shopping-list";

/** Termos que NUNCA podem aparecer no export compartilhável. */
export const FORBIDDEN_TERMS = [
  "transi", "mtf", "feminiz", "amazona", "trein-final", "trein final",
  "hormô", "hormo", "trh", "estrog", "glúteo", "gluteo", "cintura fina",
];

const PERIOD_LABEL: Record<Meal["mealType"], string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

const PERIOD_ORDER: Meal["mealType"][] = ["cafe", "almoco", "lanche", "jantar"];

const CATEGORY_LABEL: Record<string, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  hortifruti: "Hortifruti",
  laticinio: "Laticínios",
  gordura: "Gorduras",
  mercearia: "Mercearia",
};

/** Markdown neutro pronto pra colar no WhatsApp. Ignora `plan.name` de propósito. */
export function renderDietMarkdown(plan: MealPlan, shopping: ShoppingItem[]): string {
  const lines: string[] = [];
  lines.push(`# Plano alimentar — emagrecimento`);
  lines.push("");
  lines.push(`Meta diária: ${plan.kcalDaily} kcal · ${plan.proteinG}g proteína · ${plan.carbG}g carbo · ${plan.fatG}g gordura`);
  lines.push("");

  const slotByType = new Map(plan.slots.map((s) => [s.mealType, s]));
  for (const type of PERIOD_ORDER) {
    const slot = slotByType.get(type);
    if (!slot) continue;
    lines.push(`## ${PERIOD_LABEL[type]}`);
    for (const v of slot.variants) {
      lines.push(`### ${v.label}`);
      for (const f of v.foods) {
        lines.push(`- ${f.name} — ${f.kcal} kcal`);
        if (f.preparation) lines.push(`  - Preparo: ${f.preparation}`);
      }
      if (v.ingredients.length) {
        const ing = v.ingredients.map((i) => `${i.item} (${i.qty} ${i.unit})`).join(", ");
        lines.push(`  - Ingredientes: ${ing}`);
      }
      lines.push("");
    }
  }

  lines.push(`## Lista de compras`);
  let lastCat = "";
  for (const item of shopping) {
    if (item.category !== lastCat) {
      lines.push(`### ${CATEGORY_LABEL[item.category] ?? item.category}`);
      lastCat = item.category;
    }
    lines.push(`- ${item.item} — ${item.qty} ${item.unit}`);
  }

  return lines.join("\n");
}

/** Versão HTML imprimível (print → salvar como PDF). Mesmo conteúdo neutro. */
export function renderDietHtml(plan: MealPlan, shopping: ShoppingItem[]): string {
  const md = renderDietMarkdown(plan, shopping);
  const body = md
    .split("\n")
    .map((l) => {
      if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
      if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
      if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
      if (l.startsWith("  - ")) return `<p style="margin-left:1.5em">${l.slice(4)}</p>`;
      if (l.startsWith("- ")) return `<p>${l.slice(2)}</p>`;
      return l ? `<p>${l}</p>` : "";
    })
    .join("\n");
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Plano alimentar — emagrecimento</title><style>body{font-family:system-ui,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem;color:#222}h1,h2,h3{margin:.6em 0 .2em}</style></head><body>${body}</body></html>`;
}
```

> Verifique que NENHUM termo de `FORBIDDEN_TERMS` aparece no conteúdo das variantes do seed (foods/preparation/ingredientes). O teste de neutralidade cobre o nome do plano; o conteúdo das receitas é responsabilidade do seed (Task 4).

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/lib/diet-export.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diet-export.ts tests/lib/diet-export.test.ts
git commit -m "feat(export): neutral diet markdown/html export with forbidden-term guard"
```

---

## Task 8: Botão "Exportar dieta" + variantes na `MealPlanView`

**Files:**
- Modify: `src/pages/path/MealPlanView.tsx`
- Test: `tests/pages/meal-plan-view.smoke.test.tsx` (criar)

- [ ] **Step 1: Escrever o smoke test que falha**

Criar `tests/pages/meal-plan-view.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { MealPlanView } from "../../src/pages/path/MealPlanView";

describe("MealPlanView", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.mealPlans.add(INITIAL_PLAN as never);
  });

  it("mostra macros, variantes e botão de exportar", async () => {
    render(<MemoryRouter><MealPlanView /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/2200/)).toBeInTheDocument());
    expect(screen.getByText(/Caf[eé]/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar dieta/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run tests/pages/meal-plan-view.smoke.test.tsx`
Expected: FAIL — não existe botão "exportar dieta".

- [ ] **Step 3: Atualizar a tela**

Substituir `src/pages/path/MealPlanView.tsx` por:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { buildShoppingList } from "../../lib/shopping-list";
import { renderDietMarkdown } from "../../lib/diet-export";

const PERIOD_NAMES = ["Café", "Almoço", "Lanche", "Jantar"];

export function MealPlanView() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function exportDiet() {
    if (!plan) return;
    const text = renderDietMarkdown(plan, buildShoppingList(plan));
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Plano alimentar — emagrecimento", text });
        return;
      }
    } catch {
      // usuário cancelou ou share indisponível — cai no fallback
    }
    try {
      await navigator.clipboard?.writeText(text);
      alert("Dieta copiada — é só colar no WhatsApp.");
    } catch {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plano-alimentar.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao/editar" className="text-muted text-sm">editar</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">{plan.name}</h2>
        <div className="grid grid-cols-4 gap-2">
          <div><p className="text-muted text-xs">kcal</p><p className="text-nude-warm text-lg">{plan.kcalDaily}</p></div>
          <div><p className="text-muted text-xs">proteína</p><p className="text-nude-warm text-lg">{plan.proteinG}g</p></div>
          <div><p className="text-muted text-xs">carbo</p><p className="text-nude-warm text-lg">{plan.carbG}g</p></div>
          <div><p className="text-muted text-xs">gordura</p><p className="text-nude-warm text-lg">{plan.fatG}g</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => void exportDiet()}
          className="flex-1 bg-wine-light text-nude-warm rounded-md py-2.5 text-sm font-medium"
        >
          Exportar dieta
        </button>
        <Link
          to="/trilha/alimentacao/lista-compras"
          className="flex-1 text-center border border-bg-border text-nude rounded-md py-2.5 text-sm"
        >
          Lista de compras
        </Link>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Refeições e opções</h2>
      <div className="space-y-3">
        {plan.slots.map((slot, i) => (
          <div key={slot.mealType} className="card">
            <h3 className="text-nude-warm font-medium mb-2">
              {PERIOD_NAMES[i] ?? slot.mealType} <span className="text-muted text-xs">· alvo {slot.targetKcal} kcal</span>
            </h3>
            <div className="space-y-2">
              {slot.variants.map((v) => (
                <details key={v.id} className="group">
                  <summary className="cursor-pointer list-none text-nude-warm text-sm flex justify-between">
                    <span>{v.label} <span className="text-nude text-xs">▸</span></span>
                    <span className="text-muted text-xs">{v.foods.reduce((s, f) => s + f.kcal, 0)} kcal</span>
                  </summary>
                  <ul className="space-y-1.5 text-sm mt-2 ml-3">
                    {v.foods.map((f, j) => (
                      <li key={j}>
                        <span className="text-nude-warm">{f.name}</span>
                        {f.preparation && (
                          <p className="text-muted text-xs mt-0.5 leading-relaxed">{f.preparation}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run tests/pages/meal-plan-view.smoke.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/path/MealPlanView.tsx tests/pages/meal-plan-view.smoke.test.tsx
git commit -m "feat(meal-plan): show variants and add neutral diet export button"
```

---

## Task 9: Verificação final (suite completa + build)

- [ ] **Step 1: Rodar a suite inteira**

Run: `npm run test`
Expected: PASS — todos os testes, incluindo os antigos. Se `MealsToday`/algum teste antigo quebrar por causa de `defaultMeals`, confirme que `INITIAL_PLAN.defaultMeals` está derivado (Task 4) e tem 4 entradas.

- [ ] **Step 2: Type-check + build**

Run: `npm run build`
Expected: build OK, sem erros de TypeScript.

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "test: full suite green for nutrition deficit + neutral export onda"
```

---

## Self-review (cobertura do spec)

| Requisito do spec | Task |
|---|---|
| Recalibrar 2600→2200 kcal, 180g proteína, déficit | Task 4, 5 |
| Regra didática de ajuste | (texto no app — exibir na `MealPlanView`/edit; conteúdo no seed `name`/nota) — **incluir nota curta na MealPlanView se desejado; não bloqueia** |
| `slots` com 3 variantes + ingredientes | Task 1, 4 |
| `defaultMeals` derivado (retrocompat) | Task 2, 4 |
| Migração sem quebrar telas | Task 5, 6, 8, 9 |
| Lista de compras agregada por categoria | Task 3, 6 |
| Export neutro (markdown/html) + termos proibidos | Task 7 |
| Botão de export com Web Share + fallback | Task 8 |
| Testes (lógica, export-neutralidade, seed, smoke) | Tasks 2,3,4,7 + smokes 6,8 |

**Observação:** a "regra de ajuste de kcal por resultado" do spec §3 é conteúdo didático (texto), não lógica. Pode entrar como um parágrafo na `MealPlanView` ou no `name`/nota do plano durante a Task 8 — não tem teste próprio e não bloqueia a onda.

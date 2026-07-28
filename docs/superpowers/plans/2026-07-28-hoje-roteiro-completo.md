# A tela Hoje como roteiro completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a tela Hoje bastar para o dia inteiro — as três opções de cada refeição acessíveis, barba e voz na rotina, micro-pausas com conteúdo e contador que funciona, fim de semana coerente, e movimento e sono registrados.

**Architecture:** Quase tudo é dado e apresentação. O único ponto de esquema é `DailyLog`, que ganha um campo de hora de dormir (sem bump de versão do Dexie — campos novos em objetos existentes não exigem migração). As refeições passam a ler `plan.slots[].variants[]` em vez do atalho `defaultMeals`, que só guarda a variante 0. O padrão de card-modal já estabelecido (`RecipeModal`, `SkincareRoutineModal`) se repete para as micro-pausas.

**Tech Stack:** React 18 · TypeScript strict (`verbatimModuleSyntax: true`) · Dexie · Vitest + happy-dom · Tailwind v3

## Global Constraints

- Spec de origem: `docs/superpowers/specs/2026-07-28-hoje-roteiro-completo-design.md`
- Testes em `tests/`, **nunca** ao lado do fonte. Import do fonte com `../../src/...`
- Rodar testes: `npm test` · build: `npm run build`
- TS com `verbatimModuleSyntax: true` — sempre `import type` para tipos
- `tsconfig.json` é só project-references; compilerOptions vão em `tsconfig.app.json`. `noUnusedParameters` está ativo.
- **Nunca usar emoji.** Símbolos geométricos/dingbats (`◆ · — ✦ ♪ ✚ ⇄ ✓`) são o padrão do projeto e aceitáveis.
- Copy em pt-br, tratando a usuária por "você"
- Páginas usam **named export** (`export function X()`), não default
- Não commitar `.claude/settings.local.json`
- Suíte deve permanecer verde (baseline: 318 testes)

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `src/lib/db.ts` | `MealVariant.effort`, `DailyLog.sleepAt` | Modificar |
| `src/components/RecipeModal.tsx` | Mostrar as 3 variantes e registrar a escolha | Modificar |
| `src/data/meal-plan-seed.ts` | `effort` em toda variante; lanche remontado como pré-treino | Modificar |
| `src/data/micro-pausas-seed.ts` | Os 6 movimentos de pausa | **Criar** |
| `src/components/MicroPausaModal.tsx` | Card da pausa da vez | **Criar** |
| `src/lib/micro-pausas.ts` | Rotação dos movimentos por número de pausas do dia | **Criar** |
| `src/lib/today-routine.ts` | Barba, voz, fim de semana, lanche nos 7 dias | Modificar |
| `src/components/ShortcutsGrid.tsx` | Tirar voz e depilação (subiram para a rotina) | Modificar |
| `src/pages/Today.tsx` | Ligar o card de pausa, creditar minutos, registrar sono | Modificar |
| `src/components/StreakCard.tsx` | (consumidor, provavelmente sem mudança) | Verificar |

---

### Task 1: As três opções de refeição aparecem e ela escolhe

**Files:**
- Modify: `src/components/RecipeModal.tsx`
- Test: `tests/components/RecipeModal-variantes.test.tsx` (**criar**)

**Interfaces:**
- Consumes: `getActiveMealPlan()` de `src/lib/meal-plan.ts`, que devolve `MealPlan` com `slots: MealSlot[]`; cada `MealSlot` tem `mealType`, `targetKcal` e `variants: MealVariant[]` (`id`, `label`, `foods`, `ingredients`)
- Produces: nada consumido adiante

**Contexto do bug:** hoje o modal faz `plan?.defaultMeals[MEAL_INDEX[mealType]]`, e `deriveDefaultMeals` devolve `slot.variants[0]?.foods` — a variante 0, sempre. As opções 2 e 3 existem no plano e são inalcançáveis pela interface. É a queixa literal da usuária.

- [ ] **Step 1: Escrever o teste**

Criar `tests/components/RecipeModal-variantes.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../src/lib/db";
import { seedPath } from "../../src/lib/path-seed";
import { RecipeModal } from "../../src/components/RecipeModal";

beforeEach(async () => {
  await db.mealPlans.clear();
  await db.meals.clear();
  await seedPath();
});

describe("RecipeModal — as três opções", () => {
  it("mostra as três variantes da refeição, com o rótulo de cada uma", async () => {
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    expect(opcoes).toHaveLength(3);
  });

  it("escolher uma variante grava a refeição do dia", async () => {
    const user = userEvent.setup();
    render(<RecipeModal mealType="lanche" onClose={() => {}} />);
    const opcoes = await screen.findAllByRole("button", { name: /opção/i });
    await user.click(opcoes[1]);
    const meals = await db.meals.toArray();
    const lanche = meals.find((m) => m.mealType === "lanche");
    expect(lanche).toBeDefined();
    expect(lanche!.foods.length).toBeGreaterThan(0);
  });

  it("mostra o modo de preparo dos itens da variante escolhida", async () => {
    render(<RecipeModal mealType="cafe" onClose={() => {}} />);
    expect(await screen.findByText(/modo de preparo/i)).toBeInTheDocument();
  });
});
```

Se `seedPath` tiver outro nome ou assinatura, abra `src/lib/path-seed.ts` e use o real — o objetivo é ter os planos alimentares no Dexie antes de renderizar.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- RecipeModal-variantes`
Expected: FAIL — hoje só existe uma lista de alimentos, sem botões de opção.

- [ ] **Step 3: Reescrever o `RecipeModal`**

O modal passa a:
1. Achar o slot da refeição: `plan?.slots.find((s) => s.mealType === mealType)`
2. Renderizar cada `variant` como um botão com o `label` (ex.: "Opção 1 · Banana & ovos cozidos"), a lista de alimentos e o modo de preparo
3. Marcar visualmente a variante já escolhida hoje (comparar com a refeição em `db.meals`)
4. Ao tocar numa variante, gravar em `db.meals` (usar `db.meals.put`, com `date` de hoje, `mealType`, `foods: variant.foods`, `checked: false`), preservando o `id` se já houver registro do dia

Mantenha o `MEAL_TYPE_LABEL` exportado — outros arquivos o importam. Se `plan.slots` estiver vazio (instalação antiga), caia no comportamento atual com `defaultMeals` para não quebrar.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test -- RecipeModal-variantes`
Expected: PASS

- [ ] **Step 5: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde. `MealsToday` também usa refeições — confira que continua funcionando.

- [ ] **Step 6: Commit**

```bash
git add src/components/RecipeModal.tsx tests/components/RecipeModal-variantes.test.tsx
git commit -m "fix(refeicoes): as três opções aparecem e a escolha fica registrada"
```

---

### Task 2: Selo de esforço e o lanche pré-treino de verdade

**Files:**
- Modify: `src/lib/db.ts` (campo `effort` em `MealVariant`)
- Modify: `src/data/meal-plan-seed.ts`
- Modify: `src/components/RecipeModal.tsx` (renderizar o selo)
- Modify: `src/lib/path-seed.ts` (bump de `MEAL_PLAN_VERSION`)
- Test: `tests/data/refeicoes-praticidade.test.ts` (**criar**)

**Interfaces:**
- Consumes: `MealVariant` da Task 1
- Produces: `MealVariant.effort`

- [ ] **Step 1: Escrever o teste**

Criar `tests/data/refeicoes-praticidade.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

const variantes = ALL_MEAL_PLANS.flatMap((p) => p.slots.flatMap((s) => s.variants.map((v) => ({ slot: s.mealType, v }))));

describe("praticidade das refeições", () => {
  it("toda variante declara o esforço de preparo", () => {
    const sem = variantes.filter(({ v }) => !v.effort).map(({ v }) => v.id);
    expect(sem).toEqual([]);
  });

  it("o lanche pré-treino é leve em gordura — ela caminha 1h e treina logo depois", () => {
    const pesados = variantes
      .filter(({ slot }) => slot === "lanche")
      .map(({ v }) => ({ id: v.id, gordura: v.foods.reduce((t, f) => t + (f.fatG ?? 0), 0) }))
      .filter((x) => x.gordura > 5);
    expect(pesados).toEqual([]);
  });

  it("todo lanche continua sendo portátil e tem ao menos duas opções", () => {
    const doLanche = variantes.filter(({ slot }) => slot === "lanche");
    expect(doLanche.length).toBeGreaterThanOrEqual(2);
  });

  it("as receitas com ovo/queijo coalho não sumiram — migraram pro café", () => {
    const cafe = variantes.filter(({ slot }) => slot === "cafe").map(({ v }) => v.label.toLowerCase()).join(" | ");
    expect(cafe).toMatch(/ovo|coalho/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- refeicoes-praticidade`
Expected: FAIL — `effort` não existe e o lanche tem 10-11 g de gordura.

- [ ] **Step 3: Adicionar o campo em `db.ts`**

Em `MealVariant`:

```ts
export interface MealVariant {
  id: string;
  label: string;
  foods: Meal["foods"];
  ingredients: Ingredient[];
  /** Custo de preparo, mostrado como etiqueta na escolha da refeição. Existe
   *  porque a usuária declarou que não quer cozinhar — o cardápio já era
   *  acessível, faltava o esforço ficar legível na hora de decidir. */
  effort?: "zero-preparo" | "5-min" | "air-fryer" | "lote-domingo";
}
```

- [ ] **Step 4: Marcar `effort` em toda variante existente**

Percorra `src/data/meal-plan-seed.ts` e classifique cada variante pelo trabalho real do `preparation`:
- nada a fazer além de abrir/servir → `zero-preparo`
- até ~5 min de fogão/micro-ondas/cuscuzeira → `5-min`
- vai à air fryer → `air-fryer`
- depende de comida cozida no domingo (marmita) → `lote-domingo`

- [ ] **Step 5: Remontar as variantes do lanche**

Substituir as variantes do slot `lanche` por três, todas com ≤ 5 g de gordura, portáteis e compatíveis com a geladeira do trabalho. Alvo mantido em ~350 kcal:

- **"Opção 1 · Iogurte, banana & aveia"** (`zero-preparo`) — iogurte natural integral 170 g, banana 1 un, aveia 30 g
- **"Opção 2 · Pão com peito de peru & fruta"** (`zero-preparo`) — 2 fatias de pão de forma, 4 fatias de peito de peru, 1 fruta
- **"Opção 3 · Cuscuz pequeno & banana"** (`5-min`) — cuscuz 60 g de flocos feito de manhã, banana 1 un

Calcule kcal e macros de cada item a partir de tabelas usuais e mantenha o padrão dos outros itens do arquivo (`name`, `qtyG`, `kcal`, `proteinG`, `carbG`, `fatG`, `preparation`) e os `ingredients` correspondentes.

**As receitas antigas do lanche não podem ser perdidas:** mova "Banana & ovos cozidos" e "Tapioca com ovo & queijo coalho" para as variantes do **café da manhã**, ajustando o rótulo e a numeração das opções. É lá que a gordura não atrapalha e onde ela tem cuscuzeira e frigideira.

- [ ] **Step 6: Renderizar o selo no `RecipeModal`**

Etiqueta discreta ao lado do rótulo da variante. Texto legível: `zero-preparo` → "zero preparo", `5-min` → "pronto em 5 min", `air-fryer` → "air fryer", `lote-domingo` → "do lote de domingo".

- [ ] **Step 7: Bumpar `MEAL_PLAN_VERSION`**

Em `src/lib/path-seed.ts`, subir de `5` para `6`, para que a instalação existente da usuária receba o cardápio novo.

- [ ] **Step 8: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde. Confira `tests/data/meal-plan-seed.test.ts`, que pode assertar sobre as variantes.

- [ ] **Step 9: Commit**

```bash
git add src/lib/db.ts src/data/meal-plan-seed.ts src/components/RecipeModal.tsx src/lib/path-seed.ts tests/data/refeicoes-praticidade.test.ts
git commit -m "feat(refeicoes): selo de esforço e o lanche das 16h remontado como pré-treino"
```

---

### Task 3: Barba e voz entram na rotina

**Files:**
- Modify: `src/lib/today-routine.ts`
- Modify: `src/components/ShortcutsGrid.tsx`
- Test: `tests/lib/rotina-barba-voz.test.ts` (**criar**)

**Interfaces:**
- Consumes: `RoutineItem` com `defaultTime` (já existe)
- Produces: itens `barba` e `voz`

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/rotina-barba-voz.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itensDoDia = (dow: number, diaDoAno: number) =>
  buildDayRoutine(dow, diaDoAno).blocks.flatMap((b) => b.items);

describe("barba e voz na rotina diária", () => {
  it("a voz é item de todo dia, à noite", () => {
    for (let dow = 0; dow < 7; dow++) {
      const voz = itensDoDia(dow, 1).find((i) => i.id === "voz");
      expect({ dow, temVoz: Boolean(voz) }).toEqual({ dow, temVoz: true });
      expect(voz!.block).toBe("noite");
    }
  });

  it("a barba aparece em dias alternados, não todo dia", () => {
    const par = itensDoDia(1, 100).some((i) => i.id === "barba");
    const impar = itensDoDia(1, 101).some((i) => i.id === "barba");
    expect(par).not.toBe(impar);
  });

  it("a barba é de manhã e vem antes do skincare", () => {
    const manha = buildDayRoutine(1, 100).blocks.find((b) => b.id === "manha")!;
    const ids = manha.items.map((i) => i.id);
    if (ids.includes("barba")) {
      expect(ids.indexOf("barba")).toBeLessThan(ids.indexOf("skincare-manha"));
    } else {
      // dia sem barba: o teste do dia alternado acima cobre a presença
      expect(buildDayRoutine(1, 101).blocks.find((b) => b.id === "manha")!.items.map((i) => i.id)).toContain("barba");
    }
  });
});

describe("atalhos não duplicam a rotina", () => {
  it("voz e depilação saíram do grid, porque viraram itens diários", async () => {
    const { SHORTCUTS } = await import("../../src/components/ShortcutsGrid");
    const rotas = SHORTCUTS.map((s) => s.to);
    expect(rotas).not.toContain("/beleza/voz");
    expect(rotas).not.toContain("/beleza/depilacao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- rotina-barba-voz`
Expected: FAIL — `buildDayRoutine` hoje recebe só `dayOfWeek`, e `SHORTCUTS` não é exportado.

- [ ] **Step 3: `buildDayRoutine` passa a receber o dia do ano**

Assinatura nova: `buildDayRoutine(dayOfWeek: number, dayOfYear: number)`. O segundo parâmetro decide os itens alternados. Derivar do dia do ano (e não de histórico) mantém a função pura e o resultado estável.

Atualize os chamadores: `src/pages/Today.tsx` e `src/pages/RoutineTimes.tsx`. Em `RoutineTimes`, passe um dia do ano **par** e outro **ímpar** e una os itens, para que a barba apareça na tela de ajuste de horários mesmo num dia em que ela não é feita — use `itensAjustaveis`, que já deduplica por id.

Adicione um helper de dia do ano onde fizer sentido (ex.: `src/lib/clock.ts` se existir, senão inline em `Today.tsx`).

- [ ] **Step 4: Adicionar os itens**

Em `MANHA`, entre o alongamento e o skincare, **quando o dia for alternado**:

```ts
{ id: "barba", block: "manha", label: "Barba", subtitle: "Rente, no sentido do pelo · depois o corretivo alaranjado se precisar", to: "/beleza/depilacao", defaultTime: "06:15" },
```

Em `NOITE`, entre o skincare e o alongamento:

```ts
{ id: "voz", block: "noite", label: "Voz · 5 min", subtitle: "Só melhora com frequência — igual à mobilidade", to: "/beleza/voz", defaultTime: "21:00" },
```

- [ ] **Step 5: Tirar os dois do grid de atalhos**

Em `src/components/ShortcutsGrid.tsx`, remover as entradas de Voz e Depilação e **exportar** `SHORTCUTS` (o teste importa). O grid fica com fertilidade, apoio, cabelo, estilo, corpo e maquiagem.

- [ ] **Step 6: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde. O teste `tests/lib/routine-times.test.ts` chama `buildDayRoutine(1)` — atualize as chamadas para a assinatura nova.

- [ ] **Step 7: Commit**

```bash
git add src/lib/today-routine.ts src/components/ShortcutsGrid.tsx src/pages/Today.tsx src/pages/RoutineTimes.tsx tests/
git commit -m "feat(rotina): barba em dias alternados e voz diária entram no roteiro"
```

---

### Task 4: Fim de semana coerente

**Files:**
- Modify: `src/lib/today-routine.ts`
- Test: `tests/lib/rotina-fim-de-semana.test.ts` (**criar**)

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/rotina-fim-de-semana.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("fim de semana", () => {
  it("sábado e domingo não têm bloco de expediente", () => {
    for (const dow of [0, 6]) {
      const rotulos = buildDayRoutine(dow, 1).blocks.map((b) => b.label.toLowerCase());
      expect({ dow, temTrabalho: rotulos.some((r) => r.includes("trabalho")) })
        .toEqual({ dow, temTrabalho: false });
    }
  });

  it("dia de semana continua com o bloco de expediente", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const rotulos = buildDayRoutine(dow, 1).blocks.map((b) => b.label.toLowerCase());
      expect({ dow, temTrabalho: rotulos.some((r) => r.includes("trabalho")) })
        .toEqual({ dow, temTrabalho: true });
    }
  });

  it("micro-pausas de expediente só existem em dia de semana", () => {
    const fds = buildDayRoutine(6, 1).blocks.flatMap((b) => b.items).some((i) => i.id === "micro-pausas");
    const semana = buildDayRoutine(3, 1).blocks.flatMap((b) => b.items).some((i) => i.id === "micro-pausas");
    expect({ fds, semana }).toEqual({ fds: false, semana: true });
  });

  it("as quatro refeições existem nos sete dias — a fome não sabe que dia é", () => {
    for (let dow = 0; dow < 7; dow++) {
      const ids = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).map((i) => i.id);
      expect({ dow, refeicoes: ["cafe-marmita", "almoco", "lanche-saida", "jantar"].filter((r) => ids.includes(r)).length })
        .toEqual({ dow, refeicoes: 4 });
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- rotina-fim-de-semana`
Expected: FAIL — hoje o bloco `TRABALHO` é fixo e o lanche só existe em dia de semana.

- [ ] **Step 3: Variar o bloco do meio por dia**

Em `buildBlocks`, o bloco do meio passa a ser:
- dia de semana → `{ id: "trabalho", label: "No trabalho", timeHint: "7h–16h", items: [almoço, micro-pausas, água] }`
- fim de semana → `{ id: "trabalho", label: "Durante o dia", items: [almoço, água] }`

Mantenha o `id` como `"trabalho"` para não invalidar checagens já gravadas em `routineChecks` da usuária.

- [ ] **Step 4: Lanche nos sete dias**

Mover o item `lanche-saida` para fora de `tardeSemana()` de modo que ele exista também no sábado e no domingo, no bloco da tarde, antes dos itens do dia (dança no sábado, descanso no domingo). Manter `defaultTime: "16:00"`.

- [ ] **Step 5: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde. O teste de ordem cronológica em `tests/lib/routine-times.test.ts` cobre só a segunda-feira; verifique que o sábado e o domingo também ficam em ordem.

- [ ] **Step 6: Commit**

```bash
git add src/lib/today-routine.ts tests/lib/rotina-fim-de-semana.test.ts
git commit -m "fix(rotina): fim de semana não diz 'No trabalho' e ganha o lanche da tarde"
```

---

### Task 5: Micro-pausas com conteúdo e contador que funciona

**Files:**
- Create: `src/data/micro-pausas-seed.ts`
- Create: `src/lib/micro-pausas.ts`
- Create: `src/components/MicroPausaModal.tsx`
- Modify: `src/pages/Today.tsx`
- Test: `tests/lib/micro-pausas.test.ts` (**criar**)

**Contexto:** a usuária perguntou explicitamente o que fazer nas pausas — ela sabe que precisa e não sabe o quê. Hoje `rightSlotFor` devolve um `<span>` para `control: "breaks"`, então o contador é sempre zero e aparece em dois lugares (a linha e o `StreakCard`).

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/micro-pausas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { MICRO_PAUSAS } from "../../src/data/micro-pausas-seed";
import { pausaDaVez } from "../../src/lib/micro-pausas";

describe("catálogo de micro-pausas", () => {
  it("tem pelo menos seis movimentos", () => {
    expect(MICRO_PAUSAS.length).toBeGreaterThanOrEqual(6);
  });

  it("todo movimento declara o quanto é discreto — o ambiente dela não é receptivo", () => {
    const sem = MICRO_PAUSAS.filter((m) => !m.discricao).map((m) => m.id);
    expect(sem).toEqual([]);
  });

  it("a maioria é invisível, pra poder ser feita na mesa", () => {
    const invisiveis = MICRO_PAUSAS.filter((m) => m.discricao === "invisivel");
    expect(invisiveis.length).toBeGreaterThanOrEqual(3);
  });

  it("todo movimento explica por que serve pro objetivo dela", () => {
    const sem = MICRO_PAUSAS.filter((m) => !m.porque).map((m) => m.id);
    expect(sem).toEqual([]);
  });
});

describe("pausaDaVez", () => {
  it("devolve de dois a três movimentos", () => {
    for (let n = 0; n < 8; n++) {
      const p = pausaDaVez(n);
      expect(p.length).toBeGreaterThanOrEqual(2);
      expect(p.length).toBeLessThanOrEqual(3);
    }
  });

  it("roda os movimentos — pausas seguidas não repetem o mesmo conjunto", () => {
    expect(pausaDaVez(0).map((m) => m.id)).not.toEqual(pausaDaVez(1).map((m) => m.id));
  });

  it("ao longo do dia, cobre todos os movimentos do catálogo", () => {
    const vistos = new Set<string>();
    for (let n = 0; n < 12; n++) pausaDaVez(n).forEach((m) => vistos.add(m.id));
    expect(vistos.size).toBe(MICRO_PAUSAS.length);
  });

  it("é estável: a mesma pausa devolve sempre o mesmo conjunto", () => {
    expect(pausaDaVez(3).map((m) => m.id)).toEqual(pausaDaVez(3).map((m) => m.id));
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- micro-pausas`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Criar o seed**

`src/data/micro-pausas-seed.ts`, com o tipo e os seis movimentos da spec:

```ts
export interface MicroPausa {
  id: string;
  nome: string;
  duracao: string;
  /** "invisivel" = dá pra fazer na mesa sem ninguém notar. O ambiente de
   *  trabalho dela não é receptivo, então discrição é requisito, não conforto. */
  discricao: "invisivel" | "precisa-de-canto" | "normal";
  como: string;
  porque: string;
}
```

Os seis: `levantar` (1 min, invisivel), `apertar-gluteo` (10× 3s, invisivel), `queixo-pra-tras` (10×,
invisivel), `juntar-escapulas` (10× 2s, invisivel), `alongar-flexor-quadril` (30s cada, precisa-de-canto),
`ir-ao-bebedouro` (2 min, normal).

Escreva `como` e `porque` com o conteúdo da spec — o `porque` deve ligar ao objetivo real dela (glúteo
dormente, pelve puxada, cabeça anteriorizada, postura que muda a leitura do tronco), não a genéricos de
saúde ocupacional.

- [ ] **Step 4: Criar a rotação**

`src/lib/micro-pausas.ts`:

```ts
import { MICRO_PAUSAS, type MicroPausa } from "../data/micro-pausas-seed";

/** Os movimentos da pausa nº `n` do dia (0-indexado). Rotativo e estável:
 *  a mesma pausa devolve sempre o mesmo conjunto, e ao longo do dia o
 *  rodízio cobre o catálogo inteiro. */
export function pausaDaVez(n: number): MicroPausa[] { /* ... */ }
```

Implementação sugerida: janela deslizante de tamanho 3 sobre o catálogo, com passo 2, usando módulo para dar
a volta. Confira contra o teste "cobre todos os movimentos em 12 pausas".

- [ ] **Step 5: Criar o card**

`src/components/MicroPausaModal.tsx`, seguindo o padrão visual de `SkincareRoutineModal` e `RecipeModal`
(overlay `fixed inset-0 z-50`, `card` interno, botão de fechar). Recebe `{ n: number; onClose: () => void;
onFeito: () => void }`, lista os movimentos de `pausaDaVez(n)` com nome, duração, como e porquê, e tem um
botão "Feito" que chama `onFeito` e fecha.

- [ ] **Step 6: Ligar na tela Hoje**

Em `src/pages/Today.tsx`:
1. Estado `const [pausaAberta, setPausaAberta] = useState(false)`
2. O item com `control: "breaks"` passa a abrir o card (via `onOpen`, como refeição e skincare já fazem), em vez de só exibir um número
3. `onFeito` incrementa `dailyLog.activeBreakCount` — siga o padrão de `addWater`, com o mesmo cuidado de criar o registro do dia se não existir
4. `rightSlotFor` para `breaks` continua mostrando a contagem, agora viva

- [ ] **Step 7: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add src/data/micro-pausas-seed.ts src/lib/micro-pausas.ts src/components/MicroPausaModal.tsx src/pages/Today.tsx tests/lib/micro-pausas.test.ts
git commit -m "feat(pausas): conteúdo discreto pras micro-pausas e o contador finalmente anda"
```

---

### Task 6: Movimento em minutos e sono registrado

**Files:**
- Modify: `src/lib/db.ts` (`DailyLog.sleepAt`)
- Modify: `src/lib/settings-helpers.ts` e `src/hooks/useSetting.ts` (`walkGoalMin` de 30 para 75)
- Modify: `src/lib/today-routine.ts` (subtítulos de cães e dormir)
- Modify: `src/pages/Today.tsx` (creditar minutos, registrar sono, novo `StreakCard`)
- Test: `tests/lib/movimento-sono.test.ts` (**criar**)

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/movimento-sono.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { creditarPasseio, registrarSono, noitesNoAlvo } from "../../src/lib/daily-log-helpers";

beforeEach(async () => { await db.dailyLog.clear(); });

describe("passeio credita minutos de movimento", () => {
  it("marcar o passeio soma 60 min ao dia", async () => {
    await creditarPasseio("2026-07-28");
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(60);
  });

  it("cria o registro do dia se ainda não existir", async () => {
    await creditarPasseio("2026-07-29");
    const log = await db.dailyLog.get("2026-07-29");
    expect(log).toBeDefined();
    expect(log!.waterMl).toBe(0);
  });

  it("desmarcar devolve os 60 min, sem ficar negativo", async () => {
    await creditarPasseio("2026-07-28");
    await creditarPasseio("2026-07-28", false);
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(0);
    await creditarPasseio("2026-07-28", false);
    expect((await db.dailyLog.get("2026-07-28"))?.walkMin).toBe(0);
  });
});

describe("sono", () => {
  it("registra a hora real de deitar", async () => {
    await registrarSono("2026-07-28", "22:40");
    expect((await db.dailyLog.get("2026-07-28"))?.sleepAt).toBe("22:40");
  });

  it("conta as noites no alvo dos últimos 7 dias", async () => {
    await registrarSono("2026-07-26", "22:15");
    await registrarSono("2026-07-27", "23:40");
    await registrarSono("2026-07-28", "22:30");
    const logs = await db.dailyLog.toArray();
    expect(noitesNoAlvo(logs, "22:30")).toBe(2);
  });

  it("noite sem registro não conta nem a favor nem contra", async () => {
    await registrarSono("2026-07-28", "22:00");
    expect(noitesNoAlvo(await db.dailyLog.toArray(), "22:30")).toBe(1);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- movimento-sono`
Expected: FAIL — `src/lib/daily-log-helpers.ts` não existe.

- [ ] **Step 3: Adicionar `sleepAt` em `DailyLog`**

```ts
export interface DailyLog {
  date: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  activeBreakCount: number;
  waterMl: number;
  walkMin?: number;
  /** Hora "HH:MM" em que ela deitou. Campo novo em objeto existente — o Dexie
   *  não precisa de bump de versão para isso. */
  sleepAt?: string;
}
```

- [ ] **Step 4: Criar `src/lib/daily-log-helpers.ts`**

Com `creditarPasseio(date: string, marcado = true): Promise<void>` (soma ou devolve 60 min, com piso em 0),
`registrarSono(date: string, hhmm: string): Promise<void>`, e `noitesNoAlvo(logs: DailyLog[], alvo: string):
number` (pura — conta quantos logs têm `sleepAt` menor ou igual ao alvo).

Extraia também `addWater` e `addWalk` de `Today.tsx` para cá se ficar natural — hoje elas repetem o padrão
"pega o log, atualiza ou cria". Não force: se o diff ficar grande demais, deixe para outra rodada e diga isso
no relatório.

- [ ] **Step 5: Subir a meta de movimento**

`walkGoalMin` de `30` para `75` em `src/lib/settings-helpers.ts` **e** em `src/hooks/useSetting.ts` — o
default é duplicado nos dois arquivos e mudar só um deixa a UI divergente da camada de dados.

75 min porque o passeio cobre 60 e sobra uma folga pequena para deslocamento e idas ao bebedouro: a meta
precisa ser alcançável sem ser automática.

- [ ] **Step 6: Ligar na tela Hoje**

1. Marcar o item `caes` chama `creditarPasseio(todayISO, marcado)`; desmarcar devolve
2. O item `caes` mostra no subtítulo os minutos do dia contra a meta, como o item de água já faz
3. Marcar `dormir` chama `registrarSono` com a hora do relógio no momento
4. Um `StreakCard` novo mostra `noitesNoAlvo` dos últimos 7 dias, ao lado dos de treino e skincare — troque o
   card de "Pausas" por ele **ou** passe a grade para 4 colunas, o que ficar melhor no celular

O subtítulo do passeio deve continuar deixando claro que ele é **NEAT, não zona 2** — é lento, com paradas,
e não substitui os 15–20 min contínuos do fim do treino.

- [ ] **Step 7: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add src/lib/db.ts src/lib/daily-log-helpers.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/lib/today-routine.ts src/pages/Today.tsx tests/lib/movimento-sono.test.ts
git commit -m "feat(hoje): passeio credita movimento e o sono passa a ser registrado"
```

---

## Self-Review

**Cobertura da spec:**

| Requisito | Task |
|---|---|
| A1 · três opções acessíveis e escolha registrada | 1 |
| A2 · selo de esforço | 2 |
| A3 · lanche pré-treino leve, receitas antigas migram pro café | 2 |
| B1 · barba em dias alternados | 3 |
| B2 · voz diária | 3 |
| B2 · os dois saem do grid de atalhos | 3 |
| B3 · fim de semana sem bloco de expediente, com lanche | 4 |
| B4 · micro-pausas com conteúdo e contador vivo | 5 |
| B5 · movimento em minutos alimentado pelo passeio | 6 |
| B6 · dormir registra hora real | 6 |
| Testes da seção "Testes" da spec | 1–6 |

**Placeholders:** nenhum. Os únicos pontos sem código literal são a implementação de `pausaDaVez` (Task 5
Step 4, com a estratégia descrita e o teste que a define) e o cálculo de macros das novas variantes do lanche
(Task 2 Step 5) — ambos deliberados, porque o teste é a especificação exata e transcrever números de tabela
nutricional no plano não os tornaria mais corretos.

**Consistência de tipos:** `MealVariant.effort` (Task 2) é consumido pelo `RecipeModal` da Task 1 — a Task 2
Step 6 volta nele. `buildDayRoutine(dayOfWeek, dayOfYear)` (Task 3) quebra chamadores existentes em
`Today.tsx`, `RoutineTimes.tsx` e `tests/lib/routine-times.test.ts`; a Task 3 Step 3 e Step 6 tratam disso.
`DailyLog.sleepAt` e os helpers (Task 6) não são consumidos por tasks posteriores.

**Ordem:** as Tasks 1 e 2 são sequenciais (a 2 edita o componente que a 1 reescreve). As Tasks 3 e 4 tocam o
mesmo arquivo (`today-routine.ts`) e devem ser feitas em ordem. A Task 5 e a 6 tocam `Today.tsx`; façam-nas
depois da 3.

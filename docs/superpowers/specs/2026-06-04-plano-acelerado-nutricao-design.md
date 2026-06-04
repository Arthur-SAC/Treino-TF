# Plano Acelerado — Onda 1: Nutrição + Export neutro

**Data:** 2026-06-04
**Status:** Spec em revisão
**Usuária:** a mesma pessoa (uso pessoal, transição MTF sem TRH ainda)

---

## 1. Resumo

Primeira onda de um redesenho ("Plano Acelerado") que prioriza **resultado físico sentido mais rápido**. A análise das fotos e medidas atuais (1,73m / ~96kg / IMC ~32 / cintura 99 / quadril 114 / WHR 0,87, gordura de distribuição central) mostrou que **a maior alavanca para a estética-alvo (ampulheta) é perda de gordura abdominal** — não o treino isolado. Como a usuária é iniciante com gordura a perder, está no cenário ideal de **recomposição** (perder gordura e construir glúteo ao mesmo tempo).

Esta onda entrega a camada de **nutrição completa** recalibrada para emagrecimento + um **export neutro** que pode ser compartilhado com terceiros (mãe) como "dieta de emagrecimento", **sem nenhuma referência à transição**.

As ondas seguintes (fora deste spec): **Onda 2 — Export** já incluída aqui por compartilhar o modelo de dados; **Onda 3 — Treino acelerado** (encurtar Adaptação, aquecimento real, 3ª sessão de glúteo, micro-rotina de postura, cardio) terá spec próprio.

## 2. Contexto e decisões já tomadas

| Item | Decisão | Motivo |
|---|---|---|
| Ordem das ondas | Nutrição → Export → Treino | Nutrição é a maior alavanca da cintura; export depende da nutrição e entrega cedo o artefato pra mãe. |
| Tipo de plano | Plano alimentar completo (não só guardrails) | Escolha da usuária. |
| Restrições | Nenhuma — come de tudo | Maximiza variedade e barateia. |
| Cozinha/orçamento | Prático e barato (<20min, ingredientes de mercado comum, marmita que rende) | Rotina de dev com pouco tempo. |
| Objetivo calórico | Déficit moderado (~0,5–0,7 kg/semana) | Perde gordura preservando glúteo. |
| Privacidade do export | Neutro, zero menção a transição | Mãe não sabe da transição e não reagiria bem. |

## 3. Recalibração nutricional

O seed atual (`meal-plan-seed.ts`) está em **2600 kcal "recomposição"**, que é ~manutenção para o gasto estimado — **não emagrece**. Recalibrar:

- **Gasto estimado (TDEE):** BMR (Mifflin-St Jeor, fisiologia pré-TRH) = 10·96 + 6,25·173 − 5·27 + 5 ≈ **1911 kcal**. Fator de atividade ~1,4 (sentada o dia + treino) → TDEE ≈ **2650–2750 kcal**.
- **Alvo:** **2200 kcal/dia** (déficit ~450–550 → ~0,5–0,7 kg/semana).
- **Proteína:** **180 g** (~1,9 g/kg) — preserva/constrói glúteo no déficit.
- **Gordura:** **70 g** (~30% kcal).
- **Carboidrato:** **210 g** (restante).
- **Split por refeição (alvo kcal):** café ~500 · almoço ~650 · lanche ~350 · jantar ~700.

**Regra de ajuste (didática, exibida no app):** se o peso não cair em 2–3 semanas seguidas, reduzir ~150–200 kcal (cortar dos carbos). Se cair rápido demais (>1 kg/sem por 2 sem) ou treino piorar muito, somar ~150 kcal. Manter proteína fixa.

**Disclaimer:** reforçar o disclaimer já existente no app — estimativa de boas práticas, não substitui nutricionista. Não travar nada.

## 4. Modelo de dados

### 4.1 Problema atual

`MealPlan.defaultMeals: Meal["foods"][]` guarda **uma única opção** por período (índice 0 = café, 1 = almoço, ...). Não suporta variantes nem lista de ingredientes crus (os "foods" são pratos como "Ovos mexidos (3 un)", não ingredientes de compra).

### 4.2 Schema novo (extensão retrocompatível)

Adicionar tipos em `db.ts`:

```ts
export interface Ingredient {
  item: string;       // "Ovos", "Peito de frango", "Arroz integral"
  qty: number;        // quantidade numérica
  unit: string;       // "un", "g", "ml", "colher de sopa"
}

export interface MealVariant {
  id: string;             // "cafe-1", "cafe-2"...
  label: string;          // nome neutro: "Opção 1 · Ovos & pão integral"
  foods: Meal["foods"];   // mesmo shape atual (name, qtyG, kcal, macros, preparation)
  ingredients: Ingredient[]; // ingredientes crus pra lista de compras
}

export interface MealSlot {
  mealType: "cafe" | "almoco" | "lanche" | "jantar";
  targetKcal: number;
  variants: MealVariant[]; // 3 opções por período
}
```

Estender `MealPlan`:

```ts
export interface MealPlan {
  id?: number;
  name: string;
  goal: "deficit" | "manutencao" | "superavit"; // novo
  kcalDaily: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  slots: MealSlot[];          // novo — fonte de verdade
  defaultMeals: Meal["foods"][]; // mantido p/ retrocompat: = variante 0 de cada slot
}
```

`defaultMeals` continua existindo e é **derivado** (variante selecionada/índice 0 de cada slot), pra `MealsToday`/`MealPlanView` seguirem funcionando sem reescrita grande. Consumidores novos usam `slots`.

### 4.3 Migração (Dexie)

- A store `mealPlans` é `"++id"` (sem índice nos campos novos) → **não precisa bump de versão de schema** pra adicionar campos. Mas vamos bump por segurança/migração de dados.
- `path-seed.ts` hoje faz "re-seed" do plano (`update(existing.id, INITIAL_PLAN)`). Atualizar pra novo `INITIAL_PLAN` com `slots`. Plano antigo do usuário é sobrescrito pelo novo (comportamento já existente em `path-seed.ts`).
- Garantir que `defaultMeals` seja preenchido coerentemente (variante 0 de cada slot) ao semear.

### 4.4 Consumidores a atualizar

| Arquivo | Mudança |
|---|---|
| `data/meal-plan-seed.ts` | Reescrever `INITIAL_PLAN`: 2200 kcal, macros novos, `slots` com 3 variantes/período + `ingredients`, e `defaultMeals` derivado. |
| `lib/db.ts` | Novos tipos + campos. Bump de versão Dexie. |
| `pages/path/MealsToday.tsx` | Continua lendo `defaultMeals` (ok). Opcional: permitir trocar de variante no dia (fase 2, não bloqueia). |
| `pages/path/MealPlanView.tsx` | Mostrar variantes por período (tabs/accordion) + macros do plano. |
| `pages/path/ShoppingList.tsx` | Gerar lista a partir de `slots`/`ingredients` agregados (ver §5). |
| `pages/path/MealPlanEdit.tsx` | Editar kcal/macros/objetivo. Edição de variantes: leitura ok; edição fina é fase 2. |

## 5. Lista de compras

- Função pura `buildShoppingList(plan, selection?)` que agrega `ingredients` de todas as variantes (ou das variantes selecionadas) e **soma quantidades por `item`+`unit`**.
- Agrupar por categoria de mercado (proteínas / carboidratos / hortifruti / laticínios / mercearia) pra facilitar a compra.
- Exibir em `ShoppingList.tsx` e alimentar o export (§6).
- Considerar "semana": como o plano é diário e repetível, a lista semanal = diário × 7 (com opção de marcar dias que come fora). Versão 1: lista diária × 7 simples.

## 6. Export neutro ("dieta da mãe")

### 6.1 Requisito de neutralidade (crítico)

O artefato exportado **não pode conter nada** que revele transição: nada de "transição", "MTF", "feminizar", "amazona", "glúteo pra feminilizar", nome do app que entregue contexto, ícones/paleta temáticos, nem menção a treino de transição. Só conteúdo de **dieta de emagrecimento comum**.

- Título neutro: **"Plano alimentar — emagrecimento"** (sem logo da app, sem "Trein").
- Conteúdo: alvo calórico + macros (apresentados de forma comum), e **por período do dia** (café / almoço / lanche / jantar): as 3 variantes, com **receita** (preparo) e **lista de ingredientes**; ao final, **lista de compras** consolidada.
- **Teste automatizado** garante ausência de uma lista de termos proibidos no texto gerado.

### 6.2 Formato

- **Markdown/Texto** pronto pra colar no WhatsApp + **HTML imprimível** (print → "Salvar como PDF" do próprio navegador, padrão PWA).
- Disparo: botão "Exportar dieta" na tela de plano alimentar. Onde possível, usar **Web Share API** (`navigator.share`) pra mandar direto; fallback = copiar texto / baixar arquivo `.txt`/abrir janela de impressão.
- O arquivo gerado tem nome neutro: `plano-alimentar.txt` / `plano-alimentar.pdf`.

### 6.3 Módulo

- `lib/diet-export.ts`: `renderDietMarkdown(plan, shoppingList): string` e `renderDietHtml(...): string`. Puras, testáveis. Sem dependência de transição.

## 7. Conteúdo das variantes (prático e barato)

3 variantes por período, base em ingredientes baratos de mercado comum (frango, ovo, carne moída patinho, sardinha em lata, atum, arroz, feijão, batata doce, aveia, banana, ovos, leite, whey opcional). Preparo <20min, rende marmita. Cada variante fecha perto do `targetKcal` do período e o dia soma ~2200 kcal / 180 g proteína. Conteúdo detalhado definido na implementação (não no spec), seguindo o padrão de `preparation` já existente no seed.

## 8. Testes

| Tipo | Cobertura |
|---|---|
| Lógica pura | `buildShoppingList` agrega e soma quantidades corretamente; soma de macros das variantes ≈ alvo do plano; cálculo TDEE/déficit (se virar função). |
| Export | `renderDietMarkdown`/`renderDietHtml` **não contêm** termos proibidos (lista de neutralidade); contêm os 4 períodos, receitas, ingredientes e lista de compras. |
| Migração/seed | Após seed, `mealPlans` tem 1 plano com `slots` (4 períodos × 3 variantes) e `defaultMeals` derivado coerente; `kcalDaily` = 2200. |
| Smoke | `MealPlanView` renderiza variantes; `ShoppingList` renderiza itens agregados; botão de export gera texto não-vazio. |

Atualizar `tests/lib/path-seed.test.ts` (hoje espera `kcalDaily > 1500` — segue válido; adicionar checagem de `slots`).

## 9. Fora de escopo (desta onda)

- Edição fina de variantes pela UI (criar/editar receita pela tela) — leitura e troca, sim; CRUD completo, fase 2.
- Treino acelerado (Onda 3, spec próprio).
- Integração de cardio/passos com a dieta.
- Ajuste automático de kcal por resultado (só instrução didática nesta onda).

## 10. Riscos / bordas

| Cenário | Comportamento |
|---|---|
| Plano antigo (2600) já no device | `path-seed` sobrescreve com o novo na próxima carga (comportamento já existente). |
| Web Share API indisponível (desktop) | Fallback: copiar texto + abrir impressão. |
| Usuária come fora num dia | Lista de compras v1 assume 7 dias iguais; marcar refeição como "não vou comer" fica pra fase 2. |
| Termo proibido vaza no export | Teste de neutralidade quebra o build. |

# Trein-Final — Onda 2 Parte 3: Trilha (Alimentação + Marcos + Diário)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Aba Trilha completa: linha do tempo da transição (marcos), plano alimentar (macros + refeições padrão + lista de compras), diário de sentimento simples. Integração no Hoje com cards de refeições e humor.

**Continua de:** Onda 2 Parte 2 — commit `fd0a463`

---

## File Structure

```
src/
├── data/
│   ├── milestones-seed.ts        # marcos iniciais (fertilidade → TRH → consultas)
│   └── meal-plan-seed.ts         # plano alimentar inicial (2200 kcal pra ganho gradual)
├── components/
│   ├── PathTabs.tsx              # sub-nav: Marcos / Alimentação / Diário
│   ├── MilestoneCard.tsx
│   ├── MealCard.tsx
│   └── MoodPicker.tsx            # 1-5 emojis (mas SEM emojis — usar SVG)
├── pages/path/
│   ├── PathHome.tsx              # rename Path.tsx; agora com sub-tabs
│   ├── MilestonesView.tsx
│   ├── MilestoneNew.tsx
│   ├── MealPlanView.tsx          # macros + refeições padrão
│   ├── MealPlanEdit.tsx
│   ├── MealsToday.tsx
│   ├── ShoppingList.tsx          # derivada das refeições padrão
│   └── DiaryView.tsx
└── lib/
    └── path-seed.ts
tests/lib/path-seed.test.ts
```

---

## Task 1: Seed marcos + plano alimentar

- [ ] **Step 1: Test**

`tests/lib/path-seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedPath } from "../../src/lib/path-seed";
import { db } from "../../src/lib/db";

describe("seedPath", () => {
  it("popula milestones e mealPlan", async () => {
    await seedPath();
    expect((await db.milestones.toArray()).length).toBeGreaterThanOrEqual(5);
    expect((await db.mealPlans.toArray()).length).toBeGreaterThanOrEqual(1);
  });

  it("é idempotente", async () => {
    await seedPath();
    const a = (await db.milestones.toArray()).length;
    await seedPath();
    expect((await db.milestones.toArray()).length).toBe(a);
  });

  it("plano alimentar tem macros", async () => {
    await seedPath();
    const plan = (await db.mealPlans.toArray())[0];
    expect(plan.kcalDaily).toBeGreaterThan(1500);
    expect(plan.proteinG).toBeGreaterThan(80);
  });
});
```

- [ ] **Step 2: Marcos iniciais**

`src/data/milestones-seed.ts`:

```typescript
import type { Milestone } from "../lib/db";

function isoFromMonthsFromNow(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Buscar dermatologista pra acompanhar tratamentos de pele",
    category: "medico",
    notes: "Especialmente importante antes de usar ácidos potentes (glicólico, retinol) e clareadores na axila/íntima.",
  },
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Buscar nutricionista pra calibrar plano alimentar",
    category: "medico",
    notes: "Plano atual é boas práticas gerais. Profissional ajusta pra você: composição corporal, ganho de glúteo direcionado.",
  },
  {
    datePlanned: isoFromMonthsFromNow(1),
    title: "Primeira foto de progresso pós-início do plano",
    category: "fisico",
    notes: "Frente / lado / costas em luz natural, mesma roupa próxima, mesmo horário. Pra comparar daqui 30 dias.",
  },
  {
    datePlanned: isoFromMonthsFromNow(3),
    title: "Re-avaliar relação cintura/quadril (WHR)",
    category: "fisico",
    notes: "Meta: cintura reduzir 1-2cm + quadril aumentar 1-2cm com treino de glúteo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(6),
    title: "Marco visual: pixie cacheado formato definido",
    category: "fisico",
    notes: "Com cronograma capilar consistente (hidratação semanal + nutrição quinzenal + reconstrução mensal), o cabelo deve estar mais saudável e definido.",
  },
  {
    datePlanned: isoFromMonthsFromNow(9),
    title: "Conversa com endocrinologista sobre planejamento de TRH",
    category: "fertilidade",
    notes: "Pra entender o caminho: preservação de fertilidade primeiro (vitrificação de gametas), depois TRH. Ginecologista/urologista pode entrar antes do endo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(12),
    title: "Avaliar congelamento de gametas (criopreservação)",
    category: "fertilidade",
    notes: "Procedimento que preserva fertilidade ANTES de iniciar TRH. Você e namorada planejam ter filhos primeiro — esse marco pode adiantar isso.",
  },
];
```

- [ ] **Step 3: Plano alimentar inicial**

`src/data/meal-plan-seed.ts`:

```typescript
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
```

- [ ] **Step 4: Seed function**

`src/lib/path-seed.ts`:

```typescript
import { db } from "./db";
import { MILESTONES } from "../data/milestones-seed";
import { INITIAL_PLAN } from "../data/meal-plan-seed";

export async function seedPath(): Promise<void> {
  const seeded = await db.settings.get("pathSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.milestones, db.mealPlans, db.settings], async () => {
    for (const m of MILESTONES) {
      await db.milestones.add(m as never);
    }
    if ((await db.mealPlans.count()) === 0) {
      await db.mealPlans.add(INITIAL_PLAN as never);
    }
    await db.settings.put({ key: "pathSeeded", value: true });
  });
}
```

Add `pathSeeded: boolean` to Settings interface AND DEFAULTS in both `settings-helpers.ts` and `useSetting.ts`.

- [ ] **Step 5: Wire in `main.tsx`**

Update Promise.all:
```tsx
import { seedPath } from "./lib/path-seed";
// ...
Promise.all([seedDatabase(), seedBeauty(), seedStyle(), seedPath()]).then(() => { ... });
```

- [ ] **Step 6: Test + build + commit**

```bash
npm run test
npm run build
git add src/data/milestones-seed.ts src/data/meal-plan-seed.ts src/lib/path-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx tests/lib/path-seed.test.ts
git commit -m "feat(path): seed de marcos iniciais + plano alimentar"
```

---

## Task 2: PathHome + PathTabs

**Files:**
- Modify: rename `src/pages/Path.tsx` → `src/pages/path/PathHome.tsx`
- Create: `src/components/PathTabs.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: PathTabs**

`src/components/PathTabs.tsx`:

```tsx
import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/trilha", label: "Marcos", end: true },
  { to: "/trilha/alimentacao", label: "Alimentação" },
  { to: "/trilha/diario", label: "Diário" },
];

export function PathTabs() {
  return (
    <div className="flex gap-2 mb-4">
      {ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 py-2 rounded-md text-sm text-center ${
              isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Delete old Path.tsx, create new structure**

```bash
mkdir -p src/pages/path
rm src/pages/Path.tsx
```

`src/pages/path/PathHome.tsx` (will be reused by MilestonesView in Task 3 — for now, redirect or show marcos placeholder).

Actually, simplify: PathHome IS MilestonesView. So skip creating PathHome — just create MilestonesView in Task 3 and route `/trilha` to it.

For this task: just create PathTabs.tsx and remove old Path.tsx. Don't modify main.tsx yet (need to wait for MilestonesView in Task 3).

- [ ] **Step 3: Commit**

```bash
git add src/components/PathTabs.tsx
git rm src/pages/Path.tsx
git commit -m "feat(trilha): componente de sub-navegação + remove placeholder antigo"
```

---

## Task 3: MilestonesView + MilestoneNew

**Files:**
- Create: `src/components/MilestoneCard.tsx`
- Create: `src/pages/path/MilestonesView.tsx`
- Create: `src/pages/path/MilestoneNew.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MilestoneCard**

`src/components/MilestoneCard.tsx`:

```tsx
import type { Milestone } from "../lib/db";
import { formatDateBR, formatRelativeDays } from "../lib/format";

const CATEGORY_LABEL: Record<Milestone["category"], string> = {
  medico: "Médico",
  fisico: "Físico",
  social: "Social",
  fertilidade: "Fertilidade",
};

interface Props {
  milestone: Milestone;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function MilestoneCard({ milestone, onComplete, onDelete }: Props) {
  const completed = Boolean(milestone.dateCompleted);
  const planned = new Date(milestone.datePlanned);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - planned.getTime()) / 86400000);

  return (
    <div className={`card ${completed ? "opacity-60" : ""}`}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[milestone.category]}</span>
        <span className="text-muted text-xs">
          {completed ? `concluído ${formatDateBR(new Date(milestone.dateCompleted!))}` : formatRelativeDays(daysDiff)}
        </span>
      </div>
      <h3 className={`font-medium ${completed ? "text-muted line-through" : "text-nude-warm"}`}>
        {milestone.title}
      </h3>
      <p className="text-muted text-xs mt-1">previsto: {formatDateBR(planned)}</p>
      {milestone.notes && <p className="text-muted text-sm mt-2">{milestone.notes}</p>}
      <div className="flex gap-3 mt-3">
        {!completed && onComplete && (
          <button onClick={onComplete} type="button" className="text-nude text-xs underline">
            marcar como concluído
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} type="button" className="text-muted text-xs hover:text-red-300">
            apagar
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: MilestonesView**

`src/pages/path/MilestonesView.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { MilestoneCard } from "../../components/MilestoneCard";

export function MilestonesView() {
  const milestones = useLiveQuery(() => db.milestones.orderBy("datePlanned").toArray(), []);

  async function complete(id?: number) {
    if (id === undefined) return;
    const today = new Date().toISOString().slice(0, 10);
    await db.milestones.update(id, { dateCompleted: today });
  }

  async function remove(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este marco?")) return;
    await db.milestones.delete(id);
  }

  const upcoming = milestones?.filter((m) => !m.dateCompleted) ?? [];
  const done = milestones?.filter((m) => m.dateCompleted) ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/marcos/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <PathTabs />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Próximos</h2>
      <div className="space-y-2 mb-4">
        {upcoming.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            onComplete={() => void complete(m.id)}
            onDelete={() => void remove(m.id)}
          />
        ))}
        {upcoming.length === 0 && (
          <p className="text-muted text-sm">Nenhum marco pendente.</p>
        )}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Concluídos</h2>
          <div className="space-y-2">
            {done.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onDelete={() => void remove(m.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: MilestoneNew**

`src/pages/path/MilestoneNew.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Milestone } from "../../lib/db";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MilestoneNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [datePlanned, setDatePlanned] = useState(todayISO());
  const [category, setCategory] = useState<Milestone["category"]>("medico");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await db.milestones.add({
      title: title.trim(),
      datePlanned,
      category,
      notes: notes.trim() || undefined,
    } as Milestone);
    navigate("/trilha", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha" className="text-muted text-sm">&larr; Trilha</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo marco</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Consulta endocrinologista"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Data prevista</label>
            <input
              type="date"
              value={datePlanned}
              onChange={(e) => setDatePlanned(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Milestone["category"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="medico">Médico</option>
              <option value="fisico">Físico</option>
              <option value="social">Social</option>
              <option value="fertilidade">Fertilidade</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium">
          Salvar marco
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Routes**

In `main.tsx`, REMOVE the old `import { Path } from "./pages/Path"`. ADD imports for MilestonesView and MilestoneNew. Replace `{ path: "trilha", element: <Path /> }` with:

```tsx
import { MilestonesView } from "./pages/path/MilestonesView";
import { MilestoneNew } from "./pages/path/MilestoneNew";
// ...
{ path: "trilha", element: <MilestonesView /> },
{ path: "trilha/marcos/novo", element: <MilestoneNew /> },
```

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/components/MilestoneCard.tsx src/pages/path/ src/main.tsx
git commit -m "feat(trilha): linha do tempo de marcos da transição"
```

---

## Task 4: MealPlanView + MealPlanEdit

**Files:**
- Create: `src/pages/path/MealPlanView.tsx`
- Create: `src/pages/path/MealPlanEdit.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MealPlanView**

`src/pages/path/MealPlanView.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";

const MEAL_NAMES = ["Café", "Almoço", "Lanche", "Jantar"];

export function MealPlanView() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
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
          <div>
            <p className="text-muted text-xs">kcal</p>
            <p className="text-nude-warm text-lg">{plan.kcalDaily}</p>
          </div>
          <div>
            <p className="text-muted text-xs">proteína</p>
            <p className="text-nude-warm text-lg">{plan.proteinG}g</p>
          </div>
          <div>
            <p className="text-muted text-xs">carbo</p>
            <p className="text-nude-warm text-lg">{plan.carbG}g</p>
          </div>
          <div>
            <p className="text-muted text-xs">gordura</p>
            <p className="text-nude-warm text-lg">{plan.fatG}g</p>
          </div>
        </div>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Refeições padrão</h2>
      <div className="space-y-3">
        {plan.defaultMeals.map((meal, i) => (
          <div key={i} className="card">
            <h3 className="text-nude-warm font-medium mb-2">{MEAL_NAMES[i] ?? `Refeição ${i + 1}`}</h3>
            <ul className="space-y-1 text-sm">
              {meal.map((food, j) => (
                <li key={j} className="flex justify-between">
                  <span className="text-nude-warm">{food.name}</span>
                  <span className="text-muted text-xs">{food.kcal} kcal</span>
                </li>
              ))}
            </ul>
            <p className="text-muted text-xs mt-2 pt-2 border-t border-bg-border">
              Total: {meal.reduce((s, f) => s + f.kcal, 0)} kcal · {meal.reduce((s, f) => s + (f.proteinG ?? 0), 0)}g proteína
            </p>
          </div>
        ))}
      </div>

      <Link to="/trilha/alimentacao/lista-compras" className="block text-center text-nude text-sm mt-4 underline">
        Ver lista de compras
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: MealPlanEdit (form simples só pra ajustar macros do plano principal)**

`src/pages/path/MealPlanEdit.tsx`:

```tsx
import { useState, useEffect, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../lib/db";

export function MealPlanEdit() {
  const navigate = useNavigate();
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (plan) {
      setKcal(String(plan.kcalDaily));
      setProtein(String(plan.proteinG));
      setCarb(String(plan.carbG));
      setFat(String(plan.fatG));
      setName(plan.name);
    }
  }, [plan]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!plan?.id) return;
    await db.mealPlans.update(plan.id, {
      name: name.trim(),
      kcalDaily: Number(kcal),
      proteinG: Number(protein),
      carbG: Number(carb),
      fatG: Number(fat),
    });
    navigate("/trilha/alimentacao", { replace: true });
  }

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Editar plano</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Kcal diárias</label>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Proteína (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Carbo (g)</label>
            <input
              type="number"
              value={carb}
              onChange={(e) => setCarb(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Gordura (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium">
          Salvar
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Routes + commit**

```tsx
import { MealPlanView } from "./pages/path/MealPlanView";
import { MealPlanEdit } from "./pages/path/MealPlanEdit";
// ...
{ path: "trilha/alimentacao", element: <MealPlanView /> },
{ path: "trilha/alimentacao/editar", element: <MealPlanEdit /> },
```

```bash
npm run build
git add src/pages/path/MealPlanView.tsx src/pages/path/MealPlanEdit.tsx src/main.tsx
git commit -m "feat(alimentacao): plano de macros + refeições padrão + edição"
```

---

## Task 5: ShoppingList

**Files:**
- Create: `src/pages/path/ShoppingList.tsx`
- Modify: `src/main.tsx`

A shopping list é derivada das refeições padrão — agrupa todos os alimentos únicos.

- [ ] **Step 1: ShoppingList**

`src/pages/path/ShoppingList.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";

export function ShoppingList() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  // Agrupa todos alimentos das refeições padrão (multiplica por 7 dias)
  const itemMap = new Map<string, number>();
  for (const meal of plan.defaultMeals) {
    for (const food of meal) {
      const current = itemMap.get(food.name) ?? 0;
      itemMap.set(food.name, current + food.qtyG * 7); // 7 dias
    }
  }
  const items = Array.from(itemMap.entries()).sort();

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Lista de compras</h1>
      </div>

      <p className="text-muted text-sm mb-4">
        Quantidades pra 7 dias do plano padrão. Pode arredondar pra cima na hora de comprar.
      </p>

      <div className="card">
        <ul className="space-y-2 text-sm">
          {items.map(([name, qtyG]) => (
            <li key={name} className="flex justify-between">
              <span className="text-nude-warm">{name}</span>
              <span className="text-muted text-xs">{(qtyG / 1000).toFixed(2)} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { ShoppingList } from "./pages/path/ShoppingList";
// ...
{ path: "trilha/alimentacao/lista-compras", element: <ShoppingList /> },
```

```bash
npm run build
git add src/pages/path/ShoppingList.tsx src/main.tsx
git commit -m "feat(alimentacao): lista de compras semanal derivada"
```

---

## Task 6: MealsToday (registro de refeições do dia)

**Files:**
- Create: `src/pages/path/MealsToday.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MealsToday**

`src/pages/path/MealsToday.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Meal } from "../../lib/db";

const MEAL_TYPE_LABEL: Record<Meal["mealType"], string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MealsToday() {
  const today = todayISO();
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(today).toArray(), [today]);

  async function toggleMeal(type: Meal["mealType"], mealIndex: number) {
    if (!plan) return;
    const existing = meals?.find((m) => m.mealType === type);
    if (existing && existing.id !== undefined) {
      await db.meals.update(existing.id, { checked: !existing.checked });
    } else {
      const foods = plan.defaultMeals[mealIndex] ?? [];
      await db.meals.add({
        date: today,
        mealType: type,
        foods,
        checked: true,
      } as Meal);
    }
  }

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const MEAL_ORDER: Array<{ type: Meal["mealType"]; index: number }> = [
    { type: "cafe", index: 0 },
    { type: "almoco", index: 1 },
    { type: "lanche", index: 2 },
    { type: "jantar", index: 3 },
  ];

  const totalKcal = meals
    ?.filter((m) => m.checked)
    .reduce((s, m) => s + m.foods.reduce((sf, f) => sf + f.kcal, 0), 0) ?? 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Refeições hoje</h1>
      </div>

      <div className="card mb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-muted text-sm">Consumido hoje</span>
          <span className="text-nude-warm text-lg">
            {totalKcal} / {plan.kcalDaily} kcal
          </span>
        </div>
        <div className="h-1.5 bg-bg-deep rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-nude"
            style={{ width: `${Math.min(100, (totalKcal / plan.kcalDaily) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {MEAL_ORDER.map(({ type, index }) => {
          const meal = meals?.find((m) => m.mealType === type);
          const foods = meal?.foods ?? plan.defaultMeals[index] ?? [];
          const checked = Boolean(meal?.checked);
          const kcal = foods.reduce((s, f) => s + f.kcal, 0);
          return (
            <div key={type} className="card">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => void toggleMeal(type, index)}
                  className={`w-6 h-6 rounded-md flex-shrink-0 border ${
                    checked ? "bg-nude border-nude" : "bg-bg-deep border-bg-border"
                  }`}
                  aria-label={checked ? "Feito" : "Não feito"}
                >
                  {checked && <span className="text-bg-base text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0 flex justify-between items-baseline">
                  <h3 className={`font-medium ${checked ? "text-muted line-through" : "text-nude-warm"}`}>
                    {MEAL_TYPE_LABEL[type]}
                  </h3>
                  <span className="text-muted text-xs">{kcal} kcal</span>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted ml-9">
                {foods.map((f, j) => (
                  <li key={j}>{f.name}</li>
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

- [ ] **Step 2: Route + commit**

```tsx
import { MealsToday } from "./pages/path/MealsToday";
// ...
{ path: "refeicoes-hoje", element: <MealsToday /> },
```

(Coloca na raiz, não dentro de /trilha — é acessada do Hoje.)

```bash
npm run build
git add src/pages/path/MealsToday.tsx src/main.tsx
git commit -m "feat(alimentacao): registro de refeições do dia com check"
```

---

## Task 7: DiaryView

**Files:**
- Create: `src/components/MoodPicker.tsx`
- Create: `src/pages/path/DiaryView.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MoodPicker (com SVGs — sem emojis)**

`src/components/MoodPicker.tsx`:

```tsx
interface Props {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}

const LABELS: Record<number, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Médio",
  4: "Bom",
  5: "Ótimo",
};

// 5 círculos com intensidade crescente de cor (de wine escuro a nude claro)
const COLORS: Record<number, string> = {
  1: "#3a1419",
  2: "#5c1a2b",
  3: "#8b3a4a",
  4: "#a87a6a",
  5: "#d4a373",
};

export function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {([1, 2, 3, 4, 5] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-md transition ${
            value === v ? "bg-bg-raised border border-nude" : "bg-bg-deep border border-bg-border"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: COLORS[v], opacity: value === v ? 1 : 0.5 }}
          />
          <span className={`text-[0.65rem] ${value === v ? "text-nude" : "text-muted"}`}>
            {LABELS[v]}
          </span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: DiaryView**

`src/pages/path/DiaryView.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type DailyLog } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { MoodPicker } from "../../components/MoodPicker";
import { formatDateBR } from "../../lib/format";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DiaryView() {
  const today = todayISO();
  const log = useLiveQuery(() => db.dailyLog.get(today), [today]);
  const recent = useLiveQuery(
    () => db.dailyLog.orderBy("date").reverse().limit(30).toArray(),
    [],
  );
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>();

  useEffect(() => {
    if (log) {
      setNotes(log.notes ?? "");
      setMood(log.mood);
    }
  }, [log]);

  async function save() {
    const existing = await db.dailyLog.get(today);
    if (existing) {
      await db.dailyLog.update(today, { mood, notes: notes.trim() || undefined });
    } else {
      await db.dailyLog.put({
        date: today,
        mood,
        notes: notes.trim() || undefined,
        activeBreakCount: 0,
        waterMl: 0,
      } as DailyLog);
    }
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl text-nude mb-3">Trilha</h1>
      <PathTabs />

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Hoje · {formatDateBR(new Date())}</h2>
        <p className="text-muted text-xs uppercase tracking-wider mb-2">Humor</p>
        <MoodPicker value={mood} onChange={setMood} />
        <p className="text-muted text-xs uppercase tracking-wider mb-2 mt-4">Notas</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => void save()}
          rows={4}
          placeholder="Como foi o dia? Algo que aconteceu, sentimentos, dúvidas, conquistas..."
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <button
          type="button"
          onClick={() => void save()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm mt-3"
        >
          Salvar
        </button>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Últimos dias</h2>
      <div className="space-y-2">
        {recent?.filter((r) => r.mood || r.notes).map((r) => (
          <div key={r.date} className="card">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-nude-warm text-sm">{formatDateBR(new Date(r.date))}</span>
              {r.mood && (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ["#3a1419", "#5c1a2b", "#8b3a4a", "#a87a6a", "#d4a373"][r.mood - 1] }} />
              )}
            </div>
            {r.notes && <p className="text-sm text-muted">{r.notes}</p>}
          </div>
        ))}
        {(!recent || recent.filter((r) => r.mood || r.notes).length === 0) && (
          <p className="text-muted text-sm text-center py-4">Sem registros ainda.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Route + commit**

```tsx
import { DiaryView } from "./pages/path/DiaryView";
// ...
{ path: "trilha/diario", element: <DiaryView /> },
```

```bash
npm run build
git add src/components/MoodPicker.tsx src/pages/path/DiaryView.tsx src/main.tsx
git commit -m "feat(diario): registro de humor + notas diárias"
```

---

## Task 8: Integração no Today

**Files:**
- Modify: `src/pages/Today.tsx`

Adicionar 2 cards no Today: refeições do dia (status N/4) e diário (humor de hoje se preenchido).

- [ ] **Step 1: Update Today**

Edit `src/pages/Today.tsx`. Adicione queries:

```tsx
const mealsToday = useLiveQuery(
  () => db.meals.where("date").equals(todayISO).toArray(),
  [todayISO],
);
const mealsDone = mealsToday?.filter((m) => m.checked).length ?? 0;
```

Adicione 2 TodayCards (depois do card de hidratação, antes dos cards de skincare):

```tsx
<TodayCard
  title="Refeições"
  subtitle={`${mealsDone}/4 do plano`}
  to="/refeicoes-hoje"
  variant={mealsDone < 4 ? "highlight" : "default"}
/>
<TodayCard
  title="Diário"
  subtitle={dailyLog?.mood ? `humor registrado` : "como foi o dia?"}
  to="/trilha/diario"
/>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/Today.tsx
git commit -m "feat(hoje): cards de refeições e diário"
```

---

## Task 9: README + push final

- [ ] **Step 1: Update README Status**

```markdown
## Status

- **Onda 1:** ✅ Concluída
- **Onda 2 Parte 1:** ✅ Concluída — Beleza Pele & cabelo
- **Onda 2 Parte 2:** ✅ Concluída — Beleza Estilo
- **Onda 2 Parte 3:** ✅ Concluída — Trilha (marcos + alimentação + diário)
- **Onda 3:** dança/movimento profundo
- **Onda 4:** polimento + maquiagem
```

- [ ] **Step 2: Final tests + build + push**

```bash
npm run test
npm run build
git add README.md docs/superpowers/plans/2026-05-27-onda-2-parte-3-trilha.md
git commit -m "docs: README — Onda 2 Parte 3 concluída"
git push origin main
```

## Report

Tests, build, commit, push, total commits.

# Trein-Final — Onda 2 Parte 1: Beleza → Pele & Cabelo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Implementar a sub-aba "Pele & cabelo" dentro da aba Beleza. Inclui catálogo pré-cadastrado de ~20 produtos brasileiros + 6 rotinas (rosto manhã/noite, axila clareamento, íntima clareamento, costas cicatrizes, cronograma capilar pixie). Checklist diário integrado no Hoje. Notificações matinais/noturnas via scheduler.

**Architecture:** Continua o pattern. Sub-navegação dentro de Beleza com tabs (BeautyTabs). Skincare e Haircare como sub-páginas. Produtos catalogados em store `products` + seed function. Logs em `skincareLogs` e `haircare`. Estilo fica placeholder até Parte 2.

**Continua de:** Onda 1 Parte 2 — commit `e9ee359`

---

## File Structure (additions)

```
src/
├── data/
│   ├── products-seed.ts            # ~20 produtos brasileiros
│   └── skincare-routines-seed.ts   # 6 rotinas
├── components/
│   ├── BeautyTabs.tsx              # navegação sub-tabs (Pele&Cabelo / Estilo)
│   ├── RoutineCard.tsx             # card de uma rotina com checklist
│   ├── ProductCard.tsx
│   └── DisclaimerCard.tsx          # aviso de procurar derma (reutilizável)
├── pages/beauty/
│   ├── BeautyHome.tsx              # substitui Beauty.tsx
│   ├── SkincareHome.tsx            # lista rotinas + checklist diário
│   ├── SkincareDetail.tsx          # passos de uma rotina
│   ├── SkincareNew.tsx             # criar/editar rotina customizada
│   ├── HaircareHome.tsx            # cronograma capilar
│   ├── ProductsHome.tsx            # lista de produtos
│   └── ProductNew.tsx              # adicionar produto
└── lib/
    └── beauty-seed.ts              # seed function pra beauty data
tests/
├── lib/
│   └── beauty-seed.test.ts
└── pages/
    └── skincare.smoke.test.tsx
```

---

## Fase A — Dados pré-cadastrados

### Task 1: Seed de produtos e rotinas

**Files:**
- Create: `src/data/products-seed.ts`
- Create: `src/data/skincare-routines-seed.ts`
- Create: `src/lib/beauty-seed.ts`
- Create: `tests/lib/beauty-seed.test.ts`

- [ ] **Step 1: Test**

`tests/lib/beauty-seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedBeauty } from "../../src/lib/beauty-seed";
import { db } from "../../src/lib/db";

describe("seedBeauty", () => {
  it("popula produtos e rotinas na primeira chamada", async () => {
    await seedBeauty();
    const products = await db.products.toArray();
    const routines = await db.skincareRoutines.toArray();
    expect(products.length).toBeGreaterThanOrEqual(15);
    expect(routines.length).toBeGreaterThanOrEqual(5);
  });

  it("não duplica em chamadas repetidas", async () => {
    await seedBeauty();
    const firstP = (await db.products.toArray()).length;
    const firstR = (await db.skincareRoutines.toArray()).length;
    await seedBeauty();
    expect((await db.products.toArray()).length).toBe(firstP);
    expect((await db.skincareRoutines.toArray()).length).toBe(firstR);
  });

  it("todo produto tem nome e categoria", async () => {
    await seedBeauty();
    for (const p of await db.products.toArray()) {
      expect(p.name).toBeTruthy();
      expect(["skincare", "haircare", "supplements"]).toContain(p.category);
    }
  });
});
```

- [ ] **Step 2: Catálogo de produtos**

`src/data/products-seed.ts`:

```typescript
import type { Product } from "../lib/db";

// 20 produtos comuns no Brasil (com explicação do PORQUÊ no notes)
export const PRODUCTS: Omit<Product, "id">[] = [
  // === SKINCARE ROSTO ===
  {
    name: "Sabonete líquido facial CeraVe (pele oleosa)",
    category: "skincare",
    notes: "Limpa sem agredir barreira. Use 2x/dia. Pra começar.",
  },
  {
    name: "Sabonete La Roche Effaclar Concentrado",
    category: "skincare",
    notes: "Pra pele com tendência a oleosidade ou acne. Use noite.",
  },
  {
    name: "Tônico hidratante Bioderma Sensibio",
    category: "skincare",
    notes: "Equilibra pH depois da limpeza. Aplica antes do hidratante.",
  },
  {
    name: "Vitamina C 10% Adcos",
    category: "skincare",
    notes: "Antioxidante de manhã, antes do protetor solar. Clareia manchas com o tempo.",
  },
  {
    name: "Hidratante Cetaphil PRO Oil Control",
    category: "skincare",
    notes: "Hidrata sem deixar oleoso. Use manhã + noite.",
  },
  {
    name: "Protetor solar La Roche Anthelios FPS 60",
    category: "skincare",
    notes: "OBRIGATÓRIO de manhã, sempre. Sem ele, vitamina C, ácidos e tudo se anula.",
  },
  {
    name: "Ácido glicólico 8% noturno (Neostrata)",
    category: "skincare",
    notes: "1-2x/semana à noite. Renova pele, ajuda cicatrizes. NÃO usar mesmo dia que retinol.",
  },
  {
    name: "Retinol 0,3% Skinceuticals",
    category: "skincare",
    notes: "1-2x/semana à noite (alternar com glicólico). Estimula renovação. Pode irritar — começa devagar.",
  },
  // === CICATRIZES/CORPO ===
  {
    name: "Bepantol Derma Pré + Pós",
    category: "skincare",
    notes: "Cicatrizante. Use em cicatrizes recentes nas costas. Acelera reparação.",
  },
  {
    name: "Kelo-Cote silicone para cicatrizes",
    category: "skincare",
    notes: "Gel de silicone pra cicatrizes velhas. Aplica fina camada, 2x/dia, por 3-6 meses.",
  },
  {
    name: "Esfoliante químico corporal (ácido salicílico 2%)",
    category: "skincare",
    notes: "Pra costas com acne. 1-2x/semana. Não usar junto com glicólico forte.",
  },
  // === AXILA E ÍNTIMA (CLAREAMENTO) ===
  {
    name: "Sabonete íntimo Lucretin / Dermacyd",
    category: "skincare",
    notes: "pH neutro. Não agride mucosa. Use diariamente.",
  },
  {
    name: "Clareador axila/íntima Adcos (com niacinamida)",
    category: "skincare",
    notes: "Niacinamida + alfa-arbutin. Clareamento gradual em 2-3 meses. Aplica à noite.",
  },
  {
    name: "Hidratante íntimo de glicerina",
    category: "skincare",
    notes: "Mantém maciez da região. Aplica após banho.",
  },
  // === HAIRCARE (pixie cacheado) ===
  {
    name: "Shampoo Salon Line Meu Cacho Minha Vida hidratação",
    category: "haircare",
    notes: "Sem sulfato agressivo. Mantém cachos. Use 2-3x/semana, alterna com co-wash.",
  },
  {
    name: "Co-wash Salon Line / Lola",
    category: "haircare",
    notes: "Limpa cachos sem espumar. Use nos dias entre shampoo.",
  },
  {
    name: "Máscara de hidratação Lola My Curls",
    category: "haircare",
    notes: "Hidratação semanal. Deixa 20min antes de enxaguar.",
  },
  {
    name: "Máscara de nutrição (manteiga de karité)",
    category: "haircare",
    notes: "Nutrição quinzenal. Repõe lipídios.",
  },
  {
    name: "Máscara de reconstrução (queratina/hidrolisado)",
    category: "haircare",
    notes: "Reconstrução mensal. Repõe proteína. NÃO USE toda semana — proteína em excesso quebra fios.",
  },
  {
    name: "Creme de pentear leve pra cachos curtos",
    category: "haircare",
    notes: "Aplica em mecha úmida pra definir cachos do pixie. Não usa muito — pixie cacheado fica leve.",
  },
];
```

- [ ] **Step 3: Rotinas de skincare**

`src/data/skincare-routines-seed.ts`:

```typescript
import type { SkincareRoutine } from "../lib/db";

export const ROUTINES: Omit<SkincareRoutine, "id">[] = [
  {
    name: "Rosto · manhã",
    time: "morning",
    target: "face",
    steps: [
      { productName: "Sabonete líquido facial (CeraVe ou similar)", technique: "Massagem suave por 30s, enxágua com água fria", waitMin: 0 },
      { productName: "Tônico hidratante Bioderma Sensibio", technique: "Algodão ou mãos, espalha por todo rosto", waitMin: 1 },
      { productName: "Vitamina C 10% Adcos", technique: "4-5 gotas, rosto e pescoço, aguarda absorver", waitMin: 2 },
      { productName: "Hidratante Cetaphil PRO", technique: "Bolinha do tamanho de ervilha, espalha", waitMin: 1 },
      { productName: "Protetor solar La Roche Anthelios FPS 60", technique: "2 dedos de produto (rosto + pescoço). Reaplica a cada 3h se sair de casa", waitMin: 0 },
    ],
  },
  {
    name: "Rosto · noite",
    time: "evening",
    target: "face",
    steps: [
      { productName: "Sabonete La Roche Effaclar (se houver maquiagem, demaquilar primeiro com Bioderma Sensibio H2O)", technique: "Massagem 1min, enxágua", waitMin: 0 },
      { productName: "Tônico hidratante Bioderma Sensibio", technique: "Espalha por todo rosto", waitMin: 1 },
      { productName: "Ácido glicólico 8% (2x/semana) OU Retinol 0,3% (1-2x/semana, dias diferentes do glicólico)", technique: "Fina camada. NÃO use se a pele está irritada", waitMin: 10 },
      { productName: "Hidratante Cetaphil PRO", technique: "Bolinha pequena, espalha bem", waitMin: 0 },
    ],
  },
  {
    name: "Axila · clareamento (noturno)",
    time: "evening",
    target: "armpit",
    steps: [
      { productName: "Sabonete neutro no banho (não usa desodorante na hora desse tratamento)", technique: "Limpa bem", waitMin: 0 },
      { productName: "Clareador axila/íntima Adcos (niacinamida + alfa-arbutin)", technique: "Camada fina nas duas axilas. Não sai por cima. Não usa desodorante de noite.", waitMin: 10 },
      { productName: "Hidratante leve (opcional)", technique: "Se ficar ressecado", waitMin: 0 },
    ],
  },
  {
    name: "Região íntima · clareamento (noturno)",
    time: "evening",
    target: "intimate",
    steps: [
      { productName: "Sabonete íntimo Lucretin/Dermacyd no banho", technique: "Limpa bem, seca completamente", waitMin: 0 },
      { productName: "Clareador axila/íntima Adcos", technique: "Camada fina na pele externa. NUNCA dentro da mucosa.", waitMin: 10 },
      { productName: "Hidratante íntimo de glicerina", technique: "Mantém maciez", waitMin: 0 },
    ],
  },
  {
    name: "Costas · tratamento de cicatrizes (noturno)",
    time: "evening",
    target: "back",
    steps: [
      { productName: "Esfoliante químico (ácido salicílico 2%) — 1-2x/semana", technique: "Aplica nas costas após banho. Espera secar.", waitMin: 5 },
      { productName: "Kelo-Cote silicone (nas cicatrizes velhas, todo dia)", technique: "Camada fina sobre cicatrizes", waitMin: 5 },
      { productName: "Bepantol Derma (nas cicatrizes recentes)", technique: "Espalha sobre lesão", waitMin: 0 },
    ],
  },
  {
    name: "Geral · após o banho",
    time: "morning",
    target: "general",
    steps: [
      { productName: "Hidratante corporal", technique: "Pele ainda úmida, ajuda absorver. Foco em coxas, braços, cintura.", waitMin: 0 },
    ],
  },
];
```

- [ ] **Step 4: Seed function**

`src/lib/beauty-seed.ts`:

```typescript
import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

export async function seedBeauty(): Promise<void> {
  const seeded = await db.settings.get("beautySeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.products, db.skincareRoutines, db.settings], async () => {
    for (const p of PRODUCTS) {
      await db.products.add(p as never);
    }
    for (const r of ROUTINES) {
      await db.skincareRoutines.add(r as never);
    }
    await db.settings.put({ key: "beautySeeded", value: true });
  });
}
```

Add `beautySeeded` to Settings interface in `src/lib/settings-helpers.ts`:

```typescript
beautySeeded: boolean;
```

And in DEFAULTS:

```typescript
beautySeeded: false,
```

Same in `src/hooks/useSetting.ts` DEFAULTS.

- [ ] **Step 5: Wire seed in `main.tsx`**

In `src/main.tsx`, the existing `seedDatabase().then(...)` call. Add `seedBeauty()` chained:

```tsx
import { seedBeauty } from "./lib/beauty-seed";
// ...
Promise.all([seedDatabase(), seedBeauty()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    // ...
  );
});
```

- [ ] **Step 6: Test + build + commit**

```bash
cd "C:/Users/ASCalderon/Desktop/Trein-Final"
npm run test
npm run build
git add src/data/products-seed.ts src/data/skincare-routines-seed.ts src/lib/beauty-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx tests/lib/beauty-seed.test.ts
git commit -m "feat(beauty): seed de 20 produtos brasileiros + 6 rotinas pré-cadastradas"
```

---

## Fase B — UI base

### Task 2: BeautyHome + sub-navegação

**Files:**
- Modify: rename `src/pages/Beauty.tsx` → `src/pages/beauty/BeautyHome.tsx`
- Create: `src/components/BeautyTabs.tsx`
- Create: `src/components/DisclaimerCard.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: BeautyTabs (sub-navegação)**

`src/components/BeautyTabs.tsx`:

```tsx
import { NavLink } from "react-router-dom";

export function BeautyTabs() {
  return (
    <div className="flex gap-2 mb-4">
      <NavLink
        to="/beleza/pele-cabelo"
        className={({ isActive }) =>
          `flex-1 py-2 rounded-md text-sm text-center ${
            isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
          }`
        }
      >
        Pele & cabelo
      </NavLink>
      <NavLink
        to="/beleza/estilo"
        className={({ isActive }) =>
          `flex-1 py-2 rounded-md text-sm text-center ${
            isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
          }`
        }
      >
        Estilo
      </NavLink>
    </div>
  );
}
```

- [ ] **Step 2: DisclaimerCard**

`src/components/DisclaimerCard.tsx`:

```tsx
interface Props {
  text: string;
}

export function DisclaimerCard({ text }: Props) {
  return (
    <div className="card !bg-wine/20 !border-wine-light text-sm">
      <span className="text-nude font-medium">Lembrete:</span> <span className="text-nude-warm">{text}</span>
    </div>
  );
}
```

- [ ] **Step 3: BeautyHome (pele&cabelo overview)**

```bash
mkdir -p src/pages/beauty
rm src/pages/Beauty.tsx
```

Create `src/pages/beauty/BeautyHome.tsx`:

```tsx
import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";

export function BeautyHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude">Beleza</h1>
      <BeautyTabs />
      <DisclaimerCard text="Antes de começar tratamentos com ácidos/clareadores, vale uma consulta com dermatologista. O app sugere boas práticas, mas não substitui orientação profissional." />
      <Link to="/beleza/pele-cabelo/skincare" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Skincare</h3>
        <p className="text-muted text-sm mt-1">Rotinas manhã/noite, áreas específicas, checklist</p>
      </Link>
      <Link to="/beleza/pele-cabelo/haircare" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Cabelo</h3>
        <p className="text-muted text-sm mt-1">Cronograma capilar pro pixie cacheado</p>
      </Link>
      <Link to="/beleza/pele-cabelo/produtos" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Produtos</h3>
        <p className="text-muted text-sm mt-1">Catálogo + estoque</p>
      </Link>
    </div>
  );
}
```

Also create placeholder for Estilo:

`src/pages/beauty/StylePlaceholder.tsx`:

```tsx
import { BeautyTabs } from "../../components/BeautyTabs";
import { EmptyState } from "../../components/EmptyState";

export function StylePlaceholder() {
  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl text-nude mb-3">Beleza</h1>
      <BeautyTabs />
      <EmptyState title="Estilo" description="Paleta pessoal, peças estratégicas e looks chegam na próxima parte." />
    </div>
  );
}
```

- [ ] **Step 4: Update routes in `main.tsx`**

Replace the existing `{ path: "beleza", element: <Beauty /> }` with:

```tsx
import { BeautyHome } from "./pages/beauty/BeautyHome";
import { StylePlaceholder } from "./pages/beauty/StylePlaceholder";
// ...
{ path: "beleza", element: <BeautyHome /> },
{ path: "beleza/pele-cabelo", element: <BeautyHome /> },
{ path: "beleza/estilo", element: <StylePlaceholder /> },
```

Remove old `import { Beauty } from "./pages/Beauty";` since we deleted that file.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/pages/beauty/ src/components/BeautyTabs.tsx src/components/DisclaimerCard.tsx src/main.tsx
git rm src/pages/Beauty.tsx
git commit -m "feat(beleza): home com sub-tabs Pele&Cabelo / Estilo + disclaimer"
```

---

### Task 3: Skincare — lista de rotinas + checklist diário

**Files:**
- Create: `src/components/RoutineCard.tsx`
- Create: `src/pages/beauty/SkincareHome.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: RoutineCard**

`src/components/RoutineCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { SkincareRoutine } from "../lib/db";

const TIME_LABEL: Record<SkincareRoutine["time"], string> = {
  morning: "Manhã",
  evening: "Noite",
};

const TARGET_LABEL: Record<SkincareRoutine["target"], string> = {
  face: "Rosto",
  back: "Costas",
  armpit: "Axila",
  intimate: "Íntima",
  general: "Geral",
};

interface Props {
  routine: SkincareRoutine;
  done?: boolean;
  onToggle?: () => void;
}

export function RoutineCard({ routine, done, onToggle }: Props) {
  return (
    <div className="card flex items-center gap-3">
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={`w-6 h-6 rounded-md flex-shrink-0 border ${
            done ? "bg-nude border-nude" : "bg-bg-deep border-bg-border"
          }`}
          aria-label={done ? "Feito" : "Não feito"}
        >
          {done && <span className="text-bg-base text-xs">✓</span>}
        </button>
      )}
      <Link to={`/beleza/pele-cabelo/skincare/${routine.id}`} className="flex-1 min-w-0">
        <h3 className={`font-medium ${done ? "text-muted line-through" : "text-nude-warm"}`}>
          {routine.name}
        </h3>
        <p className="text-muted text-xs mt-0.5">
          {TIME_LABEL[routine.time]} · {TARGET_LABEL[routine.target]} · {routine.steps.length} passos
        </p>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: SkincareHome com checklist diário**

`src/pages/beauty/SkincareHome.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { RoutineCard } from "../../components/RoutineCard";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SkincareHome() {
  const today = todayISO();
  const routines = useLiveQuery(() => db.skincareRoutines.orderBy("time").toArray(), []);
  const todayLogs = useLiveQuery(() => db.skincareLogs.where("date").equals(today).toArray(), [today]);

  const doneIds = new Set(todayLogs?.filter((l) => l.completed).map((l) => l.routineId) ?? []);

  async function toggle(routineId: number) {
    const existing = todayLogs?.find((l) => l.routineId === routineId);
    if (existing && existing.id !== undefined) {
      await db.skincareLogs.update(existing.id, { completed: !existing.completed });
    } else {
      await db.skincareLogs.add({ date: today, routineId, completed: true });
    }
  }

  const morning = routines?.filter((r) => r.time === "morning") ?? [];
  const evening = routines?.filter((r) => r.time === "evening") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Skincare</h1>
        <Link to="/beleza/pele-cabelo/skincare/nova" className="text-muted text-sm">+ nova</Link>
      </div>
      <BeautyTabs />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2 mt-2">Manhã</h2>
      <div className="space-y-2 mb-4">
        {morning.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            done={r.id !== undefined && doneIds.has(r.id)}
            onToggle={() => r.id !== undefined && void toggle(r.id)}
          />
        ))}
        {morning.length === 0 && <p className="text-muted text-sm">Nenhuma rotina matinal.</p>}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Noite</h2>
      <div className="space-y-2">
        {evening.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            done={r.id !== undefined && doneIds.has(r.id)}
            onToggle={() => r.id !== undefined && void toggle(r.id)}
          />
        ))}
        {evening.length === 0 && <p className="text-muted text-sm">Nenhuma rotina noturna.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Route + commit**

```tsx
import { SkincareHome } from "./pages/beauty/SkincareHome";
// ...
{ path: "beleza/pele-cabelo/skincare", element: <SkincareHome /> },
```

```bash
npm run build
git add src/components/RoutineCard.tsx src/pages/beauty/SkincareHome.tsx src/main.tsx
git commit -m "feat(skincare): lista de rotinas com checklist diário"
```

---

### Task 4: SkincareDetail — passos da rotina

**Files:**
- Create: `src/pages/beauty/SkincareDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: SkincareDetail**

`src/pages/beauty/SkincareDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams, useNavigate } from "react-router-dom";

import { db } from "../../lib/db";

export function SkincareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(
    async () => (id ? await db.skincareRoutines.get(Number(id)) : undefined),
    [id],
  );

  if (!routine) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function handleDelete() {
    if (!routine?.id) return;
    if (!confirm(`Apagar a rotina "${routine.name}"?`)) return;
    await db.skincareRoutines.delete(routine.id);
    navigate("/beleza/pele-cabelo/skincare", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/skincare" className="text-muted text-sm">&larr; Skincare</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{routine.name}</h1>
      <p className="text-muted text-xs mb-4">
        {routine.time === "morning" ? "Manhã" : "Noite"} · {routine.target}
      </p>

      <ol className="space-y-2">
        {routine.steps.map((step, i) => (
          <li key={i} className="card">
            <div className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-wine text-nude-warm flex items-center justify-center text-sm font-medium flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-nude-warm font-medium">{step.productName}</h3>
                <p className="text-sm text-muted mt-1">{step.technique}</p>
                {step.waitMin > 0 && (
                  <p className="text-xs text-nude mt-1">Aguardar {step.waitMin} min antes do próximo</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => void handleDelete()}
        className="mt-6 text-muted text-xs hover:text-red-300"
      >
        Apagar rotina
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { SkincareDetail } from "./pages/beauty/SkincareDetail";
// ...
{ path: "beleza/pele-cabelo/skincare/:id", element: <SkincareDetail /> },
```

```bash
npm run build
git add src/pages/beauty/SkincareDetail.tsx src/main.tsx
git commit -m "feat(skincare): detalhe de rotina com passos"
```

---

### Task 5: SkincareNew — criar rotina customizada

**Files:**
- Create: `src/pages/beauty/SkincareNew.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Form**

`src/pages/beauty/SkincareNew.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type SkincareRoutine } from "../../lib/db";

type Step = SkincareRoutine["steps"][number];

export function SkincareNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [time, setTime] = useState<SkincareRoutine["time"]>("morning");
  const [target, setTarget] = useState<SkincareRoutine["target"]>("face");
  const [steps, setSteps] = useState<Step[]>([{ productName: "", technique: "", waitMin: 0 }]);

  function updateStep(i: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, { productName: "", technique: "", waitMin: 0 }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanSteps = steps.filter((s) => s.productName.trim() !== "");
    if (cleanSteps.length === 0) return;
    await db.skincareRoutines.add({ name: name.trim(), time, target, steps: cleanSteps } as SkincareRoutine);
    navigate("/beleza/pele-cabelo/skincare", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/skincare" className="text-muted text-sm">&larr; Skincare</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Nova rotina</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Rosto noite com retinol"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Horário</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value as SkincareRoutine["time"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="morning">Manhã</option>
              <option value="evening">Noite</option>
            </select>
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Área</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as SkincareRoutine["target"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="face">Rosto</option>
              <option value="back">Costas</option>
              <option value="armpit">Axila</option>
              <option value="intimate">Íntima</option>
              <option value="general">Geral</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-muted text-xs uppercase tracking-wider">Passos</label>
            <button type="button" onClick={addStep} className="text-nude text-xs">+ adicionar</button>
          </div>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="card !p-3 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted text-xs">Passo {i + 1}</span>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-muted text-xs hover:text-red-300">
                      remover
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={s.productName}
                  onChange={(e) => updateStep(i, { productName: e.target.value })}
                  placeholder="Nome do produto"
                  className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
                />
                <textarea
                  value={s.technique}
                  onChange={(e) => updateStep(i, { technique: e.target.value })}
                  placeholder="Como aplicar (técnica)"
                  rows={2}
                  className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={s.waitMin}
                    onChange={(e) => updateStep(i, { waitMin: Number(e.target.value) })}
                    className="w-20 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
                  />
                  <span className="text-muted text-xs">min de espera</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
        >
          Salvar rotina
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { SkincareNew } from "./pages/beauty/SkincareNew";
// ...
{ path: "beleza/pele-cabelo/skincare/nova", element: <SkincareNew /> },
```

Importante: registrar `nova` ANTES de `:id` no Router se houver conflito, mas React Router 7 resolve estáticos antes de dinâmicos automaticamente. OK.

```bash
npm run build
git add src/pages/beauty/SkincareNew.tsx src/main.tsx
git commit -m "feat(skincare): criar rotina customizada"
```

---

### Task 6: HaircareHome — cronograma capilar

**Files:**
- Create: `src/pages/beauty/HaircareHome.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: HaircareHome**

`src/pages/beauty/HaircareHome.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type HaircareEntry } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { formatDateBR } from "../../lib/format";

const TYPE_LABEL: Record<HaircareEntry["type"], string> = {
  hidratacao: "Hidratação",
  nutricao: "Nutrição",
  reconstrucao: "Reconstrução",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function HaircareHome() {
  const entries = useLiveQuery(() => db.haircare.orderBy("date").reverse().limit(30).toArray(), []);
  const [type, setType] = useState<HaircareEntry["type"]>("hidratacao");
  const [products, setProducts] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    await db.haircare.add({
      date: todayISO(),
      type,
      products: products.split(",").map((p) => p.trim()).filter(Boolean),
      completed: true,
    });
    setProducts("");
  }

  const lastByType: Record<HaircareEntry["type"], string | undefined> = {
    hidratacao: entries?.find((e) => e.type === "hidratacao")?.date,
    nutricao: entries?.find((e) => e.type === "nutricao")?.date,
    reconstrucao: entries?.find((e) => e.type === "reconstrucao")?.date,
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Cabelo</h1>
      </div>
      <BeautyTabs />

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-2">Cronograma capilar — pixie cacheado</h2>
        <p className="text-muted text-sm mb-3">
          Hidratação semanal · Nutrição quinzenal · Reconstrução mensal.
          Não passa proteína (reconstrução) toda semana — em excesso quebra fios.
        </p>
        <ul className="space-y-1 text-sm">
          {(["hidratacao", "nutricao", "reconstrucao"] as const).map((t) => (
            <li key={t} className="flex justify-between">
              <span className="text-nude-warm">{TYPE_LABEL[t]}</span>
              <span className="text-muted text-xs">
                {lastByType[t] ? `última: ${formatDateBR(new Date(lastByType[t]!))}` : "ainda não registrou"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Registrar tratamento de hoje</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as HaircareEntry["type"])}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            <option value="hidratacao">Hidratação</option>
            <option value="nutricao">Nutrição</option>
            <option value="reconstrucao">Reconstrução</option>
          </select>
          <input
            type="text"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="Produtos usados (separados por vírgula)"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm">
            Registrar
          </button>
        </form>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      <div className="space-y-2">
        {entries?.map((e) => (
          <div key={e.id} className="card !p-3">
            <div className="flex justify-between items-baseline">
              <span className="text-nude-warm text-sm">{TYPE_LABEL[e.type]}</span>
              <span className="text-muted text-xs">{formatDateBR(new Date(e.date))}</span>
            </div>
            {e.products.length > 0 && (
              <p className="text-muted text-xs mt-1">{e.products.join(" + ")}</p>
            )}
          </div>
        ))}
        {(!entries || entries.length === 0) && (
          <p className="text-muted text-sm py-2">Sem registros ainda.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { HaircareHome } from "./pages/beauty/HaircareHome";
// ...
{ path: "beleza/pele-cabelo/haircare", element: <HaircareHome /> },
```

```bash
npm run build
git add src/pages/beauty/HaircareHome.tsx src/main.tsx
git commit -m "feat(haircare): cronograma capilar do pixie cacheado"
```

---

### Task 7: ProductsHome + ProductNew

**Files:**
- Create: `src/components/ProductCard.tsx`
- Create: `src/pages/beauty/ProductsHome.tsx`
- Create: `src/pages/beauty/ProductNew.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: ProductCard**

`src/components/ProductCard.tsx`:

```tsx
import type { Product } from "../lib/db";
import { formatDateBR } from "../lib/format";

const CATEGORY_LABEL: Record<Product["category"], string> = {
  skincare: "Skincare",
  haircare: "Cabelo",
  supplements: "Suplemento",
};

interface Props {
  product: Product;
  onDelete?: () => void;
}

export function ProductCard({ product, onDelete }: Props) {
  const expiring = product.endDate && new Date(product.endDate) < new Date();
  return (
    <div className="card">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[product.category]}</span>
        {expiring && <span className="text-red-300 text-xs">vencido</span>}
      </div>
      <h3 className="text-nude-warm font-medium">{product.name}</h3>
      {product.notes && <p className="text-muted text-sm mt-1">{product.notes}</p>}
      {product.boughtAt && (
        <p className="text-muted text-xs mt-2">comprado em {formatDateBR(new Date(product.boughtAt))}</p>
      )}
      {product.endDate && (
        <p className="text-muted text-xs">vence em {formatDateBR(new Date(product.endDate))}</p>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="text-muted text-xs mt-2 hover:text-red-300">
          apagar
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: ProductsHome**

`src/pages/beauty/ProductsHome.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Product } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { ProductCard } from "../../components/ProductCard";

type Filter = "all" | Product["category"];

export function ProductsHome() {
  const [filter, setFilter] = useState<Filter>("all");
  const products = useLiveQuery(async () => {
    if (filter === "all") return db.products.toArray();
    return db.products.where("category").equals(filter).toArray();
  }, [filter]);

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este produto?")) return;
    await db.products.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Produtos</h1>
        <Link to="/beleza/pele-cabelo/produtos/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />

      <div className="flex gap-2 mb-4">
        {(["all", "skincare", "haircare", "supplements"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-pill text-xs ${
              filter === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {f === "all" ? "Todos" : f === "skincare" ? "Pele" : f === "haircare" ? "Cabelo" : "Supl."}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} onDelete={() => void handleDelete(p.id)} />
        ))}
        {products?.length === 0 && (
          <p className="text-muted text-sm py-4 text-center">Nenhum produto.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ProductNew**

`src/pages/beauty/ProductNew.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Product } from "../../lib/db";

export function ProductNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("skincare");
  const [boughtAt, setBoughtAt] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await db.products.add({
      name: name.trim(),
      category,
      boughtAt: boughtAt || undefined,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    } as Product);
    navigate("/beleza/pele-cabelo/produtos", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/produtos" className="text-muted text-sm">&larr; Produtos</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product["category"])}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            <option value="skincare">Skincare</option>
            <option value="haircare">Cabelo</option>
            <option value="supplements">Suplemento</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Comprado em</label>
            <input
              type="date"
              value={boughtAt}
              onChange={(e) => setBoughtAt(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Vence em</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
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
          Salvar
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Routes + commit**

```tsx
import { ProductsHome } from "./pages/beauty/ProductsHome";
import { ProductNew } from "./pages/beauty/ProductNew";
// ...
{ path: "beleza/pele-cabelo/produtos", element: <ProductsHome /> },
{ path: "beleza/pele-cabelo/produtos/novo", element: <ProductNew /> },
```

```bash
npm run build
git add src/components/ProductCard.tsx src/pages/beauty/ProductsHome.tsx src/pages/beauty/ProductNew.tsx src/main.tsx
git commit -m "feat(produtos): catálogo + criar novo"
```

---

## Fase D — Hoje + notificações

### Task 8: Integrar skincare no dashboard Hoje

**Files:**
- Modify: `src/pages/Today.tsx`

- [ ] **Step 1: Atualizar Today**

No `Today.tsx`, substituir os dois `TodayCard` placeholders ("Skincare" e "Movimento") por skincare real. Logo após o `addWater` na função, e antes do JSX, adicione:

```tsx
function todayISOLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```

(Se já tiver `todayISO` no arquivo, use esse.)

Adicione queries pra rotinas e logs:

```tsx
const morningRoutines = useLiveQuery(
  () => db.skincareRoutines.where("time").equals("morning").toArray(),
  [],
);
const eveningRoutines = useLiveQuery(
  () => db.skincareRoutines.where("time").equals("evening").toArray(),
  [],
);
const todaySkincareLogs = useLiveQuery(
  () => db.skincareLogs.where("date").equals(todayISO).toArray(),
  [todayISO],
);

const morningDone = todaySkincareLogs && morningRoutines && morningRoutines.length > 0 &&
  morningRoutines.every((r) => todaySkincareLogs.some((l) => l.routineId === r.id && l.completed));
const eveningDone = todaySkincareLogs && eveningRoutines && eveningRoutines.length > 0 &&
  eveningRoutines.every((r) => todaySkincareLogs.some((l) => l.routineId === r.id && l.completed));
```

Substituir o `<TodayCard title="Skincare" subtitle="Rotina chega na próxima atualização" />` por:

```tsx
<TodayCard
  title="Skincare manhã"
  subtitle={
    morningRoutines && morningRoutines.length > 0
      ? `${morningRoutines.length} rotina${morningRoutines.length > 1 ? "s" : ""} · ${morningDone ? "concluído ✓" : "pendente"}`
      : "sem rotina configurada"
  }
  to="/beleza/pele-cabelo/skincare"
  variant={!morningDone && morningRoutines && morningRoutines.length > 0 ? "highlight" : "default"}
/>
<TodayCard
  title="Skincare noite"
  subtitle={
    eveningRoutines && eveningRoutines.length > 0
      ? `${eveningRoutines.length} rotina${eveningRoutines.length > 1 ? "s" : ""} · ${eveningDone ? "concluído ✓" : "pendente"}`
      : "sem rotina configurada"
  }
  to="/beleza/pele-cabelo/skincare"
  variant={!eveningDone && eveningRoutines && eveningRoutines.length > 0 ? "highlight" : "default"}
/>
```

Remover o `<TodayCard title="Movimento" ... />` (vai entrar em outra parte).

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/Today.tsx
git commit -m "feat(hoje): cards de skincare manhã/noite com status"
```

---

### Task 9: Notificações de skincare no scheduler

**Files:**
- Modify: `src/lib/notification-scheduler.ts`

- [ ] **Step 1: Adicionar timers de skincare**

No `src/lib/notification-scheduler.ts`, dentro de `tick()`, após os blocos de pausa ativa e hidratação, adicione:

```typescript
// Skincare matinal/noturno (uma vez por dia)
const morningTime = await getSetting("morningReminderTime");
const eveningTime = await getSetting("eveningReminderTime");
const todayISO = now.toISOString().slice(0, 10);
const lastMorning = await getSetting("lastSkincareMorningAt");
const lastEvening = await getSetting("lastSkincareEveningAt");

const [mH, mM] = morningTime.split(":").map(Number);
const [eH, eM] = eveningTime.split(":").map(Number);
const currentMin = now.getHours() * 60 + now.getMinutes();
const morningMin = mH * 60 + mM;
const eveningMin = eH * 60 + eM;

// Se ultrapassou o horário hoje e ainda não notificou hoje
if (currentMin >= morningMin && lastMorning !== todayISO) {
  notify("Skincare matinal", "Comece o dia com a sua rotina de rosto");
  await setSetting("lastSkincareMorningAt", todayISO);
}
if (currentMin >= eveningMin && lastEvening !== todayISO) {
  notify("Skincare noturno", "Hora da rotina noturna antes de dormir");
  await setSetting("lastSkincareEveningAt", todayISO);
}
```

Add to `Settings` interface in `settings-helpers.ts` AND `useSetting.ts` DEFAULTS:

```typescript
lastSkincareMorningAt: string; // "yyyy-mm-dd" or ""
lastSkincareEveningAt: string;
```

DEFAULTS:

```typescript
lastSkincareMorningAt: "",
lastSkincareEveningAt: "",
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/lib/notification-scheduler.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts
git commit -m "feat(notif): lembretes de skincare manhã/noite"
```

---

## Fase E — Testes + finalização

### Task 10: Smoke test skincare

**Files:**
- Create: `tests/pages/skincare.smoke.test.tsx`

- [ ] **Step 1: Test**

`tests/pages/skincare.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SkincareHome } from "../../src/pages/beauty/SkincareHome";
import { db } from "../../src/lib/db";
import { seedBeauty } from "../../src/lib/beauty-seed";

beforeEach(async () => {
  await seedBeauty();
});

describe("Skincare smoke", () => {
  it("marca rotina como feita e registra no log", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/pele-cabelo/skincare"]}>
        <Routes>
          <Route path="/beleza/pele-cabelo/skincare" element={<SkincareHome />} />
        </Routes>
      </MemoryRouter>,
    );
    // Espera rotinas carregarem
    await waitFor(() => expect(screen.getByText(/Rosto · manhã/)).toBeInTheDocument());

    // Encontra todos os botões de checkbox (aria-label "Não feito")
    const buttons = await screen.findAllByLabelText("Não feito");
    fireEvent.click(buttons[0]);

    // Espera o log persistir
    await waitFor(async () => {
      const logs = await db.skincareLogs.toArray();
      const today = new Date().toISOString().slice(0, 10);
      const completed = logs.filter((l) => l.completed && l.date === today);
      expect(completed.length).toBeGreaterThanOrEqual(1);
    });
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
npm run test
git add tests/pages/skincare.smoke.test.tsx
git commit -m "test: smoke test skincare checklist"
```

---

### Task 11: README + finalização

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README update**

Em `README.md`, atualize a seção Status:

```markdown
## Status

- **Onda 1:** ✅ Concluída — fundação, libs, Corpo, Treino, Hoje, Notif, Settings
- **Onda 2 Parte 1:** ✅ Concluída — Beleza (Pele & cabelo: skincare + haircare + produtos)
- **Onda 2 Parte 2 (próximo):** Beleza → Estilo (paleta + peças + looks + íntimo)
- **Onda 2 Parte 3:** Trilha (alimentação + marcos + diário)
- **Onda 3:** dança/movimento profundo
- **Onda 4:** polimento + maquiagem
```

- [ ] **Step 2: Final test + build**

```bash
npm run test
npm run build
git add README.md
git commit -m "docs: README — Onda 2 Parte 1 concluída"
git log --oneline | head -15
git push origin main
```

## Report

Status, total tests, build, push success.

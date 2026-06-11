# Painel Evolução + Marcos de Voz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tela "Evolução" consolidando progresso (voz, movimento, skincare, treino, WHR, marcos) + categoria de marco "voz" com marcos-semente.

**Architecture:** Lib pura `evolution.ts` (dias distintos/streak, testável) + tela `EvolucaoView` agregando 6 fontes do Dexie via `useLiveQuery` + extensão da categoria de `Milestone` para "voz" (tipo + label + seed + migração v5).

**Tech Stack:** React 18 + TypeScript + Vite, Dexie, Vitest + Testing Library.

---

### Task 1: Lib pura `evolution.ts`

**Files:**
- Create: `src/lib/evolution.ts`
- Test: `tests/lib/evolution.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/evolution.test.ts
import { describe, it, expect } from "vitest";
import { distinctDays, daysInLast, currentStreak } from "../../src/lib/evolution";

describe("distinctDays", () => {
  it("conta dias únicos", () => {
    expect(distinctDays(["2026-06-10", "2026-06-10", "2026-06-11"])).toBe(2);
    expect(distinctDays([])).toBe(0);
  });
});

describe("daysInLast", () => {
  it("conta dias distintos dentro da janela", () => {
    expect(daysInLast(["2026-06-11", "2026-06-05", "2026-04-01"], "2026-06-11", 30)).toBe(2);
  });
  it("zero quando tudo fora da janela", () => {
    expect(daysInLast(["2026-01-01"], "2026-06-11", 30)).toBe(0);
  });
});

describe("currentStreak", () => {
  it("conta dias consecutivos terminando hoje", () => {
    expect(currentStreak(["2026-06-11", "2026-06-10", "2026-06-09", "2026-06-07"], "2026-06-11")).toBe(3);
  });
  it("zero se hoje não tem atividade", () => {
    expect(currentStreak(["2026-06-10"], "2026-06-11")).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- evolution`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write implementation**

```ts
// src/lib/evolution.ts
function shiftISO(iso: string, deltaDays: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function distinctDays(dates: string[]): number {
  return new Set(dates).size;
}

export function daysInLast(dates: string[], todayISO: string, n: number): number {
  const set = new Set(dates);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (set.has(shiftISO(todayISO, -i))) count++;
  }
  return count;
}

export function currentStreak(dates: string[], todayISO: string): number {
  const set = new Set(dates);
  let streak = 0;
  while (set.has(shiftISO(todayISO, -streak))) streak++;
  return streak;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- evolution`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/evolution.ts tests/lib/evolution.test.ts
git commit -m "feat(evolucao): lib evolution (dias distintos, janela, streak)"
```

---

### Task 2: Categoria de marco "voz" + marcos-semente

**Files:**
- Modify: `src/lib/db.ts` (`Milestone.category`)
- Modify: `src/components/MilestoneCard.tsx` (`CATEGORY_LABEL`)
- Modify: `src/pages/path/MilestoneNew.tsx` (option no select)
- Modify: `src/data/milestones-seed.ts` (`VOICE_MILESTONES`)
- Modify: `src/lib/path-seed.ts` (seed inicial + migração v5)
- Test: `tests/data/milestones-voice.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/data/milestones-voice.test.ts
import { describe, it, expect } from "vitest";
import { VOICE_MILESTONES } from "../../src/data/milestones-seed";

describe("VOICE_MILESTONES", () => {
  it("tem 5 marcos, todos categoria voz com título", () => {
    expect(VOICE_MILESTONES).toHaveLength(5);
    for (const m of VOICE_MILESTONES) {
      expect(m.category).toBe("voz");
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.datePlanned.length).toBe(10);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- milestones-voice`
Expected: FAIL — `VOICE_MILESTONES` não existe.

- [ ] **Step 3a: `src/lib/db.ts` — adicionar "voz" ao union**

Trocar:

```ts
  category: "medico" | "fisico" | "social" | "fertilidade";
```

por:

```ts
  category: "medico" | "fisico" | "social" | "fertilidade" | "voz";
```

- [ ] **Step 3b: `src/components/MilestoneCard.tsx` — adicionar a label (TypeScript exige)**

Trocar:

```ts
const CATEGORY_LABEL: Record<Milestone["category"], string> = {
  medico: "Médico",
  fisico: "Físico",
  social: "Social",
  fertilidade: "Fertilidade",
};
```

por:

```ts
const CATEGORY_LABEL: Record<Milestone["category"], string> = {
  medico: "Médico",
  fisico: "Físico",
  social: "Social",
  fertilidade: "Fertilidade",
  voz: "Voz",
};
```

- [ ] **Step 3c: `src/pages/path/MilestoneNew.tsx` — opção no select**

Trocar:

```tsx
              <option value="fertilidade">Fertilidade</option>
```

por:

```tsx
              <option value="fertilidade">Fertilidade</option>
              <option value="voz">Voz</option>
```

- [ ] **Step 3d: `src/data/milestones-seed.ts` — array `VOICE_MILESTONES`**

Adicionar ao FIM do arquivo (o helper `isoFromMonthsFromNow` e o import de `Milestone` já existem no topo):

```ts
export const VOICE_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Gravação base da voz (ponto de partida)",
    category: "voz",
    notes: "Grave 30-60s hoje pra ter referência e ouvir a evolução daqui meses.",
  },
  {
    datePlanned: isoFromMonthsFromNow(1),
    title: "1 mês de prática de voz quase diária",
    category: "voz",
    notes: "Consistência vale mais que intensidade: ~15 min/dia.",
  },
  {
    datePlanned: isoFromMonthsFromNow(2),
    title: "Atingir a faixa-alvo de pitch com naturalidade",
    category: "voz",
    notes: "Ressonância pra frente + pitch na faixa, sem forçar a garganta.",
  },
  {
    datePlanned: isoFromMonthsFromNow(3),
    title: "Pedir algo com voz feminina (café, atendimento)",
    category: "voz",
    notes: "Primeira interação curta em público — passo de coragem.",
  },
  {
    datePlanned: isoFromMonthsFromNow(6),
    title: "Conversa ao telefone mantendo a voz",
    category: "voz",
    notes: "Telefone tira as pistas visuais — é o teste de passing por voz.",
  },
];
```

- [ ] **Step 3e: `src/lib/path-seed.ts` — incluir no seed e migração v5**

1) No import, trocar:

```ts
import { MILESTONES, BODY_GOAL_MILESTONES, BUST_MILESTONES } from "../data/milestones-seed";
```

por:

```ts
import { MILESTONES, BODY_GOAL_MILESTONES, BUST_MILESTONES, VOICE_MILESTONES } from "../data/milestones-seed";
```

2) Bump da versão: trocar `const MILESTONE_SEED_VERSION = 4;` por `const MILESTONE_SEED_VERSION = 5;`.

3) No seed inicial, trocar:

```ts
      for (const m of [...MILESTONES, ...BODY_GOAL_MILESTONES, ...BUST_MILESTONES]) {
        await db.milestones.add(m as never);
      }
```

por:

```ts
      for (const m of [...MILESTONES, ...BODY_GOAL_MILESTONES, ...BUST_MILESTONES, ...VOICE_MILESTONES]) {
        await db.milestones.add(m as never);
      }
```

4) Na migração por etapas, ANTES da linha `await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });` (a que está dentro do bloco `if (msVersion < MILESTONE_SEED_VERSION)`), adicionar:

```ts
      if (msVersion < 5) {
        for (const m of VOICE_MILESTONES) await db.milestones.add(m as never);
      }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- milestones-voice` depois `npm test -- path-seed` e `npx tsc -b`
Expected: PASS nos dois testes (path-seed usa `toBeGreaterThanOrEqual`, segue verde) e tipos OK.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/components/MilestoneCard.tsx src/pages/path/MilestoneNew.tsx src/data/milestones-seed.ts src/lib/path-seed.ts tests/data/milestones-voice.test.ts
git commit -m "feat(evolucao): categoria de marco voz + 5 marcos-semente (seed v5)"
```

---

### Task 3: Tela `EvolucaoView` + rota + link

**Files:**
- Create: `src/pages/path/EvolucaoView.tsx`
- Modify: `src/main.tsx` (rota)
- Modify: `src/pages/path/MilestonesView.tsx` (link)
- Test: `tests/pages/evolucao.smoke.test.tsx`

- [ ] **Step 1: Write the smoke test**

```tsx
// tests/pages/evolucao.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { EvolucaoView } from "../../src/pages/path/EvolucaoView";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.voicePracticeLogs.clear();
  await db.milestones.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/trilha/evolucao"]}>
      <Routes>
        <Route path="/trilha/evolucao" element={<EvolucaoView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EvolucaoView smoke", () => {
  it("renderiza o painel de evolução", async () => {
    await db.milestones.add({ datePlanned: "2026-06-01", title: "X", category: "voz", dateCompleted: "2026-06-02" } as never);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Evolução · últimos 30 dias/)).toBeInTheDocument();
      expect(screen.getByText(/Marcos concluídos/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run it (fails — no component)**

Run: `npm test -- evolucao.smoke`
Expected: FAIL — `EvolucaoView` não existe.

- [ ] **Step 3a: Criar `src/pages/path/EvolucaoView.tsx`**

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { StreakCard } from "../../components/StreakCard";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { daysInLast, currentStreak } from "../../lib/evolution";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WHR_LABEL: Record<string, string> = {
  "ampulheta-forte": "ampulheta forte",
  "ampulheta-moderada": "ampulheta moderada",
  transicao: "transição",
  "perfil-masculino": "perfil masculino",
};

export function EvolucaoView() {
  const voiceLogs = useLiveQuery(() => db.voicePracticeLogs.toArray(), []);
  const practiceLogs = useLiveQuery(() => db.practiceLogs.toArray(), []);
  const skincareLogs = useLiveQuery(() => db.skincareLogs.toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), []);
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const milestones = useLiveQuery(() => db.milestones.toArray(), []);

  const t = todayISO();
  const voiceDates = (voiceLogs ?? []).map((l) => l.date);
  const moveDates = (practiceLogs ?? []).map((l) => l.date);
  const skinDates = (skincareLogs ?? []).filter((l) => l.completed).map((l) => l.date);
  const workoutDates = (sessions ?? []).map((s) => s.date);

  const latest = measurements?.at(-1);
  const whr = latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const milestonesDone = (milestones ?? []).filter((m) => m.dateCompleted).length;
  const milestonesTotal = milestones?.length ?? 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
      </div>
      <PathTabs />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Evolução · últimos 30 dias</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StreakCard label="Voz" count={daysInLast(voiceDates, t, 30)} total={30} />
        <StreakCard label="Movimento" count={daysInLast(moveDates, t, 30)} total={30} />
        <StreakCard label="Skincare" count={daysInLast(skinDates, t, 30)} total={30} />
        <StreakCard label="Treino" count={daysInLast(workoutDates, t, 30)} total={30} />
      </div>

      <div className="card mb-2 flex justify-between items-baseline">
        <span className="text-nude-warm text-sm">Sequência de voz</span>
        <span className="text-nude text-lg">{currentStreak(voiceDates, t)} dias</span>
      </div>

      <div className="card mb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-nude-warm text-sm">WHR atual</span>
          <span className="text-nude text-lg">
            {whr !== null ? `${whr.toFixed(2)} · ${WHR_LABEL[classifyWhr(whr)]}` : "—"}
          </span>
        </div>
        <Link to="/corpo/silhueta" className="text-muted text-xs underline">ver silhueta</Link>
      </div>

      <div className="card">
        <div className="flex justify-between items-baseline">
          <span className="text-nude-warm text-sm">Marcos concluídos</span>
          <span className="text-nude text-lg">{milestonesDone} de {milestonesTotal}</span>
        </div>
        <Link to="/trilha" className="text-muted text-xs underline">ver marcos</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3b: Registrar a rota em `src/main.tsx`**

Importar (junto dos outros imports de `pages/path`):

```ts
import { EvolucaoView } from "./pages/path/EvolucaoView";
```

E adicionar a rota junto das outras rotas `trilha/*` (ex.: logo após a rota
`{ path: "trilha", element: <MilestonesView /> }`):

```ts
        { path: "trilha/evolucao", element: <EvolucaoView /> },
```

- [ ] **Step 3c: Link no topo da Trilha (`src/pages/path/MilestonesView.tsx`)**

Localizar `<PathTabs />` e inserir IMEDIATAMENTE ABAIXO:

```tsx
      <Link to="/trilha/evolucao" className="card block mb-4 hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Evolução</h3>
        <p className="text-muted text-sm mt-1">Voz, movimento, skincare, treino, WHR e marcos num lugar só</p>
      </Link>
```

(`Link` já é importado em MilestonesView.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- evolucao.smoke`
Expected: PASS.

- [ ] **Step 5: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/pages/path/EvolucaoView.tsx src/main.tsx src/pages/path/MilestonesView.tsx tests/pages/evolucao.smoke.test.tsx
git commit -m "feat(evolucao): tela Evolucao consolidada + link na Trilha"
```

---

### Task 4: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos verdes (novos: `evolution`, `milestones-voice`, `evolucao.smoke`; antigos intactos, incl. `path-seed`).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

---

## Notas

- **Ambiente Windows:** `npm` fora do PATH; use
  `$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" ...`.
- **Re-seed dos marcos de voz:** o bump `MILESTONE_SEED_VERSION` 4 → 5 + a etapa `if (msVersion < 5)`
  garantem que a usuária já existente receba os 5 marcos sem duplicar os antigos.
- **Sem mudança de schema Dexie:** `milestones` já é tabela; só o union de categoria cresce.

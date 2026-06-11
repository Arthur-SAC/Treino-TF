# Inteligência Adaptativa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o app reagir aos dados: recomendar troca de ciclo por resultado (sugere+confirma), progressão de carga consciente da estética, e um card "Foco de hoje" no dashboard.

**Architecture:** Três libs puras (`measurement-trend`, `cycle-advisor`, `today-priority`) + um hook `useCycleAdvice` que liga ao Dexie, consumidas por `Today.tsx`, `Cycles.tsx` e `SessionRecorder.tsx`. Progressão ganha consciência de categoria. Sem mudança de schema; reusa os sinais do #1 (`silhouette.ts`, `waist-hip-ratio.ts`).

**Tech Stack:** React 18 + TypeScript + Vite, Dexie (`dexie-react-hooks`), React Router 7, Tailwind, Vitest + Testing Library + fake-indexeddb.

---

### Task 1: Lib `measurement-trend.ts`

**Files:**
- Create: `src/lib/measurement-trend.ts`
- Test: `tests/lib/measurement-trend.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/measurement-trend.test.ts
import { describe, it, expect } from "vitest";
import { waistTrend, hipTrend } from "../../src/lib/measurement-trend";
import type { Measurement } from "../../src/lib/db";

const m = (date: string, waistCm?: number, hipCm?: number): Measurement => ({ date, waistCm, hipCm });

describe("waistTrend", () => {
  it("detecta queda além do limiar", () => {
    const t = waistTrend([m("2026-01-01", 80), m("2026-02-01", 78), m("2026-03-01", 76)]);
    expect(t.dir).toBe("down");
    expect(t.deltaCm).toBe(-4);
    expect(t.points).toBe(3);
  });
  it("detecta estável dentro do limiar (<=0,5cm)", () => {
    const t = waistTrend([m("2026-01-01", 76.3), m("2026-02-01", 76.0)]);
    expect(t.dir).toBe("stable");
  });
  it("detecta subida", () => {
    expect(waistTrend([m("2026-01-01", 76), m("2026-02-01", 78)]).dir).toBe("up");
  });
  it("usa só a janela das últimas n medidas com o campo", () => {
    const t = waistTrend([m("2026-01-01", 90), m("2026-02-01", 80), m("2026-03-01", 79), m("2026-04-01", 78)], 3);
    expect(t.deltaCm).toBe(-2); // 80 -> 78, ignora o 90
  });
  it("stable quando há menos de 2 pontos", () => {
    expect(waistTrend([m("2026-01-01", 80)]).dir).toBe("stable");
    expect(waistTrend([m("2026-01-01")]).points).toBe(0);
  });
});

describe("hipTrend", () => {
  it("detecta crescimento de quadril", () => {
    expect(hipTrend([m("2026-01-01", undefined, 100), m("2026-02-01", undefined, 102)]).dir).toBe("up");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- measurement-trend`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/measurement-trend.ts
import type { Measurement } from "./db";

export type TrendDir = "down" | "stable" | "up";

export interface Trend {
  dir: TrendDir;
  deltaCm: number; // newest - oldest na janela
  points: number;
}

const STABLE_THRESHOLD_CM = 0.5;

function fieldTrend(measurements: Measurement[], field: "waistCm" | "hipCm", n: number): Trend {
  const withField = measurements.filter((mm) => typeof mm[field] === "number");
  const window = withField.slice(-n);
  if (window.length < 2) return { dir: "stable", deltaCm: 0, points: window.length };
  const oldest = window[0][field] as number;
  const newest = window[window.length - 1][field] as number;
  const deltaCm = Math.round((newest - oldest) * 10) / 10;
  let dir: TrendDir = "stable";
  if (deltaCm <= -STABLE_THRESHOLD_CM) dir = "down";
  else if (deltaCm >= STABLE_THRESHOLD_CM) dir = "up";
  return { dir, deltaCm, points: window.length };
}

export function waistTrend(measurements: Measurement[], n = 3): Trend {
  return fieldTrend(measurements, "waistCm", n);
}

export function hipTrend(measurements: Measurement[], n = 3): Trend {
  return fieldTrend(measurements, "hipCm", n);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- measurement-trend`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/measurement-trend.ts tests/lib/measurement-trend.test.ts
git commit -m "feat(adaptativa): lib measurement-trend (cintura/quadril caindo/estável)"
```

---

### Task 2: Lib `cycle-advisor.ts`

**Files:**
- Create: `src/lib/cycle-advisor.ts`
- Test: `tests/lib/cycle-advisor.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/cycle-advisor.test.ts
import { describe, it, expect } from "vitest";
import { recommendCycleChange } from "../../src/lib/cycle-advisor";
import type { Trend } from "../../src/lib/measurement-trend";

const stable: Trend = { dir: "stable", deltaCm: 0, points: 3 };
const down: Trend = { dir: "down", deltaCm: -2, points: 3 };
const up: Trend = { dir: "up", deltaCm: 2, points: 3 };

const base = {
  activeCycle: "variacao" as const,
  sessionsInCycle: 60,
  threshold: 60,
  whr: 0.85,
  targetWhr: 0.72,
  waistTrend: down,
  hipTrend: up,
  waistGuardTriggered: false,
};

describe("recommendCycleChange", () => {
  it("manutencao não tem próximo", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "manutencao" })).toBeNull();
  });

  it("não recomenda antes do piso de sessões", () => {
    expect(recommendCycleChange({ ...base, sessionsInCycle: 10 })).toBeNull();
  });

  it("adaptacao -> variacao pelo piso de sessões", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "adaptacao" });
    expect(r?.recommend).toBe(true);
    expect(r?.toCycle).toBe("variacao");
  });

  it("variacao -> hipertrofia quando WHR atinge o alvo", () => {
    const r = recommendCycleChange({ ...base, whr: 0.72, waistTrend: down });
    expect(r?.toCycle).toBe("hipertrofia");
    expect(r?.reason).toMatch(/alvo/i);
  });

  it("variacao -> hipertrofia quando a cintura estabiliza (platô)", () => {
    const r = recommendCycleChange({ ...base, whr: 0.85, waistTrend: stable });
    expect(r?.toCycle).toBe("hipertrofia");
    expect(r?.reason).toMatch(/estabiliz/i);
  });

  it("variacao NÃO avança se cintura ainda cai e WHR longe do alvo", () => {
    expect(recommendCycleChange({ ...base, whr: 0.85, waistTrend: down })).toBeNull();
  });

  it("hipertrofia -> refinamento quando a trava de cintura dispara (override do piso)", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "hipertrofia", sessionsInCycle: 5, waistGuardTriggered: true });
    expect(r?.toCycle).toBe("refinamento");
    expect(r?.reason).toMatch(/cintura/i);
  });

  it("hipertrofia -> refinamento quando o quadril estabiliza (com piso)", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "hipertrofia", hipTrend: stable });
    expect(r?.toCycle).toBe("refinamento");
  });

  it("hipertrofia NÃO avança se quadril ainda cresce e sem trava", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "hipertrofia", hipTrend: up })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- cycle-advisor`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/cycle-advisor.ts
import type { CycleId } from "../data/cycles-seed";
import type { Trend } from "./measurement-trend";

const NEXT: Record<CycleId, CycleId | null> = {
  adaptacao: "variacao",
  variacao: "hipertrofia",
  hipertrofia: "refinamento",
  refinamento: "manutencao",
  manutencao: null,
};

export interface CycleAdviceInput {
  activeCycle: CycleId;
  sessionsInCycle: number;
  threshold: number;
  whr: number | null;
  targetWhr: number;
  waistTrend: Trend;
  hipTrend: Trend;
  waistGuardTriggered: boolean;
}

export interface CycleAdvice {
  recommend: boolean;
  toCycle: CycleId;
  reason: string;
}

export function recommendCycleChange(i: CycleAdviceInput): CycleAdvice | null {
  const to = NEXT[i.activeCycle];
  if (!to) return null;
  const floorReached = i.sessionsInCycle >= i.threshold;

  if (i.activeCycle === "variacao") {
    const atTarget = i.whr !== null && i.whr <= i.targetWhr;
    const plateau = i.waistTrend.dir === "stable" && i.waistTrend.points >= 2;
    if (floorReached && (atTarget || plateau)) {
      const why = atTarget
        ? `sua cintura atingiu o alvo de WHR (${i.targetWhr.toFixed(2)})`
        : "sua cintura estabilizou — o déficit deu o que tinha pra dar";
      return { recommend: true, toCycle: to, reason: `Hora de crescer o glúteo: ${why}. Bora pra hipertrofia (superávit).` };
    }
    return null;
  }

  if (i.activeCycle === "hipertrofia") {
    if (i.waistGuardTriggered) {
      return { recommend: true, toCycle: to, reason: "A cintura subiu no superávit — hora de refinar e segurar a gordura. Vamos pro refinamento." };
    }
    if (floorReached && i.hipTrend.dir === "stable" && i.hipTrend.points >= 2) {
      return { recommend: true, toCycle: to, reason: "O quadril parou de crescer — hora de refinar a forma. Vamos pro refinamento." };
    }
    return null;
  }

  // adaptacao -> variacao e refinamento -> manutencao: piso de sessões
  if (floorReached) {
    return { recommend: true, toCycle: to, reason: `Você completou ${i.sessionsInCycle} sessões do ciclo. Pronta pro próximo.` };
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- cycle-advisor`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cycle-advisor.ts tests/lib/cycle-advisor.test.ts
git commit -m "feat(adaptativa): lib cycle-advisor (recomendação híbrida de ciclo)"
```

---

### Task 3: Lib `today-priority.ts`

**Files:**
- Create: `src/lib/today-priority.ts`
- Test: `tests/lib/today-priority.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/today-priority.test.ts
import { describe, it, expect } from "vitest";
import { computeFocus } from "../../src/lib/today-priority";
import type { FocusState } from "../../src/lib/today-priority";

const empty: FocusState = {
  cycleAdvice: null,
  waistGuardTriggered: false,
  workoutToday: null,
  daysSinceMeasurement: null,
  daysSincePhoto: null,
};

describe("computeFocus", () => {
  it("null quando nada pendente", () => {
    expect(computeFocus(empty)).toBeNull();
  });

  it("trava de cintura tem prioridade máxima", () => {
    const f = computeFocus({
      ...empty,
      waistGuardTriggered: true,
      cycleAdvice: { recommend: true, reason: "x" },
      workoutToday: { done: false, name: "Glúteo A", to: "/x" },
    });
    expect(f?.to).toBe("/corpo/silhueta");
  });

  it("ciclo vem antes do treino", () => {
    const f = computeFocus({
      ...empty,
      cycleAdvice: { recommend: true, reason: "porque sim" },
      workoutToday: { done: false, name: "Glúteo A", to: "/treino/sessao/x" },
    });
    expect(f?.to).toBe("/treino/ciclos");
    expect(f?.subtitle).toBe("porque sim");
  });

  it("treino de hoje não feito", () => {
    const f = computeFocus({ ...empty, workoutToday: { done: false, name: "Glúteo A", to: "/treino/sessao/x" } });
    expect(f?.to).toBe("/treino/sessao/x");
  });

  it("treino feito não vira foco; cai pra medida atrasada", () => {
    const f = computeFocus({
      ...empty,
      workoutToday: { done: true, name: "Glúteo A", to: "/treino/sessao/x" },
      daysSinceMeasurement: 40,
    });
    expect(f?.to).toBe("/corpo/medidas");
  });

  it("foto atrasada é o último critério", () => {
    expect(computeFocus({ ...empty, daysSincePhoto: 20 })?.to).toBe("/corpo/fotos");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- today-priority`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/today-priority.ts
export interface FocusState {
  cycleAdvice: { recommend: boolean; reason: string } | null;
  waistGuardTriggered: boolean;
  workoutToday: { done: boolean; name: string; to: string } | null;
  daysSinceMeasurement: number | null;
  daysSincePhoto: number | null;
}

export interface Focus {
  title: string;
  subtitle: string;
  to: string;
}

const MEASUREMENT_OVERDUE_DAYS = 28;
const PHOTO_OVERDUE_DAYS = 14;

export function computeFocus(s: FocusState): Focus | null {
  if (s.waistGuardTriggered) {
    return {
      title: "Segure a cintura",
      subtitle: "Sua cintura subiu no superávit — veja a estratégia de silhueta",
      to: "/corpo/silhueta",
    };
  }
  if (s.cycleAdvice?.recommend) {
    return { title: "Hora de avançar o ciclo", subtitle: s.cycleAdvice.reason, to: "/treino/ciclos" };
  }
  if (s.workoutToday && !s.workoutToday.done) {
    return { title: `Foco: ${s.workoutToday.name}`, subtitle: "Seu treino prioritário de hoje", to: s.workoutToday.to };
  }
  if (s.daysSinceMeasurement !== null && s.daysSinceMeasurement > MEASUREMENT_OVERDUE_DAYS) {
    return {
      title: "Hora de medir",
      subtitle: `Última medida há ${s.daysSinceMeasurement} dias — o app precisa de dados pra te orientar`,
      to: "/corpo/medidas",
    };
  }
  if (s.daysSincePhoto !== null && s.daysSincePhoto > PHOTO_OVERDUE_DAYS) {
    return { title: "Hora de tirar fotos", subtitle: `Última foto há ${s.daysSincePhoto} dias`, to: "/corpo/fotos" };
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- today-priority`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-priority.ts tests/lib/today-priority.test.ts
git commit -m "feat(adaptativa): lib today-priority (foco do dia por prioridade)"
```

---

### Task 4: Progressão consciente da categoria

**Files:**
- Modify: `src/lib/progression.ts`
- Test: `tests/lib/progression.test.ts` (acrescentar)

- [ ] **Step 1: Write the failing test (append)**

```ts
// adicionar ao fim de tests/lib/progression.test.ts
import { isHoldLight } from "../../src/lib/progression";

describe("progressão consciente da categoria", () => {
  it("isHoldLight marca peitoral/postura/costas", () => {
    expect(isHoldLight("peitoral")).toBe(true);
    expect(isHoldLight("postura")).toBe(true);
    expect(isHoldLight("costas")).toBe(true);
    expect(isHoldLight("gluteo")).toBe(false);
  });
  it("hold-light não sobe carga mesmo no easy", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "peitoral" })).toBe(10);
  });
  it("hold-light recua se não completou as reps", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false, category: "postura" })).toBe(9);
  });
  it("gluteo segue a lógica normal", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true, category: "gluteo" })).toBe(12);
  });
  it("sem categoria segue a lógica normal (retrocompat)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true })).toBe(12);
  });
});
```

Nota: `suggestNextLoad` já está importado no topo do arquivo; some `isHoldLight` ao import existente.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progression`
Expected: FAIL — `isHoldLight` não existe / `category` não aceito.

- [ ] **Step 3: Modify `src/lib/progression.ts`**

Adicionar `category?` ao `ProgressionInput`:

```ts
export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  completedAllReps: boolean;
  category?: string;
}
```

Adicionar o helper e o curto-circuito hold-light. O início de `suggestNextLoad` passa a ser:

```ts
const HOLD_LIGHT_CATEGORIES = new Set(["peitoral", "postura", "costas"]);

export function isHoldLight(category: string): boolean {
  return HOLD_LIGHT_CATEGORIES.has(category);
}

export function suggestNextLoad({ lastLoad, feedback, completedAllReps, category }: ProgressionInput): number {
  if (category && isHoldLight(category)) {
    // manter leve: nunca sobe; só recua se não completou as reps
    return completedAllReps ? lastLoad : Math.max(0, lastLoad - 1);
  }
  if (!completedAllReps) {
    return Math.max(0, lastLoad - 1);
  }
  if (feedback === "easy") {
    if (lastLoad < 5) return lastLoad + 0.5;
    if (lastLoad < 20) return lastLoad + 2;
    return lastLoad + 2.5;
  }
  if (feedback === "medium") {
    return lastLoad + 1;
  }
  return lastLoad; // hard
}
```

(Mantenha `suggestNextHoldTime` e `SessionFeedback`/`MAX_HOLD_SEC` como já estão no arquivo.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- progression`
Expected: PASS (novos + antigos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/progression.ts tests/lib/progression.test.ts
git commit -m "feat(adaptativa): progressão consciente da categoria (hold-light)"
```

---

### Task 5: Hook `useCycleAdvice`

**Files:**
- Create: `src/hooks/useCycleAdvice.ts`

(Sem teste unitário próprio — é cola de hooks/Dexie; é exercitado pelos smoke tests de Today/Cycles. O cálculo puro já está coberto em Task 2.)

- [ ] **Step 1: Criar o hook**

```ts
// src/hooks/useCycleAdvice.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSetting } from "./useSetting";
import { CYCLES, CYCLE_TO_GOAL } from "../data/cycles-seed";
import { calculateWhr } from "../lib/waist-hip-ratio";
import { waistGuard } from "../lib/silhouette";
import { waistTrend, hipTrend } from "../lib/measurement-trend";
import { recommendCycleChange, type CycleAdvice } from "../lib/cycle-advisor";

export function useCycleAdvice(): CycleAdvice | null {
  const activeCycle = useSetting("activeCycle");
  const cycleStart = useSetting("cycleStartSessionCount");
  const targetWhr = useSetting("targetWhr");
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);

  if (totalSessions === undefined || measurements === undefined) return null;

  const sessionsInCycle = totalSessions - cycleStart;
  const threshold = CYCLES.find((c) => c.id === activeCycle)?.threshold ?? Number.POSITIVE_INFINITY;
  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
  const whr = latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const goal = CYCLE_TO_GOAL[activeCycle];
  const guard =
    latest?.waistCm && prev?.waistCm
      ? waistGuard({ cycleGoal: goal, waistStartCm: prev.waistCm, waistNowCm: latest.waistCm })
      : { triggered: false, deltaCm: 0 };

  return recommendCycleChange({
    activeCycle,
    sessionsInCycle,
    threshold,
    whr,
    targetWhr,
    waistTrend: waistTrend(measurements),
    hipTrend: hipTrend(measurements),
    waistGuardTriggered: guard.triggered,
  });
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCycleAdvice.ts
git commit -m "feat(adaptativa): hook useCycleAdvice (cola Dexie -> advisor)"
```

---

### Task 6: Fiação em `Cycles.tsx`

**Files:**
- Modify: `src/pages/workout/Cycles.tsx`

- [ ] **Step 1: Importar o hook**

Após a linha `import { CYCLES, type CycleId } from "../../data/cycles-seed";`, adicionar:

```ts
import { useCycleAdvice } from "../../hooks/useCycleAdvice";
```

- [ ] **Step 2: Ler a recomendação no componente**

Logo após `const sessionsInCycle = (totalSessions ?? 0) - cycleStart;`, adicionar:

```ts
  const advice = useCycleAdvice();
```

- [ ] **Step 3: Substituir o texto fixo do card "Como funciona" e adicionar o card de recomendação**

Localizar o bloco:

```tsx
      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Como funciona</h2>
        <p className="text-sm text-nude-warm">
          Cada ciclo tem foco diferente. Conforme você acumula sessões, o app sugere o próximo automaticamente.
          Você também pode trocar manualmente a qualquer momento.
        </p>
      </div>
```

e substituí-lo por:

```tsx
      {advice?.recommend && (
        <div className="card mb-4 !bg-wine/30 !border-nude">
          <h2 className="text-nude font-medium mb-1">Recomendação</h2>
          <p className="text-sm text-nude-warm mb-3">{advice.reason}</p>
          <button
            type="button"
            onClick={() => void activate(advice.toCycle)}
            className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
          >
            Avançar pro ciclo "{CYCLES.find((c) => c.id === advice.toCycle)?.name}" agora
          </button>
        </div>
      )}

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Como funciona</h2>
        <p className="text-sm text-nude-warm">
          Cada ciclo tem um foco. O app recomenda avançar quando seus dados mostram que a fase
          cumpriu o papel (cintura no alvo, quadril crescido) — não só por número de sessões.
          Você sempre confirma, e pode trocar manualmente a qualquer momento.
        </p>
      </div>
```

- [ ] **Step 4: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros (`activate` já aceita `CycleId`, e `advice.toCycle` é `CycleId`).

- [ ] **Step 5: Commit**

```bash
git add src/pages/workout/Cycles.tsx
git commit -m "feat(adaptativa): Cycles mostra recomendação do advisor"
```

---

### Task 7: Fiação em `Today.tsx` (card "Foco de hoje")

**Files:**
- Modify: `src/pages/Today.tsx`

- [ ] **Step 1: Ajustar imports**

Substituir a linha:

```ts
import { CYCLES } from "../data/cycles-seed";
```

por:

```ts
import { CYCLE_TO_GOAL } from "../data/cycles-seed";
import { useCycleAdvice } from "../hooks/useCycleAdvice";
import { computeFocus } from "../lib/today-priority";
import { waistGuard } from "../lib/silhouette";
```

- [ ] **Step 2: Remover as variáveis de ciclo por contagem de sessões**

Localizar e REMOVER este bloco:

```ts
  const cycleStart = useSetting("cycleStartSessionCount");
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const sessionsInCycle = (totalSessions ?? 0) - cycleStart;
  const currentCycleInfo = CYCLES.find((c) => c.id === activeCycle);
  const shouldSuggestChange = !!currentCycleInfo && sessionsInCycle >= currentCycleInfo.threshold;
```

- [ ] **Step 3: Computar o foco (após o cálculo de `daysSincePhoto`)**

Localizar:

```ts
  const daysSincePhoto = photosRecent?.[0]
    ? Math.floor((today.getTime() - new Date(photosRecent[0].date).getTime()) / 86400000)
    : null;
```

e adicionar LOGO ABAIXO:

```ts
  const advice = useCycleAdvice();
  const measurementsAsc = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const latestM = measurementsAsc?.at(-1);
  const prevM = measurementsAsc?.at(-2);
  const guardTriggered = !!(latestM?.waistCm && prevM?.waistCm) &&
    waistGuard({
      cycleGoal: CYCLE_TO_GOAL[activeCycle],
      waistStartCm: prevM!.waistCm!,
      waistNowCm: latestM!.waistCm!,
    }).triggered;
  const focus = computeFocus({
    cycleAdvice: advice ? { recommend: advice.recommend, reason: advice.reason } : null,
    waistGuardTriggered: guardTriggered,
    workoutToday: todayTemplate
      ? { done: (sessionsToday ?? 0) > 0, name: todayTemplate.name, to: `/treino/sessao/${todayTemplate.id}` }
      : null,
    daysSinceMeasurement,
    daysSincePhoto,
  });
```

- [ ] **Step 4: Renderizar o card "Foco de hoje" no topo e remover o card antigo de ciclo**

Localizar o cabeçalho:

```tsx
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">Bom dia</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>
```

e adicionar LOGO ABAIXO dele:

```tsx
      {focus && (
        <TodayCard
          title={`✦ ${focus.title}`}
          subtitle={focus.subtitle}
          to={focus.to}
          variant="highlight"
        />
      )}
```

Em seguida, localizar e REMOVER o bloco antigo de sugestão por sessões:

```tsx
      {shouldSuggestChange && (
        <TodayCard
          title="Hora de avançar o treino"
          subtitle={`Você completou ${sessionsInCycle} sessões do ciclo "${currentCycleInfo?.name}". Veja o próximo ciclo.`}
          to="/treino/ciclos"
          variant="highlight"
        />
      )}
```

- [ ] **Step 5: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros. Confirmar que não sobraram referências a `CYCLES`, `shouldSuggestChange`, `currentCycleInfo`, `sessionsInCycle`, `totalSessions`, `cycleStart`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Today.tsx
git commit -m "feat(adaptativa): card Foco de hoje no dashboard"
```

---

### Task 8: Fiação em `SessionRecorder.tsx` (progressão por categoria)

**Files:**
- Modify: `src/components/SessionRecorder.tsx`

- [ ] **Step 1: Importar `isHoldLight`**

Substituir:

```ts
import { suggestNextLoad } from "../lib/progression";
```

por:

```ts
import { suggestNextLoad, isHoldLight } from "../lib/progression";
```

- [ ] **Step 2: Passar a categoria ao calcular a sugestão**

Localizar:

```ts
            setSuggested(suggestNextLoad({ lastLoad: prevWeight, feedback: prevFeedback, completedAllReps }));
```

e trocar por:

```ts
            setSuggested(suggestNextLoad({ lastLoad: prevWeight, feedback: prevFeedback, completedAllReps, category: exercise.category }));
```

- [ ] **Step 3: Mostrar a nota "manter leve"**

Localizar o início do bloco da sugestão:

```tsx
      {suggested !== null ? (
        <button
          type="button"
          onClick={applySuggestion}
          className="text-xs text-nude underline mb-3 block"
        >
          Sugestão: {suggested} kg (aplicar em todas)
        </button>
```

e adicionar, IMEDIATAMENTE ANTES do `{suggested !== null ? (`:

```tsx
      {isHoldLight(exercise.category) && (
        <p className="text-xs text-muted mb-2">Manter leve — não subir a carga (silhueta).</p>
      )}
```

- [ ] **Step 4: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/SessionRecorder.tsx
git commit -m "feat(adaptativa): SessionRecorder respeita hold-light por categoria"
```

---

### Task 9: Smoke test do "Foco de hoje" + verificação final

**Files:**
- Test: `tests/pages/today-focus.smoke.test.tsx`

- [ ] **Step 1: Write the smoke test**

```tsx
// tests/pages/today-focus.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Today } from "../../src/pages/Today";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.measurements.clear();
  await db.photos.clear();
  await db.workoutSessions.clear();
  await db.settings.clear();
});

describe("Today focus smoke", () => {
  it("mostra o card de foco quando a medida está atrasada", async () => {
    const old = new Date();
    old.setDate(old.getDate() - 40);
    await db.measurements.add({ date: old.toISOString().slice(0, 10), waistCm: 80, hipCm: 110 });
    render(
      <MemoryRouter>
        <Today />
      </MemoryRouter>,
    );
    await waitFor(() => {
      // ✦ prefixa só o card de foco (o nudge antigo de baixo também diz "Hora de medir")
      expect(screen.getByText(/✦ Hora de medir/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run it**

Run: `npm test -- today-focus`
Expected: PASS (o card de foco aparece porque a única pendência é a medida atrasada; sem treino seedado, `workoutToday` é null).

- [ ] **Step 3: Suíte completa + build**

Run: `npm test`
Expected: TODOS verdes (incluindo `today-treino.smoke` antigo e os novos).

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

- [ ] **Step 4: Commit**

```bash
git add tests/pages/today-focus.smoke.test.tsx
git commit -m "test(adaptativa): smoke do card Foco de hoje"
```

---

## Notas de fechamento

- **Decisão de design:** o card "Foco de hoje" substituiu a ideia de reordenar a lista inteira
  (preserva a memória espacial da tela). Reavaliar só se a usuária pedir o reorder agressivo.
- **Sem migração de schema.** Reusa `silhouette.ts`/`waist-hip-ratio.ts` do #1 e os settings
  (`targetWhr`, `activeCycle`, `cycleStartSessionCount`).
- **Retrocompatibilidade:** `category?` é opcional em `ProgressionInput`; os testes antigos de
  `suggestNextLoad` continuam válidos.
- **Cuidado na Task 7:** garantir que nenhuma referência a `CYCLES`/`shouldSuggestChange`/
  `sessionsInCycle` sobre em `Today.tsx` após a remoção (o `tsc -b` pega isso).

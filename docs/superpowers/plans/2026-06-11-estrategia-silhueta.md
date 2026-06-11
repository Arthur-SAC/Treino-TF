# Estratégia de Silhueta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar à silhueta ampulheta (glúteo grande + cintura fina, sem TRH) métricas, metas e ferramentas de cintura — fechando parte do loop entre medida e estratégia, numa tela `/corpo/silhueta`.

**Architecture:** Duas libs puras novas (`body-composition.ts` Navy %BF; `silhouette.ts` razões/gaps/alavanca/trava), uma extensão em `progression.ts` (progressão por tempo), três chaves novas em `settings`, um exercício de biblioteca `vacuum-abdominal` inserido nos templates, e uma página React que sintetiza tudo. Nada de migração destrutiva; %BF é calculado na hora.

**Tech Stack:** React 18 + TypeScript + Vite, Dexie/IndexedDB (`dexie-react-hooks`), React Router 7, Tailwind (paleta amazona), Vitest + Testing Library + fake-indexeddb.

---

### Task 1: Lib `body-composition.ts` — %BF método Navy

**Files:**
- Create: `src/lib/body-composition.ts`
- Test: `tests/lib/body-composition.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/body-composition.test.ts
import { describe, it, expect } from "vitest";
import { estimateBodyFatNavy, classifyBodyFat } from "../../src/lib/body-composition";

describe("estimateBodyFatNavy", () => {
  it("estima %BF feminino (Hodgdon-Beckett métrico)", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 165, neckCm: 33, waistCm: 70, hipCm: 100 }),
    ).toBe(26.9);
  });

  it("retorna null se faltar alguma medida", () => {
    expect(estimateBodyFatNavy({ heightCm: 165, waistCm: 70, hipCm: 100 })).toBeNull();
    expect(estimateBodyFatNavy({ heightCm: 0, neckCm: 33, waistCm: 70, hipCm: 100 })).toBeNull();
  });

  it("retorna null se waist+hip-neck <= 0", () => {
    expect(
      estimateBodyFatNavy({ heightCm: 165, neckCm: 200, waistCm: 70, hipCm: 100 }),
    ).toBeNull();
  });
});

describe("classifyBodyFat", () => {
  it.each<[number, string]>([
    [12, "essencial"],
    [18, "atleta"],
    [23, "fitness"],
    [28, "media"],
    [35, "alta"],
  ])("classifica %f como %s", (pct, band) => {
    expect(classifyBodyFat(pct)).toBe(band);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- body-composition`
Expected: FAIL — `estimateBodyFatNavy is not a function` (módulo não existe).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/body-composition.ts
export interface NavyInput {
  heightCm?: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
}

/**
 * %BF feminino — fórmula US Navy (Hodgdon-Beckett), unidades em cm.
 * %BF = 495 / (1.29579 - 0.35004·log10(waist+hip-neck) + 0.22100·log10(height)) - 450
 */
export function estimateBodyFatNavy({ heightCm, neckCm, waistCm, hipCm }: NavyInput): number | null {
  if (!heightCm || !neckCm || !waistCm || !hipCm) return null;
  if (heightCm <= 0) return null;
  const sum = waistCm + hipCm - neckCm;
  if (sum <= 0) return null;
  const pct = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.221 * Math.log10(heightCm)) - 450;
  if (!Number.isFinite(pct)) return null;
  return Math.round(pct * 10) / 10;
}

export type BodyFatBand = "essencial" | "atleta" | "fitness" | "media" | "alta";

/** Faixas femininas (referência ACE). Texto de apoio, não meta dura. */
export function classifyBodyFat(pct: number): BodyFatBand {
  if (pct < 14) return "essencial";
  if (pct < 21) return "atleta";
  if (pct < 25) return "fitness";
  if (pct < 32) return "media";
  return "alta";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- body-composition`
Expected: PASS (todos os casos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/body-composition.ts tests/lib/body-composition.test.ts
git commit -m "feat(silhueta): lib body-composition (%BF Navy feminino)"
```

---

### Task 2: Lib `silhouette.ts` — razões, gaps, alavanca, trava

**Files:**
- Create: `src/lib/silhouette.ts`
- Test: `tests/lib/silhouette.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/silhouette.test.ts
import { describe, it, expect } from "vitest";
import {
  shoulderHipRatio,
  whrGap,
  shoulderHipGap,
  leverGuidance,
  waistGuard,
} from "../../src/lib/silhouette";

describe("shoulderHipRatio", () => {
  it("calcula ombro/quadril", () => {
    expect(shoulderHipRatio(105, 110)).toBeCloseTo(0.9545, 3);
  });
  it("null se quadril inválido", () => {
    expect(shoulderHipRatio(105, 0)).toBeNull();
  });
});

describe("whrGap", () => {
  it("devolve as duas rotas (cintura ou quadril) quando acima do alvo", () => {
    expect(whrGap(0.8, 0.72, 80, 100)).toEqual({ waistDeltaCm: 8, hipDeltaCm: 11.1 });
  });
  it("zera quando já no alvo ou abaixo", () => {
    expect(whrGap(0.7, 0.72, 70, 100)).toEqual({ waistDeltaCm: 0, hipDeltaCm: 0 });
  });
});

describe("shoulderHipGap", () => {
  it("calcula quanto crescer de quadril pra baixar a razão", () => {
    expect(shoulderHipGap(1.05, 1.0, 105, 100)).toEqual({ hipDeltaCm: 5 });
  });
  it("zera quando já no alvo", () => {
    expect(shoulderHipGap(0.95, 1.0, 95, 100)).toEqual({ hipDeltaCm: 0 });
  });
});

describe("leverGuidance", () => {
  it("déficit foca cintura", () => {
    expect(leverGuidance("deficit").focus).toBe("cintura");
  });
  it("superávit foca quadril", () => {
    expect(leverGuidance("superavit").focus).toBe("quadril");
  });
  it("manutenção mantém", () => {
    expect(leverGuidance("manutencao").focus).toBe("manter");
  });
});

describe("waistGuard", () => {
  it("dispara no superávit quando cintura subiu >= 1,5cm", () => {
    expect(waistGuard({ cycleGoal: "superavit", waistStartCm: 75, waistNowCm: 77 }))
      .toEqual({ triggered: true, deltaCm: 2 });
  });
  it("não dispara no superávit com subida pequena", () => {
    expect(waistGuard({ cycleGoal: "superavit", waistStartCm: 75, waistNowCm: 75.5 }))
      .toEqual({ triggered: false, deltaCm: 0.5 });
  });
  it("nunca dispara fora do superávit", () => {
    expect(waistGuard({ cycleGoal: "deficit", waistStartCm: 75, waistNowCm: 80 }))
      .toEqual({ triggered: false, deltaCm: 5 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- silhouette`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/silhouette.ts
export type CycleGoal = "deficit" | "manutencao" | "superavit";

const round1 = (n: number) => Math.round(n * 10) / 10;

export function shoulderHipRatio(shouldersCm: number, hipCm: number): number | null {
  if (!shouldersCm || !hipCm || hipCm <= 0) return null;
  return shouldersCm / hipCm;
}

export interface WhrGap {
  waistDeltaCm: number; // cm a tirar da cintura (mantendo quadril)
  hipDeltaCm: number; // cm a somar ao quadril (mantendo cintura)
}

export function whrGap(current: number, target: number, waistCm: number, hipCm: number): WhrGap {
  if (current <= target) return { waistDeltaCm: 0, hipDeltaCm: 0 };
  const waistDeltaCm = Math.max(0, waistCm - target * hipCm);
  const hipDeltaCm = Math.max(0, waistCm / target - hipCm);
  return { waistDeltaCm: round1(waistDeltaCm), hipDeltaCm: round1(hipDeltaCm) };
}

export interface ShoulderHipGap {
  hipDeltaCm: number; // cm a somar ao quadril pra baixar a razão até o alvo
}

export function shoulderHipGap(
  currentRatio: number,
  target: number,
  shouldersCm: number,
  hipCm: number,
): ShoulderHipGap {
  if (currentRatio <= target) return { hipDeltaCm: 0 };
  const hipDeltaCm = Math.max(0, shouldersCm / target - hipCm);
  return { hipDeltaCm: round1(hipDeltaCm) };
}

export interface LeverGuidance {
  focus: "cintura" | "quadril" | "manter";
  why: string;
}

export function leverGuidance(cycleGoal: CycleGoal): LeverGuidance {
  if (cycleGoal === "deficit")
    return {
      focus: "cintura",
      why: "Ciclo em déficit: a alavanca é baixar a cintura (gordura abdominal) com dieta + transverso. Mantenha o volume de glúteo, mas o ganho de silhueta agora vem de afinar.",
    };
  if (cycleGoal === "superavit")
    return {
      focus: "quadril",
      why: "Ciclo em superávit: a alavanca é crescer quadril/glúteo. Vigie a cintura — sem TRH, o superávit também deposita gordura na barriga.",
    };
  return {
    focus: "manter",
    why: "Ciclo de manutenção: segure a forma e meça. Nenhuma alavanca forte agora.",
  };
}

export interface WaistGuardInput {
  cycleGoal: CycleGoal;
  waistStartCm: number;
  waistNowCm: number;
}

export interface WaistGuard {
  triggered: boolean;
  deltaCm: number;
}

const WAIST_GUARD_THRESHOLD_CM = 1.5;

export function waistGuard({ cycleGoal, waistStartCm, waistNowCm }: WaistGuardInput): WaistGuard {
  const deltaCm = round1(waistNowCm - waistStartCm);
  const triggered = cycleGoal === "superavit" && deltaCm >= WAIST_GUARD_THRESHOLD_CM;
  return { triggered, deltaCm };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- silhouette`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/silhouette.ts tests/lib/silhouette.test.ts
git commit -m "feat(silhueta): lib silhouette (razões, gaps, alavanca, trava de cintura)"
```

---

### Task 3: Progressão por tempo de isometria (vacuum)

**Files:**
- Modify: `src/lib/progression.ts` (acrescentar função no fim, sem tocar `suggestNextLoad`)
- Test: `tests/lib/progression.test.ts` (acrescentar describe)

- [ ] **Step 1: Write the failing test (append ao arquivo existente)**

```ts
// adicionar ao fim de tests/lib/progression.test.ts
import { suggestNextHoldTime } from "../../src/lib/progression";

describe("suggestNextHoldTime", () => {
  it("sobe 5s no easy", () => {
    expect(suggestNextHoldTime(30, "easy")).toBe(35);
  });
  it("respeita o teto de 60s", () => {
    expect(suggestNextHoldTime(58, "easy")).toBe(60);
  });
  it("sobe 2s no medium", () => {
    expect(suggestNextHoldTime(40, "medium")).toBe(42);
  });
  it("mantém no hard", () => {
    expect(suggestNextHoldTime(40, "hard")).toBe(40);
  });
});
```

Nota: o `import { suggestNextLoad } from ...` já existe no topo do arquivo; adicione `suggestNextHoldTime` à lista de imports existente em vez de duplicar a linha.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progression`
Expected: FAIL — `suggestNextHoldTime is not a function`.

- [ ] **Step 3: Write minimal implementation (append a src/lib/progression.ts)**

```ts
// adicionar ao fim de src/lib/progression.ts
const MAX_HOLD_SEC = 60;

/** Progressão por tempo de isometria (ex.: vacuum/transverso). */
export function suggestNextHoldTime(lastSec: number, feedback: SessionFeedback): number {
  if (feedback === "easy") return Math.min(MAX_HOLD_SEC, lastSec + 5);
  if (feedback === "medium") return Math.min(MAX_HOLD_SEC, lastSec + 2);
  return lastSec; // hard → mantém
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- progression`
Expected: PASS (testes novos + os antigos de `suggestNextLoad`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/progression.ts tests/lib/progression.test.ts
git commit -m "feat(silhueta): progressão por tempo de isometria (suggestNextHoldTime)"
```

---

### Task 4: Chaves de `settings` (altura + metas)

**Files:**
- Modify: `src/lib/settings-helpers.ts` (interface `Settings` + `DEFAULTS`)
- Modify: `src/hooks/useSetting.ts` (`DEFAULTS` — duplicado, manter em sincronia)
- Test: `tests/lib/settings-helpers.test.ts` (acrescentar)

- [ ] **Step 1: Write the failing test (append ao describe existente ou novo)**

```ts
// adicionar ao fim de tests/lib/settings-helpers.test.ts
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

describe("settings de silhueta", () => {
  it("tem defaults de altura e metas", async () => {
    expect(await getSetting("heightCm")).toBe(0);
    expect(await getSetting("targetWhr")).toBe(0.72);
    expect(await getSetting("targetShoulderHipRatio")).toBe(1.0);
  });
  it("persiste altura", async () => {
    await setSetting("heightCm", 165);
    expect(await getSetting("heightCm")).toBe(165);
  });
});
```

Nota: se já houver `import { getSetting, setSetting }` no topo, reutilize-o.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- settings-helpers`
Expected: FAIL — TypeScript reclama de chave inexistente / default `undefined`.

- [ ] **Step 3a: Modificar `src/lib/settings-helpers.ts`**

Na interface `Settings`, adicionar (logo após `lastWalkReminderAt: string;`):

```ts
  heightCm: number; // altura em cm; 0 = não informada
  targetWhr: number; // meta cintura/quadril
  targetShoulderHipRatio: number; // meta ombro/quadril
```

No objeto `DEFAULTS` (de settings-helpers.ts), adicionar (após `lastWalkReminderAt: "",`):

```ts
  heightCm: 0,
  targetWhr: 0.72,
  targetShoulderHipRatio: 1.0,
```

- [ ] **Step 3b: Modificar `src/hooks/useSetting.ts`**

No `DEFAULTS` desse arquivo (cópia local), adicionar as mesmas três linhas após `lastWalkReminderAt: "",`:

```ts
  heightCm: 0,
  targetWhr: 0.72,
  targetShoulderHipRatio: 1.0,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- settings-helpers`
Expected: PASS. Rode também `npx tsc -b` (ou `npm run build` sem deploy) pra confirmar que os dois `DEFAULTS` batem com a interface.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-helpers.ts src/hooks/useSetting.ts tests/lib/settings-helpers.test.ts
git commit -m "feat(silhueta): settings de altura e metas (WHR, ombro/quadril)"
```

---

### Task 5: Exercício `vacuum-abdominal` + inserção nos templates

**Files:**
- Modify: `src/data/exercises-seed.ts` (novo item no array `EXERCISES`)
- Modify: `src/data/workout-plan-seed.ts` (adicionar vacuum nos templates de terça e sexta do ciclo adaptação)
- Modify: `src/data/cycles-seed.ts` (adicionar vacuum no slot de core de cada ciclo)
- Test: `tests/lib/seed.test.ts` (acrescentar validação)

- [ ] **Step 1: Write the failing test (append a tests/lib/seed.test.ts)**

```ts
// adicionar ao fim de tests/lib/seed.test.ts
import { EXERCISES } from "../../src/data/exercises-seed";

describe("vacuum/transverso na silhueta", () => {
  it("tem exercício vacuum-abdominal de cintura", () => {
    const v = EXERCISES.find((e) => e.id === "vacuum-abdominal");
    expect(v).toBeDefined();
    expect(v!.category).toBe("cintura");
    expect(v!.description.length).toBeGreaterThan(0);
    expect(v!.proTips && v!.proTips.length).toBeGreaterThan(0);
  });

  it("não introduz oblíquo com carga (categoria cintura segue isométrica)", () => {
    const cintura = EXERCISES.filter((e) => e.category === "cintura");
    for (const e of cintura) {
      expect(e.equipment).not.toContain("anilhas");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- seed`
Expected: FAIL — `vacuum-abdominal` não encontrado.

- [ ] **Step 3a: Adicionar exercício em `src/data/exercises-seed.ts`**

Logo após o bloco do exercício `prancha-lateral` (ou junto dos demais `category: "cintura"`), inserir:

```ts
  {
    id: "vacuum-abdominal",
    name: "Vacuum abdominal",
    category: "cintura",
    equipment: ["nenhum"],
    difficulty: "iniciante",
    description:
      "Em pé, sentada ou de quatro: expira todo o ar e puxa o umbigo pra dentro/pra cima, como se colasse na coluna. Segura o tempo alvo respirando curto pela costela. Trabalha o transverso — o músculo que afina a cintura por dentro, como um cinto interno.",
    commonMistakes: [
      "Prender a respiração em vez de respirar curto pela costela",
      "Estufar a barriga em vez de puxar pra dentro",
      "Contrair o oblíquo/abdômen externo (não é pra aparecer gomos)",
    ],
    easierVariation: "De quatro (4 apoios), onde a gravidade ajuda a puxar a barriga pra dentro",
    harderVariation: "Em pé, segurando 30-60s com respiração contínua",
    exposureLevel: 1,
    proTips: [
      "Sem TRH, controlar o transverso + déficit é a principal ferramenta de cintura fina — faça quase todo dia",
      "Não é exercício de gomos: é puxar pra DENTRO, afinando, não engrossando",
      "Progrida pelo tempo de isometria (30 → 45 → 60s), não por carga",
    ],
  },
```

- [ ] **Step 3b: Inserir vacuum nos templates de `src/data/workout-plan-seed.ts`**

No template de **terça** (`ter-...`, que hoje termina em `dead-bug` + `prancha`), adicionar **após** o item `prancha`:

```ts
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura por dentro, sem engrossar" },
```

No template de **sexta** (`sex-...`, que termina em `prancha-lateral`), adicionar **após** o item `prancha-lateral`:

```ts
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Cinto interno — prioridade sem TRH" },
```

- [ ] **Step 3c: Inserir vacuum nos ciclos de `src/data/cycles-seed.ts`**

Em cada bloco de ciclo (`VARIATION`, `HYPERTROPHY`, `REFINEMENT`, `MAINTENANCE`), localizar o template que contém o slot de core (o que tem `dead-bug`, `prancha` ou `prancha-lateral`) e adicionar, logo após esse item de core:

```ts
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
```

Se algum ciclo tiver mais de um dia com core, basta inserir em um (frequência mínima 1×/semana já cumpre o objetivo). Garanta consistência de indentação com os itens vizinhos.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- seed`
Expected: PASS. Rode também `npm test -- movement-seed` e a suíte completa de data pra garantir que nenhum template referencia id inexistente.

- [ ] **Step 5: Commit**

```bash
git add src/data/exercises-seed.ts src/data/workout-plan-seed.ts src/data/cycles-seed.ts tests/lib/seed.test.ts
git commit -m "feat(silhueta): vacuum/transverso como exercício e nos templates"
```

---

### Task 6: Tela `/corpo/silhueta` + rota + link no BodyHome

**Files:**
- Create: `src/pages/body/Silhouette.tsx`
- Modify: `src/main.tsx` (registrar rota `corpo/silhueta`)
- Modify: `src/pages/body/BodyHome.tsx` (link)
- Test: `tests/pages/silhueta.smoke.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/pages/silhueta.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Silhouette } from "../../src/pages/body/Silhouette";
import { db } from "../../src/lib/db";

beforeEach(async () => {
  await db.measurements.clear();
  await db.settings.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/corpo/silhueta"]}>
      <Routes>
        <Route path="/corpo/silhueta" element={<Silhouette />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Silhouette smoke", () => {
  it("mostra WHR e %BF a partir da última medida", async () => {
    await db.settings.put({ key: "heightCm", value: 165 });
    await db.measurements.add({
      date: "2026-06-10",
      neckCm: 33,
      shouldersCm: 105,
      waistCm: 80,
      hipCm: 110,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/WHR/)).toBeInTheDocument();
      expect(screen.getByText(/0[.,]73/)).toBeInTheDocument(); // 80/110 = 0,727
    });
  });

  it("orienta a registrar medida quando não há dados", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/registre uma medida/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- silhueta.smoke`
Expected: FAIL — `Silhouette` não existe.

- [ ] **Step 3a: Criar `src/pages/body/Silhouette.tsx`**

```tsx
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useSetting } from "../../hooks/useSetting";
import { calculateWhr } from "../../lib/waist-hip-ratio";
import { CYCLE_TO_GOAL } from "../../data/cycles-seed";
import { estimateBodyFatNavy, classifyBodyFat } from "../../lib/body-composition";
import {
  shoulderHipRatio,
  whrGap,
  shoulderHipGap,
  leverGuidance,
  waistGuard,
} from "../../lib/silhouette";

const BAND_LABEL: Record<string, string> = {
  essencial: "essencial",
  atleta: "faixa atleta",
  fitness: "faixa fitness",
  media: "faixa média",
  alta: "faixa alta",
};

export function Silhouette() {
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const heightCm = useSetting("heightCm");
  const targetWhr = useSetting("targetWhr");
  const targetShr = useSetting("targetShoulderHipRatio");
  const activeCycle = useSetting("activeCycle");

  if (!measurements) {
    return <div className="p-4 pb-24 text-muted">Carregando…</div>;
  }

  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
  const goal = CYCLE_TO_GOAL[activeCycle];
  const lever = leverGuidance(goal);

  const whr =
    latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const whrG =
    whr !== null && latest?.waistCm && latest?.hipCm
      ? whrGap(whr, targetWhr, latest.waistCm, latest.hipCm)
      : null;

  const shr =
    latest?.shouldersCm && latest?.hipCm
      ? shoulderHipRatio(latest.shouldersCm, latest.hipCm)
      : null;
  const shrG =
    shr !== null && latest?.shouldersCm && latest?.hipCm
      ? shoulderHipGap(shr, targetShr, latest.shouldersCm, latest.hipCm)
      : null;

  const bf = latest
    ? estimateBodyFatNavy({
        heightCm,
        neckCm: latest.neckCm,
        waistCm: latest.waistCm,
        hipCm: latest.hipCm,
      })
    : null;

  const guard =
    goal === "superavit" && latest?.waistCm && prev?.waistCm
      ? waistGuard({ cycleGoal: goal, waistStartCm: prev.waistCm, waistNowCm: latest.waistCm })
      : { triggered: false, deltaCm: 0 };

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Silhueta</h1>
      </div>

      {!latest && (
        <div className="card">
          <p className="text-nude-warm text-sm">
            Registre uma medida (cintura, quadril, ombro, pescoço) pra ver sua estratégia de
            ampulheta.
          </p>
          <Link to="/corpo/medidas" className="text-nude text-sm underline">Ir pra Medidas</Link>
        </div>
      )}

      {/* Alavanca do ciclo */}
      <div className="card space-y-1">
        <h2 className="text-nude-warm font-medium">Alavanca do momento</h2>
        <p className="text-nude text-sm font-medium capitalize">Foco: {lever.focus}</p>
        <p className="text-muted text-sm">{lever.why}</p>
      </div>

      {/* WHR */}
      {whr !== null && (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Cintura / Quadril (WHR)</h2>
          <p className="text-nude text-lg">
            WHR {whr.toFixed(2)} <span className="text-muted text-sm">· alvo {targetWhr.toFixed(2)}</span>
          </p>
          {whrG && (whrG.waistDeltaCm > 0 || whrG.hipDeltaCm > 0) ? (
            <p className="text-muted text-sm">
              Pra chegar no alvo: −{whrG.waistDeltaCm} cm de cintura <strong>ou</strong> +
              {whrG.hipDeltaCm} cm de quadril.
            </p>
          ) : (
            <p className="text-nude text-sm">No alvo. 🎯</p>
          )}
        </div>
      )}

      {/* Ombro / Quadril */}
      {shr !== null && (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Ombro / Quadril</h2>
          <p className="text-nude text-lg">
            {shr.toFixed(2)} <span className="text-muted text-sm">· alvo {targetShr.toFixed(2)}</span>
          </p>
          {shrG && shrG.hipDeltaCm > 0 ? (
            <p className="text-muted text-sm">
              Pra silhueta mais feminina: +{shrG.hipDeltaCm} cm de quadril (não treine ombro pesado).
            </p>
          ) : (
            <p className="text-nude text-sm">Ombro não passa do quadril. 🎯</p>
          )}
        </div>
      )}

      {/* %BF */}
      {bf !== null ? (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Gordura corporal estimada</h2>
          <p className="text-nude text-lg">~{bf}% <span className="text-muted text-sm">· {BAND_LABEL[classifyBodyFat(bf)]}</span></p>
          <p className="text-muted text-xs">Estimativa por fita (Navy): pescoço + cintura + quadril + altura. Use a tendência, não o número absoluto.</p>
        </div>
      ) : (
        heightCm === 0 && (
          <div className="card">
            <p className="text-muted text-sm">
              Informe sua altura nas <Link to="/configuracoes" className="text-nude underline">Configurações</Link> pra estimar a gordura corporal.
            </p>
          </div>
        )
      )}

      {/* Trava de cintura */}
      {guard.triggered && (
        <div className="card border-red-900 bg-red-900/20 space-y-1">
          <h2 className="text-red-200 font-medium">Trava de cintura</h2>
          <p className="text-red-200 text-sm">
            Sua cintura subiu {guard.deltaCm} cm desde a última medida durante o superávit. Sem
            TRH, isso é gordura na barriga. Considere segurar o superávit ou voltar à manutenção.
          </p>
        </div>
      )}

      {/* Educativo */}
      <div className="card space-y-1">
        <h2 className="text-nude-warm font-medium">Por que treinar transverso, não oblíquo</h2>
        <p className="text-muted text-sm">
          Oblíquo com carga engrossa a cintura. O transverso (vacuum) age como um cinto interno
          que afina por dentro. Por isso o treino tem vacuum e pranchas, mas zero rotação ou
          flexão lateral com peso.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3b: Registrar rota em `src/main.tsx`**

Importar no topo (junto dos outros imports de `pages/body`):

```ts
import { Silhouette } from "./pages/body/Silhouette";
```

E adicionar a rota logo após `{ path: "corpo", element: <BodyHome /> },`:

```ts
        { path: "corpo/silhueta", element: <Silhouette /> },
```

- [ ] **Step 3c: Link no `src/pages/body/BodyHome.tsx`**

Adicionar como **primeiro** card dentro do `<div className="p-4 pb-24 space-y-3">`, logo após o `<h1>`:

```tsx
      <Link to="/corpo/silhueta" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Silhueta</h3>
        <p className="text-muted text-sm mt-1">Estratégia ampulheta: WHR, ombro/quadril, %BF, alavanca do ciclo</p>
      </Link>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- silhueta.smoke`
Expected: PASS (ambos os casos).

- [ ] **Step 5: Commit**

```bash
git add src/pages/body/Silhouette.tsx src/main.tsx src/pages/body/BodyHome.tsx tests/pages/silhueta.smoke.test.tsx
git commit -m "feat(silhueta): tela /corpo/silhueta com metas, gaps, %BF e trava"
```

---

### Task 7: UI de Configurações (altura + metas)

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Ler valores de setting no componente**

No corpo de `Settings()`, junto dos outros `useSetting`, adicionar:

```ts
  const heightCm = useSetting("heightCm");
  const targetWhr = useSetting("targetWhr");
  const targetShr = useSetting("targetShoulderHipRatio");
```

- [ ] **Step 2: Adicionar card de Silhueta na UI**

Inserir um novo card logo **antes** do card "Backup" (`<div className="card space-y-2">` com `<h2>Backup`):

```tsx
      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Silhueta</h2>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Altura (cm)</label>
          <input type="number" min={120} max={220} value={heightCm || ""} placeholder="ex.: 165"
                 onChange={(e) => void setSetting("heightCm", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">Usada pra estimar a gordura corporal (método Navy).</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Meta WHR (cintura/quadril)</label>
          <input type="number" step={0.01} min={0.5} max={1.1} value={targetWhr}
                 onChange={(e) => void setSetting("targetWhr", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">0,72 = ampulheta forte · 0,80 = moderada.</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Meta ombro/quadril</label>
          <input type="number" step={0.01} min={0.7} max={1.3} value={targetShr}
                 onChange={(e) => void setSetting("targetShoulderHipRatio", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">1,00 = ombro no máximo igual ao quadril.</p>
        </div>
      </div>
```

- [ ] **Step 3: Verificar build/tipos**

Run: `npx tsc -b`
Expected: sem erros de tipo.

- [ ] **Step 4: Smoke manual rápido (opcional)**

Run: `npm run dev` e abrir `/configuracoes` → ajustar altura/metas; abrir `/corpo/silhueta` → ver os valores refletidos. (Sem teste automatizado novo aqui; a página Settings não tem smoke test e não vamos introduzir um só pra isso — YAGNI.)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat(silhueta): campos de altura e metas em Configurações"
```

---

### Task 8: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos os testes passam (incluindo os 35 antigos + os novos de body-composition, silhouette, progression, settings, seed e silhueta.smoke).

- [ ] **Step 2: Build de produção**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

- [ ] **Step 3: Commit final (se houver ajuste)**

```bash
git add -A
git commit -m "chore(silhueta): verificação final da estratégia de silhueta"
```

---

## Notas de fechamento

- **Fora de escopo (vai pro #2 — Inteligência adaptativa):** ciclo trocar por resultado, `suggestNextLoad` reagir a medidas, hábito diário de vacuum no Hoje, projeção preditiva de WHR.
- **Sem migração de schema:** `Measurement` não muda; `bodyFatPct` é sempre calculado. As únicas adições persistidas são três chaves em `settings` (com defaults).
- **Regra preservada:** nenhum oblíquo com carga entra; o vacuum é isométrico (`equipment: ["nenhum"]`), e o teste do Task 5 trava regressões nisso.

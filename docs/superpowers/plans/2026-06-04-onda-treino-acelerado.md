# Onda Treino Acelerado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Acelerar treino: encurtar adaptação (80→28), progressão de carga mais agressiva, aquecimento real em todo treino, 3ª dose de glúteo na Quarta, micro-rotina diária de postura e caminhada diária com registro.

**Architecture:** Mudanças concentradas em seeds (cycles/workout-plan/sequences), na função pura `suggestNextLoad`, em settings (default novo) e em 2 cards no `Today.tsx`. Sem bump de schema Dexie (nenhum campo novo indexado); re-seed de sequências via `MOVEMENT_VERSION`.

**Tech Stack:** React 18 + TypeScript + Dexie 4 + Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-04-onda-treino-acelerado-design.md`
**Branch:** `feat/treino-acelerado` (em cima de `feat/nutricao-emagrecimento`).

## Comandos
- Teste específico: `npx vitest run tests/<caminho>`
- Tudo: `npm run test` · Build: `npm run build`

## Mapa de arquivos
| Arquivo | Ação |
|---|---|
| `src/lib/progression.ts` | nova regra de progressão |
| `src/data/cycles-seed.ts` | threshold 28 + aquecimento/glúteo nos templates + durações |
| `src/data/workout-plan-seed.ts` | aquecimento + glúteo Quarta + durações |
| `src/lib/db.ts` | `DailyLog.walkMin?` |
| `src/lib/settings-helpers.ts` | tipo + default `walkGoalMin` |
| `src/hooks/useSetting.ts` | default `walkGoalMin` |
| `src/data/sequences-seed.ts` | nova sequência `postura-silhueta-diaria` |
| `src/lib/movement-seed.ts` | `MOVEMENT_VERSION` 3→4 |
| `src/pages/Today.tsx` | cards "Postura" e "Caminhada" |

---

## Task 1: Progressão de carga mais agressiva

**Files:** Modify `src/lib/progression.ts`; Modify `tests/lib/progression.test.ts`

- [ ] **Step 1: Reescrever o teste** — substituir o conteúdo de `tests/lib/progression.test.ts` por:

```ts
import { describe, it, expect } from "vitest";
import { suggestNextLoad } from "../../src/lib/progression";

describe("suggestNextLoad", () => {
  it("fácil + carga <5kg → +0,5", () => {
    expect(suggestNextLoad({ lastLoad: 4, feedback: "easy", completedAllReps: true })).toBe(4.5);
  });
  it("fácil + carga 5–20 → +2", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true })).toBe(12);
  });
  it("fácil + carga >=20 → +2,5", () => {
    expect(suggestNextLoad({ lastLoad: 20, feedback: "easy", completedAllReps: true })).toBe(22.5);
  });
  it("médio + completou → +1 (mantém momentum)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "medium", completedAllReps: true })).toBe(11);
  });
  it("difícil + completou → mantém", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: true })).toBe(10);
  });
  it("não completou → -1 (piso 0)", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false })).toBe(9);
    expect(suggestNextLoad({ lastLoad: 0.5, feedback: "hard", completedAllReps: false })).toBe(0);
  });
  it("não completou tem prioridade sobre 'easy'", () => {
    expect(suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: false })).toBe(9);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/lib/progression.test.ts` → FAIL (o "médio" hoje mantém=10, esperado 11; "fácil" em 10 dá 11, esperado 12).

- [ ] **Step 3: Implementar** — substituir o corpo de `src/lib/progression.ts` (mantendo os tipos exportados):

```ts
export type SessionFeedback = "easy" | "medium" | "hard";

export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  completedAllReps: boolean;
}

export function suggestNextLoad({ lastLoad, feedback, completedAllReps }: ProgressionInput): number {
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

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/lib/progression.test.ts` → PASS.
- [ ] **Step 5: Commit** — `feat(progression): faster beginner load progression (scaled easy jumps, +1 on medium)`

---

## Task 2: Encurtar a Adaptação (threshold 80 → 28)

**Files:** Modify `src/data/cycles-seed.ts` (CYCLES array, ~line 247); Test `tests/data/cycles-threshold.test.ts` (criar)

- [ ] **Step 1: Escrever o teste** — criar `tests/data/cycles-threshold.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CYCLES } from "../../src/data/cycles-seed";

describe("CYCLES thresholds", () => {
  it("Adaptação foi encurtada para 28 sessões", () => {
    const adapt = CYCLES.find((c) => c.id === "adaptacao");
    expect(adapt?.threshold).toBe(28);
  });
  it("demais ciclos seguem em 60", () => {
    for (const id of ["variacao", "hipertrofia", "refinamento"]) {
      expect(CYCLES.find((c) => c.id === id)?.threshold).toBe(60);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/data/cycles-threshold.test.ts` → FAIL (adaptacao threshold=80).

- [ ] **Step 3: Implementar** — em `src/data/cycles-seed.ts`, no objeto `CYCLES`, trocar a linha da Adaptação:

de:
```ts
  { id: "adaptacao", name: "Adaptação", description: "Aprende movimentos, ativa glúteo, cargas leves", threshold: 80 },
```
para:
```ts
  { id: "adaptacao", name: "Adaptação", description: "Aprende movimentos, ativa glúteo, cargas leves (~6 semanas)", threshold: 28 },
```

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/data/cycles-threshold.test.ts` → PASS.
- [ ] **Step 5: Commit** — `feat(cycles): shorten Adaptação threshold 80 -> 28 sessions`

---

## Task 3: Settings `walkGoalMin` + `DailyLog.walkMin`

**Files:** Modify `src/lib/db.ts` (DailyLog ~line 209), `src/lib/settings-helpers.ts` (type ~line 31 + default ~line 62), `src/hooks/useSetting.ts` (DEFAULTS ~line 33); Test `tests/lib/settings-walk.test.ts` (criar)

- [ ] **Step 1: Escrever o teste** — criar `tests/lib/settings-walk.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("walkGoalMin setting", () => {
  it("tem default de 30 min", async () => {
    expect(await getSetting("walkGoalMin")).toBe(30);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/lib/settings-walk.test.ts` → FAIL (type error / undefined: walkGoalMin não existe).

- [ ] **Step 3: Implementar:**

3a. `src/lib/db.ts`, na interface `DailyLog`, adicionar campo após `waterMl`:
```ts
  waterMl: number;
  walkMin?: number;
```

3b. `src/lib/settings-helpers.ts`, na interface `Settings` (após `cyclesSeeded: boolean;`):
```ts
  cyclesSeeded: boolean;
  walkGoalMin: number;
```
e no objeto `DEFAULTS` desse arquivo (após `cyclesSeeded: false,`):
```ts
  cyclesSeeded: false,
  walkGoalMin: 30,
```

3c. `src/hooks/useSetting.ts`, no objeto `DEFAULTS` (após `cyclesSeeded: false,`):
```ts
  cyclesSeeded: false,
  walkGoalMin: 30,
```

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/lib/settings-walk.test.ts` → PASS. Também `npm run build` pra confirmar que os dois `Settings` batem (sem erro de tipo por campo faltando).
- [ ] **Step 5: Commit** — `feat(settings): add walkGoalMin (default 30) and DailyLog.walkMin`

---

## Task 4: Sequência de postura diária

**Files:** Modify `src/data/sequences-seed.ts` (append ao array `SEQUENCES`); Modify `src/lib/movement-seed.ts` (`MOVEMENT_VERSION` 3→4); Test `tests/data/postura-seed.test.ts` (criar)

- [ ] **Step 1: Escrever o teste** — criar `tests/data/postura-seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

describe("sequência de postura", () => {
  it("existe postura-silhueta-diaria com ~7 movimentos", () => {
    const seq = SEQUENCES.find((s) => s.id === "postura-silhueta-diaria");
    expect(seq).toBeDefined();
    expect(seq?.category).toBe("mobilidade");
    expect(seq?.durationMin).toBeGreaterThanOrEqual(5);
    expect((seq?.moves.length ?? 0)).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/data/postura-seed.test.ts` → FAIL.

- [ ] **Step 3: Implementar:**

3a. Em `src/data/sequences-seed.ts`, adicionar ao array `SEQUENCES` (segue o shape `DanceSequence`: `{id,name,category,level,durationMin,focus,moves:[{name,description,durationSec,repeat?}]}`):

```ts
  {
    id: "postura-silhueta-diaria",
    name: "Postura & silhueta (diária)",
    category: "mobilidade",
    level: "iniciante",
    durationMin: 7,
    focus: "Corrigir cabeça pra frente, abrir o peito, ativar glúteo e marcar a cintura. Vitória visível em semanas, faz a silhueta parecer mais alongada já hoje.",
    moves: [
      { name: "Chin tuck (retração cervical)", description: "Em pé ou sentada, olhar à frente. Desliza o queixo pra trás (como fazer 'papada'), alongando a nuca. Segura 3s, solta. Corrige a cabeça projetada.", durationSec: 60, repeat: 10 },
      { name: "Extensão torácica", description: "Mãos atrás da nuca, cotovelos abertos. Abre o peito levando os cotovelos pra trás e olhando levemente pra cima. Não força a lombar — o movimento é na parte alta das costas.", durationSec: 60, repeat: 10 },
      { name: "Retração escapular (parede/banda)", description: "Em pé, aperta as escápulas pra trás e pra baixo, sem subir os ombros. Segura 3s. Pode usar uma faixa elástica esticada à frente.", durationSec: 60, repeat: 12 },
      { name: "Alongamento de peitoral no batente", description: "Antebraço apoiado no batente da porta, gira o tronco pro lado oposto até sentir o peito alongar. 30s cada lado. Abre os ombros fechados pra frente.", durationSec: 60 },
      { name: "Ativação de glúteo em pé", description: "Em pé, transfere o peso pra uma perna, aperta o glúteo dela com força 3s, solta. Alterna. Reacorda o glúteo dormente do dia sentada.", durationSec: 60, repeat: 12 },
      { name: "Vacuum abdominal", description: "Expira todo o ar e puxa o umbigo em direção à coluna, sem prender com força. Segura 10-15s respirando raso. Trabalha o transverso, que afina a cintura por dentro.", durationSec: 90, repeat: 4 },
      { name: "Respiração de postura final", description: "Em pé, alinha orelha-ombro-quadril. 5 respirações profundas mantendo o alinhamento, gravando a sensação de postura ereta.", durationSec: 60 },
    ],
  },
```

3b. Em `src/lib/movement-seed.ts`, trocar `const MOVEMENT_VERSION = 3;` por `const MOVEMENT_VERSION = 4;`.

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/data/postura-seed.test.ts` → PASS. Rodar `npx vitest run tests/lib/movement-seed.test.ts` pra confirmar que o seed segue idempotente.
- [ ] **Step 5: Commit** — `feat(movement): add daily posture/silhouette routine + bump MOVEMENT_VERSION`

---

## Task 5: Aquecimento + 3ª dose de glúteo nos templates

**Files:** Modify `src/data/workout-plan-seed.ts`; Modify `src/data/cycles-seed.ts` (templates VARIATION/HYPERTROPHY/REFINEMENT); Test `tests/data/templates-warmup-gluteo.test.ts` (criar)

**Regras (aplicar em AMBOS os arquivos, em todos os templates):**
- **Dias de força** (`dayOfWeek` ∈ {1,2,4,5}): inserir como PRIMEIRO exercício `{ exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 }`, ANTES do `aquecimento-articular` existente. Aumentar `durationMin` em +7.
- **Dia de Quarta** (`dayOfWeek === 3`): inserir como PRIMEIRO exercício `{ exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 }` (hoje não tem). E adicionar, ANTES do bloco de dança/mobilidade final, o bloco de glúteo leve:
  ```ts
  { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
  { exerciseId: "kickback-cabo", sets: 3, repsTarget: "15 cada", restSec: 30 },
  { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
  ```
  Aumentar `durationMin` da Quarta em +12.

Esses `exerciseId` já existem no catálogo (`exercises-seed.ts`): `cardio-leve-esteira`, `aquecimento-articular`, `ponte-gluteo-band`, `kickback-cabo`, `abdutor-deitada`.

- [ ] **Step 1: Escrever o teste** — criar `tests/data/templates-warmup-gluteo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import type { WorkoutTemplate } from "../../src/lib/db";

const ALL: WorkoutTemplate[] = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("aquecimento e glúteo nos templates", () => {
  it("todo dia de força começa com cardio leve + articular", () => {
    const force = ALL.filter((t) => [1, 2, 4, 5].includes(t.dayOfWeek));
    expect(force.length).toBeGreaterThan(0);
    for (const t of force) {
      expect(t.exercises[0].exerciseId).toBe("cardio-leve-esteira");
      expect(t.exercises[1].exerciseId).toBe("aquecimento-articular");
    }
  });

  it("a Quarta tem aquecimento articular e bloco de glúteo", () => {
    const quartas = ALL.filter((t) => t.dayOfWeek === 3);
    expect(quartas.length).toBeGreaterThan(0);
    for (const t of quartas) {
      const ids = t.exercises.map((e) => e.exerciseId);
      expect(ids[0]).toBe("aquecimento-articular");
      expect(ids).toContain("ponte-gluteo-band");
      expect(ids).toContain("abdutor-deitada");
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/data/templates-warmup-gluteo.test.ts` → FAIL.

- [ ] **Step 3: Implementar** — editar cada template nos dois arquivos seguindo as regras acima. Atenção: o dia de Quarta hoje (ids `qua-mobilidade-danca`, `v-qua-mobilidade-danca`, `h-qua-mobilidade-danca`, `r-qua-mobilidade-danca`) começa com `cat-cow`; inserir `aquecimento-articular` antes do `cat-cow`, e o bloco de glúteo antes dos exercícios de dança/isolamento (`rebolado-basico`/`isolamento-quadril-lateral`/`rotacao-quadril-em-pe`). Ajustar `durationMin` conforme as regras.

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/data/templates-warmup-gluteo.test.ts` → PASS. Rodar `npm run test` (a suíte de seed de treino existente deve continuar verde).
- [ ] **Step 5: Commit** — `feat(workout): wire cardio+joint warm-up into all sessions and add Wednesday glute block`

---

## Task 6: Cards "Postura" e "Caminhada" no Hoje

**Files:** Modify `src/pages/Today.tsx`; Test `tests/pages/today-treino.smoke.test.tsx` (criar)

- [ ] **Step 1: Escrever o smoke test** — criar `tests/pages/today-treino.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";

const todayISO = new Date().toISOString().slice(0, 10);

describe("Today — cards de treino", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
  });

  it("mostra os cards Postura e Caminhada", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Postura")).toBeInTheDocument());
    expect(screen.getByText("Caminhada")).toBeInTheDocument();
  });

  it("o botão +10 min registra caminhada no dailyLog", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Caminhada")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /\+10 min/i }));
    await waitFor(async () => {
      const log = await db.dailyLog.get(todayISO);
      expect(log?.walkMin).toBe(10);
    });
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run tests/pages/today-treino.smoke.test.tsx` → FAIL (cards não existem).

- [ ] **Step 3: Implementar** — em `src/pages/Today.tsx`:

3a. Adicionar a leitura da meta de caminhada e do estado de postura, junto das outras `useSetting`/`useLiveQuery` (perto da linha 38-52):
```ts
  const walkGoalMin = useSetting("walkGoalMin");
  const posturaDoneToday = useLiveQuery(
    () => db.practiceLogs.where("date").equals(todayISO).and((p) => p.sequenceId === "postura-silhueta-diaria").count(),
    [todayISO],
  );
```

3b. Adicionar a função de registrar caminhada, junto de `addWater` (após a linha ~123):
```ts
  async function addWalk(min: number) {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { walkMin: (log.walkMin ?? 0) + min });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: 0, activeBreakCount: 0, walkMin: min });
    }
  }
```

3c. Adicionar os dois cards no JSX. Colocar o card "Postura" logo após o card "Movimento" (após a linha ~194) e o card "Caminhada" logo após o de "Hidratação":
```tsx
      <TodayCard
        title="Caminhada"
        subtitle={`${dailyLog?.walkMin ?? 0} / ${walkGoalMin} min`}
        rightSlot={
          <button
            type="button"
            onClick={() => void addWalk(10)}
            className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md"
          >
            +10 min
          </button>
        }
      />
```
e:
```tsx
      <TodayCard
        title="Postura"
        subtitle={`Rotina diária · 7 min · ${(posturaDoneToday ?? 0) > 0 ? "feito ✓" : "pendente"}`}
        to="/treino/movimento/postura-silhueta-diaria"
        variant={(posturaDoneToday ?? 0) === 0 ? "highlight" : "default"}
      />
```

(O card "Caminhada" deve ficar próximo ao de Hidratação; o de "Postura" próximo ao de Movimento. Manter o restante do JSX intacto.)

- [ ] **Step 4: Rodar e confirmar passa** — `npx vitest run tests/pages/today-treino.smoke.test.tsx` → PASS.
- [ ] **Step 5: Commit** — `feat(today): add Postura and Caminhada cards`

---

## Task 7: Verificação final

- [ ] **Step 1:** `npm run test` → toda a suíte verde (reportar contagem).
- [ ] **Step 2:** `npm run build` → tsc + vite sem erros.
- [ ] **Step 3:** Commit (se houver algo pendente) — `test: full suite green for treino acelerado onda`

---

## Self-review (cobertura do spec)
| Requisito | Task |
|---|---|
| Adaptação 80→28 | Task 2 |
| Progressão mais agressiva | Task 1 |
| Aquecimento (cardio+articular) em todo treino + Quarta | Task 5 |
| 3ª dose de glúteo (Quarta) | Task 5 |
| Micro-rotina de postura + card no Hoje | Task 4, 6 |
| Caminhada diária + registro + card | Task 3, 6 |
| Sem bump Dexie; re-seed via MOVEMENT_VERSION | Task 4 |
| Testes (progressão, threshold, settings, seed, templates, smoke) | Tasks 1-6 |

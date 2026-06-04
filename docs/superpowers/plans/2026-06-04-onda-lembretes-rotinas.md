# Onda Lembretes de Rotinas (postura + caminhada) — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Lembretes diários para a rotina de postura e a caminhada, no mesmo padrão do scheduler existente (gated por dia, respeitando quiet hours / modo foco), disparando só se a tarefa ainda não foi feita.

**Design:**
- Postura: lembrete diário (default 19:00), uma vez/dia, só se a sequência `postura-silhueta-diaria` não foi praticada hoje.
- Caminhada: lembrete diário (default 12:00), uma vez/dia, só se `dailyLog.walkMin < walkGoalMin`.
- Helper puro `shouldRemindOncePerDay` (testável) encapsula a decisão; o scheduler liga postura e caminhada nele.
- 4 settings novas: `posturaReminderTime`, `walkReminderTime`, `lastPosturaReminderAt`, `lastWalkReminderAt`.

**Tech:** TypeScript + Vitest. Branch `feat/lembretes-rotinas` (sobre `feat/plano-acelerado`).

## Mapa de arquivos
| Arquivo | Ação |
|---|---|
| `src/lib/notifications.ts` | + `shouldRemindOncePerDay` (puro) |
| `src/lib/settings-helpers.ts` | + 4 settings (tipo + default) |
| `src/hooks/useSetting.ts` | + 4 defaults |
| `src/lib/notification-scheduler.ts` | blocos de postura + caminhada |
| `tests/lib/notifications.test.ts` | testes do helper |
| `tests/lib/settings-reminders.test.ts` | defaults das settings novas |

---

## Task 1: Helper puro `shouldRemindOncePerDay`

**Files:** Modify `src/lib/notifications.ts`; Modify `tests/lib/notifications.test.ts` (append).

- [ ] **Step 1: Append tests** to `tests/lib/notifications.test.ts`:
```ts
import { shouldRemindOncePerDay } from "../../src/lib/notifications";

describe("shouldRemindOncePerDay", () => {
  const base = { currentMin: 12 * 60, targetMin: 12 * 60, lastNotifiedDate: "", todayISO: "2026-06-04", done: false };
  it("dispara quando passou do horário, não feito e não notificou hoje", () => {
    expect(shouldRemindOncePerDay(base)).toBe(true);
  });
  it("não dispara antes do horário", () => {
    expect(shouldRemindOncePerDay({ ...base, currentMin: 11 * 60 })).toBe(false);
  });
  it("não dispara se já feito", () => {
    expect(shouldRemindOncePerDay({ ...base, done: true })).toBe(false);
  });
  it("não dispara se já notificou hoje", () => {
    expect(shouldRemindOncePerDay({ ...base, lastNotifiedDate: "2026-06-04" })).toBe(false);
  });
});
```

- [ ] **Step 2:** `npx vitest run tests/lib/notifications.test.ts` → FAIL (função não existe).

- [ ] **Step 3:** Em `src/lib/notifications.ts`, adicionar:
```ts
export function shouldRemindOncePerDay(opts: {
  currentMin: number;
  targetMin: number;
  lastNotifiedDate: string;
  todayISO: string;
  done: boolean;
}): boolean {
  if (opts.done) return false;
  if (opts.currentMin < opts.targetMin) return false;
  if (opts.lastNotifiedDate === opts.todayISO) return false;
  return true;
}
```

- [ ] **Step 4:** `npx vitest run tests/lib/notifications.test.ts` → PASS.
- [ ] **Step 5: Commit:** `feat(notifications): add shouldRemindOncePerDay helper`

---

## Task 2: Settings novas

**Files:** Modify `src/lib/settings-helpers.ts` (tipo + DEFAULTS), `src/hooks/useSetting.ts` (DEFAULTS); Create `tests/lib/settings-reminders.test.ts`.

- [ ] **Step 1: Create `tests/lib/settings-reminders.test.ts`:**
```ts
import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("settings de lembrete", () => {
  it("postura default 19:00, caminhada default 12:00", async () => {
    expect(await getSetting("posturaReminderTime")).toBe("19:00");
    expect(await getSetting("walkReminderTime")).toBe("12:00");
  });
  it("timestamps de último lembrete começam vazios", async () => {
    expect(await getSetting("lastPosturaReminderAt")).toBe("");
    expect(await getSetting("lastWalkReminderAt")).toBe("");
  });
});
```

- [ ] **Step 2:** `npx vitest run tests/lib/settings-reminders.test.ts` → FAIL.

- [ ] **Step 3:** Em `src/lib/settings-helpers.ts`, na interface `Settings` (após `walkGoalMin: number;`):
```ts
  walkGoalMin: number;
  posturaReminderTime: string;
  walkReminderTime: string;
  lastPosturaReminderAt: string;
  lastWalkReminderAt: string;
```
E no `DEFAULTS` desse arquivo (após `walkGoalMin: 30,`):
```ts
  walkGoalMin: 30,
  posturaReminderTime: "19:00",
  walkReminderTime: "12:00",
  lastPosturaReminderAt: "",
  lastWalkReminderAt: "",
```
E o MESMO bloco de 4 defaults no `DEFAULTS` de `src/hooks/useSetting.ts` (após `walkGoalMin: 30,`).

- [ ] **Step 4:** `npx vitest run tests/lib/settings-reminders.test.ts` → PASS. E `npm run build` (os dois DEFAULTS precisam satisfazer o tipo `Settings`).
- [ ] **Step 5: Commit:** `feat(settings): add postura/walk reminder time + last-notified settings`

---

## Task 3: Ligar postura + caminhada no scheduler

**Files:** Modify `src/lib/notification-scheduler.ts`.

- [ ] **Step 1:** No `tick()` de `src/lib/notification-scheduler.ts`, após o bloco de skincare (que já computa `now`, `todayISO`, `currentMin`), adicionar:
```ts
  // Postura (uma vez/dia, se não praticou hoje)
  const posturaTime = await getSetting("posturaReminderTime");
  const lastPostura = await getSetting("lastPosturaReminderAt");
  const [pH, pM] = posturaTime.split(":").map(Number);
  const posturaDone = (await db.practiceLogs.where("date").equals(todayISO).and((p) => p.sequenceId === "postura-silhueta-diaria").count()) > 0;
  if (shouldRemindOncePerDay({ currentMin, targetMin: pH * 60 + pM, lastNotifiedDate: lastPostura, todayISO, done: posturaDone })) {
    notify("Postura & silhueta", "7 min de rotina de postura — abre o peito, ativa o glúteo");
    await setSetting("lastPosturaReminderAt", todayISO);
  }

  // Caminhada (uma vez/dia, se não bateu a meta)
  const walkTime = await getSetting("walkReminderTime");
  const lastWalk = await getSetting("lastWalkReminderAt");
  const [wH, wM] = walkTime.split(":").map(Number);
  const walkGoal = await getSetting("walkGoalMin");
  const walkLog = await db.dailyLog.get(todayISO);
  const walkDone = (walkLog?.walkMin ?? 0) >= walkGoal;
  if (shouldRemindOncePerDay({ currentMin, targetMin: wH * 60 + wM, lastNotifiedDate: lastWalk, todayISO, done: walkDone })) {
    notify("Caminhada", `Bora caminhar · meta ${walkGoal} min hoje`);
    await setSetting("lastWalkReminderAt", todayISO);
  }
```
Garantir que `shouldRemindOncePerDay` está importado de `./notifications` (adicionar ao import existente `{ shouldNotifyNow, isWithinWorkingHours, notify }`).

- [ ] **Step 2:** `npm run build` → sem erros TS. `npm run test` → suíte verde (a lógica testável vive no helper da Task 1).
- [ ] **Step 3: Commit:** `feat(scheduler): daily posture and walk reminders`

---

## Task 4: Verificação final
- [ ] `npm run test` (reportar contagem) + `npm run build` (sem erros). Commit se pendente.

## Self-review
| Requisito | Task |
|---|---|
| Helper puro testável | 1 |
| Settings (horários + last) | 2 |
| Lembrete postura (gated, só se não feito) | 1,3 |
| Lembrete caminhada (gated, só se < meta) | 1,3 |
| Respeita quiet hours/foco | herdado do `shouldNotifyNow` no início do tick |

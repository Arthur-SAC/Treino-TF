# Backbone — Tela Hoje ancorada na rotina do dia · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a tela Hoje pra apresentar a rotina inteira do dia em blocos por horário, com cada item marcável (✓) e persistido, um "foco agora" pelo horário atual, e uma grade de atalhos — de forma que a usuária só abra o app e vá clicando.

**Architecture:** Um módulo puro (`today-routine.ts`) define o dia como blocos de horário com itens tipados; um store novo do Dexie (`routineChecks`) persiste o "feito" de cada item por data; um hook (`useRoutineChecks`) expõe/alterna esse estado; um componente (`RoutineRow`) desenha a linha marcável; e `Today.tsx` compõe tudo. Itens que já têm estado próprio (skincare, treino, refeições) continuam refletindo esse estado via `control: "link"`.

**Tech Stack:** React 18 + TypeScript strict, Dexie 4 (IndexedDB) + dexie-react-hooks, Tailwind v3, Vitest 4 + @testing-library/react + fake-indexeddb, react-router-dom 7.

## Global Constraints

- TypeScript com `verbatimModuleSyntax: true` — sempre `import type` pra tipos (ex.: `import { useState, type ReactNode } from "react"`).
- Paleta amazona (não hardcodar hex — usar classes Tailwind existentes): `bg-bg-raised`, `border-bg-border`, `text-nude`/`text-nude-warm`, `text-muted`, `bg-wine`/`bg-wine-light`, `rounded-card`, `font-serif`.
- Datas: a base usa `date.toISOString().slice(0,10)` pra ISO e `date.getDay()` pra dia da semana — manter esse padrão (há dívida de TZ conhecida, mas não é escopo deste plano).
- Testes puros em `tests/lib/*.test.ts`; componentes em `tests/components/*.test.tsx`. Rodar com `npm test` (vitest run). `tests/setup.ts` já importa `fake-indexeddb/auto`.
- Commits frequentes, um por task. Não usar `--no-verify`.
- Migração de schema Dexie: **só adicionar** `this.version(9).stores({...})` — nunca editar versões anteriores.

---

### Task 1: Modelo puro da rotina do dia (`today-routine.ts`)

**Files:**
- Create: `src/lib/today-routine.ts`
- Test: `tests/lib/today-routine.test.ts`

**Interfaces:**
- Produces:
  - `type RoutineBlock = "manha" | "trabalho" | "tarde" | "noite" | "semana"`
  - `type RoutineControl = "check" | "water" | "walk" | "breaks" | "invert" | "link"`
  - `type RoutineLinkKey = "skincareMorning" | "skincareNight" | "workout"`
  - `interface RoutineItem { id: string; block: RoutineBlock; label: string; subtitle?: string; note?: string; to?: string; control?: RoutineControl; optional?: boolean; linkKey?: RoutineLinkKey }`
  - `interface RoutineBlockGroup { id: RoutineBlock; label: string; timeHint?: string; items: RoutineItem[] }`
  - `interface DayRoutine { dayOfWeek: number; blocks: RoutineBlockGroup[] }`
  - `function buildDayRoutine(dayOfWeek: number): DayRoutine`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/today-routine.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("buildDayRoutine", () => {
  it("dia de semana tem os 5 blocos na ordem manhã→semana", () => {
    const r = buildDayRoutine(3); // quarta
    expect(r.blocks.map((b) => b.id)).toEqual(["manha", "trabalho", "tarde", "noite", "semana"]);
  });

  it("dia de semana inclui os itens-âncora da rotina", () => {
    const ids = buildDayRoutine(3).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toEqual(
      expect.arrayContaining([
        "alongamento-manha", "skincare-manha", "sol-manha",
        "agua", "micro-pausas",
        "lanche-saida", "caes", "treino",
        "skincare-noite", "alongamento-noite", "seu-tempo", "diario",
      ]),
    );
  });

  it("itens com estado externo usam control:link e linkKey", () => {
    const items = buildDayRoutine(3).blocks.flatMap((b) => b.items);
    const treino = items.find((i) => i.id === "treino")!;
    expect(treino.control).toBe("link");
    expect(treino.linkKey).toBe("workout");
  });

  it("sábado troca a tarde por dança + caminhada", () => {
    const ids = buildDayRoutine(6).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toContain("danca-sabado");
    expect(ids).not.toContain("treino");
  });

  it("domingo destaca a marmita da semana e não tem treino", () => {
    const ids = buildDayRoutine(0).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toContain("marmita-domingo");
    expect(ids).not.toContain("treino");
  });

  it("água usa control:water e caminhada/inverter existe na tarde", () => {
    const items = buildDayRoutine(2).blocks.flatMap((b) => b.items);
    expect(items.find((i) => i.id === "agua")!.control).toBe("water");
    expect(items.find((i) => i.id === "caes")!.control).toBe("invert");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- today-routine`
Expected: FAIL — "Cannot find module '../../src/lib/today-routine'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/today-routine.ts
// Define o dia como blocos por horário. Módulo puro — Today.tsx só apresenta.
// Itens com estado próprio (skincare/treino) usam control:"link" + linkKey e
// NÃO são marcados aqui; refletem o estado do módulo correspondente.

export type RoutineBlock = "manha" | "trabalho" | "tarde" | "noite" | "semana";
export type RoutineControl = "check" | "water" | "walk" | "breaks" | "invert" | "link";
export type RoutineLinkKey = "skincareMorning" | "skincareNight" | "workout";

export interface RoutineItem {
  id: string;
  block: RoutineBlock;
  label: string;
  subtitle?: string;
  note?: string;
  to?: string;
  control?: RoutineControl;
  optional?: boolean;
  linkKey?: RoutineLinkKey;
}

export interface RoutineBlockGroup {
  id: RoutineBlock;
  label: string;
  timeHint?: string;
  items: RoutineItem[];
}

export interface DayRoutine {
  dayOfWeek: number;
  blocks: RoutineBlockGroup[];
}

const MANHA: RoutineItem[] = [
  { id: "sol-manha", block: "manha", label: "Sol · 10–15 min", subtitle: "Braços e pernas — ataca o cansaço/vitamina D", note: "Rosto com protetor. No fim de semana ou no almoço, sem pressa.", optional: true },
  { id: "alongamento-manha", block: "manha", label: "Alongamento manhã · 15 min", subtitle: "Desperta quadril e coluna", to: "/treino/movimento" },
  { id: "skincare-manha", block: "manha", label: "Skincare manhã", to: "/beleza/pele-cabelo/skincare", control: "link", linkKey: "skincareMorning" },
  { id: "cafe-marmita", block: "manha", label: "Café + whey · montar marmita", subtitle: "Tapioca/cuscuz + ovo · não esquece a marmita" },
];

const TRABALHO: RoutineItem[] = [
  { id: "almoco", block: "trabalho", label: "Almoço", subtitle: "Proteína + feijão/macaxeira + legume", to: "/refeicoes-hoje" },
  { id: "micro-pausas", block: "trabalho", label: "Micro-pausas de postura", subtitle: "Discretas, ao longo do dia", control: "breaks" },
  { id: "agua", block: "trabalho", label: "Água", control: "water" },
];

function tardeSemana(): RoutineItem[] {
  return [
    { id: "lanche-saida", block: "tarde", label: "Lanche da saída (pré-treino)", subtitle: "Banana + ovos ou tapioca+ovo — pra chegar no treino com energia", to: "/refeicoes-hoje" },
    { id: "caes", block: "tarde", label: "Passear com os cães · 1h", subtitle: "Dá pra fazer antes ou depois do treino", control: "invert" },
    { id: "treino", block: "tarde", label: "Treino do dia", subtitle: "+ cardio zona 2 no fim", to: "/treino", control: "link", linkKey: "workout" },
  ];
}

const NOITE: RoutineItem[] = [
  { id: "skincare-noite", block: "noite", label: "Skincare noite", subtitle: "Rosto + clareamento axila/virilha + hidratante corpo", to: "/beleza/pele-cabelo/skincare", control: "link", linkKey: "skincareNight" },
  { id: "alongamento-noite", block: "noite", label: "Alongamento noite · 10 min", subtitle: "Flexibilidade profunda + quadril e assoalho pélvico", to: "/treino/movimento" },
  { id: "seu-tempo", block: "noite", label: "Seu tempo: desenho + leitura", subtitle: "Descanso protegido — vale pro humor e pro sono", optional: true },
  { id: "diario", block: "noite", label: "Diário · como foi o dia?", to: "/trilha/diario" },
];

function buildBlocks(dayOfWeek: number): RoutineBlockGroup[] {
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;

  const tarde: RoutineBlockGroup = isSaturday
    ? {
        id: "tarde", label: "Fim de tarde", items: [
          { id: "danca-sabado", block: "tarde", label: "Dança / rebolado", subtitle: "A sessão divertida da semana", to: "/treino/movimento" },
          { id: "caminhada-sabado", block: "tarde", label: "Caminhada leve", control: "walk" },
        ],
      }
    : isSunday
      ? { id: "tarde", label: "Fim de tarde", items: [
          { id: "descanso-domingo", block: "tarde", label: "Descanso", subtitle: "Dia livre — se quiser, só uma caminhada" },
        ] }
      : { id: "tarde", label: "Fim de tarde", timeHint: "16h30", items: tardeSemana() };

  const semanaItems: RoutineItem[] = [
    { id: "exame-vitd", block: "semana", label: "Marcar exame: vitamina D · ferro · B12", subtitle: "Tem no SUS · resolve o cansaço na raiz", to: "/trilha/marcos" },
  ];
  if (!isSaturday && !isSunday) semanaItems.push({ id: "lembrete-sabado-danca", block: "semana", label: "Sábado · dança / rebolado", to: "/treino/movimento" });
  if (!isSunday) semanaItems.push({ id: "lembrete-domingo-marmita", block: "semana", label: "Domingo · marmita da semana", to: "/trilha/alimentacao" });
  if (isSunday) semanaItems.unshift({ id: "marmita-domingo", block: "semana", label: "Marmita da semana", subtitle: "Frango + ovos + feijão + macaxeira + legumes", to: "/trilha/alimentacao" });

  return [
    { id: "manha", label: "Manhã", timeHint: "~6h", items: MANHA },
    { id: "trabalho", label: "No trabalho", timeHint: "7h–16h", items: TRABALHO },
    tarde,
    { id: "noite", label: "Noite", timeHint: "~20h", items: NOITE },
    { id: "semana", label: "Esta semana", items: semanaItems },
  ];
}

export function buildDayRoutine(dayOfWeek: number): DayRoutine {
  return { dayOfWeek, blocks: buildBlocks(dayOfWeek) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- today-routine`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-routine.ts tests/lib/today-routine.test.ts
git commit -m "feat(hoje): modelo puro da rotina do dia em blocos por horário"
```

---

### Task 2: Store `routineChecks` (Dexie v9) + hook `useRoutineChecks`

**Files:**
- Modify: `src/lib/db.ts` (adicionar interface, tabela e `version(9)`)
- Create: `src/hooks/useRoutineChecks.ts`
- Test: `tests/lib/routine-checks.test.ts`

**Interfaces:**
- Consumes: `db` de `src/lib/db.ts`.
- Produces:
  - `interface RoutineCheck { date: string; itemId: string; done: boolean }` (chave primária composta `[date+itemId]`)
  - `db.routineChecks: Table<RoutineCheck, [string, string]>`
  - `function toggleRoutineCheck(date: string, itemId: string): Promise<void>` (exportada de `useRoutineChecks.ts`)
  - `function useRoutineChecks(date: string): { done: Set<string>; toggle: (itemId: string) => Promise<void> }`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/routine-checks.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { toggleRoutineCheck } from "../../src/hooks/useRoutineChecks";

beforeEach(async () => {
  await db.routineChecks.clear();
});

describe("toggleRoutineCheck", () => {
  it("marca um item como feito na primeira chamada", async () => {
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    const row = await db.routineChecks.get(["2026-07-16", "alongamento-manha"]);
    expect(row?.done).toBe(true);
  });

  it("desmarca ao chamar de novo (toggle)", async () => {
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    const row = await db.routineChecks.get(["2026-07-16", "alongamento-manha"]);
    expect(row?.done).toBe(false);
  });

  it("isola por data — marcar hoje não afeta ontem", async () => {
    await toggleRoutineCheck("2026-07-16", "diario");
    const ontem = await db.routineChecks.get(["2026-07-15", "diario"]);
    expect(ontem).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- routine-checks`
Expected: FAIL — `db.routineChecks` é `undefined` / módulo do hook inexistente.

- [ ] **Step 3a: Adicionar schema no `db.ts`**

Adicionar a interface (perto das outras, antes da classe):

```ts
export interface RoutineCheck {
  date: string;
  itemId: string;
  done: boolean;
}
```

Declarar a tabela na classe `TreinFinalDB` (junto das outras declarações `!: Table<...>`):

```ts
  routineChecks!: Table<RoutineCheck, [string, string]>;
```

Adicionar a nova versão no fim do constructor, **depois** de `this.version(8)`:

```ts
    this.version(9).stores({
      routineChecks: "[date+itemId], date",
    });
```

- [ ] **Step 3b: Criar o hook**

```ts
// src/hooks/useRoutineChecks.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

export async function toggleRoutineCheck(date: string, itemId: string): Promise<void> {
  const current = await db.routineChecks.get([date, itemId]);
  await db.routineChecks.put({ date, itemId, done: !(current?.done ?? false) });
}

export function useRoutineChecks(date: string): { done: Set<string>; toggle: (itemId: string) => Promise<void> } {
  const rows = useLiveQuery(() => db.routineChecks.where("date").equals(date).toArray(), [date]);
  const done = new Set((rows ?? []).filter((r) => r.done).map((r) => r.itemId));
  return { done, toggle: (itemId: string) => toggleRoutineCheck(date, itemId) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- routine-checks`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/hooks/useRoutineChecks.ts tests/lib/routine-checks.test.ts
git commit -m "feat(hoje): persistência de itens marcáveis da rotina (Dexie v9)"
```

---

### Task 3: Componente `RoutineRow` (linha marcável)

**Files:**
- Create: `src/components/RoutineRow.tsx`
- Test: `tests/components/RoutineRow.test.tsx`

**Interfaces:**
- Consumes: `RoutineItem` de `today-routine.ts`.
- Produces:
  - `interface RoutineRowProps { item: RoutineItem; done: boolean; onToggle: () => void; rightSlot?: ReactNode; navValue?: string }`
  - `function RoutineRow(props: RoutineRowProps): JSX.Element`
  - Comportamento: itens com `control: "link"` mostram o `done` externo e **navegam** (não alternam check local); os demais alternam o check ao clicar no corpo. Botões em `rightSlot` não disparam o toggle.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/RoutineRow.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

const item: RoutineItem = { id: "alongamento-manha", block: "manha", label: "Alongamento manhã · 15 min" };

function renderRow(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("RoutineRow", () => {
  it("chama onToggle ao clicar num item de check", async () => {
    const onToggle = vi.fn();
    renderRow(<RoutineRow item={item} done={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /alongamento/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("reflete estado marcado via aria-checked", () => {
    renderRow(<RoutineRow item={item} done={true} onToggle={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("item control:link NÃO alterna check local — vira link de navegação", () => {
    const onToggle = vi.fn();
    const linkItem: RoutineItem = { ...item, id: "treino", control: "link", to: "/treino" };
    renderRow(<RoutineRow item={linkItem} done={false} onToggle={onToggle} />);
    const link = screen.getByRole("link", { name: /alongamento/i });
    expect(link).toHaveAttribute("href", "/treino");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- RoutineRow`
Expected: FAIL — módulo `RoutineRow` inexistente.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/RoutineRow.tsx
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { RoutineItem } from "../lib/today-routine";

export interface RoutineRowProps {
  item: RoutineItem;
  done: boolean;
  onToggle: () => void;
  rightSlot?: ReactNode;
  navValue?: string;
}

function Body({ item, done }: { item: RoutineItem; done: boolean }) {
  return (
    <span className="flex-1 min-w-0">
      <span className={`block text-sm font-medium ${done ? "text-muted line-through" : "text-nude-warm"}`}>{item.label}</span>
      {item.subtitle && <span className="block text-xs text-muted mt-0.5">{item.subtitle}</span>}
      {item.note && <span className="block text-[11px] text-muted opacity-80 mt-0.5">{item.note}</span>}
    </span>
  );
}

function Box({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex-none w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center text-xs ${done ? "bg-nude border-nude text-bg-deep" : "border-muted text-transparent"}`}
    >
      ✓
    </span>
  );
}

export function RoutineRow({ item, done, onToggle, rightSlot, navValue }: RoutineRowProps) {
  const isLink = item.control === "link";
  const cls = `card flex items-start gap-3 ${item.optional ? "opacity-90" : ""}`;

  if (isLink && item.to) {
    return (
      <Link to={item.to} role="link" aria-label={item.label} className={`${cls} hover:border-nude/40`}>
        <Box done={done} />
        <Body item={item} done={done} />
        <span className="flex-none self-center text-xs text-nude">{navValue ?? (done ? "feito ✓" : "ver →")}</span>
      </Link>
    );
  }

  return (
    <div className={cls}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={item.label}
        onClick={onToggle}
        className="flex items-start gap-3 flex-1 text-left"
      >
        <Box done={done} />
        <Body item={item} done={done} />
      </button>
      {item.to && !rightSlot && (
        <Link to={item.to} aria-label={`abrir ${item.label}`} className="flex-none self-center text-xs text-nude">ver →</Link>
      )}
      {rightSlot && <span className="flex-none self-center">{rightSlot}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- RoutineRow`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/components/RoutineRow.tsx tests/components/RoutineRow.test.tsx
git commit -m "feat(hoje): componente RoutineRow (linha marcável + variante link)"
```

---

### Task 4: Foco pelo horário atual (`timeBlockFocus`)

**Files:**
- Modify: `src/lib/today-priority.ts` (adicionar função + tipos, sem quebrar `computeFocus`)
- Test: `tests/lib/today-priority.test.ts` (adicionar casos; não remover os existentes)

**Interfaces:**
- Produces:
  - `function currentBlock(hour: number): "manha" | "trabalho" | "tarde" | "noite"`
  - `function timeBlockFocus(hour: number, dayOfWeek: number): { title: string; subtitle: string; to: string }`
  - Regra de horário: `<11` manhã, `<16` trabalho, `<19` tarde, senão noite.

- [ ] **Step 1: Write the failing test (append ao arquivo existente)**

```ts
// adicionar em tests/lib/today-priority.test.ts
import { currentBlock, timeBlockFocus } from "../../src/lib/today-priority";

describe("currentBlock / timeBlockFocus", () => {
  it("mapeia a hora para o bloco certo", () => {
    expect(currentBlock(6)).toBe("manha");
    expect(currentBlock(13)).toBe("trabalho");
    expect(currentBlock(17)).toBe("tarde");
    expect(currentBlock(21)).toBe("noite");
  });

  it("à tarde num dia de semana, o foco chama o lanche + treino", () => {
    const f = timeBlockFocus(17, 3);
    expect(f.title.toLowerCase()).toContain("treino");
    expect(f.to).toBe("/treino");
  });

  it("no sábado à tarde o foco é a dança", () => {
    const f = timeBlockFocus(17, 6);
    expect(f.title.toLowerCase()).toContain("dança");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- today-priority`
Expected: FAIL — `currentBlock`/`timeBlockFocus` não exportados.

- [ ] **Step 3: Write minimal implementation (append ao `today-priority.ts`)**

```ts
// adicionar ao fim de src/lib/today-priority.ts
export function currentBlock(hour: number): "manha" | "trabalho" | "tarde" | "noite" {
  if (hour < 11) return "manha";
  if (hour < 16) return "trabalho";
  if (hour < 19) return "tarde";
  return "noite";
}

export function timeBlockFocus(hour: number, dayOfWeek: number): { title: string; subtitle: string; to: string } {
  const block = currentBlock(hour);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (block === "manha") {
    return { title: "Comece leve", subtitle: "Alongamento, skincare e café — desperta o corpo", to: "/treino/movimento" };
  }
  if (block === "trabalho") {
    return { title: "No trabalho", subtitle: "Bebe água e faz as micro-pausas de postura", to: "/refeicoes-hoje" };
  }
  if (block === "tarde") {
    if (dayOfWeek === 6) return { title: "Hora da dança", subtitle: "A sessão divertida da semana", to: "/treino/movimento" };
    if (dayOfWeek === 0) return { title: "Descanso", subtitle: "Dia livre — se quiser, uma caminhada leve", to: "/treino/movimento" };
    return { title: "Agora: lanche da saída → treino", subtitle: "Come o pré-treino, passeia com os cães e cai no treino", to: "/treino" };
  }
  return { title: "Antes de dormir", subtitle: isWeekend ? "Skincare, alongamento e seu tempo" : "Skincare, alongamento noite e seu tempo (desenho/leitura)", to: "/beleza/pele-cabelo/skincare" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- today-priority`
Expected: PASS (existentes + 3 novos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-priority.ts tests/lib/today-priority.test.ts
git commit -m "feat(hoje): foco pelo horário atual (timeBlockFocus)"
```

---

### Task 5: Reescrever `Today.tsx` compondo a rotina

**Files:**
- Modify: `src/pages/Today.tsx` (reescrita da apresentação, reaproveitando as queries existentes)
- Test: `tests/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `buildDayRoutine` (Task 1), `useRoutineChecks` (Task 2), `RoutineRow` (Task 3), `timeBlockFocus`/`computeFocus` (Task 4), e as queries já existentes (`todayTemplate`, `sessionsToday`, `morningRoutines/eveningRoutines/todaySkincareLogs`, `dailyLog`, `useSetting`, `useCycleAdvice`, `waistGuard`).

**Notas de composição:**
- O "foco agora" prioriza `computeFocus(...)` (guarda de cintura / avançar ciclo / medir / foto). Se `computeFocus` retornar `null`, cai no `timeBlockFocus(hora, dia)`.
- `control: "link"` resolve o `done` externo por `linkKey`: `workout` → `(sessionsToday ?? 0) > 0`; `skincareMorning`/`skincareNight` → `morningDone`/`eveningDone` (lógica já existente no arquivo). Passar via prop `done` e `navValue`.
- Controles de contador reusam as funções já existentes `addWater(200)` e (para `walk`) `addWalk(10)`, renderizados como `rightSlot`. `breaks` mostra `activeBreakCount` como texto (sem novo backend neste plano). `invert` é um `rightSlot` visual ("⇄ trocar") — sem efeito de dados neste plano (a ordem cães/treino é escolha da usuária; documentar como nota).
- Os demais itens usam `useRoutineChecks(todayISO)`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/pages/Today.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";

beforeEach(async () => {
  await db.routineChecks.clear();
});

describe("Today (backbone)", () => {
  it("renderiza os blocos da rotina do dia", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  it("mostra o item Seu tempo (desenho + leitura)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Seu tempo/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Today`
Expected: FAIL — os textos de bloco ainda não existem na tela antiga (ou a tela ainda não compõe a rotina).

- [ ] **Step 3: Reescrever `Today.tsx`**

Manter todas as queries/`useLiveQuery` já presentes no topo do componente (não remover). Substituir **o `return (...)`** por uma composição baseada em blocos. Trecho novo do corpo de render (abaixo da lógica já existente que calcula `morningDone`, `eveningDone`, `advice`, `focus` via `computeFocus`):

```tsx
  const now = new Date();
  const routine = buildDayRoutine(dayOfWeek);
  const { done, toggle } = useRoutineChecks(todayISO);

  const linkDone = (item: RoutineItem): boolean => {
    if (item.linkKey === "workout") return (sessionsToday ?? 0) > 0;
    if (item.linkKey === "skincareMorning") return !!morningDone;
    if (item.linkKey === "skincareNight") return !!eveningDone;
    return false;
  };

  const isDone = (item: RoutineItem): boolean =>
    item.control === "link" ? linkDone(item) : done.has(item.id);

  const rightSlotFor = (item: RoutineItem) => {
    if (item.control === "water") {
      return (
        <button type="button" onClick={() => void addWater(200)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+200 ml</button>
      );
    }
    if (item.control === "walk") {
      return (
        <button type="button" onClick={() => void addWalk(10)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+10 min</button>
      );
    }
    if (item.control === "invert") {
      return <span className="text-[11px] text-nude border border-bg-border rounded-full px-2 py-1">⇄ trocar</span>;
    }
    if (item.control === "breaks") {
      return <span className="text-[11px] text-nude">{dailyLog?.activeBreakCount ?? 0} hoje</span>;
    }
    return undefined;
  };

  const subtitleFor = (item: RoutineItem): string | undefined => {
    if (item.id === "agua") return `${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`;
    return item.subtitle;
  };

  const activeFocus = focus ?? timeBlockFocus(now.getHours(), dayOfWeek);

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">{now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite"}</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>

      <TodayCard title={`✦ ${activeFocus.title}`} subtitle={activeFocus.subtitle} to={activeFocus.to} variant="highlight" />

      <div className="grid grid-cols-3 gap-2">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
      </div>

      {routine.blocks.map((block) => (
        <section key={block.id} className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <h2 className="text-muted text-xs uppercase tracking-wider">{block.label}</h2>
            {block.timeHint && <span className="text-nude text-xs ml-auto opacity-80">{block.timeHint}</span>}
          </div>
          {block.items.map((item) => (
            <RoutineRow
              key={item.id}
              item={{ ...item, subtitle: subtitleFor(item) }}
              done={isDone(item)}
              onToggle={() => void toggle(item.id)}
              rightSlot={rightSlotFor(item)}
              navValue={item.control === "link" ? (isDone(item) ? "feito ✓" : "ver →") : undefined}
            />
          ))}
        </section>
      ))}

      <ShortcutsGrid />
    </div>
  );
```

Adicionar imports no topo do arquivo:

```tsx
import { buildDayRoutine, type RoutineItem } from "../lib/today-routine";
import { useRoutineChecks } from "../hooks/useRoutineChecks";
import { RoutineRow } from "../components/RoutineRow";
import { computeFocus, timeBlockFocus } from "../lib/today-priority";
import { ShortcutsGrid } from "../components/ShortcutsGrid";
```

> `ShortcutsGrid` é criado na Task 6. Se implementar as tasks fora de ordem, crie um stub `export function ShortcutsGrid(){return null}` primeiro.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Today`
Expected: PASS (2 testes). Rodar também `npm test` completo pra garantir que nada quebrou.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Today.tsx tests/pages/Today.test.tsx
git commit -m "feat(hoje): tela Hoje ancorada na rotina do dia por blocos"
```

---

### Task 6: Grade de atalhos (`ShortcutsGrid`)

**Files:**
- Create: `src/components/ShortcutsGrid.tsx`
- Test: `tests/components/ShortcutsGrid.test.tsx`

**Interfaces:**
- Produces: `function ShortcutsGrid(): JSX.Element` — grade "Quando precisar" com atalhos pras áreas do app que não são diárias. Só rotas **existentes** neste plano (Voz, Depilação, Cabelo, Estilo, Corpo, Maquiagem). Os atalhos de Fertilidade/TRH e Apoio entram quando esses blocos forem construídos (lacunas 1 e 2).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/ShortcutsGrid.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";

describe("ShortcutsGrid", () => {
  it("mostra atalhos pras áreas não-diárias com rotas válidas", () => {
    render(<MemoryRouter><ShortcutsGrid /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /voz/i })).toHaveAttribute("href", "/beleza/voz");
    expect(screen.getByRole("link", { name: /depila/i })).toHaveAttribute("href", "/beleza/depilacao");
    expect(screen.getByRole("link", { name: /estilo/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ShortcutsGrid`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/ShortcutsGrid.tsx
import { Link } from "react-router-dom";

interface Shortcut { icon: string; label: string; sub: string; to: string }

const SHORTCUTS: Shortcut[] = [
  { icon: "🎙️", label: "Voz", sub: "treino diário 15 min", to: "/beleza/voz" },
  { icon: "🪒", label: "Depilação", sub: "registro + plano", to: "/beleza/depilacao" },
  { icon: "💇🏻", label: "Cabelo", sub: "corte do cacho · cuidados", to: "/beleza/pele-cabelo/haircare" },
  { icon: "👗", label: "Estilo", sub: "discreto · combinações", to: "/beleza/estilo/pecas" },
  { icon: "◈", label: "Corpo", sub: "medidas · fotos", to: "/corpo/medidas" },
  { icon: "❀", label: "Maquiagem", sub: "rotinas", to: "/beleza/maquiagem" },
];

export function ShortcutsGrid() {
  return (
    <section className="space-y-2">
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Quando precisar</h2>
      <div className="grid grid-cols-2 gap-2">
        {SHORTCUTS.map((s) => (
          <Link key={s.label} to={s.to} aria-label={s.label} className="card block">
            <span className="text-base">{s.icon}</span>
            <span className="block text-nude-warm text-sm font-medium mt-1.5">{s.label}</span>
            <span className="block text-muted text-[11px] mt-0.5">{s.sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

> Antes de commitar, confirmar as rotas reais em `src/main.tsx`/router (ex.: a rota de peças pode ser `/beleza/estilo/pecas` ou `/beleza/estilo/garments`). Ajustar os `to` pros paths que existem no router; o teste de estilo pode ser afrouxado pra checar só presença do link se necessário.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ShortcutsGrid`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ShortcutsGrid.tsx tests/components/ShortcutsGrid.test.tsx
git commit -m "feat(hoje): grade de atalhos das áreas não-diárias"
```

---

## Self-Review

**Spec coverage (Bloco 1 do spec):**
- Blocos por horário (manhã/trabalho/tarde/noite/semana) → Task 1 + Task 5. ✓
- Tudo marcável com ✓ persistido → Task 2 + Task 3. ✓
- Foco "agora" pelo horário → Task 4 + composição na Task 5. ✓
- Sol opcional/fim de semana · lanche da saída · seu tempo · inverter cães↔treino → itens em Task 1; inverter é visual (documentado). ✓
- Comportamento sábado (dança) / domingo (marmita) → Task 1 (`buildDayRoutine`). ✓
- Contextuais medir/foto → permanecem via `computeFocus` (reusado na Task 5). ✓
- Atalhos ("quando precisar") → Task 6. Fertilidade/Apoio adiados pras lacunas (documentado). ✓
- Vitalidade (marco de exame vit D) → item `exame-vitd` no bloco "semana" (Task 1). ✓

**Placeholders:** nenhum passo com "TBD"/"handle edge cases"; código real em cada step. A única dependência de ordem (`ShortcutsGrid` na Task 5) está sinalizada com stub. ✓

**Type consistency:** `RoutineItem`, `RoutineLinkKey`, `useRoutineChecks(date).{done,toggle}`, `RoutineRowProps`, `timeBlockFocus(hour,dayOfWeek)` usados de forma idêntica entre tasks. ✓

**Fora de escopo (viram planos próprios):** conteúdo real de Treino/Movimento/Nutrição/Pele/Cabelo e as 3 lacunas — este plano só monta a **casca de rotina** do Hoje que aponta pra eles.

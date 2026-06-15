# Rotina consolidada do dia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar a tela "Hoje" em 3 blocos (Cuidados ao acordar / Treino + cardio / Antes de dormir) + apoio, eliminando a esteira dupla e os nags fragmentados, com um único lembrete noturno de presença.

**Architecture:** Extrair a classificação manhã/noite dos cuidados e a lista de práticas de presença num módulo puro testável (`src/lib/daily-routine.ts`); `Today.tsx` consome esse módulo só para apresentar. O scheduler troca os toques fixos de Postura+Caminhada por um lembrete noturno único reutilizando `shouldRemindOncePerDay`. Settings ganham `presencaReminderTime`/`lastPresencaReminderAt` e perdem os de postura/caminhada.

**Tech Stack:** React + TypeScript, Dexie (IndexedDB), Vitest, Tailwind. Spec: `docs/superpowers/specs/2026-06-15-rotina-consolidada-design.md`.

---

### Task 1: Settings — lembrete de presença substitui postura+caminhada

**Files:**
- Modify: `src/lib/settings-helpers.ts` (type `Settings` ~13-42, `DEFAULTS` ~44-83)
- Modify: `src/hooks/useSetting.ts` (`DEFAULTS` ~5-44)

Nenhum outro arquivo referencia `posturaReminderTime`/`walkReminderTime`/`lastPosturaReminderAt`/`lastWalkReminderAt` além do scheduler (alterado na Task 4), então é seguro removê-los. `walkGoalMin` permanece (usado em Today).

- [ ] **Step 1: Atualizar o tipo `Settings` em `settings-helpers.ts`**

Trocar as quatro linhas de postura/caminhada por presença:

```ts
  walkGoalMin: number;
  presencaReminderTime: string;
  lastPresencaReminderAt: string;
```

(Removidas: `posturaReminderTime`, `walkReminderTime`, `lastPosturaReminderAt`, `lastWalkReminderAt`.)

- [ ] **Step 2: Atualizar `DEFAULTS` em `settings-helpers.ts`**

```ts
  walkGoalMin: 30,
  presencaReminderTime: "21:00",
  lastPresencaReminderAt: "",
```

- [ ] **Step 3: Espelhar a mesma mudança no `DEFAULTS` de `useSetting.ts`**

Trocar, no objeto `DEFAULTS` de `src/hooks/useSetting.ts`:

```ts
  walkGoalMin: 30,
  presencaReminderTime: "21:00",
  lastPresencaReminderAt: "",
```

(Remover as mesmas quatro chaves de postura/caminhada.)

- [ ] **Step 4: Compilar pra confirmar que não há referências órfãs**

Run: `npx tsc -b`
Expected: erros APENAS em `src/lib/notification-scheduler.ts` (usa as chaves removidas) — serão corrigidos na Task 4. Se aparecer erro em qualquer outro arquivo, pare e investigue.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-helpers.ts src/hooks/useSetting.ts
git commit -m "feat(rotina): setting presencaReminderTime substitui postura/caminhada"
```

---

### Task 2: Módulo puro — classificação de cuidados manhã/noite

**Files:**
- Create: `src/lib/daily-routine.ts`
- Test: `tests/lib/daily-routine.test.ts`

Skincare manhã/noite têm tratamento próprio em `Today.tsx` (estado "feito"); este módulo cobre só os cuidados extras (cabelo/maquiagem/look/clareamento/unhas/depilação).

- [ ] **Step 1: Escrever o teste que falha**

Create `tests/lib/daily-routine.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CARE_ITEMS, careItemsFor } from "../../src/lib/daily-routine";

describe("careItemsFor", () => {
  it("manhã traz cabelo/maquiagem/look (sem skincare)", () => {
    const ids = careItemsFor("morning").map((c) => c.id);
    expect(ids).toEqual(["cabelo-finalizacao", "maquiagem", "estilo-look"]);
  });

  it("noite traz clareamento/cabelo/unhas/depilação (sem skincare)", () => {
    const ids = careItemsFor("night").map((c) => c.id);
    expect(ids).toEqual(["clareamento", "cabelo-tratamento", "unhas", "depilacao"]);
  });

  it("todo item tem rota e label, e nenhum é skincare", () => {
    for (const c of CARE_ITEMS) {
      expect(c.to.startsWith("/beleza")).toBe(true);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.id).not.toContain("skincare");
    }
  });
});
```

- [ ] **Step 2: Rodar o teste pra ver falhar**

Run: `npx vitest run tests/lib/daily-routine.test.ts`
Expected: FAIL — "Cannot find module '../../src/lib/daily-routine'".

- [ ] **Step 3: Implementar o módulo**

Create `src/lib/daily-routine.ts`:

```ts
// Classificação dos cuidados de beleza por hora do dia (manhã/noite) e a
// lista de práticas de presença. Módulo puro — Today.tsx só apresenta.
export type TimeOfDay = "morning" | "night";

export interface CareItem {
  id: string;
  label: string;
  to: string; // rota existente em /beleza/...
  time: TimeOfDay;
  cadence?: string; // nota de cadência; ausente = diário/leve
  optional?: boolean;
}

// Skincare manhã/noite NÃO entram aqui (têm estado "feito" próprio em Today).
export const CARE_ITEMS: CareItem[] = [
  { id: "cabelo-finalizacao", label: "Cabelo — finalização do dia", to: "/beleza/pele-cabelo/haircare", time: "morning" },
  { id: "maquiagem", label: "Maquiagem (se for sair)", to: "/beleza/maquiagem", time: "morning", optional: true },
  { id: "estilo-look", label: "Look do dia", to: "/beleza/estilo/looks", time: "morning", optional: true },
  { id: "clareamento", label: "Clareamento", to: "/beleza/pele-cabelo/clareamento", time: "night", cadence: "nos dias da onda" },
  { id: "cabelo-tratamento", label: "Cabelo — tratamento do cronograma", to: "/beleza/pele-cabelo/haircare", time: "night", cadence: "cronograma semanal" },
  { id: "unhas", label: "Unhas — lixar", to: "/beleza/pele-cabelo/unhas", time: "night", cadence: "a cada 3–4 dias" },
  { id: "depilacao", label: "Depilação", to: "/beleza/depilacao", time: "night", cadence: "na cadência" },
];

export function careItemsFor(time: TimeOfDay): CareItem[] {
  return CARE_ITEMS.filter((c) => c.time === time);
}
```

- [ ] **Step 4: Rodar o teste pra ver passar**

Run: `npx vitest run tests/lib/daily-routine.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/daily-routine.ts tests/lib/daily-routine.test.ts
git commit -m "feat(rotina): módulo de classificação de cuidados manhã/noite"
```

---

### Task 3: Práticas de presença + sugestão do dia

**Files:**
- Modify: `src/lib/daily-routine.ts`
- Test: `tests/lib/daily-routine.test.ts`

- [ ] **Step 1: Adicionar testes que falham**

Acrescentar a `tests/lib/daily-routine.test.ts`:

```ts
import { PRESENCE_ITEMS, presenceSuggestionForDay } from "../../src/lib/daily-routine";

describe("presença", () => {
  it("tem pelo menos postura, gingado e uma sequência de intimidade", () => {
    const ids = PRESENCE_ITEMS.map((p) => p.id);
    expect(ids).toContain("postura-silhueta-diaria");
    expect(ids).toContain("sensual-andar-gingado");
    expect(ids.some((id) => id.startsWith("intimidade-"))).toBe(true);
  });

  it("sugestão é determinística e fica dentro da lista pra qualquer dia 0-6", () => {
    for (let d = 0; d < 7; d++) {
      const s = presenceSuggestionForDay(d);
      expect(PRESENCE_ITEMS).toContainEqual(s);
    }
    expect(presenceSuggestionForDay(0)).toEqual(presenceSuggestionForDay(7));
  });
});
```

- [ ] **Step 2: Rodar pra ver falhar**

Run: `npx vitest run tests/lib/daily-routine.test.ts`
Expected: FAIL — `PRESENCE_ITEMS`/`presenceSuggestionForDay` não exportados.

- [ ] **Step 3: Implementar**

Acrescentar a `src/lib/daily-routine.ts` (ids são sequências reais já semeadas em `sequences-seed.ts`):

```ts
export interface PresenceItem {
  id: string;
  label: string;
  to: string;
}

export const PRESENCE_ITEMS: PresenceItem[] = [
  { id: "postura-silhueta-diaria", label: "Postura & silhueta", to: "/treino/movimento/postura-silhueta-diaria" },
  { id: "corporal-caminhada", label: "Caminhada feminina", to: "/treino/movimento/corporal-caminhada" },
  { id: "sensual-andar-gingado", label: "Andar com gingado", to: "/treino/movimento/sensual-andar-gingado" },
  { id: "soltura-tronco-quadril", label: "Soltura de tronco e quadril", to: "/treino/movimento/soltura-tronco-quadril" },
  { id: "intimidade-flex-passiva", label: "Flexibilidade passiva a dois", to: "/treino/movimento/intimidade-flex-passiva" },
  { id: "intimidade-grinding", label: "Grinding pélvico", to: "/treino/movimento/intimidade-grinding" },
  { id: "intimidade-cavalgar", label: "Cavalgar com controle", to: "/treino/movimento/intimidade-cavalgar" },
];

export function presenceSuggestionForDay(dayOfWeek: number): PresenceItem {
  return PRESENCE_ITEMS[dayOfWeek % PRESENCE_ITEMS.length];
}
```

- [ ] **Step 4: Rodar pra ver passar**

Run: `npx vitest run tests/lib/daily-routine.test.ts`
Expected: PASS (5 testes no total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/daily-routine.ts tests/lib/daily-routine.test.ts
git commit -m "feat(rotina): lista de presença + sugestão do dia"
```

---

### Task 4: Scheduler — lembrete noturno único de presença

**Files:**
- Modify: `src/lib/notification-scheduler.ts:76-97` (blocos de Postura e Caminhada)

- [ ] **Step 1: Substituir os dois blocos (Postura + Caminhada) por um único de presença**

Trocar o trecho atual (das linhas dos comentários `// Postura ...` até o fim do bloco `// Caminhada ...`, atualmente ~76-97) por:

```ts
  // Presença (uma vez/dia, à noite, se não praticou nada de presença hoje)
  const presencaTime = await getSetting("presencaReminderTime");
  const lastPresenca = await getSetting("lastPresencaReminderAt");
  const [prH, prM] = presencaTime.split(":").map(Number);
  const PRESENCE_SEQUENCE_IDS = [
    "postura-silhueta-diaria",
    "corporal-caminhada",
    "sensual-andar-gingado",
    "soltura-tronco-quadril",
    "intimidade-flex-passiva",
    "intimidade-grinding",
    "intimidade-cavalgar",
  ];
  const presencaDone =
    (await db.practiceLogs
      .where("date")
      .equals(todayISO)
      .and((p) => PRESENCE_SEQUENCE_IDS.includes(p.sequenceId))
      .count()) > 0;
  if (shouldRemindOncePerDay({ currentMin, targetMin: prH * 60 + prM, lastNotifiedDate: lastPresenca, todayISO, done: presencaDone })) {
    notify("Antes de dormir", "Um pouco de presença: postura, gingado, dança ou intimidade");
    await setSetting("lastPresencaReminderAt", todayISO);
  }
```

Observação: `currentMin` e `todayISO` já estão definidos acima no `tick()`; reutilize-os (não redeclare).

- [ ] **Step 2: Compilar pra confirmar que sumiram os erros da Task 1**

Run: `npx tsc -b`
Expected: PASS, sem erros (as chaves removidas na Task 1 não são mais referenciadas).

- [ ] **Step 3: Rodar os testes de notificação existentes**

Run: `npx vitest run tests/lib/notifications.test.ts`
Expected: PASS (sem regressão — `shouldRemindOncePerDay` inalterado).

- [ ] **Step 4: Commit**

```bash
git add src/lib/notification-scheduler.ts
git commit -m "feat(rotina): lembrete noturno único de presença no scheduler"
```

---

### Task 5: Today.tsx — 3 blocos + apoio

**Files:**
- Modify: `src/pages/Today.tsx`

Reorganiza a renderização. Mantém os hooks/queries existentes; remove o cartão separado de Caminhada (vira finalizador dentro do bloco de treino) e agrupa postura/movimento/apresentação num bloco "Antes de dormir". Usa o módulo da Task 2/3.

- [ ] **Step 1: Adicionar imports do módulo**

Após os imports existentes em `src/pages/Today.tsx`, adicionar:

```ts
import { careItemsFor, presenceSuggestionForDay } from "../lib/daily-routine";
```

- [ ] **Step 2: Derivar a sugestão de presença do dia**

Dentro do componente, perto dos outros cálculos derivados (após `const todayISO = ...`), adicionar:

```ts
  const presencaSeq = presenceSuggestionForDay(dayOfWeek);
  const morningCare = careItemsFor("morning");
  const nightCare = careItemsFor("night");
```

- [ ] **Step 3: Substituir o bloco `return (...)` pela estrutura reorganizada**

Substituir todo o JSX retornado (do `<div className="p-4 pb-24 space-y-3">` até o `</div>` final do componente) por:

```tsx
    <div className="p-4 pb-24 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">Bom dia</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>

      {focus && (
        <TodayCard title={`✦ ${focus.title}`} subtitle={focus.subtitle} to={focus.to} variant="highlight" />
      )}

      <div className="grid grid-cols-3 gap-2">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
      </div>

      {/* BLOCO 1 — Cuidados ao acordar */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Cuidados ao acordar</h2>
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
      {morningCare.map((c) => (
        <TodayCard key={c.id} title={c.label} subtitle={c.cadence ?? (c.optional ? "se quiser" : "diário")} to={c.to} />
      ))}

      {/* BLOCO 2 — Treino + cardio */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Treino + cardio</h2>
      {todayTemplate ? (
        <TodayCard
          title={todayTemplate.name}
          subtitle={`Treino + cardio · ${todayTemplate.durationMin} min + zona 2 · ${(sessionsToday ?? 0) > 0 ? "concluído ✓" : "ainda não feito"}`}
          note="Aquece curto → levanta peso → fecha com a zona 2 na MESMA esteira (cardio é finalizador, não aquecimento). Bater o cardio aqui já cumpre a caminhada do dia."
          to={`/treino/sessao/${todayTemplate.id}`}
          variant={(sessionsToday ?? 0) > 0 ? "default" : "highlight"}
        />
      ) : (
        <TodayCard title="Descanso" subtitle="Hoje não tem treino — se quiser, faça só a caminhada zona 2" />
      )}
      <TodayCard
        title="Caminhada / cardio zona 2"
        subtitle={`${dailyLog?.walkMin ?? 0} / ${walkGoalMin} min`}
        note="Esteira inclinada 8–12% · ~5 km/h · zona 2 (ofegante, mas ainda conversando)"
        rightSlot={
          <button type="button" onClick={() => void addWalk(10)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">
            +10 min
          </button>
        }
      />

      {/* APOIO */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Apoio</h2>
      <TodayCard
        title="Hidratação"
        subtitle={`${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`}
        rightSlot={
          <button type="button" onClick={() => void addWater(200)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">
            +200ml
          </button>
        }
      />
      <TodayCard title="Refeições" subtitle={`${mealsDone}/4 do plano`} to="/refeicoes-hoje" />
      <TodayCard title="Diário" subtitle={dailyLog?.mood ? "humor registrado" : "como foi o dia?"} to="/trilha/diario" />

      {daysSinceMeasurement !== null && daysSinceMeasurement > 28 && (
        <TodayCard title="Hora de medir" subtitle={`Última medida há ${daysSinceMeasurement} dias`} to="/corpo/medidas" variant="highlight" />
      )}
      {daysSincePhoto !== null && daysSincePhoto > 14 && (
        <TodayCard title="Hora de tirar fotos" subtitle={`Última foto há ${daysSincePhoto} dias`} to="/corpo/fotos" variant="highlight" />
      )}

      {/* BLOCO 3 — Antes de dormir */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Antes de dormir</h2>
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
      {nightCare.map((c) => (
        <TodayCard key={c.id} title={c.label} subtitle={c.cadence ?? "diário"} to={c.to} />
      ))}
      <TodayCard
        title="Presença & intimidade"
        subtitle={`Sugestão de hoje: ${presencaSeq.label}`}
        note="Opcional, sem pressa. Postura, gingado, dança, mobilidade ou intimidade — pegue o que pedir o corpo."
        to={presencaSeq.to}
      />
      <TodayCard title="Ver tudo de movimento" subtitle="postura · dança · gingado · intimidade · voz" to="/treino/movimento" />
    </div>
```

- [ ] **Step 4: Remover código morto**

Após a substituição, remover do componente as consts que ficaram sem uso para o `tsc` não acusar variável não lida: `suggestedSeq`, `practiceToday`, `APRESENTACAO_IDS`, `apresentacaoSeq`, `apresentacaoToday`, `posturaDoneToday`, e `sequences` (a query `db.danceSequences`) se não for mais referenciada. **Mantenha** `walkGoalMin` (usado no cartão de cardio).

Verifique referência a referência: mantenha apenas o que o novo JSX usa (`todayTemplate`, `sessionsToday`, `dailyLog`, `goalMl`, `walkGoalMin`, `mealsDone`, `morningRoutines`, `eveningRoutines`, `morningDone`, `eveningDone`, `daysSinceMeasurement`, `daysSincePhoto`, `focus`, `last7DaysTraining`, `last7DaysSkincare`, `addWater`, `addWalk`, `presencaSeq`, `morningCare`, `nightCare`).

- [ ] **Step 5: Compilar e rodar a suíte**

Run: `npx tsc -b && npx vitest run`
Expected: build PASS sem erros de variável não usada; todos os testes PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Today.tsx
git commit -m "feat(rotina): tela Hoje em 3 blocos (cuidados/treino+cardio/antes de dormir)"
```

---

### Task 6: Settings.tsx — horário do lembrete de presença

**Files:**
- Modify: `src/pages/Settings.tsx` (~11-13 hooks; ~183-193 inputs)

- [ ] **Step 1: Adicionar o hook do setting**

Junto dos outros `useSetting` no topo do componente (~11-13):

```ts
  const presenca = useSetting("presencaReminderTime");
```

- [ ] **Step 2: Adicionar o input de horário**

Após o input de lembrete noturno (evening, ~193), adicionar um campo análogo:

```tsx
          <label className="block text-muted text-sm mt-3">Lembrete de presença (noite)</label>
          <input type="time" value={presenca} onChange={(e) => void setSetting("presencaReminderTime", e.target.value)}
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
```

(Use exatamente o mesmo wrapper/classes do input de `evening` acima; replique o markup vizinho se ele tiver um container.)

- [ ] **Step 3: Compilar**

Run: `npx tsc -b`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat(rotina): horário do lembrete de presença nas Configurações"
```

---

### Task 7: Verificação final

- [ ] **Step 1: Build + suíte completa**

Run: `npm run build && npx vitest run`
Expected: build PASS; todos os testes PASS (incluindo os 5 novos de `daily-routine`).

- [ ] **Step 2: Conferência manual rápida (opcional)**

Run: `npm run dev` e abrir a Home — confirmar os 3 cabeçalhos (Cuidados ao acordar / Treino + cardio / Antes de dormir), nenhum emoji, e o cartão de Caminhada agora dentro de Treino + cardio.

- [ ] **Step 3: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore(rotina): ajustes finais da rotina consolidada"
```

---

## Notas de verificação contra o spec

- Bloco 1 Cuidados ao acordar → Task 2 + Task 5 (skincare manhã + `morningCare`).
- Bloco 2 Treino + cardio (esteira uma vez, cardio finalizador, conta a meta) → Task 5 (cartões + nota; sem cartão de caminhada concorrente).
- Bloco 3 Antes de dormir (cuidados da noite + presença/intimidade) → Task 2/3 + Task 5.
- Lembrete noturno único substituindo postura+caminhada → Task 1 + Task 4 + Task 6.
- Voz como prática opcional no movimento/presença → presente via "Ver tudo de movimento" (rota `/treino/movimento`); a voz vive em `/beleza/voz`, linkada pelo módulo de Beleza — não entra em Cuidados (conforme spec).
- Sem criar tracking novo de cadência → cuidados por cadência aparecem como link discreto com a nota (Task 2/5).
- Sem emoji → cabeçalhos tipográficos + glifo `✦` só no foco (Task 5).
```

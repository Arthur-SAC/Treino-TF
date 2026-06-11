# Postura/Gestual à mostra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promover os 4 gestuais femininos (`corporal-*`) de "sensual" enterrado a uma categoria própria "apresentacao", com seção no MovementHome e card rotativo no Hoje.

**Architecture:** Recategorização no seed + bump de versão de movimento (re-seed por upsert) + duas edições de UI. Sem lógica nova complexa; conteúdo (`moves`) intacto.

**Tech Stack:** React 18 + TypeScript + Vite, Dexie, Vitest.

---

### Task 1: Categoria "apresentacao" no tipo + recategorização do seed

**Files:**
- Modify: `src/lib/db.ts` (union `DanceSequence.category`)
- Modify: `src/data/sequences-seed.ts` (4 entradas `corporal-*`)
- Modify: `src/lib/movement-seed.ts` (`MOVEMENT_VERSION`)
- Test: `tests/lib/movement-seed.test.ts` (acrescentar asserção)

- [ ] **Step 1: Write the failing test (append)**

```ts
// adicionar dentro do describe existente em tests/lib/movement-seed.test.ts,
// junto das outras asserções de category (após a linha do twerk):
    expect(seqs.filter((s) => s.category === "apresentacao").length).toBe(4);
    for (const s of seqs.filter((x) => x.category === "apresentacao")) {
      expect(s.moves.length).toBeGreaterThan(0);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- movement-seed`
Expected: FAIL — `apresentacao` count é 0 (ainda são "sensual").

- [ ] **Step 3a: Adicionar o valor ao union em `src/lib/db.ts`**

Trocar:

```ts
  category: "mobilidade" | "danca" | "pelvic" | "sensual" | "flexibilidade" | "twerk";
```

por:

```ts
  category: "mobilidade" | "danca" | "pelvic" | "sensual" | "flexibilidade" | "twerk" | "apresentacao";
```

- [ ] **Step 3b: Recategorizar e renomear os 4 `corporal-*` em `src/data/sequences-seed.ts`**

Aplicar exatamente (cada par é um find/replace independente, preservando o resto do objeto):

```ts
// corporal-postura-sentar
    name: "Postura e como sentar (feminino sensual)",
    category: "sensual",
// vira:
    name: "Postura e como sentar",
    category: "apresentacao",
```

```ts
// corporal-caminhada
    name: "Caminhada sensual",
    category: "sensual",
// vira:
    name: "Caminhada feminina",
    category: "apresentacao",
```

```ts
// corporal-gestual-maos (só a categoria; nome mantém)
    name: "Gestual de mãos e cabelo",
    category: "sensual",
// vira:
    name: "Gestual de mãos e cabelo",
    category: "apresentacao",
```

```ts
// corporal-olhar-expressao
    name: "Olhar e expressão sedutora",
    category: "sensual",
// vira:
    name: "Olhar e expressão",
    category: "apresentacao",
```

Atenção: existem outras sequências com `category: "sensual"` que NÃO devem mudar (dança
avançada). Edite apenas os blocos cujo `id` começa com `corporal-`. Para garantir unicidade do
find/replace, inclua a linha `name:` correspondente no casamento (como mostrado acima).

- [ ] **Step 3c: Bump da versão em `src/lib/movement-seed.ts`**

Trocar `const MOVEMENT_VERSION = 5;` por `const MOVEMENT_VERSION = 6;`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- movement-seed`
Expected: PASS. Rode também `npm test -- movement` (e a suíte de data) pra garantir que nada que conta "sensual" quebrou.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/data/sequences-seed.ts src/lib/movement-seed.ts tests/lib/movement-seed.test.ts
git commit -m "feat(apresentacao): gestuais corporal-* viram categoria propria (v6)"
```

---

### Task 2: Seção "Apresentação" no MovementHome

**Files:**
- Modify: `src/pages/workout/MovementHome.tsx`

- [ ] **Step 1: Adicionar o filtro da categoria**

Após a linha `const mobilidade = sequences?.filter((s) => s.category === "mobilidade") ?? [];`,
adicionar:

```ts
  const apresentacao = sequences?.filter((s) => s.category === "apresentacao") ?? [];
```

- [ ] **Step 2: Renderizar a seção logo após o bloco "Mobilidade"**

Localizar o fim do bloco de Mobilidade:

```tsx
      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Mobilidade</h2>
      <div className="space-y-2 mb-4">
        {mobilidade.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>
```

e inserir IMEDIATAMENTE ABAIXO:

```tsx
      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Apresentação · gestual e postura feminina no dia a dia</h2>
      <div className="space-y-2 mb-4">
        {apresentacao.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/workout/MovementHome.tsx
git commit -m "feat(apresentacao): secao propria no MovementHome"
```

---

### Task 3: Card "Apresentação" rotativo no Hoje

**Files:**
- Modify: `src/pages/Today.tsx`

- [ ] **Step 1: Computar a sequência de apresentação do dia**

Localizar o bloco do `practiceToday` (a useLiveQuery logo após o `suggestedSeq`):

```ts
  const practiceToday = useLiveQuery(
    async () => {
      if (!suggestedSeq) return 0;
      return db.practiceLogs.where("date").equals(todayISO).and((p) => p.sequenceId === suggestedSeq.id).count();
    },
    [todayISO, suggestedSeq?.id],
  );
```

e adicionar IMEDIATAMENTE ABAIXO:

```ts
  const APRESENTACAO_IDS = [
    "corporal-postura-sentar",
    "corporal-caminhada",
    "corporal-gestual-maos",
    "corporal-olhar-expressao",
  ];
  const apresentacaoSeq = sequences?.find((s) => s.id === APRESENTACAO_IDS[dayOfWeek % 4]) ?? null;
  const apresentacaoToday = useLiveQuery(
    async () => {
      if (!apresentacaoSeq) return 0;
      return db.practiceLogs.where("date").equals(todayISO).and((p) => p.sequenceId === apresentacaoSeq.id).count();
    },
    [todayISO, apresentacaoSeq?.id],
  );
```

- [ ] **Step 2: Renderizar o card após o card de Postura**

Localizar o card de Postura:

```tsx
      <TodayCard
        title="Postura"
        subtitle={`Rotina diária · 7 min · ${(posturaDoneToday ?? 0) > 0 ? "feito ✓" : "pendente"}`}
        to="/treino/movimento/postura-silhueta-diaria"
        variant={(posturaDoneToday ?? 0) === 0 ? "highlight" : "default"}
      />
```

e inserir IMEDIATAMENTE ABAIXO:

```tsx
      {apresentacaoSeq && (
        <TodayCard
          title="Apresentação"
          subtitle={`${apresentacaoSeq.name} · ${apresentacaoSeq.durationMin} min · ${(apresentacaoToday ?? 0) > 0 ? "feito ✓" : "pendente"}`}
          to={`/treino/movimento/${apresentacaoSeq.id}`}
          variant={(apresentacaoToday ?? 0) === 0 ? "highlight" : "default"}
        />
      )}
```

- [ ] **Step 3: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Today.tsx
git commit -m "feat(apresentacao): card rotativo no Hoje"
```

---

### Task 4: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos verdes (incluindo `today-treino.smoke`, `today-focus.smoke`, `movement-seed`).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

---

## Notas

- **Re-seed:** o bump `MOVEMENT_VERSION` 5 → 6 faz o `seedMovement` re-aplicar (upsert) as
  categorias novas no banco já populado da usuária — sem isso, a recategorização não apareceria.
- **Ambiente Windows:** `npm` não está no PATH; use
  `$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" ...`
  em cada linha (o PATH não persiste entre comandos).
- **Sensual permanece:** sobram 4 sequências `category: "sensual"` (dança avançada) — a seção
  Sensual do MovementHome continua válida.

# Onda Cabelo — jornada de crescimento — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Execute task-by-task, verify, commit.

**Goal:** Transformar o módulo de cabelo de "manter pixie" em hub de jornada de crescimento (guias + cronograma re-tematizado) e corrigir o marco da Trilha.

**Architecture:** Conteúdo estático (`hair-guide-seed.ts`) renderizado na `HaircareHome`; sem migração de schema; migração de marco na versão 4.

Spec: `docs/superpowers/specs/2026-06-10-onda-cabelo-crescimento-design.md`

---

## Task 1: Conteúdo dos guias (hair-guide-seed.ts)

**Files:** Create `src/data/hair-guide-seed.ts`; Test `tests/data/hair-guide-seed.test.ts`

- [ ] **Step 1: Teste de conteúdo (falha primeiro)** — `tests/data/hair-guide-seed.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { HAIR_GUIDE } from "../../src/data/hair-guide-seed";

describe("HAIR_GUIDE", () => {
  it("tem 4 seções com tips não-vazias e ids únicos", () => {
    expect(HAIR_GUIDE).toHaveLength(4);
    const ids = new Set<string>();
    for (const s of HAIR_GUIDE) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(4);
  });
});
```
- [ ] **Step 2: Rodar e ver falhar** — `npm test -- hair-guide` → FAIL (módulo inexistente).
- [ ] **Step 3: Criar o seed** com a interface `HairGuideSection` e 4 seções (crescimento, retenção, fase-chata, definição) conforme §5 do spec.
- [ ] **Step 4: Rodar e ver passar** — `npm test -- hair-guide` → PASS.
- [ ] **Step 5: Commit** — `feat(cabelo): conteúdo de guia da jornada de crescimento`.

## Task 2: Re-tematizar HaircareHome

**Files:** Modify `src/pages/beauty/HaircareHome.tsx`

- [ ] **Step 1:** Importar `HAIR_GUIDE`; trocar título "Cabelo" → "Cabelo · jornada de crescimento"; adicionar intro curta; renderizar os 4 cards de guia (expansíveis com `<details>`) acima do cronograma; trocar a cópia "Cronograma capilar — pixie cacheado" → "Cronograma capilar — crescimento saudável" e o texto associado. Registro/histórico inalterados.
- [ ] **Step 2:** `npx tsc --noEmit` → sem erros.
- [ ] **Step 3: Commit** — `feat(cabelo): tela vira hub de jornada de crescimento`.

## Task 3: Atualizar o marco da Trilha + migração

**Files:** Modify `src/data/milestones-seed.ts`, `src/lib/path-seed.ts`, `tests/lib/path-seed.test.ts`

- [ ] **Step 1: Teste de migração (falha primeiro)** em `tests/lib/path-seed.test.ts`:
```ts
  it("migra o marco de pixie pro de crescimento", async () => {
    await db.milestones.add({ datePlanned: "2026-12-01", title: "Marco visual: pixie cacheado formato definido", category: "fisico" } as never);
    await db.settings.put({ key: "pathSeeded", value: true });
    await db.settings.put({ key: "milestoneSeedVersion", value: 3 });
    await seedPath();
    const titles = (await db.milestones.toArray()).map((m) => m.title);
    expect(titles.some((t) => t.includes("pixie"))).toBe(false);
    expect(titles.some((t) => t.includes("transição"))).toBe(true);
  });
```
- [ ] **Step 2: Rodar e ver falhar** — `npm test -- path-seed`.
- [ ] **Step 3:** Em `milestones-seed.ts`, trocar o objeto do mês 6 "pixie cacheado formato definido" pelo marco de transição (título "💇‍♀️ Cabelo na fase de transição — manter forma e saúde crescendo" + notas do §6).
- [ ] **Step 4:** Em `path-seed.ts`: `MILESTONE_SEED_VERSION = 4`; adicionar no bloco de migração:
```ts
      if (msVersion < 4) {
        const antigos = await db.milestones.where("category").equals("fisico").toArray();
        const pixie = antigos.find((m) => m.title.includes("pixie"));
        const novo = MILESTONES.find((m) => m.title.includes("transição"));
        if (novo) {
          if (pixie?.id !== undefined) {
            await db.milestones.update(pixie.id, { title: novo.title, notes: novo.notes });
          } else {
            await db.milestones.add(novo as never);
          }
        }
      }
```
- [ ] **Step 5: Rodar e ver passar** — `npm test -- path-seed`.
- [ ] **Step 6: Commit** — `feat(trilha): marco de cabelo vira fase de transição + migração`.

## Task 4: Verificação final

- [ ] **Step 1:** `npm test && npm run build` → tudo PASS, build ok.

## Self-Review

- Cobertura: §4 arquitetura → Tasks 1-3; §5 conteúdo → Task 1/2; §6 marco → Task 3; §7 testes → Tasks 1,3. Sem lacunas.
- Sem placeholders. Tipos: `HairGuideSection` usado igual no seed e no teste; migração casa com o padrão stepwise existente.

# Painel Evolução + Marcos de Voz — visão consolidada da transição

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação
**Foco:** #3c de 3 (sub-projeto final de "Voz + feminização não-corporal")

---

## 1. Resumo

Hoje cada módulo guarda seu log isolado e não há **visão consolidada** da transição. Este
sub-projeto adiciona uma tela **Evolução** (`/trilha/evolucao`) que junta num lugar só o
progresso de voz, movimento, skincare, treino, WHR e marcos concluídos — e dá à **voz** o mesmo
tratamento de roadmap que corpo/cabelo/busto já têm, com uma **categoria de marco "voz"** e
marcos-semente.

## 2. Contexto

- Voz está ausente de qualquer streak/painel; `Milestone.category` (`db.ts:207`) só tem
  `"medico" | "fisico" | "social" | "fertilidade"` — sem voz.
- `milestones-seed.ts` tem `MILESTONES`, `BODY_GOAL_MILESTONES`, `BUST_MILESTONES`; `path-seed.ts`
  faz seed inicial + migração por `MILESTONE_SEED_VERSION` (hoje 4).
- `MilestoneCard.tsx` tem `CATEGORY_LABEL: Record<Milestone["category"], string>` — adicionar
  categoria **obriga** atualizar esse mapa (TypeScript exige a chave).
- Dados de progresso existem todos no Dexie (`voicePracticeLogs`, `practiceLogs`, `skincareLogs`,
  `workoutSessions`, `measurements`, `milestones`) — falta só a view agregadora.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Categoria nova | `"voz"` (só ela) | Pedido explícito; apresentação fica pra depois (YAGNI). |
| Agregação | Lib pura `evolution.ts` (dias distintos, streak) | Testável sem UI. |
| Acesso à tela | Card "Ver evolução" no topo da Trilha | Evita 5ª aba apertada no mobile. |
| Escopo da tela | Read-only (números), sem edição | É um espelho de progresso, não entrada de dados. |

## 4. Arquitetura

### 4.1 Lib pura — `src/lib/evolution.ts`
- `distinctDays(dates: string[]): number`.
- `daysInLast(dates: string[], todayISO: string, n: number): number` — dias distintos com
  atividade nos últimos n dias.
- `currentStreak(dates: string[], todayISO: string): number` — dias consecutivos terminando hoje
  (0 se hoje não tem atividade). Datas no formato `"yyyy-mm-dd"`.

### 4.2 Marcos de voz
- `src/lib/db.ts` — `Milestone.category` ganha `"voz"`.
- `src/components/MilestoneCard.tsx` — `CATEGORY_LABEL` ganha `voz: "Voz"`.
- `src/pages/path/MilestoneNew.tsx` — `<option value="voz">Voz</option>` no select.
- `src/data/milestones-seed.ts` — `VOICE_MILESTONES` (5 marcos: gravação base → 1 mês de
  prática → faixa-alvo de pitch → pedir algo com voz fem → conversa ao telefone).
- `src/lib/path-seed.ts` — importar `VOICE_MILESTONES`, incluir no seed inicial, bump
  `MILESTONE_SEED_VERSION` 4 → 5 e migração `if (msVersion < 5)` que os adiciona.

### 4.3 Tela Evolução
- `src/pages/path/EvolucaoView.tsx` — `useLiveQuery` nas 6 fontes; cards de estatística: Voz
  (streak + dias/30), Movimento (dias/30), Skincare (dias/30), Treino (dias/30), WHR atual
  (`calculateWhr`+`classifyWhr`), Marcos concluídos (x de y).
- `src/main.tsx` — rota `trilha/evolucao` → `<EvolucaoView />`.
- `src/pages/path/MilestonesView.tsx` — card-link "Ver evolução" logo após `<PathTabs />`.

## 5. Conteúdo dos marcos de voz

| Quando | Título | Categoria |
|---|---|---|
| agora | Gravação base da voz (ponto de partida) | voz |
| +1 mês | 1 mês de prática de voz quase diária | voz |
| +2 meses | Atingir a faixa-alvo de pitch com naturalidade | voz |
| +3 meses | Pedir algo com voz feminina (café, atendimento) | voz |
| +6 meses | Conversa ao telefone mantendo a voz | voz |

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Unidade | `evolution`: `distinctDays`, `daysInLast` (janela), `currentStreak` (consecutivos; 0 sem hoje). |
| Conteúdo | `VOICE_MILESTONES` têm `category: "voz"` e títulos não-vazios; 5 itens. |
| Regressão | `path-seed.test.ts` segue verde (usa `toBeGreaterThanOrEqual`; idempotência preservada). |
| Smoke | `EvolucaoView` renderiza os cards com dados de exemplo. |

## 7. Fora de escopo

- Voz no card "Foco de hoje" / Today (era da frente "Acompanhamento", não selecionada).
- Categoria de marco "apresentação"/gestual (YAGNI; só voz agora).
- Gráficos temporais (a tela mostra números/streaks, não séries).

## 8. Critérios de aceite

- Tela Evolução mostra progresso consolidado (voz, movimento, skincare, treino, WHR, marcos).
- Categoria "voz" disponível no formulário de marco, exibida no card, e 5 marcos-semente
  aparecem (seed v5).
- `npm test` e `npm run build` passam.

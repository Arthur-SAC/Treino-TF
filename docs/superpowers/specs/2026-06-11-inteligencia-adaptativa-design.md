# Inteligência Adaptativa — o app reagir aos dados

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação (usuária delegou as decisões finais)
**Abordagem escolhida:** A — três libs puras (`measurement-trend`, `cycle-advisor`, `today-priority`) + fiação dirigida
**Foco:** #2 de 3 (silhueta ✓ → inteligência adaptativa → voz/feminização)

---

## 1. Resumo

Faz o app **reagir aos dados** em vez de só mostrar conteúdo estático, em três superfícies:

1. **Troca de ciclo por resultado (sugere + confirma):** além do piso de sessões, recomenda
   avançar de ciclo com base na evolução das medidas e na trava de cintura do #1 — sempre
   explicando o porquê, e você confirma com 1 toque.
2. **Progressão de carga consciente da estética:** glúteo progride como hoje; peitoral,
   postura e costas **mantêm a carga leve** (subir peso ali trabalha contra a silhueta).
3. **"Foco de hoje" no dashboard:** um card fixo no topo que nomeia a alavanca mais atrasada/
   estratégica do dia, mantendo o resto da lista estável.

## 2. Contexto

Auditoria do código mostrou que as três superfícies hoje são "cegas":
- `Cycles.tsx`/`Today.tsx`: a troca de ciclo é manual + sugestão **só por contagem de sessões**
  (`sessionsInCycle >= threshold`). O texto da tela de Ciclos já promete "o app sugere o
  próximo automaticamente", mas não olha nenhum resultado.
- `SessionRecorder.tsx`: `suggestNextLoad` usa o mesmo incremento pra tudo — hip thrust e
  supino "LEVE" sobem igual. Ignora a categoria e o `rpe` por série.
- `Today.tsx`: lista plana; nudges por tempo (medida > 28d, foto > 14d).

O #1 (Estratégia de Silhueta) já entregou as métricas/metas (`silhouette.ts`, `waistGuard`,
`targetWhr`) e a tela `/corpo/silhueta`. O #2 consome esses sinais para **fechar o loop**:
medida → recomendação.

**Decisões (brainstorming + delegação):**
- Autonomia: **sugere e a usuária confirma** (mantém no controle, ensina o porquê).
- Gatilho de ciclo: **híbrido** — sessões como piso, resultado/trava como gatilho real.
- Dashboard: a usuária escolheu "reordenar tudo", mas **delegou a decisão final**; o designer
  optou pelo **card "Foco de hoje" fixo no topo** (prioriza sem embaralhar a tela — reorder
  total quebra a memória espacial de uma tela de uso diário). Reversível depois.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Autonomia | Sugere + confirma | Corpo é da usuária; decisões reversíveis e explicadas. |
| Gatilho de ciclo | Híbrido (piso de sessões + resultado) | Sessões sozinhas ignoram o corpo; resultado sozinho pode travar. |
| Dashboard | Card "Foco de hoje" fixo + lista estável | Prioriza a alavanca atrasada sem desorientar (vs. reorder total). |
| Progressão | `gluteo` cresce; `peitoral/postura/costas` mantêm leve | Subir carga de busto/costas trabalha contra a ampulheta. |
| Libs puras | 3 módulos isolados | Testável sem UI; cada um com uma responsabilidade. |

## 4. Arquitetura

### 4.1 Libs novas (lógica pura, testável)
- **`src/lib/measurement-trend.ts`** — `waistTrend(measurements, n=3)` e `hipTrend(...)`:
  janela das últimas N medidas com o campo, devolvendo `{ dir: "down"|"stable"|"up";
  deltaCm; points }`. Limiar de "estável" = `|delta| <= 0,5 cm`. Assume medidas em ordem
  crescente de data.
- **`src/lib/cycle-advisor.ts`** — `recommendCycleChange(input): CycleAdvice | null`. Híbrido:
  - `adaptacao → variacao` e `refinamento → manutencao`: pelo **piso de sessões**.
  - `variacao → hipertrofia` (déficit→superávit, momento-chave): piso + (`WHR <= targetWhr`
    **ou** cintura em platô).
  - `hipertrofia → refinamento`: **trava de cintura** dispara (override do piso) **ou** piso +
    quadril em platô.
  - `manutencao`: sem próximo (`null`).
  - Sempre com `reason` em texto explicando o porquê.
- **`src/lib/today-priority.ts`** — `computeFocus(state): Focus | null`. Ordem de prioridade:
  1. trava de cintura → `/corpo/silhueta`; 2. recomendação de ciclo → `/treino/ciclos`;
  3. treino de hoje não feito → sessão; 4. medida atrasada (>28d); 5. foto atrasada (>14d).
  Primeiro que casar vira o foco. Determinístico.

### 4.2 Progressão consciente da categoria
- **`src/lib/progression.ts`** — `ProgressionInput` ganha `category?: string`; helper
  `isHoldLight(category)` (`peitoral`, `postura`, `costas`). Quando hold-light, `suggestNextLoad`
  **nunca sobe** a carga (mantém; só recua se não completou as reps). `gluteo` e demais seguem
  a lógica atual. Retrocompatível (campo opcional).

### 4.3 Fiação (UI)
- **`src/pages/Today.tsx`** — monta `FocusState` (advisor + waistGuard + treino + recência) e
  renderiza o card **"Foco de hoje"** fixo no topo via `computeFocus`. O card de ciclo passa a
  vir do advisor (substitui o `shouldSuggestChange` por sessões). Resto da lista permanece.
- **`src/pages/workout/Cycles.tsx`** — mostra a recomendação do advisor (com `reason`) no lugar
  do texto fixo; botão "Avançar agora" aplica (`setSetting activeCycle` + `cycleStartSessionCount`).
- **`src/components/SessionRecorder.tsx`** — passa `exercise.category` ao `suggestNextLoad`;
  quando `isHoldLight`, mostra nota "manter leve — não subir (silhueta)".

### 4.4 Dados
- **Nenhuma mudança de schema.** Reusa `db.measurements`, `db.workoutSessions`, settings
  (`activeCycle`, `cycleStartSessionCount`, `targetWhr`). O `waistGuard` e `calculateWhr` vêm
  do #1 (`silhouette.ts`, `waist-hip-ratio.ts`).

## 5. Tipos-chave

```ts
// measurement-trend.ts
type TrendDir = "down" | "stable" | "up";
interface Trend { dir: TrendDir; deltaCm: number; points: number; }

// cycle-advisor.ts
interface CycleAdviceInput {
  activeCycle: CycleId; sessionsInCycle: number; threshold: number;
  whr: number | null; targetWhr: number;
  waistTrend: Trend; hipTrend: Trend; waistGuardTriggered: boolean;
}
interface CycleAdvice { recommend: boolean; toCycle: CycleId; reason: string; }

// today-priority.ts
interface FocusState {
  cycleAdvice: { recommend: boolean; reason: string } | null;
  waistGuardTriggered: boolean;
  workoutToday: { done: boolean; name: string; to: string } | null;
  daysSinceMeasurement: number | null;
  daysSincePhoto: number | null;
}
interface Focus { title: string; subtitle: string; to: string; }
```

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Unidade | `measurement-trend`: down/stable/up por limiar; janela; `points < 2` → stable. |
| Unidade | `cycle-advisor`: cada transição (adaptacao, variacao com alvo/platô, hipertrofia com trava/platô, refinamento, manutencao→null); piso respeitado; trava faz override. |
| Unidade | `today-priority`: ordem de prioridade (trava > ciclo > treino > medida > foto); `null` quando nada pendente. |
| Unidade | `progression`: hold-light mantém carga (não sobe no easy), recua se não completou; `gluteo`/sem categoria seguem a lógica atual (testes existentes intactos). |
| Smoke | `Today` renderiza o card "Foco de hoje" quando há pendência; suíte antiga verde. |

## 7. Fora de escopo (vai pro #3 — Voz + feminização)

- Voz, postura/gestual aprofundados, integração das alavancas de aparência ao progresso.
- Reordenação dinâmica total do `Today` (preterida em favor do card de foco; reavaliar se a
  usuária pedir).
- Progressão reagindo a tendências de medida além do cap por categoria (ex.: travar busto se a
  cintura subir) — possível evolução futura, fora deste escopo.

## 8. Critérios de aceite

- Avançar de ciclo é recomendado com `reason` baseado em resultado (não só sessões) e aplicado
  por confirmação, em `Today` e `Cycles`.
- `suggestNextLoad` não sobe carga de `peitoral/postura/costas`; `SessionRecorder` sinaliza isso.
- `Today` mostra o card "Foco de hoje" priorizando a alavanca mais atrasada.
- Nenhuma mudança de schema; `npm test` e `npm run build` passam.

# Estratégia de Silhueta — engenheirar a ampulheta sem TRH

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação
**Abordagem escolhida:** A — view "Silhueta" como cérebro da estratégia (em *Corpo*) + ferramentas de cintura no Treino
**Foco:** #1 de 3 (silhueta → inteligência adaptativa → voz/feminização não-corporal)

---

## 1. Resumo

Fecha parte do loop entre **medida e estratégia** da silhueta ampulheta (glúteo grande +
cintura fina) para uma usuária MTF **sem TRH no momento** — portanto sem redistribuição
hormonal de gordura, o que torna as alavancas mecânicas (déficit, transverso, hipertrofia
de quadril) praticamente as únicas disponíveis.

Adiciona:
1. **Metas configuráveis** de WHR e de ombro/quadril, com **gap em cm** e orientação de
   **qual alavanca puxar** conforme o ciclo ativo.
2. **%BF estimado** pelo método Navy (só com fita: pescoço/cintura/quadril já medidos +
   altura coletada 1×), dando métrica real ao "secar a barriga".
3. **Trava de cintura**: alerta quando a cintura sobe durante o superávit da hipertrofia.
4. **Vacuum/transverso** como exercício de biblioteca de verdade (com progressão por tempo
   de isometria) e presente nos templates de todos os ciclos.
5. Uma tela **`/corpo/silhueta`** que reúne tudo num painel único.

## 2. Contexto

Auditoria do código (treino + corpo) mostrou que a base "glúteo prioridade nº 1" está muito
bem feita (4 estímulos/semana, variação, periodização treino+dieta via `CYCLE_TO_GOAL`), e
que a filosofia anti-cintura está correta (nenhum oblíquo com carga em nenhum template).
A lacuna é que **o app mede e mostra, mas não orienta**:

- `waist-hip-ratio.ts` só rotula (`classifyWhr`), sem meta, sem gap, sem direção.
- O **vacuum** (ferramenta nº 1 de cintura sem TRH) existe só como um `move` de 90s dentro
  da sequência de dança `postura-silhueta-diaria` (`sequences-seed.ts:408`) — fora do treino
  e sem progressão.
- **Composição corporal não é rastreada**: `Measurement` não tem `bodyFatPct` nem altura,
  apesar de já coletar `neckCm`/`waistCm`/`hipCm` (suficientes para o método Navy).
- O superávit da hipertrofia (`CYCLE_TO_GOAL.hipertrofia = "superavit"`) não tem nenhuma
  trava contra reganho de gordura na cintura.

**Decisões da usuária (brainstorming):**
- Meta **dupla**: WHR **e** ombro/quadril.
- **Estimar %BF** (método Navy), não só tendência de cintura.
- Alvo de ombro/quadril **estimado** das fotos de objetivo (quadril ≥ ombro, ampulheta
  marcada) → default **1,00** (aspiracional 0,95), calibrável depois.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | A — tela `/corpo/silhueta` dedicada | Dá um *lar* à estratégia; combina com a arquitetura modular; fronteira limpa com o #2. |
| Metas | WHR alvo `0,72` + ombro/quadril alvo `1,00`, em `settings` | Configuráveis; defaults derivados das escolhas/fotos. |
| %BF | Estimativa Navy, **calculada na hora** | Sem migração destrutiva; nenhuma medida antiga quebra; só fita. |
| Altura | Coletada 1× em `settings.heightCm` | Constante; não polui cada `Measurement`. |
| Vacuum | Exercício de biblioteca + nos templates | Tira da sequência de dança; vira ferramenta progressável. |
| Trava de cintura | Alerta **exibido** na tela Silhueta | Aqui a tela *mostra/orienta*; agir sozinho é o #2. |
| Adaptação automática | **Fora de escopo** (vai pro #2) | Mantém o #1 focado em métrica+estratégia exibida. |

## 4. Arquitetura

### 4.1 Camada de dados (sem migração destrutiva)
- **`settings`** (chaves novas, via `hooks/useSetting` + `settings-helpers`):
  - `heightCm: number` — altura, coletada 1×.
  - `targetWhr: number` — default `0.72`.
  - `targetShoulderHipRatio: number` — default `1.00`.
- **`bodyFatPct` NÃO é armazenado** — calculado a partir do `Measurement` (neck/waist/hip) +
  `heightCm`. Nenhuma mudança na interface `Measurement`.

### 4.2 Libs (lógica pura, testável)
- **`src/lib/body-composition.ts`** (novo):
  - `estimateBodyFatNavy({ heightCm, neckCm, waistCm, hipCm }): number | null` — fórmula
    Navy feminina (métrica Hodgdon-Beckett):
    `495 / (1.29579 − 0.35004·log10(waist+hip−neck) + 0.22100·log10(height)) − 450`,
    arredondada a 1 casa. Retorna `null` se faltar alguma medida ou inputs inválidos
    (ex.: `waist+hip−neck <= 0`, `height <= 0`).
  - `classifyBodyFat(pct): string` — faixas informativas (ex.: essencial/atleta/fitness/
    média/alta) com rótulos pt-BR. Sem juízo de valor pesado; texto de apoio, não meta dura.
- **`src/lib/silhouette.ts`** (novo):
  - `shoulderHipRatio(shouldersCm, hipCm): number | null`.
  - `whrGap(current, target, waistCm, hipCm): { waistDeltaCm: number; hipDeltaCm: number }` —
    quantos cm tirar da cintura **ou** somar ao quadril para atingir o alvo (duas rotas).
  - `shoulderHipGap(currentRatio, target, shouldersCm, hipCm): { hipDeltaCm: number }` —
    para baixar a razão, a rota saudável é **subir quadril** (não treinar/encolher ombro).
  - `leverGuidance(cycleGoal: "deficit"|"manutencao"|"superavit"): { focus; why }` —
    déficit → **baixar cintura**; superávit → **subir quadril**; manutenção → **manter/medir**.
  - `waistGuard({ cycleGoal, waistStartCm, waistNowCm }): { triggered; deltaCm }` —
    `triggered` quando `cycleGoal === "superavit"` e a cintura subiu `>= 1,5 cm` desde a
    **medição anterior** (sem depender de rastrear a data de início do ciclo — isso é #2).
- **`src/lib/progression.ts`** (estender): `suggestNextHoldTime(lastSec, feedback): number` —
  progressão por tempo de isometria para o vacuum (ex.: `easy` → +5s até teto ~60s; `hard` →
  mantém). Função pura nova; não altera `suggestNextLoad`.

### 4.3 Treino — vacuum/transverso
- **`src/data/exercises-seed.ts`**: novo exercício `vacuum-abdominal`, `category: "cintura"`,
  `equipment: "nenhum"`, `exposureLevel` baixo, `repsTarget` por tempo, `proTips` explicando
  o transverso afinando a cintura "por dentro". (Opcional: `transverso-respiracao-90-90`.)
- **`src/data/workout-plan-seed.ts`** e **`src/data/cycles-seed.ts`**: incluir um bloco curto
  de vacuum no slot de core dos templates (sem remover prancha/dead-bug; complementa). Mantém
  a regra "zero oblíquo com carga".

### 4.4 UI
- **`src/pages/body/Silhouette.tsx`** (novo) — rota `corpo/silhueta`:
  - Dois medidores: **WHR** (atual/alvo/gap em cm via `whrGap`) e **ombro/quadril**
    (atual/alvo/gap via `shoulderHipGap`).
  - Card **"Alavanca do momento"** — lê o ciclo ativo (`activeCycle` → `CYCLE_TO_GOAL`) e
    usa `leverGuidance`.
  - **%BF estimado + tendência** (série calculada sobre `db.measurements`) + faixa-alvo.
  - **Trava de cintura** — `waistGuard` comparando início do ciclo vs. agora; alerta vermelho.
  - Card educativo curto: por que transverso e não oblíquo com carga.
- **`src/pages/body/BodyHome.tsx`** — novo item de menu "Silhueta".
- **`src/pages/Settings.tsx`** (ou um prompt em Medidas) — campos altura, `targetWhr`,
  `targetShoulderHipRatio`.
- **`src/main.tsx`** — rota `corpo/silhueta` → `<Silhouette />`.

## 5. Fórmulas e defaults

- **Navy feminino (cm, Hodgdon-Beckett):**
  `%BF = 495 / (1.29579 − 0.35004·log10(waist+hip−neck) + 0.22100·log10(height)) − 450`.
- **WHR alvo:** `0,72` (ampulheta forte).
- **Ombro/quadril alvo:** `1,00` (aspiracional `0,95`) — ombro no máximo igual ao quadril.
- **Limiar da trava de cintura:** `+1,5 cm` de cintura desde a medição anterior, durante superávit.

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Unidade (Vitest) | `estimateBodyFatNavy` (valor conhecido, `null` em input faltante/inválido); `classifyBodyFat` faixas. |
| Unidade | `silhouette`: `whrGap` (rotas cintura/quadril), `shoulderHipGap`, `leverGuidance` (déficit/superávit/manutenção), `waistGuard` (dispara só no superávit acima do limiar). |
| Unidade | `suggestNextHoldTime` (sobe no `easy`, teto, mantém no `hard`). |
| Conteúdo | seed do `vacuum-abdominal` válido (`category: "cintura"`, campos não-vazios); presença nos templates sem oblíquo carregado. |
| Smoke (Testing Library) | `Silhouette.tsx` renderiza medidores, alavanca e %BF com dados de exemplo. |

## 7. Fora de escopo (vai pro #2 — Inteligência adaptativa)

- Ciclo trocar sozinho **por resultado** (hoje e aqui: por contagem de sessões).
- `suggestNextLoad` reagir a medidas / cap de progressão por categoria estética.
- Hábito diário de vacuum no **Hoje** / nudge no dashboard.
- Projeção/tendência preditiva de WHR (aqui: tendência descritiva apenas).

## 8. Critérios de aceite

- Tela `/corpo/silhueta` mostra WHR e ombro/quadril com alvo e gap em cm, a alavanca do
  ciclo ativo, %BF estimado com tendência, e a trava de cintura quando aplicável.
- Altura + metas configuráveis e persistidas em `settings`.
- `vacuum-abdominal` existe na biblioteca com progressão por tempo e aparece nos templates.
- Nenhuma medida/seed antigo quebra; `npm test` passa.

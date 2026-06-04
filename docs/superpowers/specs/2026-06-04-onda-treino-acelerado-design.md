# Plano Acelerado — Onda 3: Treino acelerado

**Data:** 2026-06-04
**Status:** Spec em revisão
**Usuária:** a mesma pessoa (transição MTF sem TRH; 1,73m / ~96kg / IMC ~32; gordura central; glúteo dormente; postura cabeça-à-frente). Iniciante. Até ~1h/dia. Treina mix academia (máquinas, por timidez) + casa.

---

## 1. Resumo

Onda que torna o treino **mais rápido de progredir e mais eficaz pra estética-alvo (ampulheta)**, complementando a onda de Nutrição (a maior alavanca da cintura). Ataca 6 frentes:

1. Encurtar a fase de **Adaptação** (hoje exige 80 sessões pra sugerir avanço → muito conservador).
2. **Progressão de carga mais agressiva** pra iniciante (ganhos de iniciante).
3. **Aquecimento de verdade** em todo treino (cardio leve + articular + ativação).
4. **3ª "dose" de glúteo na semana** (glúteo responde a frequência) — sem alargar a parte de cima.
5. **Micro-rotina diária de postura/silhueta** (vitória visível em semanas).
6. **Cardio leve diário** (caminhada) — alavanca direta de perda de gordura, com registro simples.

Mantém a filosofia do app: ≤1h/dia, didático, sem alargar ombro/trapézio, ativação glútea antes dos compostos.

## 2. Decisões de design (marcadas como AJUSTÁVEL onde há tradeoff)

| # | Decisão | Valor proposto | Nota |
|---|---|---|---|
| Threshold Adaptação | sessões até sugerir avanço | **80 → 28** (~6 semanas a 5x/sem) | AJUSTÁVEL. Demais ciclos seguem 60. |
| Critério de avanço | contagem (já implementado) | manter contagem + texto de "se já executa os movimentos com técnica boa, pode avançar" | Lógica de competência real fica fora de escopo (YAGNI). |
| Progressão | `suggestNextLoad` | saltos maiores no "fácil" conforme a carga | ver §4 |
| 3ª dose de glúteo | onde encaixar | **bloco leve de ativação/pump glúteo na Quarta** (dia hoje mais leve) | AJUSTÁVEL. Alternativa: redistribuir a semana. Quarta leve evita sobrecarga entre Seg e Qui. |
| Postura | rotina diária | nova sequência `postura-silhueta-diaria` (~7 min), card próprio no "Hoje" | — |
| Cardio | hábito diário | caminhada com meta de minutos, registro em `dailyLog.walkMin` + card no "Hoje" | meta padrão 30 min, editável |

## 3. Ciclos — encurtar Adaptação

- Em `src/data/cycles-seed.ts`, `CYCLES`: trocar `threshold` da Adaptação de `80` para `28`. Demais inalterados.
- Nenhuma mudança de lógica: `Today.tsx:43` já usa `sessionsInCycle >= threshold` pra exibir o card "Hora de avançar". A tela `Cycles.tsx` mostra `progresso / threshold`.
- Atualizar o `description` da Adaptação pra refletir "~6 semanas" se mencionar prazo.

## 4. Progressão de carga mais agressiva

Hoje (`src/lib/progression.ts`):
- não completou reps → `lastLoad - 1`
- "fácil" → `+0,5` (se <5kg) senão `+1`
- "médio"/"difícil" (completou) → mantém

Novo comportamento (mais rápido pra iniciante, ainda seguro):
- **não completou** as reps → `lastLoad - 1` (igual; piso 0).
- **"fácil"** → salto proporcional à carga:
  - `lastLoad < 5` → `+0,5`
  - `5 ≤ lastLoad < 20` → `+2`
  - `lastLoad ≥ 20` → `+2,5`
- **"médio"** (completou todas) → `+1` (antes: mantinha — agora mantém momentum leve).
- **"difícil"** (completou) → mantém (`lastLoad`).

Mantém a função pura e os tipos atuais (`ProgressionInput`, `SessionFeedback`). Atualizar `tests/lib/progression.test.ts` com os novos limiares (ver plano).

## 5. Aquecimento em todo treino

Os exercícios `cardio-leve-esteira` (5-7 min) e `aquecimento-articular` (5 min) já existem no catálogo, mas o cardio **não está plugado em nenhum template**.

- Nos dias de **força** (Seg/Ter/Qui/Sex) de **todos os 4 ciclos** (`workout-plan-seed.ts` + `cycles-seed.ts`): inserir `cardio-leve-esteira` como **primeiro** item (1 set, "5-7min", rest 0), antes do `aquecimento-articular`.
- No dia de **Quarta** (mobilidade/dança), que hoje não tem aquecimento: inserir `aquecimento-articular` como primeiro item.
- Isso aumenta a duração de cada treino em ~5-7 min — atualizar `durationMin` dos templates de força (+7) e da Quarta (+5).

## 6. 3ª dose de glúteo (frequência)

A semana hoje treina glúteo Seg + Qui (2x). Proposta: adicionar um **bloco leve de glúteo** ao dia de **Quarta** (hoje "Mobilidade + Dança"), virando "Mobilidade + Glúteo (ativação) + Dança". Bloco proposto (leve, baixa fadiga, foco em conexão e bombeamento — coerente com a Quarta ser dia leve):

- `ponte-gluteo-band` — 3×20
- `kickback-cabo` (ou `abdutor-band-em-pe` em casa) — 3×15 cada
- `abdutor-deitada` — 3×20 cada

Aplicar nos templates de Quarta dos 4 ciclos (adaptando à variação de cada ciclo). Ajustar `durationMin` (+~12 min; ainda dentro de ~50 min com a dança encurtada se necessário).

**AJUSTÁVEL:** se preferir não mexer na Quarta, alternativa é manter 2x e focar em volume/intensidade nos dias Seg/Qui. Glúteo 3x/sem (sendo 1 leve) é seguro e acelera o visível.

## 7. Micro-rotina diária de postura/silhueta

Nova `DanceSequence` (mesmo modelo já usado, surge no "Hoje"):
- `id: "postura-silhueta-diaria"`, `category: "mobilidade"` (reusa a categoria existente — `DanceSequence.category` é union estrito `mobilidade|danca|pelvic|sensual`; o "Hoje" referencia esta rotina pelo `id`, então NÃO precisa criar categoria nova nem mexer no tipo), `level: "iniciante"`, `durationMin: 7`.
- `focus`: corrigir cabeça-à-frente, abrir o peito, ativar glúteo, afinar a cintura visualmente. Vitória rápida.
- `moves` (~7): chin tuck (retração cervical), extensão torácica (mãos na nuca), retração escapular (banda/parede), alongamento peitoral no batente, ativação de glúteo em pé (band), "vacuum" abdominal (transverso), respiração final.
- Texto neutro e didático no padrão das sequências existentes.

**Exibição no "Hoje":** adicionar um `TodayCard` dedicado "Postura" que sempre aponta pra essa sequência (independente do dia), com estado feito/pendente lido de `practiceLogs` daquele dia. Não substitui o card "Movimento" existente.

## 8. Cardio leve diário (caminhada)

- Adicionar campo `walkMin?: number` a `DailyLog` em `db.ts` (sem índice novo → sem bump de schema Dexie; default ausente tratado como 0).
- Setting nova `walkGoalMin` (default **30**), no padrão das settings existentes (`hydrationGoalMl` etc.).
- `TodayCard` "Caminhada" mostrando `${walkMin ?? 0} / ${walkGoalMin} min` com botão `+10 min` (no padrão do card de Hidratação, que faz `+200ml` em `dailyLog`).
- Sem GPS/contador de passos (YAGNI) — registro manual.

## 9. Modelo de dados

- `DailyLog` (`db.ts`): + `walkMin?: number`.
- `walkGoalMin` (default **30**) precisa entrar nos DOIS lugares de defaults: `src/hooks/useSetting.ts` (objeto de defaults, junto de `hydrationGoalMl: 2000`) e `src/lib/settings-helpers.ts` (o tipo na ~linha 20 e o default na ~linha 51, junto de `hydrationGoalMl`).
- `DanceSequence.category`: SEM mudança — reusa `"mobilidade"` (ver §7).
- Sem bump de versão Dexie (nenhum campo novo é indexado). `MOVEMENT_VERSION` 3→4 cuida do re-seed da sequência nova.

## 10. Migração / seed

- `cycles-seed.ts` e `workout-plan-seed.ts`: editar templates (aquecimento, glúteo na Quarta, durações, threshold).
- `sequences-seed.ts`: + `postura-silhueta-diaria`. O seed roda via `seedMovement()` (`src/lib/movement-seed.ts`) que faz `db.danceSequences.put(s)` (upsert) e compara `MOVEMENT_VERSION` (hoje `3`). **Bump `MOVEMENT_VERSION` → 4** pra a nova sequência ser semeada em devices existentes.

## 11. Telas afetadas

| Arquivo | Mudança |
|---|---|
| `data/cycles-seed.ts` | threshold 28; aquecimento+glúteo nos templates; durações |
| `data/workout-plan-seed.ts` | aquecimento (cardio+articular); glúteo na Quarta; durações |
| `lib/progression.ts` | nova regra de progressão |
| `data/sequences-seed.ts` | nova sequência de postura |
| `lib/db.ts` | `DailyLog.walkMin`; (talvez) `DanceSequence.category` |
| `lib/settings-helpers.ts` + defaults | `walkGoalMin` |
| `pages/Today.tsx` | cards "Postura" e "Caminhada" |

## 12. Testes

| Tipo | Cobertura |
|---|---|
| Lógica pura | `suggestNextLoad`: cada limiar novo (fácil <5/<20/≥20, médio +1, difícil mantém, falha -1, piso 0). |
| Seed | Adaptação `threshold === 28`; todo template de força tem `cardio-leve-esteira` como 1º item; Quarta tem aquecimento + bloco de glúteo; `postura-silhueta-diaria` existe com ~7 moves. |
| Settings | `walkGoalMin` default 30. |
| Smoke | "Hoje" renderiza card "Postura" e "Caminhada"; botão +10min incrementa `dailyLog.walkMin`. |

## 13. Fora de escopo

- Lógica de avanço de ciclo por competência real (mantém contagem).
- Contador de passos/GPS/integração com wearables.
- Vídeos novos de exercício.
- Reescrever a estética/UX do "Hoje" além dos 2 cards novos.

## 14. Riscos / bordas

| Cenário | Comportamento |
|---|---|
| Usuária já passou de 28 sessões na adaptação | O card "avançar" aparece imediatamente (esperado e desejável). |
| Aumento de duração dos treinos | Comunicado via `durationMin`; ainda dentro de ~1h. |
| 3ª dose de glúteo gera fadiga | Bloco da Quarta é leve/ativação; usuária pode pular (nada trava). |
| `walkMin` ausente em logs antigos | Tratado como 0. |
| Categoria "postura" nova | Se `DanceSequence.category` for union estrito, estender o tipo; senão sem efeito. |

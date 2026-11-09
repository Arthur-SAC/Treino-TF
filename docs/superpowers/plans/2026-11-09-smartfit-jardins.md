# Smartfit Jardins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar todo o treino pra Smart Fit Jardins (recomeço pela Entrada), com "Ocupado"/"Não tem aqui", sem nada do teto do prédio, Hoje no horário novo, e explicações de execução num formato fixo e simples.

**Architecture:** Conteúdo em seeds (`src/data/*`), regras puras em `src/lib/*` (sem `db`, sem `new Date()`), telas em `src/components` / `src/pages`. A troca de aparelho é um campo `substitutoId` em cada item de template + um módulo puro que aplica ausências; a migração única reinicia o ciclo sem tocar no histórico. Explicações viram um tipo estruturado `Execucao` renderizado por um componente só.

**Tech Stack:** React + TypeScript, Dexie (IndexedDB), Vitest + Testing Library, Vite.

**Spec:** `docs/superpowers/specs/2026-11-09-smartfit-jardins-design.md` — leia inteira antes da Task 1; leia também `docs/OBJETIVO.md` §2, §5, §8 e `docs/CONTINUAR-AQUI.md` §4–§5.

## Global Constraints

- Texto visível em **pt-BR com acento**, "você", **sem emoji**; quando algo é inalcançável sem hormônio a palavra é "impossível"; nenhum texto trata TRH como etapa futura (`tests/data/sem-trh-agendada.test.ts`).
- **Proibidos em qualquer template** (régua já existente em `tests/data/fase1-chun-li.test.ts`): `puxada-frente-maquina`; nomes casando `/desenvolvimento|eleva[çc][ãa]o lateral|encolhimento|supino reto|declinado|obl[íi]quo com carga/`. Nada acima da cabeça, nada que engrosse ombro/trapézio.
- **Força ≤ 60 min pelo estimador** (`estimarDuracaoMin`, `src/lib/session-duration.ts`), medida no template **cru** (sem o `cardio-pos-treino` de `comCardioPosTreino`, que continua somando +15 nos ciclos de déficit — decisão dela). `durationMin === estimarDuracaoMin(t)` em todo template reescrito.
- Entrada: `durationMin ≤ 40` (mantém a régua atual da rampa).
- Ids de **template** existentes não mudam (o histórico aponta pra eles). Ids de exercício existentes não mudam de significado.
- Seed mudou → sobe a versão e o pino em `tests/lib/seeds-chegam-no-aparelho.test.ts`. Versões hoje: `EXERCISE_SEED_VERSION` 15, `TEMPLATE_SEED_VERSION` 17, `MOVEMENT_VERSION` 13.
- Dexie carimba `id` no objeto do `add()` → gravar **cópias** de constantes.
- Setting novo entra em `DEFAULTS` (`src/lib/settings-helpers.ts`); settings vão inteiros pro backup (nada a fazer em `backup-io.ts`).
- Lembrete: texto passa pela regex de discrição `EXPOE` dos testes (`/\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i`).
- `npm run test` verde e `npm run build` limpo **em todo commit**.
- **Nunca `git push`.** Merge local só no fim, com ela. Trabalhar na branch `feat/smartfit-jardins`.
- **Se um teste deste plano falhar contra o conteúdo deste plano, PARE e reporte** — não "conserte" o teste. Exceção explícita: os testes listados como "aposentados" na Task 3 e na Task 5, que este plano reescreve de propósito.

## Review Focus

1. **Migração roda uma vez só e não apaga nada.** Depois de recomeçar na Entrada e avançar pra entrada-2, reabrir o app não pode jogá-la de volta pra entrada-1; sessões antigas continuam no Progresso; `sessionsInCycle` começa em 0, não negativo. → testes na Task 4.
2. **Substituto também marcado "Não tem aqui".** Não pode haver laço nem item sumindo: o substituto fica, e o botão "Não tem aqui" não aparece nele. → teste na Task 2 (`aplicarAusentes`) e Task 6 (tela).
3. **"Ocupado" depois de já ter registrado séries do original.** Não pode perder o que foi registrado: depois de salvar, o botão "Ocupado" some daquele exercício. → teste na Task 6.
4. **Reabrir uma sessão salva em que ela usou o substituto.** O item tem que aparecer como feito (com o substituto), não como "não registrado" do original. → teste na Task 6.
5. **Substituto que já existe no mesmo template.** Duplicaria `key`/`exerciseId` em `SessionDetail` e o `handleSave` sobrescreveria o outro. → teste de dados na Task 2.

---

### Task 0: Branch e documentos

**Files:** `docs/OBJETIVO.md`, `docs/CONTINUAR-AQUI.md`, `docs/superpowers/specs/2026-11-09-smartfit-jardins-design.md`, este plano (já editados, sem commit).

- [ ] **Step 1:** `git switch -c feat/smartfit-jardins`
- [ ] **Step 2:** `git add docs/OBJETIVO.md docs/CONTINUAR-AQUI.md docs/superpowers/specs/2026-11-09-smartfit-jardins-design.md docs/superpowers/plans/2026-11-09-smartfit-jardins.md` — **não** adicionar `design/`, `*.rar`, `agentes_especialistas_antigravity.md`, `.claude/settings.local.json`.
- [ ] **Step 3:** `git commit -m "docs: Smartfit Jardins já na fase 1 — decisão, spec e plano"`

---

## Entrega 1 — Treino na Smartfit

### Task 1: Catálogo da Smartfit

**Files:**
- Modify: `src/data/exercises-seed.ts`, `src/lib/volume-muscular.ts` (`GRUPO_DO_EXERCICIO`), `src/lib/progression.ts:32` (incrementos), `src/lib/seed.ts:30`
- Test: `tests/data/exercicios-chun-li.test.ts` (troca `DISPONIVEL`), `tests/lib/seeds-chegam-no-aparelho.test.ts:63`

**Interfaces — Produces:** ids novos de exercício usados nas Tasks 3 e 8:
`hip-thrust-maquina` (gluteo, `["maquina-hip-thrust"]`), `flexora-sentada` (pernas, `["maquina-flexora"]`), `triceps-polia-corda` (bracos, `["polia"]`), `rosca-polia` (bracos, `["polia"]`), `pallof-polia` (cintura, `["polia"]`), `extensao-45-gluteo` (gluteo, `["banco-45"]`, nome termina em "(se tiver)"), `coice-maquina` (gluteo, `["maquina-coice"]`, "(se tiver)"), `hack-machine` (pernas, `["maquina-hack"]`, "(se tiver)").
Grupos em `GRUPO_DO_EXERCICIO`: hip-thrust-maquina, extensao-45-gluteo, coice-maquina, coice-gluteo-polia, pull-through-polia → `gluteo-max`; abducao-quadril-polia → `gluteo-medio`; flexora-sentada → `posterior`; hack-machine → `quadriceps`; triceps-polia-corda → `triceps`; rosca-polia → `biceps`; pallof-polia → fora do mapa (core não conta).

- [ ] **Step 1: Teste.** Em `exercicios-chun-li.test.ts`, `DISPONIVEL` passa a ser o catálogo da Smartfit: `["halteres","barra","anilhas","banco","leg-press","polia","maquina-hip-thrust","maquina-abdutor","maquina-adutor","maquina-flexora","maquina-extensora","maquina-voador","maquina-remada","colchonete","elastico","kettlebell","caneleira","banco-45","maquina-coice","maquina-hack","esteira"]`. Novo `it("todo exercício com aparelho incerto se anuncia como (se tiver)")`: para todo exercício cujo `equipment` contém `banco-45|maquina-coice|maquina-hack|smith`, `expect(name).toMatch(/\(se tiver\)$/)`. Pino: `EXERCISE_SEED_VERSION` toBe(16).
- [ ] **Step 2:** `npx vitest run tests/data/exercicios-chun-li.test.ts tests/lib/seeds-chegam-no-aparelho.test.ts` → FAIL.
- [ ] **Step 3:** Criar os 8 exercícios (campos obrigatórios de `Exercise`; `exposureLevel: 2`; `startLoadKg` conservador; `description`/`commonMistakes` curtos — a Task 8 reescreve no formato novo). `cadeira-extensora` passa a `["maquina-extensora"]`; `kickback-cabo` e `abdutor-cabo-em-pe` passam a `["polia"]` (o nome já diz cabo). Incrementos em `progression.ts`: `polia` 2,5 kg; qualquer `maquina-*` 5 kg (minha decisão; caneleira continua 1). `EXERCISE_SEED_VERSION = 16` com linha de histórico "16 — catálogo da Smartfit Jardins".
- [ ] **Step 4:** `npm run test` → PASS (o resto do repo não pode quebrar — `exercise-category-taxonomy` e `exercicios-chun-li:28` cobrem categoria e mapa).
- [ ] **Step 5:** `git commit -am "feat(catalogo): aparelhos da Smartfit Jardins"`

### Task 2: Substituto por item e ausências (lib pura)

**Files:**
- Modify: `src/lib/db.ts:48-66` (item de `WorkoutTemplate.exercises` ganha `substitutoId?: string`)
- Create: `src/lib/troca-aparelho.ts`
- Test: `tests/lib/troca-aparelho.test.ts`

**Interfaces — Produces:**
- `aplicarAusentes(t: WorkoutTemplate, ausentes: readonly string[]): WorkoutTemplate` — para cada item cujo `exerciseId` está em `ausentes` e tem `substitutoId`, troca `exerciseId` pelo substituto e grava o original em `originalId`. Se o substituto também está ausente, mantém o substituto (sem laço). Não muta a entrada.
- `type ItemTemplate = WorkoutTemplate["exercises"][number] & { originalId?: string }`
- `podeMarcarAusente(item: ItemTemplate): boolean` — `true` só se o item tem `substitutoId` e não é ele mesmo um substituto aplicado (`originalId` ausente).

- [ ] **Step 1: Testes** (fixtures locais):
  - `troca o ausente pelo substituto e guarda o original` → `{exerciseId:"b", originalId:"a"}`.
  - `não mexe em item sem substituto` (mesmo se ausente).
  - `substituto também ausente → fica o substituto, sem laço`.
  - `não muta o template de entrada` (`Object.freeze` profundo).
  - `podeMarcarAusente` → false para item com `originalId` e para item sem `substitutoId`.
- [ ] **Step 2:** `npx vitest run tests/lib/troca-aparelho.test.ts` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** `git add -A src/lib tests/lib && git commit -m "feat(treino): substituto por item e ausências"`

### Task 3: Templates de todos os ciclos

Uma task só porque as réguas são as mesmas e um ciclo depende do outro (adaptação ≤ variação ≤ hipertrofia). O implementador pode commitar por ciclo.

**Files:**
- Modify: `src/data/entrada-seed.ts`, `src/data/workout-plan-seed.ts` (adaptação), `src/data/cycles-seed.ts` (variação, hipertrofia, refinamento, manutenção; comentário do topo l.3-25 reescrito: Smartfit desde 2026-11-09), `src/lib/seed.ts:45`
- Test: `tests/data/fase1-chun-li.test.ts` (estende), Create `tests/data/fase2-smartfit.test.ts`, Create `tests/data/substitutos.test.ts`, `tests/lib/seeds-chegam-no-aparelho.test.ts` (pino + pares de chegada)
- **Aposentados (reescrever/remover de propósito):** `tests/data/no-low-pulley.test.ts` (remover), `tests/data/polia-troca.test.ts` (remover), `tests/data/forca-levantar.test.ts:167` (remover só esse `it`), `tests/data/entrada-rampa-exposicao.test.ts` (manter só `durationMin ≤ 40` e "ids existem"; remover a rampa de `exposureLevel` e "só a semana 3 tem hip-thrust"), `tests/data/entrada-blocos.test.ts:44` (trocar a lista fixa de dias sem miolo por: todo template de Entrada tem `block` em todos os itens, contíguos).

**Interfaces — Consumes:** ids da Task 1; `substitutoId` da Task 2.

**Composição da variação (topo da fase 1 — decisão minha; sets indicativos, a régua manda):**
| Template | Miolo (ordem; `substitutoId` entre parênteses) |
|---|---|
| `v-seg-gluteo-unilateral` | hip-thrust-maquina 4 (hip-thrust-barra) · leg-press-pes-medios 3 (agachamento-goblet) · abdutor-maquina 3 (abducao-quadril-polia) · adutora-maquina 3 (agachamento-sumo) · coice-gluteo-polia 3 (kickback) · vacuum-abdominal 3 |
| `v-ter-cintura-costas` | remada-baixa-maquina 3 (remada-unilateral-halter) · face-pull-polia 3 (face-pull) · supino-inclinado-halteres 3 (cross-over-cabo) · voador-maquina 3 (crucifixo-polia) · rosca-martelo 3 (rosca-polia) · triceps-polia-corda 3 (triceps-testa-barra-w) · pallof-polia 3 (prancha-antirrotacao) |
| `v-qua-mobilidade-danca` | abdutor-maquina 4 (abducao-quadril-polia) · cadeira-extensora 3 (agachamento-goblet) · adutora-maquina 3 (agachamento-sumo) · agachamento-bulgaro 3 (leg-press-pes-medios) · abducao-quadril-polia 3 (abdutor-deitada) · ponte-gluteo-band 3 |
| `v-qui-gluteo-stiff` | supino-inclinado-halteres 3 · remada-unilateral-halter 3 (remada-baixa-maquina) · rosca-polia 3 (rosca-barra-w) · triceps-testa-barra-w 3 (triceps-polia-corda) · carregamento-frontal 3 · farmer-walk 3 · vacuum-abdominal 3 |
| `v-sex-peitoral-postura` | abdutor-maquina 3 (abducao-quadril-polia) · flexora-sentada 4 (flexora-em-pe) · hip-thrust-maquina 3 (hip-thrust-unilateral) · pull-through-polia 3 (kettlebell-swing) · extensao-45-gluteo 2 (stiff) · coice-gluteo-polia 3 (kickback) |
Nomes/`purpose` dos templates seguem o conteúdo (ex.: o de quinta é Superior B + levantar). Aquecimento (`cardio-leve-esteira` + `aquecimento-articular`) igual ao atual. `block`: `"maquina"` pra máquinas, `"solo"` pra polia/halter/peso do corpo.

**Derivação dos outros ciclos:**
- **Adaptação** (`WORKOUT_PLAN`, ids `seg-gluteo-mobilidade`…): mesma estrutura dia a dia da variação, cada grupo ≤ variação (régua existente).
- **Entrada 1–3** (15 templates `e1-*`…`e3-*`): mesma estrutura de dias, só máquina + polia, `durationMin ≤ 40`. Semana 1: 2 séries por exercício, `notes` "Semana de aprender: ache o aparelho, regule e use carga leve — sobra fôlego no fim de cada série" em todo item de miolo. Semana 2: 2–3 séries. Semana 3: 3 séries. Hip thrust na máquina já na semana 1.
- **Hipertrofia / refinamento / manutenção** (`h-*`, `r-*`, `m-*`): mesma divisão de dias; agora **com `block`** e `durationMin = estimarDuracaoMin`; sem smith como principal (`smith-squat` → `leg-press-pes-medios` ou `hack-machine` com `substitutoId: "leg-press-pes-medios"`).

- [ ] **Step 1: Testes.**
  - `fase1-chun-li.test.ts`: o escopo das réguas de fase 1 inclui a Entrada (duração ≤ 40, blocos contíguos). Ids de variação/adaptação continuam fixos (l.55-62).
  - `fase2-smartfit.test.ts`, com `FAIXA` = `FAIXA_VARIACAO` (exportar de um lugar só, ex. `tests/data/faixas.ts`): hipertrofia → todo grupo dentro de `FAIXA` **e** ≥ variação; refinamento → dentro de `FAIXA`; manutenção → todo grupo ≤ refinamento, `gluteo-medio ≥ 12`, `abdutor-maquina` em ≥ 1 dia; h/r/m: `durationMin ≤ 60`, `=== estimarDuracaoMin`, todo item com `block` contíguo; posterior: séries de `flexora-*` > séries de `stiff`+`good-morning` em todo ciclo.
  - `substitutos.test.ts`, sobre `ALL_TEMPLATES` crus (Entrada+adaptação+ciclos):
    1. todo item de bloco `maquina`/`solo` tem `substitutoId`;
    2. `substitutoId` existe em `EXERCISES`;
    3. mesmo grupo de `GRUPO_DO_EXERCICIO` que o original (quando o original está no mapa);
    4. substituto não casa os proibidos;
    5. **nenhum `substitutoId` é igual a outro `exerciseId` nem a outro `substitutoId` do mesmo template** (Review Focus 5);
    6. com **todos** os aparelhos de máquina ausentes (`aplicarAusentes(t, idsComEquipamentoMaquina)`), cada template continua ≤ 60 min (≤ 40 na Entrada) e a variação continua dentro de `FAIXA` em todo grupo.
  - `seeds-chegam-no-aparelho.test.ts`: `TEMPLATE_SEED_VERSION` toBe(18); pares de chegada trocados para `v-seg-gluteo-unilateral → hip-thrust-maquina`, `v-sex-peitoral-postura → flexora-sentada`, e `smith-squat` ausente de toda a Entrada.
- [ ] **Step 2:** `npx vitest run tests/data` → FAIL.
- [ ] **Step 3:** Reescrever os seeds; apagar/reescrever os aposentados; `TEMPLATE_SEED_VERSION = 18` ("18 — Smartfit Jardins em todos os ciclos").
- [ ] **Step 4:** `npm run test` e `npm run build` → PASS. Se `FAIXA` ou ≤ 60 não fecharem com a composição acima, ajuste séries/descanso **e liste no relatório cada desvio da tabela**.
- [ ] **Step 5:** Commit(s) `feat(treino): <ciclo> na Smartfit Jardins`.

### Task 4: Migração única — recomeço na Entrada, limpa o teto

**Files:**
- Modify: `src/lib/seed.ts` (bloco novo depois de `ENTRADA_MIGRATION`, l.129-138), `src/lib/settings-helpers.ts` (`DEFAULTS.smartfitMigration = 0`, `DEFAULTS.aparelhosAusentes = []`, tipos)
- Test: Create `tests/lib/seed-smartfit-migracao.test.ts`

**Interfaces — Produces:** `SMARTFIT_MIGRATION = 1` (exportada de `seed.ts`); setting `aparelhosAusentes: string[]` (ids de exercício) consumido na Task 6.

Regra: se `smartfitMigration < SMARTFIT_MIGRATION` → `activeCycle = "entrada-1"`, `cycleStartSessionCount = await db.workoutSessions.count()` (**não** 0 — assim `sessionsInCycle` começa em 0 sem apagar histórico), `db.settings.delete("tetoPredio")`, `smartfitMigration = 1`. Não toca medidas, sessões, `modoCaminhada`, `ladoFraco`.

- [ ] **Step 1: Testes** (fake-indexeddb, padrão de `tests/lib/seed-entrada.test.ts`):
  - `com 12 sessões em variacao → vai pra entrada-1 com cycleStartSessionCount 12 e as 12 sessões continuam`;
  - `apaga tetoPredio`;
  - `roda uma vez: depois de setar activeCycle "entrada-2", rodar seedDatabase de novo não volta pra entrada-1` (Review Focus 1);
  - `DEFAULTS.aparelhosAusentes` é `[]`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm run test` PASS.
- [ ] **Step 5:** `git commit -am "feat(treino): recomeço na Entrada ao chegar a versão da Smartfit"`

### Task 5: Sai o teto do prédio

**Files:**
- Create: `src/lib/lado-fraco.ts` — move `LadoFraco` e `ehUnilateral` de `teto-predio.ts` (o lado fraco **fica**)
- Delete: `src/lib/teto-predio.ts`, `src/components/SmartfitCard.tsx`
- Modify: `src/components/SessionRecorder.tsx` (tirar l.11 teto, l.51-52, l.69-81, l.176, l.179-194, l.291-298, l.304-308; manter lado fraco l.53, 178, 269-282), `src/pages/workout/WorkoutHome.tsx` (l.5, l.12-19, l.39-44), `src/pages/Today.tsx` (l.44-45, l.77, l.470-471), `src/lib/settings-helpers.ts` (tirar `tetoPredio` de tipo e `DEFAULTS`; `ladoFraco` importa de `./lado-fraco`)
- **Aposentados:** `tests/lib/teto-predio.test.ts`, `tests/components/SessionRecorder-teto.test.tsx`, `tests/pages/WorkoutHome-teto.test.tsx`, `tests/components/SmartfitCard.test.tsx` (remover), `tests/pages/Today.test.tsx` l.9 e l.97-125 (remover os 3 `it` "Hora da Smartfit")
- Test: Create `tests/lib/lado-fraco.test.ts` (move os casos de `ehUnilateral`); `tests/components/SessionRecorder-lado.test.tsx` continua verde sem alteração de asserção

- [ ] **Step 1:** Mover testes de `ehUnilateral` pra `lado-fraco.test.ts` apontando pro módulo novo → FAIL.
- [ ] **Step 2:** Criar `lado-fraco.ts`, apagar o resto, ajustar imports.
- [ ] **Step 3:** `grep -rn "tetoPredio\|teto-predio\|SmartfitCard\|horaDaSmartfit\|Não tem mais peso" src tests` → vazio. Textos de exercício/sequência que tratam caneleira/espaldar **como limitação do prédio** saem (caneleira como acessório normal pode ficar).
- [ ] **Step 4:** `npm run test` e `npm run build` → PASS.
- [ ] **Step 5:** `git commit -am "refactor(treino): sai o teto do prédio e o card da Smartfit"`

### Task 6: "Ocupado" e "Não tem aqui" na sessão

**Files:**
- Modify: `src/pages/workout/SessionDetail.tsx` (l.67-70 aplica `aplicarAusentes` antes de `ordenarPorBloco`; estado local `ocupados: Record<string,string>` original→substituto; l.223 "já registrado" considera `originalId` e o substituto; `key` continua `exerciseId` efetivo)
- Modify: `src/components/SessionRecorder.tsx` (Props novas abaixo; botões ao lado do Info, l.248-263 e ramo por tempo l.217-227)
- Modify: tela de Configurações que já edita `modoCaminhada` (achar com `grep -rn "modoCaminhada" src/pages`) — seção "Aparelhos que não tem na sua academia": lista os nomes de `aparelhosAusentes` com botão "Tem sim" que remove o id
- Test: Create `tests/components/SessionRecorder-troca.test.tsx`, `tests/pages/SessionDetail-troca.test.tsx`

**Interfaces — Consumes:** `aplicarAusentes`, `podeMarcarAusente`, `ItemTemplate` (Task 2); setting `aparelhosAusentes` (Task 4).
**Props novas de `SessionRecorder`:** `onOcupado?: () => void`, `onNaoTemAqui?: () => void`, `onVoltarAoOriginal?: () => void`, `nomeOriginal?: string`. Botões renderizados só quando a prop existe. Rótulos exatos: **"Ocupado"**, **"Não tem aqui"**, **"Voltar pro {nomeOriginal}"**. Depois que alguma série foi salva (`handleSave` chamado), "Ocupado" e "Não tem aqui" somem.

Comportamento em `SessionDetail`: "Ocupado" → `ocupados[original] = substitutoId` (só a sessão; nada no `db`). "Não tem aqui" → `setSetting("aparelhosAusentes", [...atual, original])`. "Voltar pro …" → remove de `ocupados`. Passa `onNaoTemAqui` só quando `podeMarcarAusente(item)`; passa `onOcupado` só quando há `substitutoId` e o item não está trocado.

- [ ] **Step 1: Testes.**
  - Recorder: `mostra Ocupado e Não tem aqui quando recebe as props`; `some depois de salvar uma série` (Review Focus 3); `sem props, nenhum botão`.
  - SessionDetail (fake-indexeddb, aguardar texto que muda com o estado — lição 5.3): `Ocupado troca o nome do exercício pelo substituto e salva com o exerciseId do substituto`; `Ocupado não grava nada em settings`; `Não tem aqui grava o id em aparelhosAusentes e o template passa a mostrar o substituto`; `no substituto aplicado por ausência não aparece Não tem aqui` (Review Focus 2); `sessão salva com o substituto reaberta → item aparece registrado` (Review Focus 4).
  - Configurações: `Tem sim remove o id de aparelhosAusentes`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm run test` PASS.
- [ ] **Step 5:** `git commit -am "feat(treino): Ocupado e Não tem aqui"`

### Task 7: Hoje e lembretes no horário novo

**Files:**
- Modify: `src/lib/today-routine.ts` (`lanche` l.198-221, `caes` l.246-276, `CAMINHADA_TRABALHO` l.283-291, item `treino` l.308, `NOITE` jantar l.341, `noModo`/`noiteDoDia` pro modo esteira, timeHint do bloco tarde l.396)
- Modify: `src/lib/settings-helpers.ts` (`workoutReminderTime` padrão `"15:50"`), `src/lib/seed.ts` (`LEMBRETES_MIGRACAO = 2`: troca `workoutReminderTime` só se ainda for `"18:15"`), `src/lib/lembretes/planejar.ts` / `estado.ts` (corpo do lembrete de treino)
- Test: `tests/lib/today-routine-dia-real.test.ts`, `tests/lib/routine-times.test.ts`, `tests/lib/lembretes-planejar.test.ts`, `tests/lib/discricao-rotulos.test.ts` (atualizar expectativas de horário; a regex de discrição continua)

**Valores (modo `caminhada`, seg–sex):** lanche `15:30`, subtítulo "Toque pra ver a receita · coma antes de sair às 16h — você treina depois de 9 h de trabalho e 50 min a pé"; caminhada `16:00`, label "Caminhada até a academia", subtítulo "~4 km até lá e ~1 km na volta — os mesmos 5 km de sempre"; treino `17:00`, subtítulo "Força até 60 min + cardio leve no fim"; cães dia útil `18:45`, subtítulo "Quando chegar em casa"; jantar dia útil `20:00` (o texto do jantar deixa de citar "às 20h" como hora ruim). Lembrete de treino `15:50`, corpo `"{nome do template} · olhe a lotação no app da academia antes de sair"`. Fim de semana: nada muda. **Modo `esteira`:** treino 17:00, esteira 18:00, jantar 20:30, sem item sobreposto entre 16:00 e 19:15. Modo `pausada`: treino 17:00.

- [ ] **Step 1: Testes** com os valores acima (inclui: `nenhum item de dia útil no modo caminhada fica entre 16:00 e 18:45 além de caminhada e treino`; corpo do lembrete não casa `EXPOE`; migração 2 não sobrescreve horário que ela já mudou).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm run test` PASS.
- [ ] **Step 5:** `git commit -am "feat(hoje): rotina com a Smartfit no caminho do trabalho"`

---

## Entrega 2 — Explicações que dá pra entender

### Task 8: Tipo `Execucao` e a tela

**Files:**
- Modify: `src/lib/db.ts` (`Exercise.execucao?: Execucao`, `DanceMove.execucao?: Execucao`)
- Create: `src/lib/execucao.ts` (tipo + validador puro), `src/components/ExecucaoBlocos.tsx`
- Modify: `src/components/ExerciseInfoModal.tsx` (l.57-76: se `execucao`, mostra `ExecucaoBlocos` no lugar de description/erros/dicas; passa a mostrar `successCue` quando não houver `execucao`), `src/pages/workout/ExerciseDetail.tsx` (l.37-63, idem), `src/components/MoveStep.tsx` (l.54: com `execucao`, mostra Posição + Movimento sempre e o resto atrás de "Como saber se está certo")
- Test: Create `tests/lib/execucao.test.ts`, `tests/components/ExecucaoBlocos.test.tsx`

**Interfaces — Produces:**
```ts
export interface Execucao {
  posicao: string;          // uma linha
  movimento: string[];      // 2 a 4 passos
  ondeSentir: string;
  erradoSe: string[];       // ≥ 1, cada um "sinal → correção"
  renderMais: string[];     // 1 a 2
  regulagem?: string;       // obrigatório quando o equipment tem maquina-*, leg-press ou polia
}
export function problemasDaExecucao(e: Execucao, equipment?: readonly string[]): string[]; // [] = ok
export const TERMOS_QUE_PEDEM_TRADUCAO: readonly RegExp[];
```
`problemasDaExecucao` checa contagens, "→" em cada `erradoSe`, regulagem quando exigida e, para cada termo de `TERMOS_QUE_PEDEM_TRADUCAO` encontrado num texto, exige na **mesma string** um "—" ou "(" logo depois do termo (exigir a tradução, não proibir a palavra — lição 5.2). Lista inicial: `rotação interna`, `rotação externa`, `transverso`, `flexão de quadril`, `extensão de quadril`, `isometria`, `escápula`, `retroversão`, `anteversão`, `90/90`, `dorsiflexão`, `assoalho pélvico`, `cadeia posterior`.
Títulos dos blocos em `ExecucaoBlocos`, exatos: "Posição", "Movimento", "Onde sentir", "Tá errado se…", "Pra render mais", "Regulagem".

- [ ] **Step 1: Testes.** `problemasDaExecucao`: ok num exemplo válido; acusa 1 e 5 passos; acusa `erradoSe` sem "→"; acusa máquina sem regulagem; acusa "rotação interna" sem tradução e aceita "rotação interna — girar o joelho pra dentro". `ExecucaoBlocos`: renderiza os 6 títulos (5 sem regulagem) e os passos numerados.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS.
- [ ] **Step 5:** `git commit -am "feat(explicacao): formato fixo de execução"`

### Task 9: Explicações dos exercícios de treino

**Files:** Modify `src/data/exercises-seed.ts`, `src/lib/seed.ts` (`EXERCISE_SEED_VERSION = 17`); Test: Create `tests/data/execucao-exercicios.test.ts`, pino em `seeds-chegam-no-aparelho.test.ts`.

- [ ] **Step 1: Teste.** Para todo `exerciseId` **e** `substitutoId` de `ALL_TEMPLATES` (exceto `cardio-pos-treino`, `cardio-leve-esteira`, `aquecimento-articular`): `execucao` existe e `problemasDaExecucao(e.execucao, e.equipment)` é `[]`. Pino 17 + par de chegada (`hip-thrust-maquina` tem `execucao.regulagem` depois de plantar a versão 16).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Escrever as `execucao`. Linguagem: frase curta, "você", uma ação por passo, nenhum termo da lista sem tradução, "Onde sentir" sempre com o músculo em palavra comum ("bumbum, embaixo"), "Pra render mais" sem pedir mais carga. Manter `description`/`commonMistakes` (biblioteca e backup antigos dependem). Não mudar `videoUrl`.
- [ ] **Step 4:** `npm run test` PASS.
- [ ] **Step 5:** `git commit -am "feat(explicacao): execução de todos os exercícios do treino"`

### Task 10: Explicações do alongamento manhã/noite e do assoalho

**Files:** Modify `src/data/sequences-seed.ts`, `src/lib/movement-seed.ts:25` (`MOVEMENT_VERSION = 14`); Test: Create `tests/data/execucao-sequencias.test.ts`, pino em `seeds-chegam-no-aparelho.test.ts`.

- [ ] **Step 1: Teste.** Para toda sequência em `SEQUENCIAS_FLEX.manha`, `SEQUENCIAS_FLEX.noite` (`src/lib/flex-progression.ts:23-24`) e `PELVIC_ORDEM` (`src/lib/pelvic-progression.ts:38-52`), todo move (incluindo os de `NIVELAR_PELVE`) tem `execucao` com `problemasDaExecucao(...)` = `[]` (sem `equipment` → regulagem não exigida). Pino 14 + par de chegada (`flex-manha-amplitude` → move "90/90 com rotação" tem `execucao`).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Escrever. Assoalho: técnico e direto, nomeia corpo/pressão/ritmo, sem narrar cena (decisão de 2026-08-11); nenhum `name`/rótulo de sequência muda (discrição). Nunca propor strap-on.
- [ ] **Step 4:** `npm run test` PASS (inclui `sem-trh-agendada` e `discricao-rotulos`).
- [ ] **Step 5:** `git commit -am "feat(explicacao): alongamentos e assoalho no formato novo"`

### Task 11: Fechamento

**Files:** `docs/CONTINUAR-AQUI.md` (§1 linha nova da entrega, §8 onde fica `troca-aparelho.ts`/`execucao.ts`, §9 dívidas: tirar a do `tetoPredio`, registrar o que sobrou), `docs/OBJETIVO.md` §8 (passos 3–4 cumpridos; `no-low-pulley` aposentado).

- [ ] **Step 1:** `npm run test` e `npm run build` → verdes; colar o resumo no relatório.
- [ ] **Step 2:** `grep -rn "prédio" src` → só ocorrências que não tratam o prédio como lugar de treino.
- [ ] **Step 3:** Atualizar os docs; `git commit -am "docs: Smartfit Jardins entregue na branch"`.
- [ ] **Step 4:** **Parar.** Não fazer merge nem push — a decisão de publicar é dela.

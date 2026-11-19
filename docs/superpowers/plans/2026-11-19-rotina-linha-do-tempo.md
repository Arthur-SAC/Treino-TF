# Rotina em linha do tempo — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O Hoje vira uma linha do tempo única do dia, com avanço por aviso que ela aceita, noite com a noiva protegida e bloco do app de no máximo 30 min.

**Architecture:** Três módulos puros novos (`linha-do-tempo.ts`, `noite.ts`, `ofertas.ts`) que trabalham sobre o `DayRoutine` que já existe; o Today.tsx só apresenta. O desbloqueio automático do `usePlacas` vira oferta guardada em setting. Conteúdo de sequências abre num modal com o portal `NaFrente` (d5ae681).

**Tech Stack:** React 18 + TS, Dexie (`db.settings`), Vitest + Testing Library (happy-dom), Tailwind.

**Spec:** `docs/superpowers/specs/2026-11-19-rotina-linha-do-tempo-design.md` (ler inteiro, principalmente as seções 2, 3, 4 e 10).

## Global Constraints

- pt-BR em todo texto de tela; tratar por "você"; sem emoji.
- Rótulo novo passa pela regra de discrição (`src/lib/discricao.ts`, teste `tests/lib/discricao-rotulos.test.ts`): nada que diga noiva, namorada, sexo, trans, hormônio na tela do Hoje.
- Nunca escrever "enquanto a TRH não vem"; nunca sugerir cortar comida.
- Números-alvo só em `src/lib/objetivo.ts`.
- Seed mudou → sobe a versão e o teste que a prende (`tests/lib/seeds-chegam-no-aparelho.test.ts`).
- Módulos de rotina continuam puros (sem db, sem `Date` interno).
- Teto do bloco do app à noite: **30 min**. "Agora não" espera **7 dias**.
- Blocos dela: seg–qui e domingo **20h15–22h30** (jantar 20:15, com ela 21:15, leitura 22:15, dormir 22:30); bloco do app **20:45**. Sexta e sábado: das **18:00** em diante, tudo dela, sem bloco do app.
- Nada de push: o controlador pergunta a ela antes de `git push origin main`.
- Rodar `npx vitest run` e `npm run build` antes de cada commit.

## Review Focus

1. Sexta e sábado à noite: nenhum item do bloco do app aparece nem agenda lembrete nativo (`src/lib/lembretes/`, `notification-scheduler.ts`).
2. Itens sem horário (água, "Esta semana") continuam visíveis na linha do tempo.
3. Horário ajustado por ela em `/hoje/horarios` decide a posição do item na linha, não o `defaultTime`.
4. Blocos dela nunca entram em adesão, revisão de domingo, sequência ou queda (`adesao.ts`, `revisao-semanal.ts`, `sequencia.ts`).
5. Backup antigo restaurado (`backup-io.ts` une `desbloqueios`): nenhuma oferta oferece o que já está aberto.

Cada linha tem teste na tarefa dona (marcado **[RF n]**).

---

### Task 1: Noite nova e blocos dela em `today-routine.ts`

**Files:**
- Modify: `src/lib/today-routine.ts` (`NOITE`, `noiteDoDia`, `RoutineControl`, label do café)
- Modify: `src/lib/nucleo.ts` (nada muda nos ids; conferir)
- Modify: `src/lib/adesao.ts`, `src/lib/revisao-semanal.ts`, `src/lib/lembretes/planejar.ts`, `src/lib/notification-scheduler.ts` (ignorar `control: "dela"`)
- Modify: `src/lib/seed.ts` (`LEMBRETES_MIGRACAO` 2 → 3)
- Test: `tests/lib/noite-dela.test.ts`

**Interfaces:**
- Produces: `RoutineControl` ganha `"dela"` (item sem caixinha, nunca conta). Ids novos: `"com-ela"` (21:15, label `"Noite livre"`, subtitle `"Desenho, escrita, RPG ou conversa"`), `"leitura"` (22:15, label `"Leitura"`), e nas sextas/sábados um único `"noite-livre"` (18:00, label `"Noite livre"`). Exporta `export function ehDela(i: RoutineItem): boolean`.

- [ ] **Step 1: Teste que falha** — em `tests/lib/noite-dela.test.ts`:
  - `buildDayRoutine(3, 100)` (quarta): noite tem, nesta ordem de `defaultTime`, `jantar` 20:15, `skincare-noite` 20:45, `alongamento-noite` 20:50, `com-ela` 21:15, `leitura` 22:15, `dormir` 22:30; `com-ela` e `leitura` têm `control: "dela"`.
  - `buildDayRoutine(0, 100)` (domingo): mesmos blocos dela.
  - `buildDayRoutine(5, 100)` e `(6, 100)`: noite NÃO tem `skincare-noite`, `alongamento-noite`, `postura`, `voz`, `assoalho-pelvico`; tem `noite-livre` 18:00 com `control: "dela"` e `dormir`. **[RF 1]**
  - Nenhum item com `control: "dela"` aparece no plano de lembretes (`planejar.ts`) de sexta. **[RF 1]**
  - `adesao` e `revisarSemana` não contam itens `"dela"` (monte um dia com eles marcados e confira que os totais não mudam). **[RF 4]**
  - O item de café não tem "whey" no label.
  - Labels novos passam em `discricao.ts`.
- [ ] **Step 2:** `npx vitest run tests/lib/noite-dela.test.ts` → FAIL.
- [ ] **Step 3: Implementar.** Postura, voz e assoalho continuam na lista `NOITE` com `defaultTime` provisório 21:05 (quem decide se entram no dia é a Task 2). Modo esteira: manter `HORARIO_NOITE_ESTEIRA` coerente (jantar não pode cair antes da esteira acabar; se colidir, os blocos dela começam 30 min depois do jantar). `LEMBRETES_MIGRACAO = 3` troca `eveningReminderTime` "20:30" → "20:45" do mesmo jeito que a migração 2.
- [ ] **Step 4:** suíte inteira + build passam (ajustar testes antigos que prendiam 20:00/20:30/21:30, citando o spec no comentário).
- [ ] **Step 5: Commit** `feat(hoje): noite com blocos dela e sexta/sábado livres`

### Task 2: Teto de 30 min e rodízio do bloco do app (`src/lib/noite.ts`)

**Files:**
- Create: `src/lib/noite.ts`
- Test: `tests/lib/noite-rodizio.test.ts`

**Interfaces:**
- Consumes: `DayRoutine`, `Desbloqueados`, minutos das sequências (`SEQUENCES` / `duracao` de `desbloqueios.ts` — exportar `duracao` se precisar).
- Produces:
  - `export const TETO_NOITE_MIN = 30;`
  - `export const RODIZIO_NOITE = ["postura", "voz", "assoalho-pelvico"] as const;` (ordem de prioridade)
  - `export function ajustarNoite(r: DayRoutine, minutosDe: (itemId: string) => number): DayRoutine` — tira do dia os itens do rodízio que não couberem e dá `defaultTime` sequencial aos que ficam, começando logo depois do alongamento.
  - `export function rodizioDaSemana(abertos: readonly string[], minutosDe: (itemId: string) => number): Record<number, string[]>` — dia da semana (0–6) → itens do rodízio naquela noite; sexta e sábado sempre `[]`.

- [ ] **Step 1: Teste que falha:**
  - fixos (skincare 3 + alongamento 21) = 24 → sobram 6: com postura 5, voz 2 e assoalho 3 abertos, cada noite seg–qui/dom recebe itens cuja soma ≤ 6, e ao longo da semana todo item aberto aparece ao menos 1x.
  - fixos ≥ 30 → rodízio vazio todo dia (fixos nunca saem).
  - sexta e sábado → `[]`.
  - ordem de prioridade respeitada quando só um cabe.
  - função pura: mesma entrada, mesma saída.
- [ ] **Step 2:** rodar → FAIL. **Step 3:** implementar (algoritmo livre, determinístico pelo dia da semana). **Step 4:** PASS + suíte. **Step 5: Commit** `feat(hoje): teto de 30 min e rodízio da noite`

### Task 3: Ofertas "Pronta pra próxima" (`src/lib/ofertas.ts`)

**Files:**
- Create: `src/lib/ofertas.ts`
- Modify: `src/lib/settings-helpers.ts` (setting novo `ofertasRecusadas: Record<string, string>` = id → ISO da recusa, default `{}`; setting `fasesAceitas: Record<"flexManha"|"flexNoite"|"pelvica"|"rebolado"|"postura", number>`, default = fase 1 em tudo, migração na Task 6 põe a fase atual)
- Modify: `src/lib/backup-io.ts` (os dois settings entram no backup; união de `fasesAceitas` pelo maior)
- Test: `tests/lib/ofertas.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Oferta =
    | { tipo: "ciclo"; id: string; para: CycleId; titulo: string; praQue: string }
    | { tipo: "desbloqueio"; id: DesbloqueioId; titulo: string; entra: string; praQue: string; minutos: number; horario: string | null; rodizio?: string }
    | { tipo: "fase"; id: string; trilha: keyof FasesAceitas; fase: number; titulo: string; praQue: string; minutos: number };
  export interface EntradaOfertas {
    hoje: string; ciclo: CycleAdvice | null; sequencia: number; ja: Desbloqueados;
    recusadas: Record<string, string>; contagens: Record<keyof FasesAceitas, number>; fasesAceitas: FasesAceitas;
  }
  export function ofertaDaVez(e: EntradaOfertas): Oferta | null;
  export function contagemLiberada(trilha: keyof FasesAceitas, praticas: number, aceitas: FasesAceitas): number;
  export const ESPERA_RECUSA_DIAS = 7;
  ```
  `contagemLiberada` corta a contagem em `limiteDaFase - 1` enquanto a fase seguinte não foi aceita, usando `ATE_FLEX_FASE_2/3`, `ATE_FASE_3`/`ATE_ROTACAO`, `ATE_REBOLADO_FASE_2/3/4`, `ATE_GINGADO` (conferir no arquivo de cada trilha o sentido exato de cada constante antes de usar).

- [ ] **Step 1: Teste que falha:**
  - ordem: ciclo com `recommend` vence desbloqueio; desbloqueio por patamar vence fase.
  - patamar alcançado e aberto → não oferece; fechado → oferece. **[RF 5]** (com `ja` vindo de `unirDesbloqueios` de um backup).
  - recusada há 3 dias → pula pra próxima da fila; recusada há 7 → volta.
  - recusada hoje e chamada de novo no mesmo `hoje` → não volta. 
  - dentro da mesma parte nunca pula: `voz-2` não é oferecida com `voz-1` fechada.
  - `contagemLiberada("flexNoite", 40, {flexNoite: 1, ...})` = `ATE_FLEX_FASE_2 - 1` (ajustar ao sentido da constante); com fase 2 aceita = 40.
  - `alongamento-noite` nunca é oferecido (já entra aberto).
- [ ] **Step 2–4:** FAIL → implementar → PASS + suíte. **Step 5: Commit** `feat(hoje): ofertas que ela aceita`

### Task 4: Aviso de ciclo pela carga na Entrada

**Files:**
- Modify: `src/lib/cycle-advisor.ts` (entrada-1/2/3) e `src/hooks/useCycleAdvice.ts` (passar as cargas)
- Test: `tests/lib/cycle-advisor-entrada.test.ts`

**Interfaces:**
- Produces: `CycleAdviceInput` ganha `cargaAcimaDaSugerida: boolean` (true quando na última sessão do ciclo, em todo exercício com carga registrada, o peso usado passou da sugestão de `suggestNextLoad` em `progression.ts`). Em `entrada-*`, `recommend: true` quando `floorReached || cargaAcimaDaSugerida`; reason em pt-BR dizendo que a carga dela já passou da semana.

- [ ] Step 1: testes — entrada-1 com 2 sessões e carga acima → recomenda entrada-2; carga igual → não; adaptação em diante não muda de comportamento. Step 2–4 como acima. Step 5: commit `feat(ciclos): Entrada avança quando a carga já passou`.

### Task 5: Tela Hoje em linha do tempo + modal de sequência

**Files:**
- Create: `src/lib/linha-do-tempo.ts`, `src/components/SequenciaModal.tsx`, `src/components/OfertaCard.tsx`
- Modify: `src/pages/Today.tsx`, `src/components/RoutineRow.tsx` (variante `dela`: fundo roxo claro da paleta, sem caixinha), `src/hooks/usePlacas.tsx` (para de gravar `desbloqueios` sozinho: a placa de desbloqueio some; vitória e queda ficam)
- Test: `tests/lib/linha-do-tempo.test.ts`, `tests/pages/hoje-linha-do-tempo.test.tsx`, ajustar `tests/pages/hoje-niveis.test.tsx`, `tests/pages/SessionDetail-desbloqueio.test.tsx`, `tests/hooks/usePlacas-desbloqueio.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3 (`ehDela`, `ajustarNoite`, `ofertaDaVez`, `contagemLiberada`), `resolveRoutineTime`, `NaFrente`.
- Produces:
  - `export interface LinhaDoTempo { diaInteiro: RoutineItem[]; horas: RoutineItem[]; semana: RoutineItem[] }`
  - `export function linhaDoTempo(r: DayRoutine, horarios: RoutineTimeOverrides): LinhaDoTempo` — `horas` ordenado pela hora resolvida (ajuste dela vence o padrão; empate mantém a ordem dos blocos); `diaInteiro` = sem horário (água, sol); `semana` = bloco "semana".
  - `SequenciaModal({ sequenceId, onClose, onConcluir })` — passos com `ExecucaoBlocos`, vídeo, e "Concluir" grava o `practiceLog` do mesmo jeito que `SequenceDetail` (reusar a função de gravação, não duplicar).
  - `OfertaCard({ oferta, onAceitar, onAgoraNao })` — título "Pronta pra próxima", o que entra, pra quê, minutos e (se houver) o rodízio da noite; botões "Aceitar" / "Agora não".

- [ ] **Step 1: Testes que falham:**
  - `linhaDoTempo`: item com override "19:00" em `routineTimes` aparece antes de um de 19:30 padrão **[RF 3]**; água fica em `diaInteiro` **[RF 2]**; nada se perde (soma dos três = itens do dia).
  - Hoje (quarta, render com db fake como nos testes atuais de `hoje-niveis`): os itens aparecem numa lista só na ordem das horas; `com-ela` não tem checkbox; com uma oferta pendente o card "Pronta pra próxima" aparece no topo; "Aceitar" de desbloqueio grava em `desbloqueios`; "Agora não" grava em `ofertasRecusadas` e o card some; tocar no alongamento abre o modal na frente (`document.body > .fixed`) em vez de navegar.
  - Contagem "x de y" do núcleo continua (mesmos `NUCLEO_IDS`), sem a caixa separada.
  - Treino continua link pra `/treino/sessao/:id`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. A tela passa `contagemLiberada(...)` no lugar das contagens cruas pra `flexDoDia`, `pelvicDoDia`, `reboladoDoDia`, `posturaDoDia`. Voz: o item abre o mesmo modal com a sequência de voz do dia se o seed de voz tiver passos compatíveis; se não tiver, continua link (registrar no relatório). **Step 4:** suíte + build. **Step 5: Commit** `feat(hoje): linha do tempo única com ofertas e como-fazer na frente`

### Task 6: Migração, Consulta e Movimento por nível

**Files:**
- Modify: `src/lib/seed.ts` (migração `ROTINA_LINHA_MIGRACAO = 1`: marca `alongamento-noite` em `desbloqueios` com a data de hoje se não estiver; grava `fasesAceitas` com a fase que cada trilha já tem pela contagem atual, pra ninguém voltar de fase)
- Modify: `src/components/BottomNav.tsx` (label "Guia" → "Consulta"; rota `/guia` igual), `src/pages/GuiaHome.tsx` (título "Consulta"; sai "Refeições de hoje"; a rota `/refeicoes-hoje` continua existindo)
- Modify: `src/pages/workout/MovementHome.tsx` (três seções Básico / Intermediário / Avançado pelo `level` da sequência; dentro de cada uma, os grupos de hoje como subtítulo, na mesma ordem)
- Modify: `docs/CONTINUAR-AQUI.md` (linha J na tabela, com spec, plano e estado)
- Test: `tests/lib/migracao-rotina-linha.test.ts`, `tests/pages/consulta.test.tsx`, `tests/pages/movimento-por-nivel.test.tsx`

- [ ] **Step 1: Testes que falham:**
  - migração roda uma vez; com `flexNoite` já em 40 práticas, `fasesAceitas.flexNoite` fica na fase que 40 dá hoje; rodar de novo não muda nada; restaurar backup depois roda de novo (mesmo padrão de `SMARTFIT_MIGRATION`).
  - BottomNav mostra "Consulta"; `/guia` abre; "Refeições de hoje" não aparece na Consulta.
  - Movimento: a primeira seção é "Básico" e só tem `level: "iniciante"`; nenhuma sequência some (contagem total igual ao seed).
- [ ] **Step 2–4:** FAIL → implementar → PASS + suíte + build. **Step 5: Commit** `feat: migração da rotina, aba Consulta e Movimento por nível`

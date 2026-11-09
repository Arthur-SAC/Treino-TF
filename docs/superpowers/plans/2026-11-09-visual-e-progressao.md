# Visual novo e progressão por desbloqueio — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O app fica claro (paleta A), responde ao toque como carta de jogo, comemora o treino
(vitória), mostra a queda da sequência e abre as mecânicas por níveis conforme a sequência de
treinos cresce, com uma lista de Conquistas no Progresso.

**Architecture:** O tema troca os *valores* dos tokens Tailwind existentes (os nomes de classe
ficam) e acrescenta tokens novos (`feito`, `vital`, `verm`). A sequência e os desbloqueios são
funções puras em `src/lib/` (`sequencia.ts`, `proxima-parte.ts`, `desbloqueios.ts`). O estado
fica em settings (`sequenciaDesde`, `quedaVistaEm`, `desbloqueios`, `conquistasVistas`). Um
`PlacasProvider` montado no `App.tsx`, como irmão do `<main>`, mostra as placas em fila. O Hoje
aplica `filtrarRotina` entre `buildDayRoutine` e `separarNucleo`.

**Tech Stack:** React 18 + TS, Tailwind, Dexie, Vitest + Testing Library + fake-indexeddb, CSS
keyframes (sem biblioteca de animação nova), Capacitor Android (só recursos/estilos).

**Spec:** `docs/superpowers/specs/2026-11-09-visual-e-progressao-design.md`

## Global Constraints

- Ler `CLAUDE.md`, `docs/OBJETIVO.md` e `docs/CONTINUAR-AQUI.md` antes de mexer.
- `npm run test` verde e `npm run build` limpo **em todo commit**.
- Módulos de `src/lib/` sem `db`, sem `new Date()` e sem React. Datas entram como string ISO `YYYY-MM-DD`.
- Seed mudou: sobe a versão e o pin em `tests/lib/seeds-chegam-no-aparelho.test.ts`.
- Setting novo entra em `Settings` **e** em `DEFAULTS` (`src/lib/settings-helpers.ts`).
- Sem emoji em lugar nenhum. Copy em pt-BR, sem amenizar e sem humilhar.
- Todo rótulo visível novo passa no regex `EXPOE` de `tests/lib/discricao-rotulos.test.ts`.
- Animar só `transform`/`opacity`. Com `prefers-reduced-motion: reduce`, nada balança nem gira: vira fade curto.
- Sem som. Vibração desligada no check do Hoje.
- Núcleo nunca tranca: treino, refeições, lanche, água, creatina, vitamina D, caminhada, cães, dormir. A Vitalidade, o Guia e a biblioteca nunca trancam.
- Desbloqueado nunca volta a trancar.
- Sem push. `git push origin main` só com permissão dela, e quem pede é o controlador.
- Paleta A, valores exatos: fundo `#fff7f3`, card `#ffffff`, borda `#f0d9d4`, texto `#2a1416`, texto 2 `#7d5f5d` (escurecido do mockup `#8a6a68` pra passar AA), vermelho `#e23b3b`, vermelho 2 `#c81d3a`, vermelho 3 `#9e1430`, verde-água `#17a398`, roxo `#7b4fd6`, trilho `#f5e2de`.

## Review Focus

1. **Contraste do texto vermelho.** `#e23b3b` sobre `#fff7f3` dá cerca de 3,9:1 e falha AA pra texto pequeno. Texto de destaque usa `#c81d3a`. `#e23b3b` só aparece em preenchimento ou texto grande. Teste de contraste na Task 1.
2. **Combinações herdadas do tema escuro.** Classes como `bg-wine text-nude-warm` ou `bg-nude text-bg-deep` ficariam ilegíveis sem revisão. Varredura com grep na Task 2.
3. **Hoje pendente.** Treino não feito hoje não zera a sequência; só zera um dia útil que já passou. Teste na Task 6.
4. **Fim de semana.** Sábado e domingo não quebram e não contam, inclusive se ela treinar. Teste na Task 6.
5. **Testes antigos do Hoje.** Num banco novo, tudo fora do núcleo nasce trancado, então os testes antigos que esperam assoalho, postura ou alongamento da noite quebram. Eles usam o helper `desbloquearTudo()` (Task 9). Nenhum teste é apagado.

---

## Entrega 1 — paleta, movimento, responsivo, Hoje mais limpo, APK

### Task 1: Tokens da paleta A, CSS base e cores do manifesto

**Files:**
- Modify: `tailwind.config.ts`, `src/index.css`, `index.html:6`, `vite.config.ts:21-22`, `scripts/generate-icons.mjs:9-11`, `public/icons/*.svg` (regerados), `capacitor.config.ts` (`iconColor`)
- Create: `src/lib/contraste.ts`, `tests/lib/contraste-paleta.test.ts`

**Interfaces:**
- Produces:
  - `contraste(hexA: string, hexB: string): number`, a razão WCAG 2.x.
  - `PALETA` exportada de `src/lib/contraste.ts` (`as const`), com as chaves `fundo, card, borda, texto, texto2, verm, verm2, verm3, feito, vital, trilho` e os valores da spec. O `tailwind.config.ts` importa `PALETA` e não repete hex.
  - Tokens Tailwind:

| Token | Valor |
|---|---|
| `bg.base` | fundo |
| `bg.raised` | card |
| `bg.deep` | trilho |
| `bg.border` | borda |
| `nude.warm` | texto |
| `muted` | texto2 |
| `nude.DEFAULT` | verm2 (texto de destaque) |
| `nude.light` | verm |
| `wine.DEFAULT` | `#fde4e0` (tinta clara de vermelho pra fundo de botão secundário) |
| `wine.light` | `#f9cfc8` |
| `verm.DEFAULT` / `verm.2` / `verm.3` | verm / verm2 / verm3 (novos) |
| `feito` | verde-água (novo) |
| `vital` | roxo (novo) |

- [ ] **Step 1: Teste que falha.** `tests/lib/contraste-paleta.test.ts`:
  - `contraste("#ffffff","#000000")` ≈ 21 (`toBeCloseTo(21,0)`).
  - `contraste(PALETA.texto, PALETA.fundo) >= 4.5`.
  - `contraste(PALETA.texto2, PALETA.fundo) >= 4.5`.
  - `contraste(PALETA.verm2, PALETA.fundo) >= 4.5`.
  - `contraste(PALETA.vital, PALETA.card) >= 4.5`.
  - `contraste("#ffffff", PALETA.verm2) >= 4.5`, que é o texto branco no card do treino.
  - `contraste("#ffffff", PALETA.feito) >= 3`, pro ícone de "feito" (não é texto).
  - Se `texto2` falhar, escurecer até passar e registrar no commit. A spec manda AA no mínimo.
- [ ] **Step 2:** `npx vitest run tests/lib/contraste-paleta.test.ts`. Deve falhar porque o módulo não existe.
- [ ] **Step 3:** Implementar `contraste` e `PALETA`. Depois trocar os tokens do Tailwind pela tabela acima.
  - `index.css`: o `:focus-visible` passa pra `theme("colors.verm.2")`.
  - `index.html` e o manifest: `theme_color` e `background_color` passam a `#fff7f3`.
  - `generate-icons.mjs`: fundo `#fff7f3`, desenho em `#e23b3b`/`#c81d3a`. Rodar o script pra regerar `public/icons/*.svg`.
  - `capacitor.config.ts` `iconColor`: `#e23b3b`.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes.
- [ ] **Step 5:** Commit `feat(visual): paleta A clara nos tokens, manifesto e ícones`.

### Task 2: Varredura das combinações herdadas + destaques da paleta + responsivo

**Files:** os que o grep apontar em `src/`. Os certos são:
- `src/components/BottomNav.tsx` e `src/pages/Today.tsx` (`TodayCard` do treino)
- `src/components/MeasurementChart.tsx`, `ProgressionChart.tsx`, `WhrChart.tsx`
- `src/components/MoodPicker.tsx:16-20` e `src/pages/path/DiaryView.tsx:75`

**Interfaces:** Consumes os tokens da Task 1.

- [ ] **Step 1:** Grep e correção, uma regra por padrão:
  - `text-red-200|text-red-300` passa a `text-verm-3`.
  - `bg-red-900/*` passa a `bg-wine`.
  - `border-red-900` passa a `border-verm/40`.
  - `bg-black/60|70` dos modais passa a `bg-[#2a1416]/40`. Fundo de modal escurecido continua ok.
  - `text-bg-base|text-bg-deep` sobre `bg-nude`/`bg-verm` passa a `text-white`.
  - Botão primário `bg-wine-light text-nude-warm`: se o grep achar texto ilegível, passa a `bg-verm text-white`. Os 46 usos de `bg-wine-light` ficam como botão secundário claro se o texto for escuro.
  - Hex dos gráficos passa a valores da `PALETA`. Linha principal `verm`, meta `feito`, grade `borda`.
- [ ] **Step 2:** Destaques da spec §4:
  - Card do treino no Hoje: `bg-gradient-to-br from-verm to-verm-2 text-white`, com sombra `verm-3`. É o maior destaque do Hoje.
  - `BottomNav`: fundo `bg-bg-raised/95`, aba ativa `text-verm-2` com pílula `bg-wine`. Na aba Vitalidade, a ativa é `text-vital` com pílula `bg-vital/10`.
  - Verde-água só em "feito" e conquista. Grep `feito` não pode aparecer em botão comum.
- [ ] **Step 3: Responsivo.**
  - Grep por `w-\[`, `min-w-\[` e `grid-cols-[3-9]` sem prefixo `sm:`. Qualquer largura fixa > 288 px sem `max-w-full` é corrigida.
  - Alvos de toque < 44 px (`h-8`, `w-8`, `p-1` em botão) ganham área via `min-h-11 min-w-11` ou o padrão `p-3 -m-3` do `RoutineRow`.
  - Teste novo `tests/lib/sem-largura-fixa.test.ts`: lê os `.tsx` de `src/` e falha se achar `w-\[(\d{3,})px\]` com valor > 288 sem `max-w-full` na mesma className.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes. `npm run dev` e conferir à mão Hoje, Progresso, Guia, Vitalidade, sessão de treino e Configurações em 320 px e 768 px, sem rolagem horizontal. O implementador anota no relatório o que viu.
- [ ] **Step 5:** Commit `feat(visual): destaques da paleta, combinações claras e alvos de toque`.

### Task 3: Movimento — balanço, pulo, "+1", barra e placas

**Files:**
- Modify: `src/index.css`, `src/components/RoutineRow.tsx`, `src/pages/Today.tsx` (barra do núcleo)
- Test: `tests/components/RoutineRow-movimento.test.tsx`

**Interfaces:**
- Produces as classes CSS que as Tasks 7 e 10 usam:
  - `.carta-balanca` (≈450 ms, rotação até ±2,5°)
  - `.caixa-pula` (≈350 ms)
  - `.mais-um` (sobe e some, cor `feito`)
  - `.barra-enche` (transition de `transform: scaleX` com curva que passa do ponto, ex. `cubic-bezier(.34,1.56,.64,1)`)
  - `.placa-entra` (gira e assenta)
  - `.placa-treme`
  - `.numero-salta`
  - Dentro de `@media (prefers-reduced-motion: reduce)`, `.carta-balanca`, `.caixa-pula`, `.placa-entra`, `.placa-treme` e `.numero-salta` trocam a animação por `fade-curto` (opacity 0→1, 150 ms). O bloco global de 1 ms que já existe fica.

- [ ] **Step 1: Teste que falha.**
  - Clicar na caixinha de um item não feito põe a classe `caixa-pula` na caixinha e mostra um elemento com texto `+1` e classe `mais-um`.
  - Tocar no corpo do card põe `carta-balanca` no wrapper, e a classe sai no `animationend`. Disparar `fireEvent.animationEnd`.
  - `navigator.vibrate` não é chamado. Espiar com `vi.fn()`.
  - Feito: a caixinha usa `bg-feito`, não `bg-nude`.
- [ ] **Step 2:** Rodar e ver falhar.
- [ ] **Step 3:** Implementar.
  - `Box` troca `.marca-pop` por `.caixa-pula`.
  - Remover `navigator.vibrate?.(12)` (`RoutineRow.tsx:41`).
  - O "+1" é um `<span aria-hidden>` absoluto que se remove no `animationend`.
  - Barra do núcleo no `Today.tsx`: largura vira `transform: scaleX(fração)` com `origin-left` e `.barra-enche`. Preenchimento `bg-feito` quando 100%, `bg-verm` antes.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes.
- [ ] **Step 5:** Commit `feat(visual): card balança, caixinha pula com +1, barra que enche`.

### Task 4: "Seu tempo" e "Diário" saem do Hoje

**Files:**
- Modify: `src/lib/today-routine.ts:364-365`
- Tests to update: `tests/lib/today-routine.test.ts:20`, `tests/pages/Today.test.tsx:44-46`, `tests/pages/today-treino.smoke.test.tsx:16-20`
- `tests/components/RoutineRow-abrir.test.tsx` usa item literal e fica.

- [ ] **Step 1:** Mudar os testes.
  - `today-routine.test.ts`: a lista de ids não tem `seu-tempo` nem `diario`, e ganha um teste "nenhum dia tem seu-tempo/diario" pros 7 dias.
  - `Today.test.tsx`: o teste "mostra o item Seu tempo" vira "não mostra Seu tempo nem Diário" (`queryByText` nulo).
  - O smoke ancora em outro item de extras, `Postura`, depois de `desbloquearTudo()`. Se a Task 9 ainda não existir, ancorar em `Barba`/`Sol da manhã`, conforme o dia do teste.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Remover os dois itens do builder.
  - O Diário continua no Progresso (`ProgressoHome.tsx`) e na rota `trilha/diario`.
  - Os dados ficam.
- [ ] **Step 4:** Verdes.
- [ ] **Step 5:** Commit `feat(hoje): tira Seu tempo e Diário do Hoje (dados e Diário no Progresso ficam)`.

### Task 5: APK claro — ícone, splash, barra de status, NATIVE_VERSION 2

**Files:**
- Modify: `android/app/src/main/res/values/ic_launcher_background.xml`, `android/app/src/main/res/values/styles.xml`, `src/lib/versao-nativa.ts`
- Create: `android/app/src/main/res/values/colors.xml`
- Create or replace: `android/app/src/main/res/drawable/splash.xml`
- Test: `tests/lib/apk-claro.test.ts`

**Ruling já tomada:**
- Recurso nativo não chega por OTA, e é o `NATIVE_VERSION` maior que faz o app avisar "Tem versão nova do app para instalar". Então sobe de 1 pra 2. A linha mantém o formato exato: `export const NATIVE_VERSION = 2;`, pinado em `tests/lib/ci-android.test.ts:15`.
- A splash vira um `layer-list` XML com fundo `#fff7f3` e o `@mipmap/ic_launcher_foreground` no centro. Os PNGs `splash.png` de `drawable*/` são apagados, pra não haver dois `@drawable/splash`.
- Se o `Theme.SplashScreen` exigir `windowSplashScreenBackground`, pôr `#fff7f3` nele também.

- [ ] **Step 1: Teste que falha.** `tests/lib/apk-claro.test.ts` lê os XML com `fs` e espera:
  - `ic_launcher_background` = `#FFF7F3`, sem diferenciar maiúscula.
  - `styles.xml` contém `android:statusBarColor` apontando pra uma cor `#fff7f3` e `android:windowLightStatusBar` = `true`.
  - `colors.xml` define `colorPrimary`, `colorPrimaryDark` e `colorAccent`, que hoje são referenciados e não existem.
  - Não existe nenhum `splash.png` em `res/drawable*`.
  - `NATIVE_VERSION === 2`.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
  - `colorPrimary` `#fff7f3`, `colorPrimaryDark` `#fff7f3`, `colorAccent` `#e23b3b`.
  - O item de barra de status entra em `AppTheme.NoActionBar` e `AppTheme.NoActionBarLaunch`.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes. Se houver Android SDK local, também `npx cap sync android` e `cd android && ./gradlew assembleDebug`. Se não houver, anotar que o CI (`.github/workflows/android.yml`) gera.
- [ ] **Step 5:** Commit `feat(apk): ícone, splash e barra de status claros; NATIVE_VERSION 2`.

---

## Entrega 2 — sequência, vitória e queda

### Task 6: Regra pura da sequência e da próxima parte + marco de início

**Files:**
- Create: `src/lib/sequencia.ts`, `src/lib/proxima-parte.ts`
- Modify: `src/lib/settings-helpers.ts`, `src/lib/seed.ts`
- Test: `tests/lib/sequencia.test.ts`, `tests/lib/proxima-parte.test.ts`, `tests/lib/seed-sequencia-migracao.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface EstadoSequencia {
    atual: number;        // dias úteis seguidos com treino, terminando no último dia útil ≤ hoje
    quebra: string | null; // ISO do 1º dia útil perdido da última quebra (≥ desde, < hoje)
    anterior: number;     // sequência que existia logo antes dessa quebra
    diasPerdidos: number; // quantos dias úteis seguidos foram perdidos nessa quebra
  }
  export function estadoSequencia(datasComTreino: readonly string[], desde: string, hoje: string): EstadoSequencia
  export function deveMostrarQueda(e: EstadoSequencia, quedaVistaEm: string): boolean // e.quebra !== null && e.anterior >= 1 && e.quebra !== quedaVistaEm

  export interface ProximaParte { proximoId: CycleId | null; proximoNome: string | null; feitos: number; threshold: number; faltam: number; progresso: number /* 0..1 */ }
  export function proximaParte(activeCycle: CycleId, totalSessoes: number, cycleStart: number): ProximaParte
  ```
  - Settings novos:
    - `sequenciaDesde: string`, padrão `""`.
    - `sequenciaMigration: number`, padrão `0`.
    - `quedaVistaEm: string`, padrão `""`.
  - `SEQUENCIA_MIGRATION = 1`, exportado de `seed.ts`.
- Regra:
  - Dia útil = segunda a sexta. Ela pediu sem exceção, então feriado conta como dia útil.
  - Datas antes de `desde` e datas de sábado/domingo são ignoradas.
  - `hoje` sem treino não quebra: é pendente.
  - `desde === ""` dá tudo zero/nulo.
  - Datas repetidas contam uma vez.
- Ruling: a queda só aparece se `anterior ≥ 1`. Perder dia com a sequência em 0 não tem o que "perder", e a primeira semana não pune.

- [ ] **Step 1: Testes que falham.** Calendário real: 2026-11-09 é segunda.

  | Treinos | desde | hoje | Esperado |
  |---|---|---|---|
  | qualquer | `""` | qualquer | `{atual:0, quebra:null, anterior:0, diasPerdidos:0}` |
  | 09, 10, 11 | 09 | 11 | `atual 3` |
  | 09, 10, 11 | 09 | 12 (sem treino ainda) | `atual 3, quebra null` |
  | 09–13 | 09 | 16 (segunda, sem treino) | `atual 5, quebra null` (fim de semana não quebra) |
  | 09–13 + 14 (sábado) | 09 | 16 | `atual 5` (sábado não conta) |
  | 09, 10, 11 | 09 | 13 (sem o 12) | `atual 0, quebra "2026-11-12", anterior 3, diasPerdidos 1` |
  | 09, 10, 11, 13 | 09 | 13 | `atual 1, quebra "2026-11-12", anterior 3` |
  | 09, 10, 11 | 09 | 16 (sem 12, 13) | `diasPerdidos 2, quebra "2026-11-12"` |
  | 02, 03 + 09 | 09 | 09 | `atual 1` (antes do marco não conta e não quebra) |

  - `deveMostrarQueda`:
    - `{quebra:"2026-11-12", anterior:3}` com visto `""` dá `true`.
    - Com visto `"2026-11-12"` dá `false`.
    - Com `anterior 0` dá `false`.
  - `proximaParte`:
    - `("entrada-1", 3, 0)` dá `{proximoId:"entrada-2", feitos:3, threshold:5, faltam:2, progresso:0.6}`.
    - `("entrada-1", 9, 0)` dá `faltam 0, progresso 1`.
    - `("manutencao", 10, 0)` dá `proximoId null, proximoNome null`.
    - O próximo é a posição seguinte em `CYCLES` (`src/data/cycles-seed.ts`).
  - Migração:
    - Banco com `sequenciaMigration` ausente: depois de `seedDatabase()`, `sequenciaDesde === hojeISO()` e `sequenciaMigration === 1`.
    - Rodar de novo não muda `sequenciaDesde`. Gravar `"2026-01-01"` antes e conferir que fica.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
  - Migração no padrão do `SMARTFIT_MIGRATION` (`seed.ts`).
  - `backup-io.ts` não ganha bloco de delete: restaurar um backup velho não reinicia a sequência.
- [ ] **Step 4:** Verdes.
- [ ] **Step 5:** Commit `feat(sequencia): regra pura de dias úteis, próxima parte e marco de início`.

### Task 7: Placas — host em fila, vitória e queda

**Files:**
- Create: `src/hooks/usePlacas.tsx` (context + `PlacasProvider`), `src/components/placas/Placa.tsx` (moldura), `src/components/placas/PlacaVitoria.tsx`, `src/components/placas/PlacaQueda.tsx`, `src/lib/placas-texto.ts`
- Modify: `src/App.tsx`, `src/pages/workout/SessionDetail.tsx` (`finishSession`)
- Test: `tests/components/placas.test.tsx`, `tests/pages/SessionDetail-vitoria.test.tsx`, `tests/components/App-queda.test.tsx`

**Interfaces:**
- Consumes: `estadoSequencia`, `deveMostrarQueda` e `proximaParte` (Task 6). Classes `.placa-entra`, `.placa-treme` e `.numero-salta` (Task 3).
- Produces:
  ```ts
  export type PlacaDados =
    | { tipo: "vitoria"; treino: string; de: number; para: number; parte: ProximaParte }
    | { tipo: "queda"; de: number; diasPerdidos: number; parte: ProximaParte }
    | { tipo: "desbloqueio"; titulo: string; entra: string; praQue: string; minutos: number; horario: string | null }
    | { tipo: "conquista"; titulo: string; texto: string };
  export function usePlacas(): { mostrar(p: PlacaDados): void };
  export async function dadosDaSequencia(hoje: string): Promise<{ estado: EstadoSequencia; semHoje: EstadoSequencia; parte: ProximaParte }> // src/hooks/usePlacas.tsx; lê workoutSessions + settings
  ```
  O caso `desbloqueio`/`conquista` é desenhado na Task 10, mas o tipo nasce aqui.
- Copy fixa em `src/lib/placas-texto.ts`, exportada pra teste de discrição:
  - Vitória: título "Treino concluído", rótulo "Sequência", rótulo "Próxima parte", linha `faltam ${n} treinos pra ${nome}`. Com n=1, "falta 1 treino pra …". Com `proximoId null`, "Você está na última parte". Botão "Voltar pro Hoje".
  - Queda: título "Sequência perdida". Linha "Ontem não teve treino" quando `diasPerdidos === 1`, senão `${n} dias úteis sem treino`. Nota da próxima parte: "isso não volta atrás". Botão "Bora hoje".
- Comportamento:
  - O host é irmão do `<main>` no `App.tsx`, nunca dentro do `.tela-entra` (que tem transform).
  - Moldura: `fixed inset-0 z-[60]`, fundo `bg-[#2a1416]/40`, placa `card` com `.placa-entra`. Trava o scroll do body como o `ExerciseInfoModal`.
  - Fila: uma placa por vez, a próxima ao fechar.
  - Número: `de → para` sobe com `.numero-salta`. Na queda, desce de um em um até 0 (passo ≈120 ms, `setInterval` limpo no unmount) com `.placa-treme`. Com reduced-motion, mostra o final direto.
  - Faíscas da vitória: 8 `span` absolutos `aria-hidden`, alternando `bg-feito`/`bg-verm`, animados por CSS. Somem com reduced-motion.
  - Barra da próxima parte com `.barra-enche`.
  - Vitória: `finishSession` faz `await persist(...)`, depois `dadosDaSequencia(hoje)`, depois `mostrar({tipo:"vitoria", treino: <nome do template>, de: semHoje.atual, para: estado.atual, parte})`, e só então `navigate("/")`.
  - Queda: `PlacasProvider` no mount roda `verificarAoAbrir()`.
    - Se `deveMostrarQueda(estado, quedaVistaEm)`, grava `quedaVistaEm = estado.quebra` **antes** de mostrar (garante uma vez) e mostra a queda com `de = estado.anterior`.
    - Primeira abertura (marco = hoje): `quebra null`, nada aparece.

- [ ] **Step 1: Testes que falham.**
  - `placas.test.tsx`: `mostrar` duas placas e só a primeira aparece. Clicar no botão mostra a segunda.
  - Vitória com `de 7, para 8` mostra "Treino concluído", "8" e a linha do faltam.
  - Queda com `diasPerdidos 1` mostra "Ontem não teve treino" e "isso não volta atrás". Com 2, mostra "2 dias úteis sem treino".
  - `SessionDetail-vitoria.test.tsx` usa o padrão de `SessionDetail-troca.test.tsx`:
    - Com `sequenciaDesde` = hoje, salvar um exercício e clicar "Finalizar treino" mostra "Treino concluído" e Sequência "1" (o número final é texto).
    - Não depende de fake timers. Com reduced-motion simulado (`matchMedia` mock `matches:true`), o número final aparece direto.
  - `App-queda.test.tsx`: sessões nos dias úteis X-3, X-2 e nada em X-1, com X = um dia útil cujo anterior também é útil.
    - Abrir `<App>` mostra "Sequência perdida".
    - `quedaVistaEm` fica gravado.
    - Re-montar não mostra de novo.
  - Teste de discrição: `tests/lib/discricao-rotulos.test.ts` ganha um caso que roda `EXPOE` sobre todos os textos exportados de `placas-texto.ts`.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes.
- [ ] **Step 5:** Commit `feat(sequencia): placas em fila, vitória ao finalizar e queda ao abrir`.

---

## Entrega 3 — desbloqueios por nível e Conquistas

### Task 8: Tabela de níveis pura + alongamento curto da manhã

**Files:**
- Create: `src/lib/desbloqueios.ts`, `tests/lib/desbloqueios.test.ts`
- Modify: `src/data/sequences-seed.ts` (sequência nova), `src/lib/movement-seed.ts` (`MOVEMENT_VERSION` 14 para 15), `tests/lib/seeds-chegam-no-aparelho.test.ts` (pin 15), `src/lib/settings-helpers.ts`

**Interfaces:**
- Consumes: `DayRoutine`, `RoutineItem` (`src/lib/today-routine.ts`).
- Produces:
  ```ts
  export type DesbloqueioId = "manha-completa" | "assoalho-1" | "skincare-2" | "sentar" | "danca"
    | "alongamento-noite" | "assoalho-2" | "voz-1" | "skincare-3" | "postura" | "voz-2";
  export interface Desbloqueio { id: DesbloqueioId; patamar: number; titulo: string; entra: string; praQue: string; minutos: number; horario: string | null }
  export const DESBLOQUEIOS: readonly Desbloqueio[];          // ordenada por patamar
  export type Desbloqueados = Readonly<Record<string, string>>; // id -> ISO da data
  export function novosDesbloqueios(sequencia: number, ja: Desbloqueados): Desbloqueio[]
  export function proximoDesbloqueio(sequencia: number, ja: Desbloqueados): { d: Desbloqueio; faltam: number } | null
  export function filtrarRotina(r: DayRoutine, ja: Desbloqueados): DayRoutine
  export function idsTrancados(ja: Desbloqueados): ReadonlySet<string> // ids de item do Hoje escondidos
  export const SEQ_MANHA_CURTA = "manha-curta-vacuum";
  ```
  - Setting novo: `desbloqueios: Record<string, string>`, padrão `{}`.
- Tabela, com patamar e título visível exatos:

| id | patamar | título |
|---|---|---|
| manha-completa | 5 | Alongamento da manhã completo |
| assoalho-1 | 5 | Assoalho pélvico nível 1 |
| skincare-2 | 10 | Skincare nível 2 |
| sentar | 10 | Dica de sentar |
| danca | 10 | Dança de sábado |
| alongamento-noite | 15 | Alongamento da noite |
| assoalho-2 | 15 | Assoalho pélvico nível 2 |
| voz-1 | 15 | Voz nível 1 |
| skincare-3 | 20 | Skincare completo |
| postura | 20 | Postura |
| voz-2 | 25 | Voz completa |

  - `entra` e `praQue` são uma frase cada, em pt-BR, e dizem o que entra no dia.
  - `minutos` e `horario` vêm dos `defaultTime`/durações reais do seed. Exemplos: skincare-noite 20:30, assoalho 21:20, alongamento noite 21:30, voz 21:00, postura 20:45, dança sábado 17:30, sentar `null` (fica nas micro-pausas).

- **`filtrarRotina`**, o que cada id ausente faz. Ids presentes deixam o item como está. Itens fora da tabela nunca mudam.
  - Sem `manha-completa`: `alongamento-manha` vira o nível 1.
    - `label` = `Alongamento manhã · ${dur} min`, onde `dur` é a duração da sequência curta.
    - `subtitle` = "Curto pra pegar o hábito · inclui o vacuum".
    - `to` = `/treino/movimento/manha-curta-vacuum`, `linkKey` removido.
    - O vacuum continua no dia, que é a exigência da spec.
  - Sem `assoalho-1`: remove `assoalho-pelvico`.
  - Com `assoalho-1` e sem `assoalho-2`: `to` = `/treino/movimento/pelvic-identificacao`, `label` = `Assoalho pélvico · ${duração real} min`, `linkKey` removido.
  - Sem `skincare-2`: remove `skincare-noite`.
  - Com `skincare-2` e sem `skincare-3`: `skincare-noite` vira checkbox simples.
    - Remove `control: "skincare"` e `linkKey`.
    - `label` "Skincare noite · 3 min", subtitle "Gel de limpeza no rosto, depois hidratante".
  - Sem `skincare-3`: `skincare-manha` vira checkbox simples.
    - `label` "Protetor solar · 1 min", subtitle "Rosto, orelhas e pescoço antes de sair".
  - Sem `danca`: remove `danca-sabado` e `lembrete-sabado-danca`.
  - Sem `alongamento-noite`: remove `alongamento-noite`.
  - Sem `voz-1`: remove `voz`.
  - Com `voz-1` e sem `voz-2`: `label` "Voz · aquecimento 2 min", `to` `/beleza/voz/voz-aquecimento-labial-lingua`.
  - Sem `postura`: remove `postura`.
  - `sentar` não é item: a Task 9 lê `ja.sentar`.

- **Rulings:**
  - A spec estimou o assoalho nv1 em "3 min" e a voz nv1 em "aquecimento 3 min". A spec também manda não inventar prática. Então: `pelvic-identificacao` com a duração real (5 min) e `voz-aquecimento-labial-lingua` (2 min). Custo se errado: trocar duas strings.
  - Postura inteira abre no 20 (a tabela da spec diz "postura completa"). A progressão interna andar → 8 → gingado continua do `posturaDoDia`.
- **Sequência nova** `manha-curta-vacuum` em `sequences-seed.ts`, no mesmo grupo de `mobilidade-pelvica-matinal`.
  - Os 2 primeiros movimentos de `mobilidade-pelvica-matinal` (cortados pra somar ≈2 min) mais o movimento "Vacuum abdominal" copiado igual, com a mesma `execucao`.
  - Nome "Alongamento manhã curto". `durationMin` = soma arredondada.
  - Não entra em `SEQUENCIAS_FLEX`.

- [ ] **Step 1: Testes que falham.**
  - `novosDesbloqueios(0, {})` = `[]`.
  - `novosDesbloqueios(5, {})` dá os ids `["manha-completa","assoalho-1"]`.
  - `novosDesbloqueios(12, {"manha-completa":"x","assoalho-1":"x"})` dá `["skincare-2","sentar","danca"]`.
  - `novosDesbloqueios(3, {"skincare-2":"x"})` = `[]`. Save point: o já desbloqueado não aparece nem some.
  - `proximoDesbloqueio(3, {})` dá `{d.id:"manha-completa", faltam:2}`.
  - Todos desbloqueados dá `null`.
  - `proximoDesbloqueio(0, {...todos até 10})` dá `alongamento-noite` com `faltam 15`. Depois de zerar, conta a partir de zero.
  - `filtrarRotina(buildDayRoutine(1,1), {})`:
    - Não contém `assoalho-pelvico`, `skincare-noite`, `alongamento-noite`, `voz` nem `postura`.
    - `alongamento-manha.to` termina em `manha-curta-vacuum`, e o subtitle contém "vacuum".
    - `skincare-manha.label` começa com "Protetor solar".
    - Contém todos os ids do núcleo da spec: `treino`, `cafe-marmita`, `almoco`, `lanche-saida`, `jantar`, `agua`, `creatina`, `caminhada-trabalho`, `caes`, `dormir`.
  - `filtrarRotina(buildDayRoutine(6,1), {})` (sábado) não contém `danca-sabado`. Contém `caminhada-fds`.
  - `filtrarRotina(r, todos)` deep-equals `r`.
  - `idsTrancados({})` contém `"alongamento-noite"` e `"skincare-noite"`.
  - `EXPOE` não casa em nenhum `titulo`/`entra`/`praQue`. Esse caso vai em `discricao-rotulos.test.ts`.
  - O seed contém `manha-curta-vacuum` com um move `/vacuum/i`.
  - Pin `MOVEMENT_VERSION === 15`.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Verdes.
- [ ] **Step 5:** Commit `feat(progressao): tabela de níveis, filtro do Hoje e alongamento curto da manhã`.

### Task 9: Hoje e lembretes obedecem aos níveis

**Files:**
- Modify: `src/pages/Today.tsx`, `src/components/MicroPausaModal.tsx`, `src/lib/lembretes/planejar.ts`, `src/lib/lembretes/estado.ts`, `src/lib/notification-scheduler.ts`
- Create: `tests/helpers/desbloquear.ts`
- Test: `tests/pages/hoje-niveis.test.tsx`, `tests/lib/lembretes-planejar.test.ts` (casos novos)
- Atualizar com `desbloquearTudo()` os testes que renderizam o Hoje e esperam extras trancáveis: `tests/pages/Today.test.tsx`, `today-treino.smoke.test.tsx`, `today-focus.smoke.test.tsx`, `hoje-flex-progressao.test.tsx`, `hoje-streak-vitalidade.test.tsx`, e os outros que falharem pelo mesmo motivo.

**Interfaces:**
- Consumes: `filtrarRotina`, `idsTrancados`, `proximoDesbloqueio` e `Desbloqueados` (Task 8). `estadoSequencia` (Task 6).
- Produces:
  - `desbloquearTudo(): Promise<void>` em `tests/helpers/desbloquear.ts`. Grava `desbloqueios` com todos os ids.
  - `ConfigLembretes.trancados: ReadonlySet<string>`.
  - `MicroPausaModal` ganha a prop `mostrarSentar: boolean`.

- [ ] **Step 1: Testes que falham.**
  - `hoje-niveis.test.tsx`, banco novo com `sequenciaDesde` = hoje e dia útil:
    - Aparece "Protetor solar".
    - Não aparece "Alongamento noite" nem "Postura".
    - Aparece o texto "Próximo desbloqueio: Alongamento da manhã completo — faltam 5 treinos".
    - Com `desbloquearTudo()`, a linha some e "Alongamento noite" aparece.
  - Com `desbloqueios = {skincare-2:…}` e sem `skincare-3`: a linha "Skincare noite" é checkbox (`role="checkbox"`). Marcar grava em `routineChecks` com id `skincare-noite`.
  - `MicroPausaModal` com `mostrarSentar={false}` não mostra "Como sentar". Com `true`, mostra.
  - `planejar` com `trancados = new Set(["alongamento-noite"])` não gera "Alongamento noite". Sem o set, gera como hoje. O fixture `cfg` existente ganha `trancados: new Set()`.
  - `notification-scheduler`: com `skincare-noite` trancado, o tick no horário do `eveningReminderTime` não notifica "Skincare noturno". Seguir o teste existente do scheduler, se houver. Se não houver, testar a função de decisão extraída.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
  - `Today.tsx` lê `desbloqueios` via `useSetting` e aplica `filtrarRotina` logo depois de `buildDayRoutine` e antes de `separarNucleo`.
  - Os resolvers `labelFor`/`toFor`/`subtitleFor` só agem por `linkKey`. Conferir que o item sem `linkKey` sai com o texto do filtro.
  - A linha "Próximo desbloqueio: {titulo} — faltam {n} treinos" (n=1: "falta 1 treino") fica em `text-muted text-sm`, embaixo dos extras. Some quando `proximoDesbloqueio` é `null`.
  - `carregarConfig()` preenche `trancados` com `idsTrancados(getSetting("desbloqueios"))`.
  - Na Vitalidade, no Movimento e no Guia nada muda.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes.
- [ ] **Step 5:** Commit `feat(progressao): Hoje e lembretes seguem os níveis; próximo desbloqueio visível`.

### Task 10: Desbloqueio acontece + Conquistas no Progresso

**Files:**
- Create: `src/pages/Conquistas.tsx`, `src/components/placas/PlacaDesbloqueio.tsx`, `src/lib/conquistas.ts`
- Modify: `src/hooks/usePlacas.tsx`, `src/pages/workout/SessionDetail.tsx`, `src/main.tsx` (rota `progresso/conquistas`), `src/pages/ProgressoHome.tsx` (item em `ITENS_PROGRESSO`), `src/lib/abas.ts` (rota na aba Progresso), `src/lib/settings-helpers.ts`
- Test: `tests/lib/conquistas.test.ts`, `tests/pages/Conquistas.test.tsx`, `tests/pages/SessionDetail-desbloqueio.test.tsx`

**Interfaces:**
- Consumes: Tasks 6–8.
- Produces:
  ```ts
  // src/lib/conquistas.ts
  export interface MarcoCintura { cinturaCm: number; titulo: string; data: string }
  export function marcosDeCinturaAtingidos(medidas: readonly { date: string; waistCm?: number }[]): MarcoCintura[] // usa MARCOS_CINTURA de src/lib/objetivo.ts; data = 1ª medida ≤ alvo
  // src/hooks/usePlacas.tsx
  export async function aplicarDesbloqueios(sequencia: number, hoje: string): Promise<Desbloqueio[]> // grava os novos em `desbloqueios` com data = hoje; devolve os novos
  ```
  - Setting novo: `conquistasVistas: string[]`, padrão `[]`, com ids como `"cintura-88"`.
- Comportamento:
  - Em `finishSession`, depois de enfileirar a vitória: `aplicarDesbloqueios(estado.atual, hoje)`, e uma placa `desbloqueio` por item novo, na ordem da tabela.
    - Título `Parabéns, ${titulo} desbloqueado`.
    - Corpo: `entra`, `praQue`, `${minutos} min` e `às ${horario}` quando houver.
  - `verificarAoAbrir()` (Task 7) também roda `aplicarDesbloqueios`. Assim um treino salvo sem "Finalizar" destrava na próxima abertura.
  - Também roda os marcos de cintura ainda não vistos. Grava em `conquistasVistas` antes de mostrar e mostra a placa `conquista`.
  - Ordem na abertura: queda, depois desbloqueios, depois conquistas.
  - Página Conquistas, título "Conquistas":
    - Seção "Desbloqueados": título e data `dd/mm`.
    - Seção "Próximos": título, "faltam N treinos" e o `entra`.
    - Seção "Marcos":
      - Cintura atingida, com data.
      - Marcos de `db.milestones` com `dateCompleted`.
  - Ruling: "ciclo concluído" e "primeira subida de carga" ficam de fora. O app não guarda esses fatos hoje, e a spec manda mapear o que existe. Custo: entram depois como conquista nova, sem mexer no resto.
  - Item em `ITENS_PROGRESSO`: `{label:"Conquistas", sub:"o que já abriu e o que vem", to:"/progresso/conquistas"}`.

- [ ] **Step 1: Testes que falham.**
  - `marcosDeCinturaAtingidos([{date:"2026-12-01",waistCm:89},{date:"2026-12-20",waistCm:87.5}])` dá um marco 88 com data `"2026-12-20"`. Medida ≤ 84 dá os dois.
  - `SessionDetail-desbloqueio.test.tsx`:
    - Sessões nos 4 dias úteis anteriores, `sequenciaDesde` antes deles.
    - Finalizar hoje mostra "Treino concluído". Fechar mostra "Parabéns, Alongamento da manhã completo desbloqueado". Fechar mostra "Parabéns, Assoalho pélvico nível 1 desbloqueado".
    - O setting `desbloqueios` tem as duas chaves com data de hoje.
  - Save point: com `desbloqueios` contendo `skincare-2` e sequência 0, abrir o Hoje mostra a linha "Skincare noite". Nada tranca de novo.
  - `Conquistas.test.tsx`: com `{"manha-completa":"2026-11-14"}` e sequência 6, mostra "Alongamento da manhã completo" com "14/11", "Assoalho pélvico nível 1" em próximos com "faltam" e a rota ativa a aba Progresso.
  - Discrição: os textos das placas de desbloqueio passam no `EXPOE`.
- [ ] **Step 2:** Ver falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm run test` e `npm run build` verdes.
- [ ] **Step 5:** Commit `feat(progressao): desbloqueio com placa, Conquistas no Progresso`.

### Task 11: Documentação

**Files:** `docs/OBJETIVO.md` §9, `docs/CONTINUAR-AQUI.md` (decisão 2026-11-09, mapa dos arquivos novos, minors adiados, entrega "Visual e progressão").

- [ ] **Step 1:** Registrar:
  - paleta A;
  - regra da sequência (dias úteis, sem exceção, marco de início, queda só com `anterior ≥ 1`);
  - tabela de níveis e rulings (assoalho 5 min, voz 2 min, postura no 20, ciclo concluído e subida de carga fora);
  - `NATIVE_VERSION` 2 exige reinstalar o APK.
- [ ] **Step 2:** `npm run test` verde e commit `docs: visual novo e progressão por desbloqueio`.

# Navegação em 4 abas + dívidas (entrega E) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a barra de baixo passa a ter Hoje · Progresso · Guia · Vitalidade sem mudar nenhuma rota, e as dívidas anotadas nas entregas A–D são pagas.

**Architecture:** um módulo puro decide a aba acesa pela rota; duas telas-índice novas listam as telas existentes; as dívidas são mudanças pontuais com teste.

**Tech Stack:** React 18 + TypeScript, react-router 6 (`createBrowserRouter` em `src/main.tsx`), Dexie, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-02-navegacao-e-dividas-design.md`

## Global Constraints

- **Nenhuma rota existente muda ou some.** Só entram `/progresso` e `/guia`.
- **Discrição:** todo rótulo visível novo (abas, cartões, blocos) passa pelo `EXPOE` de `tests/lib/discricao-rotulos.test.ts`. "Vitalidade" continua o rótulo da aba.
- Módulos puros (`abas.ts`, `objetivo.ts`, `ritmo.ts`, `revisao-semanal.ts`): sem `db`, sem `new Date()`.
- Números-alvo só em `objetivo.ts`.
- Seed mudou → versão sobe (+1) com pino.
- pt-BR com acento; comentários explicam o porquê.
- `npm run test`, `npm run build`, `npm run build:app` limpos. Branch `feat/navegacao`; nunca `git push`.

## Review Focus

- `/trilha` exato (Marcos) acende Progresso, mas `/trilha/alimentacao` acende Guia. (Task 1)
- Rota desconhecida ou `/configuracoes` → Hoje acesa, sem erro. (Task 1)
- Uma rota listada numa tela-índice que não existe no router → teste falha. (Task 1)
- Modo `pausada` no SessionDetail → nada afirma que uma caminhada aconteceu. (Task 2)
- O lembrete de presença do PWA não dispara depois de ela fazer a Postura. (Task 2)

---

### Task 1: Navegação em 4 abas

**Files:** Create `src/lib/abas.ts`, `src/pages/ProgressoHome.tsx`, `src/pages/GuiaHome.tsx`; Modify `src/components/BottomNav.tsx`, `src/main.tsx` (2 rotas), `src/lib/linha-do-tempo.ts` (copy), `src/pages/body/Onboarding.tsx` (copy), `tests/lib/discricao-rotulos.test.ts` (rótulos novos); Tests `tests/lib/abas.test.ts`, `tests/components/BottomNav.test.tsx`, `tests/pages/indices.test.tsx`.

**Produces:** `type Aba`, `abaDaRota(pathname: string): Aba`; `ITENS_PROGRESSO: { label: string; sub: string; to: string }[]`; `BLOCOS_GUIA: { titulo: string; itens: { label: string; to: string }[] }[]`.

- [ ] **Step 1: testes que falham**

```ts
// tests/lib/abas.test.ts
import { describe, it, expect } from "vitest";
import { abaDaRota } from "../../src/lib/abas";

describe("aba acesa pela rota", () => {
  it.each([
    ["/", "hoje"], ["/hoje/horarios", "hoje"], ["/configuracoes", "hoje"], ["/qualquer", "hoje"],
    ["/vitalidade", "vitalidade"], ["/trilha/vitalidade", "vitalidade"],
    ["/progresso", "progresso"], ["/corpo", "progresso"], ["/corpo/medidas", "progresso"],
    ["/trilha", "progresso"], ["/trilha/marcos/novo", "progresso"], ["/trilha/evolucao", "progresso"],
    ["/trilha/diario", "progresso"], ["/treino/horizontes", "progresso"], ["/treino/progressao", "progresso"],
    ["/guia", "guia"], ["/treino", "guia"], ["/treino/biblioteca", "guia"], ["/treino/movimento/x", "guia"],
    ["/beleza/estilo/pecas", "guia"], ["/trilha/alimentacao", "guia"], ["/trilha/alimentacao/domingo", "guia"],
    ["/trilha/apoio", "guia"], ["/trilha/fertilidade", "guia"], ["/trilha/direitos", "guia"], ["/refeicoes-hoje", "guia"],
  ])("%s → %s", (rota, aba) => {
    expect(abaDaRota(rota)).toBe(aba);
  });
});
```

`tests/components/BottomNav.test.tsx`: em `MemoryRouter initialEntries={["/corpo/medidas"]}`, há exatamente 4 links ("Hoje" `/`, "Progresso" `/progresso`, "Guia" `/guia`, "Vitalidade" `/vitalidade`) e o link "Progresso" tem `aria-current="page"`; em `/treino/biblioteca`, "Guia" tem `aria-current="page"` e "Progresso" não.

`tests/pages/indices.test.tsx`:
1. lê `src/main.tsx` como texto (`import.meta.glob("../../src/main.tsx", { query: "?raw", import: "default", eager: true })` — o tsconfig não tem tipos do Node) e, para cada `to` de `ITENS_PROGRESSO` e de `BLOCOS_GUIA`, confere que existe `path: "<to sem a barra inicial>"` no texto (`/` vira a rota índice — não use `/` nas listas);
2. `ProgressoHome` renderiza "Progresso" e o link "Medidas" com href `/corpo/medidas`;
3. `GuiaHome` renderiza os títulos "Treino", "Alimentação", "Beleza", "Apoio" e o link "Biblioteca" com href `/treino/biblioteca`.

Em `tests/lib/discricao-rotulos.test.ts`, acrescente um caso: nenhum `label`/`sub` de `ITENS_PROGRESSO`, nenhum `titulo`/`label` de `BLOCOS_GUIA` e nenhum rótulo de aba (`["Hoje","Progresso","Guia","Vitalidade"]`) casa com `EXPOE`.

- [ ] **Step 2:** rodar e ver falhar.
- [ ] **Step 3: implementar**

```ts
// src/lib/abas.ts
// Qual aba de baixo fica acesa em cada tela. Puro.
//
// Decisão dela (2026-10-02): 4 abas no lugar de 6, sem mudar nenhuma rota — os
// links do Hoje, dos lembretes e os "← voltar" continuam valendo. Como as
// rotas antigas não seguem as abas novas (/trilha tem Marcos, que é progresso,
// e Alimentação, que é guia), o prefixo do NavLink não serve: esta regra decide.

export type Aba = "hoje" | "progresso" | "guia" | "vitalidade";

const PROGRESSO = [/^\/progresso/, /^\/corpo(\/|$)/, /^\/trilha$/, /^\/trilha\/marcos/, /^\/trilha\/evolucao/, /^\/trilha\/diario/, /^\/treino\/horizontes/, /^\/treino\/progressao/];
const GUIA = [/^\/guia/, /^\/treino(\/|$)/, /^\/beleza(\/|$)/, /^\/trilha\/(alimentacao|apoio|fertilidade|direitos)/, /^\/refeicoes-hoje/];

export function abaDaRota(pathname: string): Aba {
  if (/^\/(trilha\/)?vitalidade/.test(pathname)) return "vitalidade";
  if (PROGRESSO.some((r) => r.test(pathname))) return "progresso";
  if (GUIA.some((r) => r.test(pathname))) return "guia";
  return "hoje";
}
```

(Progresso é testado antes de Guia: `/treino/horizontes` e `/treino/progressao` são progresso.)

`BottomNav`: itens `[{ to: "/", label: "Hoje", aba: "hoje", Icon: HomeIcon }, { to: "/progresso", label: "Progresso", aba: "progresso", Icon: RulerIcon }, { to: "/guia", label: "Guia", aba: "guia", Icon: DumbbellIcon }, { to: "/vitalidade", label: "Vitalidade", aba: "vitalidade", Icon: SparkIcon }]`; troque `NavLink` por `Link` com `aria-current={ativa ? "page" : undefined}` e a classe ativa vinda de `abaDaRota(useLocation().pathname) === item.aba`. Atualize o comentário do topo (por que 4, por que a regra) e tire a nota dos 0.62rem (volte a `text-xs`). Remova imports de ícones que ficarem sem uso.

`ProgressoHome.tsx` exporta `ITENS_PROGRESSO` (label, sub, to) na ordem do spec e renderiza `h1` "Progresso" + um `Link` `card` por item (mesmo visual do `BodyHome`). Subs neutros, por exemplo: Evolução "Seu ritmo e os últimos 30 dias"; Medidas "Peso, cintura, quadril"; Fotos "Antes e agora"; Silhueta "As proporções"; Comparação "Lado a lado"; Marcos "O que já foi e o que vem"; Até onde dá pra chegar "Os tetos, com números"; Progressão de carga "Quanto cada exercício subiu"; Diário "Como foram os dias".

`GuiaHome.tsx` exporta `BLOCOS_GUIA` (spec §1) e renderiza `h1` "Guia" + por bloco um `h2` e uma grade de `Link`s `card`.

`main.tsx`: rotas `{ path: "progresso", element: <ProgressoHome /> }` e `{ path: "guia", element: <GuiaHome /> }` junto das outras.

Copy: `linha-do-tempo.ts` "Mede na aba Corpo" → "Mede em Progresso → Medidas" (ajuste a frase inteira para ficar natural); `Onboarding.tsx` "na aba <strong>Corpo</strong>" → "em <strong>Progresso → Medidas</strong>". Ajuste testes que citam esses textos, se houver.

- [ ] **Step 4:** `npx vitest run tests/lib/abas.test.ts tests/components/BottomNav.test.tsx tests/pages/indices.test.tsx tests/lib/discricao-rotulos.test.ts tests/pages/vitalidade-hub.test.tsx` — PASS; depois `npm run test` e `npm run build`.
- [ ] **Step 5:** commit `feat(navegacao): 4 abas — Hoje, Progresso, Guia, Vitalidade — sem mudar nenhuma rota`.

---

### Task 2: Dívidas

**Files:** Modify `src/pages/workout/SessionDetail.tsx`, `src/data/exercises-seed.ts` (`cardio-zona2`), `src/lib/seed.ts` (`EXERCISE_SEED_VERSION` +1) + pino, `src/lib/objetivo.ts` (`TREINOS_POR_SEMANA`), `src/lib/ritmo.ts`, `src/lib/revisao-semanal.ts`, `src/pages/Today.tsx` (StreakCard Treino), `src/components/SemanaCard.tsx`, `src/lib/daily-routine.ts`, `src/lib/notification-scheduler.ts`, `tests/lib/daily-routine.test.ts`, `tests/data/sequences-apresentacao.test.ts`, `tests/pages/Today.test.tsx`.

- [ ] **Step 1: testes que falham**
1. `tests/pages/session-detail-zona2.test.tsx` (ou caso em teste existente do SessionDetail): com `modoCaminhada` "pausada" a dica "Ao terminar" contém "caminhada está pausada" e não contém "já entrega"; com "esteira" contém "esteira inclinada do dia"; com "caminhada" mantém "caminhada de 5 km". (Abra a seção "Ao terminar" do jeito que o componente expõe — leia como os outros testes do SessionDetail fazem.)
2. `cardio-zona2`: descrição não contém "É a caminhada de 5 km do trabalho para casa"; contém "esteira".
3. `objetivo.ts` exporta `TREINOS_POR_SEMANA === 5`; uma rede de texto lê `ritmo.ts` e `revisao-semanal.ts` como texto (`?raw`) e falha se houver `5 *` ou `de 5\`` literal.
4. `notification-scheduler`: se existir teste do lembrete de presença, ajuste para a trilha de postura; senão, crie um caso mínimo que, com uma prática concluída de `corporal-oito-quadril` hoje, `presencaDone` é verdadeiro (extraia a checagem para uma função exportada `praticouPosturaHoje(hoje)` em `notification-scheduler.ts` e teste ela).
5. Rede de andar em `tests/data/sequences-apresentacao.test.ts`: o regex proibido passa a incluir `sobre a linha`, `na frente do outro`, `linha única`.
6. `tests/pages/Today.test.tsx`: `beforeEach` também limpa `db.measurements`.

- [ ] **Step 3: implementar** conforme o spec §2. Em `SessionDetail`, leia `useSetting("modoCaminhada")` e escolha os dois primeiros textos de "Ao terminar" por modo (mantendo a terceira dica, da água). `cardio-zona2` vira "Cardio zona 2 (caminhada ou esteira)" e a descrição: "Minutos contínuos num ritmo em que você fica ofegante mas ainda consegue conversar em frases curtas: a caminhada do trabalho pra casa ou a esteira inclinada (6–10%, 4,5–5,5 km/h), uns 45–60 min sem parar. Sem nenhuma das duas, bike reclinada nível 5-6 de 8." Remova `PRESENCE_ITEMS`, `PresenceItem` e `presenceSuggestionForDay` de `daily-routine.ts` e os testes deles; o scheduler importa `SEQUENCIAS_POSTURA` de `./postura-progression`.
- [ ] **Step 4:** testes focados + `npm run test`, `npm run build`, `npm run build:app`.
- [ ] **Step 5:** commit `fix: dívidas — zona 2 pelo modo, treinos/semana no objetivo, lista de presença antiga fora, redes de teste`.

---

### Task 3: Docs

- [ ] `docs/CONTINUAR-AQUI.md`: seção 1, linha "E · Navegação + dívidas" depois de "D · Nativo" (spec e plano); seção 3: `| 10-02 | Navegação em **4 abas**: Hoje · Progresso · Guia · Vitalidade. Nenhuma rota mudou; a aba acesa vem de `abaDaRota`. |`; seção 9: risque/remova as dívidas pagas (zona 2, números fora do objetivo — exceto as que continuarem —, `PRESENCE_ITEMS`).
- [ ] `docs/APK.md`: onde citar abas (se citar), use os nomes novos.
- [ ] Commit `docs: entrega E (navegação + dívidas) registrada`.

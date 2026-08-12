# Frente 3 — Corpo & treino · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar progressão de verdade à flexibilidade que ela já pratica todo dia, e pôr no treino o padrão de força que levantar outra pessoa exige — sem alongar a sessão de academia em um minuto.

**Architecture:** Um módulo puro novo (`src/lib/flex-progression.ts`) espelha `pelvic-progression.ts` e decide qual sequência de alongamento serve hoje, por momento (manhã/noite) e por fase. Quatro sequências novas entram no seed. No treino, três padrões de força entram por **troca** exercício-por-exercício, com teste garantindo que nenhum template ganhou item nem minuto.

**Tech Stack:** React 18 · TypeScript · Vite · Dexie 4 · Vitest · Tailwind

## Global Constraints

- Todo texto de usuário e comentário em **pt-BR com acentuação correta**. Nunca ASCII no lugar de acento.
- Módulos em `src/lib/` declarados puros: **sem `new Date()`, sem `db`**. Quem chama injeta.
- Comentário de código explica o **porquê**, não o quê.
- **A sessão de academia NÃO cresce.** Decisão da usuária. Todo exercício que entra sai de outro lugar do mesmo template: contagem e `durationMin` ficam idênticos.
- **Nada pode engrossar ombro ou trapézio.** É a restrição que o programa respeita desde o início — por isso carregamento **frontal**, nunca acima da cabeça.
- **Equipamento real da academia do prédio:** leg press, abdutora, halteres, caneleira, barra, multiestação, kettlebell, espaldar, bola, step, esteira, bike reclinada, colchonete, banco. **Sem Smith.** **A polia baixa é curta** e não serve para coice nem pull-through.
- **Horizonte declarado, sem adoçante:** 4–6 semanas para sentir diferença; 3–6 meses para o que as posições pedem; espacate frontal 12–24 meses; espacate lateral depende do formato do acetábulo e parte das pessoas nunca chega, **por anatomia, não por esforço**. **Espacate não é necessário para nada do que ela quer.**
- **Todo seed alterado precisa de bump de versão**, senão a mudança não chega no aparelho dela.
- `npm run test` verde e `npm run build` limpo são condição de commit.

---

### Task 1: `src/lib/flex-progression.ts` — as fases da flexibilidade

**Files:**
- Create: `src/lib/flex-progression.ts`
- Test: `tests/lib/flex-progression.test.ts`

**Interfaces:**
- Produces: `flexDoDia(momento: MomentoFlex, praticasFeitas: number): FlexDoDia` onde `MomentoFlex = "manha" | "noite"` e `FlexDoDia = { sequenceId: string; etapa: string }`; `SEQUENCIAS_FLEX: Record<MomentoFlex, readonly string[]>`; `HORIZONTE_FLEX`. Tasks 2, 3 e 6 consomem.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/flex-progression.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { flexDoDia, SEQUENCIAS_FLEX, HORIZONTE_FLEX, ATE_FASE_2, ATE_FASE_3 } from "../../src/lib/flex-progression";

describe("progressão de flexibilidade", () => {
  it("a fase 1 é a sequência que ela já faz hoje — histórico preservado", () => {
    expect(flexDoDia("manha", 0).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("noite", 0).sequenceId).toBe("flexibilidade-intima");
  });

  it("a fase 1 dura até a prática ATE_FASE_2", () => {
    expect(flexDoDia("manha", ATE_FASE_2 - 1).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("manha", ATE_FASE_2).sequenceId).not.toBe("mobilidade-pelvica-matinal");
  });

  it("manhã e noite têm trilhas próprias e nunca se cruzam", () => {
    for (let n = 0; n < 200; n += 7) {
      const manha = flexDoDia("manha", n).sequenceId;
      const noite = flexDoDia("noite", n).sequenceId;
      expect(SEQUENCIAS_FLEX.manha).toContain(manha);
      expect(SEQUENCIAS_FLEX.noite).toContain(noite);
      expect(manha).not.toBe(noite);
    }
  });

  it("toda sequência de cada trilha é alcançável — nenhuma fica órfã", () => {
    for (const momento of ["manha", "noite"] as const) {
      const vistas = new Set<string>();
      for (let n = 0; n < 400; n++) vistas.add(flexDoDia(momento, n).sequenceId);
      expect(vistas).toEqual(new Set(SEQUENCIAS_FLEX[momento]));
    }
  });

  it("a progressão não retrocede: fase 3 nunca devolve sequência de fase 1", () => {
    for (let n = ATE_FASE_3; n < ATE_FASE_3 + 50; n++) {
      expect(flexDoDia("manha", n).sequenceId).not.toBe("mobilidade-pelvica-matinal");
      expect(flexDoDia("noite", n).sequenceId).not.toBe("flexibilidade-intima");
    }
  });

  it("cada fase se anuncia — exercício cego não constrói nada", () => {
    for (const n of [0, ATE_FASE_2, ATE_FASE_3]) {
      expect(flexDoDia("manha", n).etapa.length).toBeGreaterThan(10);
    }
  });

  it("entrada inválida cai na fase 1 em vez de quebrar", () => {
    for (const n of [-5, NaN, Infinity]) {
      expect(flexDoDia("manha", n as number).sequenceId).toBe("mobilidade-pelvica-matinal");
    }
  });

  it("o horizonte declara que espacate NÃO é necessário", () => {
    expect(HORIZONTE_FLEX.espacateNecessario).toBe(false);
  });

  it("o horizonte nomeia que o espacate lateral depende de anatomia, não de esforço", () => {
    expect(HORIZONTE_FLEX.espacateLateral.toLowerCase()).toMatch(/anatomia|acet[áa]bulo/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/flex-progression.test.ts`
Expected: FAIL — não resolve `../../src/lib/flex-progression`

- [ ] **Step 3: Implementar**

Criar `src/lib/flex-progression.ts`:

```ts
// src/lib/flex-progression.ts
// Qual alongamento fazer hoje, de manhã e à noite. Módulo puro — sem I/O, sem Date.
//
// A rotina já tinha os dois momentos, mas com sequência FIXA: ela fazia a mesma
// coisa no dia 1 e no dia 200. Alongamento sem progressão para de render depois
// das primeiras semanas — o tecido adapta e o estímulo vira rotina.
//
// As trilhas são separadas de propósito. Manhã abre o quadril para o dia;
// noite trabalha flexão profunda e rotação, que é o que as posições que ela quer
// pedem. Misturar as duas faria uma anular a outra.

export type MomentoFlex = "manha" | "noite";

export interface FlexDoDia {
  sequenceId: string;
  /** Em que fase ela está, para o item do Hoje não virar exercício cego. */
  etapa: string;
}

/** Ordem didática de cada trilha. A fase 1 é a sequência que ela JÁ faz — o id
 *  é preservado para não quebrar o histórico de `practiceLogs` dela. */
export const SEQUENCIAS_FLEX: Record<MomentoFlex, readonly string[]> = {
  manha: ["mobilidade-pelvica-matinal", "flex-manha-amplitude", "flex-manha-sustentacao"],
  noite: ["flexibilidade-intima", "flex-noite-amplitude", "flex-noite-sustentacao"],
};

/** ~4 semanas de prática diária. */
export const ATE_FASE_2 = 28;
/** ~12 semanas de prática diária. */
export const ATE_FASE_3 = 84;

const ETAPA: Record<MomentoFlex, [string, string, string]> = {
  manha: [
    "Fase 1 · tolerância — o corpo aprende a posição antes de ganhar amplitude",
    "Fase 2 · amplitude — agora o alcance cresce",
    "Fase 3 · sustentação — ficar na posição sem tensão é o que serve na hora",
  ],
  noite: [
    "Fase 1 · tolerância — flexão profunda e rotação, sem forçar",
    "Fase 2 · amplitude — abre o que as posições pedem",
    "Fase 3 · sustentação — conforto e duração, não espacate",
  ],
};

/** Horizonte honesto. Números redondos e o que NÃO é necessário — sem isso ela
 *  mede o progresso contra uma meta que nunca fez parte do objetivo. */
export const HORIZONTE_FLEX = {
  primeiraMudancaSemanas: [4, 6] as const,
  posicoesQueElaQuerMeses: [3, 6] as const,
  espacateFrontalMeses: [12, 24] as const,
  espacateLateral:
    "Depende do formato do acetábulo. Parte das pessoas nunca chega — por anatomia, não por esforço.",
  espacateNecessario: false,
} as const;

export function flexDoDia(momento: MomentoFlex, praticasFeitas: number): FlexDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const trilha = SEQUENCIAS_FLEX[momento];
  const fase = n < ATE_FASE_2 ? 0 : n < ATE_FASE_3 ? 1 : 2;
  return { sequenceId: trilha[fase], etapa: ETAPA[momento][fase] };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/flex-progression.test.ts`
Expected: PASS (9 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/flex-progression.ts tests/lib/flex-progression.test.ts
git commit -m "feat(flex): progressao de flexibilidade em tres fases

Os dois alongamentos que ela ja faz todo dia tinham sequencia FIXA — a
mesma coisa no dia 1 e no dia 200. Alongamento sem progressao para de
render depois das primeiras semanas.

O horizonte vai declarado no modulo: espacate NAO e necessario pra nada do
que ela quer, e o lateral depende do formato do acetabulo — parte das
pessoas nunca chega, por anatomia e nao por esforco.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: As quatro sequências novas

**Files:**
- Modify: `src/data/sequences-seed.ts`
- Modify: `src/lib/movement-seed.ts` (`MOVEMENT_VERSION`, linha 4)
- Test: `tests/data/sequences-flex.test.ts`
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts`

**Interfaces:**
- Consumes: `SEQUENCIAS_FLEX` (Task 1)
- Produces: ids `flex-manha-amplitude`, `flex-manha-sustentacao`, `flex-noite-amplitude`, `flex-noite-sustentacao`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/sequences-flex.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const NOVAS = ["flex-manha-amplitude", "flex-manha-sustentacao", "flex-noite-amplitude", "flex-noite-sustentacao"];

describe("sequências de flexibilidade", () => {
  it("toda sequência que a progressão serve existe no catálogo", () => {
    const todas = [...SEQUENCIAS_FLEX.manha, ...SEQUENCIAS_FLEX.noite];
    const faltando = todas.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
  });

  it("as quatro novas são de mobilidade e têm foco e movimentos", () => {
    for (const id of NOVAS) {
      const s = SEQUENCES.find((x) => x.id === id)!;
      expect({ id, cat: s.category, foco: !!s.focus, movs: s.moves.length >= 4 })
        .toEqual({ id, cat: "mobilidade", foco: true, movs: true });
    }
  });

  it("nenhuma promete espacate — não é o objetivo e prometer desvia o treino", () => {
    for (const id of NOVAS) {
      expect(JSON.stringify(SEQUENCES.find((x) => x.id === id)!).toLowerCase()).not.toMatch(/espacate/);
    }
  });

  it("todas mandam parar antes da dor — alongamento não é dor", () => {
    for (const id of NOVAS) {
      expect(JSON.stringify(SEQUENCES.find((x) => x.id === id)!).toLowerCase()).toMatch(/dor|desconforto/);
    }
  });

  it("a duração cresce da fase 2 pra 3 na trilha da noite, que é a de sustentação", () => {
    const f2 = SEQUENCES.find((s) => s.id === "flex-noite-amplitude")!;
    const f3 = SEQUENCES.find((s) => s.id === "flex-noite-sustentacao")!;
    expect(f3.durationMin).toBeGreaterThanOrEqual(f2.durationMin);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/sequences-flex.test.ts`
Expected: FAIL — as quatro não existem

- [ ] **Step 3: Acrescentar as sequências**

Em `src/data/sequences-seed.ts`, junto das outras de `category: "mobilidade"`, com a mesma forma dos vizinhos (`id`, `name`, `category`, `level`, `durationMin`, `focus`, `moves[]`):

```ts
  {
    id: "flex-manha-amplitude",
    name: "Manhã · amplitude de quadril",
    category: "mobilidade",
    level: "intermediario",
    durationMin: 15,
    focus: "Fase 2 da manhã: agora que o corpo tolera as posições, o alcance cresce. Trabalha abertura e rotação com respiração — o ganho vem de respirar dentro da posição, não de empurrar. Para antes da dor: alongamento que dói ativa reflexo de proteção e o músculo fecha.",
    moves: [
      { name: "Aquecimento articular", description: "Círculos de quadril em pé, 8x cada sentido. Cat-cow 10x. Corpo morno antes de abrir — frio não alonga, resiste.", durationSec: 120, repeat: 10 },
      { name: "Rã progressiva", description: "Quatro apoios, joelhos abertos o quanto der, tornozelos alinhados com os joelhos. Empurra o quadril pra trás até sentir a virilha alongar, volta. 10 idas e vindas lentas, depois fica 60s parada respirando.", durationSec: 180, repeat: 10 },
      { name: "90/90 com rotação", description: "Sentada, uma perna à frente em 90° e outra ao lado em 90°. Gira o tronco sobre a perna da frente, depois troca de lado passando os joelhos pelo chão sem usar as mãos. 8 trocas.", durationSec: 180, repeat: 8 },
      { name: "Abertura em V", description: "Sentada, pernas abertas o quanto for confortável, coluna longa. Caminha as mãos pra frente sem arredondar as costas. Para onde alonga sem doer, 90s.", durationSec: 90 },
      { name: "Agachamento profundo com apoio", description: "Segura no espaldar ou num apoio, agacha o mais fundo que der com os calcanhares no chão. Fica 60s deixando o peso abrir o quadril. 2 vezes.", durationSec: 120, repeat: 2 },
      { name: "Respiração final", description: "Deitada, joelhos dobrados. 5 respirações longas soltando tudo. É na expiração que o tecido cede.", durationSec: 60, repeat: 5 },
    ],
  },
  {
    id: "flex-manha-sustentacao",
    name: "Manhã · sustentação",
    category: "mobilidade",
    level: "intermediario",
    durationMin: 15,
    focus: "Fase 3 da manhã: manter as posições sem tensão. Amplitude que só existe com esforço não serve na hora — serve amplitude que o corpo segura relaxado. Para antes da dor, sempre.",
    moves: [
      { name: "Aquecimento articular", description: "Círculos de quadril e cat-cow, 2 min. Nunca abrir no frio.", durationSec: 120 },
      { name: "Rã sustentada", description: "Mesma posição da fase 2, mas fica 2 min parada, respirando. O objetivo mudou: não é chegar mais fundo, é ficar sem tensão onde já chega.", durationSec: 120 },
      { name: "90/90 sustentado", description: "Fica 90s de cada lado na posição, tronco ereto, sem apoio das mãos se der. É a rotação que as posições pedem.", durationSec: 180, repeat: 2 },
      { name: "Abertura em V com respiração", description: "2 min na abertura, descendo só na expiração. Se a lombar arredondar, sobe um pouco — coluna longa vale mais que centímetro.", durationSec: 120 },
      { name: "Agachamento profundo livre", description: "Sem apoio, 90s. Se ainda precisar de apoio, tudo bem — continua na fase 2 desse movimento até soltar.", durationSec: 90 },
      { name: "Respiração final", description: "Deitada, 5 respirações longas.", durationSec: 60, repeat: 5 },
    ],
  },
  {
    id: "flex-noite-amplitude",
    name: "Noite · flexão profunda e rotação",
    category: "mobilidade",
    level: "intermediario",
    durationMin: 12,
    focus: "Fase 2 da noite: abre o que as posições que ela quer pedem — flexão profunda de quadril, rotação interna e externa, adutor solto. Espacate não entra aqui e não é necessário para nada disso. Para antes da dor.",
    moves: [
      { name: "Aquecimento", description: "Círculos de quadril e balanço de perna, 90s. Corpo já morno do dia, mas nunca pular.", durationSec: 90 },
      { name: "Joelho ao peito profundo", description: "Deitada, puxa um joelho ao peito e depois leva pro lado de fora do ombro, mantendo o quadril no chão. 60s cada lado. É a flexão profunda com rotação externa.", durationSec: 120, repeat: 2 },
      { name: "Rotação interna 90/90", description: "Sentada em 90/90, leva o tronco sobre a perna DE TRÁS — é a rotação interna, a que quase ninguém treina e a que trava primeiro. 45s cada lado.", durationSec: 90, repeat: 2 },
      { name: "Borboleta com respiração", description: "Plantas juntas, joelhos pros lados. Deixa descer pelo peso, sem empurrar com as mãos, 2 min. Empurrar aqui fecha.", durationSec: 120 },
      { name: "Pernas na parede em V", description: "Deitada, bumbum na parede, pernas pra cima e abertas em V. A gravidade faz o trabalho, 2 min. Posição passiva — é onde o adutor solta de verdade.", durationSec: 120 },
      { name: "Happy baby", description: "Segura as plantas dos pés, joelhos pros lados perto das axilas. 90s balançando de leve. Abre quadril e solta o assoalho pélvico junto.", durationSec: 90 },
    ],
  },
  {
    id: "flex-noite-sustentacao",
    name: "Noite · sustentação e conforto",
    category: "mobilidade",
    level: "intermediario",
    durationMin: 14,
    focus: "Fase 3 da noite: ficar nas posições com conforto e por tempo. É a fase que serve diretamente ao que ela quer — durar na posição sem tensão, não alcançar mais. Para antes da dor.",
    moves: [
      { name: "Aquecimento", description: "Círculos de quadril e balanço de perna, 90s.", durationSec: 90 },
      { name: "Flexão profunda sustentada", description: "Joelho ao peito por fora do ombro, 2 min cada lado, respirando fundo. O alvo é o minuto 2 ser tão confortável quanto o minuto 1.", durationSec: 240, repeat: 2 },
      { name: "Rotação interna sustentada", description: "90/90 sobre a perna de trás, 90s cada lado.", durationSec: 180, repeat: 2 },
      { name: "Borboleta longa", description: "3 min, sem empurrar, respirando. Se a virilha tensionar, recua um pouco e fica.", durationSec: 180 },
      { name: "Pernas na parede em V", description: "3 min. Se quiser, caneleira leve nos tornozelos pra gravidade trabalhar mais — só se já estiver confortável sem.", durationSec: 180 },
      { name: "Respiração final", description: "Deitada, 5 respirações longas. Termina solta, não alongada ao limite.", durationSec: 60, repeat: 5 },
    ],
  },
```

- [ ] **Step 4: Bumpar a versão do seed**

Em `src/lib/movement-seed.ts`, linha 4: incrementar `MOVEMENT_VERSION` em 1 (está em 8 depois da frente 2).

Sem isso as quatro sequências **não chegam no aparelho dela**.

- [ ] **Step 5: Estender o teste de chegada**

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, acrescentar caso que reconstrói um banco parado na versão anterior e confirma que as quatro chegam depois de rodar o seed de movimento.

- [ ] **Step 6: Rodar tudo**

Run: `npm run test`
Expected: PASS. Se algum teste fixar a contagem de sequências, ajustar o número.

- [ ] **Step 7: Commit**

```bash
git add src/data/sequences-seed.ts src/lib/movement-seed.ts tests/
git commit -m "feat(flex): as quatro sequencias das fases 2 e 3

Manha abre o quadril; noite trabalha flexao profunda e rotacao, que e o
que as posicoes pedem. Rotacao INTERNA entra de proposito — e a que quase
ninguem treina e a que trava primeiro.

Nenhuma promete espacate: ele nao e necessario pra nada do que ela quer, e
prometer desviaria o treino pra uma meta que nunca fez parte do objetivo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Os dois itens do Hoje passam a progredir

**Files:**
- Modify: `src/lib/today-routine.ts` (itens `alongamento-manha` ~53 e `alongamento-noite` ~182)
- Modify: `src/pages/Today.tsx`
- Modify: `src/lib/practice-log-helpers.ts`
- Test: `tests/pages/hoje-flex-progressao.test.tsx`

**Interfaces:**
- Consumes: `flexDoDia`, `SEQUENCIAS_FLEX` (Task 1)
- Produces: `contarPraticasFlex(momento: MomentoFlex): Promise<number>` em `practice-log-helpers.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/pages/hoje-flex-progressao.test.tsx`, seguindo o padrão de `tests/pages/hoje-streak-vitalidade.test.tsx` (render do Hoje com Dexie semeado). Cobrir:

```tsx
it("com poucas práticas, o alongamento da manhã aponta pra sequência da fase 1", async () => {
  // practiceLogs vazio → link do item alongamento-manha contém mobilidade-pelvica-matinal
});

it("depois de 28 práticas de manhã, aponta pra fase 2", async () => {
  // semeia 28 practiceLogs de mobilidade-pelvica-matinal → link contém flex-manha-amplitude
});

it("práticas da manhã não avançam a trilha da noite", async () => {
  // semeia 28 práticas de manhã → item da noite continua em flexibilidade-intima
});

it("o rótulo mostra a duração da sequência do dia, não um número fixo", async () => {
  // fase 1 (15 min) e fase 2 têm durações declaradas; o texto renderizado acompanha
});
```

**Atenção:** o teste tem que esperar o `useLiveQuery` liquidar antes de ler o `href` — aguarde por um texto que muda com a fase. Um teste que lê o link no primeiro render observa sempre a fase 1 e passa verde com a implementação quebrada. Isso já aconteceu neste projeto.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/pages/hoje-flex-progressao.test.tsx`
Expected: FAIL — o item aponta sempre para a sequência fixa

- [ ] **Step 3: Contar práticas por trilha**

Acrescentar em `src/lib/practice-log-helpers.ts`:

```ts
/** Práticas concluídas de uma trilha de flexibilidade. Cada momento tem
 *  progressão própria: praticar de manhã não avança a noite, porque são
 *  qualidades diferentes e misturar faria uma mascarar a outra. */
export async function contarPraticasFlex(momento: MomentoFlex): Promise<number> {
  const ids = SEQUENCIAS_FLEX[momento] as readonly string[];
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && ids.includes(l.sequenceId)).length;
}
```

- [ ] **Step 4: Derivar o destino e o rótulo**

Em `src/lib/today-routine.ts`, os dois itens deixam de fixar `to`. O `label` e o `subtitle` de lá viram **fallback honesto** (usado pela tela de ajuste de horários, que não conhece a progressão) — tire o "· 15 min" e o "· 10 min" fixos deles, porque a duração passa a vir da sequência.

Em `src/pages/Today.tsx`, no mesmo lugar onde o item pélvico já resolve `to` pela progressão, resolver os dois itens de alongamento com `flexDoDia(momento, praticas)` e montar rótulo e subtítulo a partir da sequência do dia mais a etapa da fase — **exatamente o padrão que `rotuloPelvicoDoDia` já estabeleceu** na frente 2. Reaproveite esse padrão em vez de inventar outro.

**`today-routine.ts` continua puro e sem conhecer o catálogo.**

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test -- tests/pages/hoje-flex-progressao.test.tsx`
Expected: PASS

- [ ] **Step 6: Suíte e build**

Run: `npm run test` e `npm run build`
Expected: PASS e build limpo. Testes de rotina que fixam o `to` ou o rótulo dos alongamentos vão precisar acompanhar — leia cada um antes de editar.

- [ ] **Step 7: Commit**

```bash
git add src/lib/today-routine.ts src/pages/Today.tsx src/lib/practice-log-helpers.ts tests/
git commit -m "feat(flex): os dois alongamentos do Hoje passam a progredir

Eram destino fixo: a mesma sequencia no dia 1 e no dia 200. Agora o item
resolve pela progressao da trilha, e o rotulo mostra a duracao real da
sequencia do dia em vez de um numero pregado no codigo.

Manha e noite contam separado: praticar de manha nao avanca a noite,
porque sao qualidades diferentes.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Os dois exercícios de força que faltam

**Files:**
- Modify: `src/data/exercises-seed.ts`
- Modify: `src/lib/seed.ts` (`EXERCISE_SEED_VERSION`)
- Test: `tests/data/forca-levantar.test.ts`

**Interfaces:**
- Produces: ids `carregamento-frontal` e `prancha-antirrotacao`. Task 5 consome.

**Nota:** `agachamento-goblet` **já existe** no catálogo (equipamento `["halteres"]`) e não está em nenhum template. Não recrie — a Task 5 apenas o coloca em uso.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/forca-levantar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";

const NOVOS = ["carregamento-frontal", "prancha-antirrotacao"];
const PADRAO_LEVANTAR = ["agachamento-goblet", "carregamento-frontal", "prancha-antirrotacao"];

describe("padrão de força para levantar outra pessoa", () => {
  it("os três exercícios do padrão existem no catálogo", () => {
    const faltando = PADRAO_LEVANTAR.filter((id) => !EXERCISES.some((e) => e.id === id));
    expect(faltando).toEqual([]);
  });

  it("os novos têm descrição, erros comuns e cue de acerto", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect({ id, desc: !!e.description, erros: (e.commonMistakes ?? []).length > 0, cue: !!e.successCue })
        .toEqual({ id, desc: true, erros: true, cue: true });
    }
  });

  it("NENHUM carrega peso acima da cabeça — a restrição de ombro vale desde o início", () => {
    for (const id of PADRAO_LEVANTAR) {
      const texto = JSON.stringify(EXERCISES.find((x) => x.id === id)!).toLowerCase();
      expect(texto).not.toMatch(/acima da cabe[çc]a|overhead|desenvolvimento militar/);
    }
  });

  it("só usam equipamento que existe na academia dela", () => {
    const DISPONIVEL = ["halteres", "halter", "kettlebell", "caneleira", "colchonete", "banco", "barra", "anilhas", "step", "espaldar", "bola-suica", "leg-press", "maquina-abdutor", "maquina-adutora", "multiestacao", "polia-alta", "esteira", "bike-reclinada", "banco-inclinado"];
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      const fora = (e.equipment ?? []).filter((eq) => !DISPONIVEL.includes(eq));
      expect({ id, fora }).toEqual({ id, fora: [] });
    }
  });

  it("nenhum usa Smith nem polia baixa — não existem na academia dela", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect((e.equipment ?? []).join(" ")).not.toMatch(/smith|polia-baixa/);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/forca-levantar.test.ts`
Expected: FAIL — os dois não existem

- [ ] **Step 3: Acrescentar os exercícios**

Em `src/data/exercises-seed.ts`, na mesma forma dos vizinhos:

```ts
  {
    id: "carregamento-frontal",
    name: "Carregamento frontal (halteres ou kettlebell)",
    category: "core",
    equipment: ["halteres"],
    difficulty: "iniciante",
    description: "Segura um halter pesado (ou kettlebell) contra o peito, cotovelos pra baixo, e caminha 20 a 30 metros mantendo o tronco ereto e a costela fechada. É o padrão de carregar peso à frente do corpo — exatamente o que levantar outra pessoa exige.",
    commonMistakes: [
      "Arquear a lombar pra compensar o peso à frente",
      "Deixar o peso descer e afastar do peito, o que joga a carga toda na lombar",
      "Prender a respiração — respira raso e contínuo, sem travar",
    ],
    easierVariation: "Distância menor com peso menor, ou parada em pé segurando por 30s",
    harderVariation: "Mesma distância com peso maior, ou carregamento unilateral (um lado só, que exige mais do core)",
    exposureLevel: 2,
    startLoadKg: 8,
    successCue: "Fez certo se o tronco ficou ereto o percurso inteiro e você sentiu o abdômen segurando — não a lombar.",
    proTips: [
      "É frontal de propósito: carregar acima da cabeça engrossaria ombro e trapézio, que é o oposto do objetivo",
      "Comece com o kettlebell de 8 kg e só suba quando conseguir os 30 m sem perder a postura",
      "Levantar outra pessoa é isso com o peso vivo: tronco firme, carga à frente, força vindo de perna e quadril",
    ],
  },
  {
    id: "prancha-antirrotacao",
    name: "Prancha com apoio alternado (antirrotação)",
    category: "core",
    equipment: ["colchonete"],
    difficulty: "intermediario",
    description: "Prancha alta (mãos no chão), pés um pouco mais abertos que o normal. Tira uma mão do chão e toca o ombro oposto, devolve, troca. O quadril NÃO pode girar — é isso que treina.",
    commonMistakes: [
      "Deixar o quadril rodar quando tira a mão — é justamente o que o exercício existe pra impedir",
      "Pés muito juntos, o que torna quase impossível não rodar",
      "Descer o quadril e virar prancha frouxa",
    ],
    easierVariation: "Prancha com apoio nos joelhos, ou só tirar a mão do chão sem tocar o ombro",
    harderVariation: "Pés mais juntos, ou tocar o ombro devagar contando 2s de ida e 2s de volta",
    exposureLevel: 2,
    successCue: "Fez certo se o quadril ficou parado — se alguém filmasse de cima, o tronco não gira.",
    proTips: [
      "Antirrotação é o que segura o tronco quando o peso que você carrega se mexe — pessoa no colo se mexe",
      "Qualidade acima de repetição: 6 trocas sem girar valem mais que 20 girando",
      "Trabalha o mesmo transverso do vacuum, que é a alavanca da cintura — dois objetivos no mesmo movimento",
    ],
  },
```

Conferir `category` e campos obrigatórios contra a interface `Exercise` em `src/lib/db.ts` e ajustar se algum não existir.

- [ ] **Step 4: Bumpar `EXERCISE_SEED_VERSION`**

Em `src/lib/seed.ts`, incrementar `EXERCISE_SEED_VERSION` em 1. Sem isso os dois exercícios não chegam no aparelho dela.

- [ ] **Step 5: Rodar tudo**

Run: `npm run test` e `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/exercises-seed.ts src/lib/seed.ts tests/data/forca-levantar.test.ts
git commit -m "feat(forca): carregamento frontal e prancha antirrotacao

Levantar outra pessoa e dobradica de quadril + carga a frente do corpo +
core que nao deixa o tronco girar. O programa ja tinha a dobradica; faltava
o resto.

Frontal de proposito: carregar acima da cabeca engrossaria ombro e
trapezio, que e o oposto do objetivo dela — e ha teste barrando isso.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: As trocas nos ciclos — nada cresce

**Files:**
- Modify: `src/data/cycles-seed.ts`
- Modify: `src/lib/seed.ts` (`TEMPLATE_SEED_VERSION`)
- Test: `tests/data/trocas-forca.test.ts`

**Interfaces:**
- Consumes: `agachamento-goblet` (já no catálogo), `carregamento-frontal` e `prancha-antirrotacao` (Task 4)

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/trocas-forca.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

/** Contagem e duração por template ANTES desta task. Congelado de propósito:
 *  a decisão da usuária é que a sessão não cresce, e um número escrito aqui é
 *  o que impede alguém de "só acrescentar um exercício" depois. */
const ANTES: Record<string, { ex: number; min: number }> = {
  "v-seg-gluteo-unilateral": { ex: 7, min: 42 },
  "v-ter-cintura-costas": { ex: 8, min: 52 },
  "v-qua-mobilidade-danca": { ex: 10, min: 54 },
  "v-qui-gluteo-stiff": { ex: 8, min: 37 },
  "v-sex-peitoral-postura": { ex: 7, min: 32 },
  "h-seg-gluteo-volume": { ex: 7, min: 47 },
  "h-ter-cintura-costas": { ex: 6, min: 35 },
  "h-qua-mobilidade-danca": { ex: 9, min: 54 },
  "h-qui-gluteo-posterior": { ex: 7, min: 37 },
  "h-sex-peitoral-postura": { ex: 8, min: 37 },
  "r-seg-gluteo-densidade": { ex: 7, min: 32 },
  "r-ter-cintura-postura": { ex: 8, min: 48 },
  "r-qua-mobilidade-danca": { ex: 9, min: 56 },
  "r-qui-gluteo-simetria": { ex: 7, min: 32 },
  "r-sex-peitoral-refinamento": { ex: 7, min: 32 },
  "m-seg-gluteo": { ex: 6, min: 32 },
  "m-ter-superior": { ex: 7, min: 45 },
  "m-qua-mobilidade": { ex: 8, min: 48 },
  "m-qui-gluteo": { ex: 5, min: 27 },
  "m-sex-gluteo": { ex: 6, min: 27 },
};

describe("as trocas não fazem a sessão crescer", () => {
  it("nenhum template ganhou ou perdeu exercício", () => {
    const divergentes = Object.entries(ANTES)
      .map(([id, esperado]) => {
        const t = ALL_TEMPLATES.find((x) => x.id === id);
        return { id, agora: t?.exercises.length, esperado: esperado.ex };
      })
      .filter((r) => r.agora !== r.esperado);
    expect(divergentes).toEqual([]);
  });

  it("nenhum template mudou de duração", () => {
    const divergentes = Object.entries(ANTES)
      .map(([id, esperado]) => {
        const t = ALL_TEMPLATES.find((x) => x.id === id);
        return { id, agora: t?.durationMin, esperado: esperado.min };
      })
      .filter((r) => r.agora !== r.esperado);
    expect(divergentes).toEqual([]);
  });

  it("o goblet saiu do limbo — estava no catálogo sem estar em treino nenhum", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "agachamento-goblet"));
    expect(usos.length).toBeGreaterThanOrEqual(4);
  });

  it("o carregamento frontal entrou nos ciclos de construção", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "carregamento-frontal"));
    expect(usos.length).toBeGreaterThanOrEqual(3);
  });

  it("a prancha antirrotação entrou", () => {
    const usos = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "prancha-antirrotacao"));
    expect(usos.length).toBeGreaterThanOrEqual(4);
  });

  it("todo exerciseId dos templates existe no catálogo — troca não pode deixar id órfão", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    const orfaos = ALL_TEMPLATES.flatMap((t) => t.exercises.map((e) => e.exerciseId)).filter((id) => !ids.has(id));
    expect([...new Set(orfaos)]).toEqual([]);
  });

  it("o vacuum abdominal não foi sacrificado — é a alavanca da cintura dela", () => {
    const comVacuum = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "vacuum-abdominal"));
    expect(comVacuum.length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/trocas-forca.test.ts`
Expected: FAIL nos testes de presença dos três padrões (os de contagem e duração já passam, e é isso que os torna a rede)

- [ ] **Step 3: Aplicar as trocas, uma por uma**

Em `src/data/cycles-seed.ts`, substituir **o `exerciseId` e ajustar `sets`/`repsTarget`/`restSec`/`notes` conforme o exercício novo**, mantendo o item na mesma posição da lista:

| Ciclo | Template | Sai | Entra |
|---|---|---|---|
| variação | `v-seg-gluteo-unilateral` | `abdutor-maquina` | `agachamento-goblet` |
| variação | `v-ter-cintura-costas` | `cross-over-cabo` | `carregamento-frontal` |
| variação | `v-ter-cintura-costas` | `prancha-lateral` | `prancha-antirrotacao` |
| hipertrofia | `h-seg-gluteo-volume` | `abdutor-maquina` | `agachamento-goblet` |
| hipertrofia | `h-ter-cintura-costas` | `cross-over-cabo` | `carregamento-frontal` |
| hipertrofia | `h-sex-peitoral-postura` | `prancha-lateral` | `prancha-antirrotacao` |
| refinamento | `r-seg-gluteo-densidade` | `abdutor-band-em-pe` | `agachamento-goblet` |
| refinamento | `r-ter-cintura-postura` | `dead-bug` | `carregamento-frontal` |
| refinamento | `r-ter-cintura-postura` | `prancha` | `prancha-antirrotacao` |
| manutenção | `m-seg-gluteo` | `abdutor-maquina` | `agachamento-goblet` |
| manutenção | `m-ter-superior` | `prancha` | `prancha-antirrotacao` |

Manutenção **não** recebe o carregamento frontal de propósito: é a fase de volume reduzido, e nem todo padrão precisa estar presente ali. Registre isso num comentário.

Prescrição sugerida para os itens novos, ajustável ao contexto de cada template:
- `agachamento-goblet`: `sets: 3, repsTarget: "10-12", restSec: 75`
- `carregamento-frontal`: `sets: 3, repsTarget: "20-30m", restSec: 60`
- `prancha-antirrotacao`: `sets: 3, repsTarget: "8 trocas cada lado", restSec: 45`

Atualizar o comentário de cabeçalho de `cycles-seed.ts` para registrar que o padrão de levantar entrou **por troca**, e por quê.

- [ ] **Step 4: Bumpar `TEMPLATE_SEED_VERSION`**

Em `src/lib/seed.ts`, incrementar em 1. Sem isso as trocas **não chegam no aparelho dela** — o app só regrava templates quando a versão sobe.

- [ ] **Step 5: Rodar tudo**

Run: `npm run test`
Expected: PASS. Se `tests/data/templates-integridade.test.ts` ou `tests/data/correcoes-ciclo.test.ts` afirmarem presença de um exercício que saiu, leia o teste inteiro: ele pode estar protegendo uma regra ainda válida (por exemplo "todo dia de glúteo tem abdução"). **Se a troca violar uma regra existente, pare e reporte** — pode ser que o alvo da troca esteja errado.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: limpo

- [ ] **Step 7: Commit**

```bash
git add src/data/cycles-seed.ts src/lib/seed.ts tests/data/trocas-forca.test.ts
git commit -m "feat(forca): o padrao de levantar entra por troca, nao por soma

A sessao nao cresce — decisao dela. Cada exercicio que entra sai de outro
lugar do mesmo template, e o teste congela contagem e duracao dos 20
templates pra que ninguem "so acrescente" depois.

O agachamento goblet ja existia no catalogo e nao estava em treino nenhum:
entrou em uso, nao foi criado.

Manutencao nao recebe o carregamento frontal de proposito — e a fase de
volume reduzido.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: O horizonte de flexibilidade aparece na tela

**Files:**
- Modify: `src/data/horizontes-seed.ts`
- Test: `tests/data/horizontes-flex.test.ts`

**Interfaces:**
- Consumes: `HORIZONTE_FLEX` de `src/lib/flex-progression.ts` (Task 1)

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/horizontes-flex.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";
import { HORIZONTE_FLEX } from "../../src/lib/flex-progression";

const secao = () => HORIZONTES.find((s) => s.id === "flexibilidade");

describe("horizonte de flexibilidade", () => {
  it("existe uma seção sobre flexibilidade", () => {
    expect(secao()).toBeDefined();
  });

  it("diz que espacate NÃO é necessário — e o módulo concorda", () => {
    expect(HORIZONTE_FLEX.espacateNecessario).toBe(false);
    expect(JSON.stringify(secao()).toLowerCase()).toMatch(/n[ãa]o (é|e) necess[áa]rio/);
  });

  it("nomeia que o espacate lateral depende de anatomia, não de esforço", () => {
    expect(JSON.stringify(secao()).toLowerCase()).toMatch(/anatomia|acet[áa]bulo/);
  });

  it("cita os prazos reais do módulo, não números inventados", () => {
    const texto = JSON.stringify(secao());
    expect(texto).toContain(String(HORIZONTE_FLEX.primeiraMudancaSemanas[0]));
    expect(texto).toContain(String(HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]));
  });

  it("não promete o que a flexibilidade não entrega — nada sobre silhueta", () => {
    expect(JSON.stringify(secao()).toLowerCase()).not.toMatch(/afina|emagrec|cintura mais fina/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/horizontes-flex.test.ts`
Expected: FAIL — a seção não existe

- [ ] **Step 3: Acrescentar a seção**

Em `src/data/horizontes-seed.ts`, uma seção nova `id: "flexibilidade"`, no mesmo formato das outras (`title`, `intro`, `tips[]`), citando os prazos de `HORIZONTE_FLEX` e dizendo, com todas as letras: a primeira mudança vem em 4 a 6 semanas; o que as posições que ela quer pedem vem em 3 a 6 meses; **espacate não é necessário para nada disso**; espacate frontal levaria 12 a 24 meses; e o lateral depende do formato do acetábulo, com parte das pessoas nunca chegando por anatomia e não por esforço.

**Importar os números de `HORIZONTE_FLEX`** em vez de escrevê-los à mão — é a regra que a frente 1 instalou e que já evitou três divergências neste projeto.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/data/horizontes-flex.test.ts` e `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/horizontes-seed.ts tests/data/horizontes-flex.test.ts
git commit -m "feat(horizontes): a flexibilidade ganha horizonte declarado

Primeira mudanca em 4-6 semanas; o que as posicoes pedem em 3-6 meses.
Espacate NAO e necessario, e o lateral depende do formato do acetabulo —
parte das pessoas nunca chega, por anatomia e nao por esforco.

Os numeros vem de HORIZONTE_FLEX, nao escritos a mao: e a regra que a
frente 1 instalou depois de tres divergencias texto x modulo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Self-review

**Cobertura do spec:**

| Requisito | Task |
|---|---|
| Sessão de academia não cresce | 5 (teste congela contagem e duração dos 20 templates) |
| Flexibilidade nos slots que já existem | 3 |
| Progressão em 3 fases | 1 |
| Sequências novas de fase 2 e 3, manhã e noite | 2 |
| Horizonte declarado (4-6 semanas, 3-6 meses, espacate desnecessário) | 1 (dado) e 6 (tela) |
| Força de levantar por troca | 4 (catálogo) e 5 (trocas) |
| Nada engrossa ombro | 4 (teste explícito) |
| Equipamento real, sem Smith nem polia baixa | 4 (teste explícito) |
| Prioridade de glúteo confirmada, não refeita | 5 (nenhum template de glúteo perde hip thrust, agachamento ou stiff) |
| Bumps de versão | 2 (`MOVEMENT_VERSION`), 4 (`EXERCISE_SEED_VERSION`), 5 (`TEMPLATE_SEED_VERSION`) |

**Consistência de tipos:** `MomentoFlex` e `FlexDoDia` definidos na Task 1, consumidos nas 2, 3 e 6 com os mesmos nomes. `contarPraticasFlex(momento)` definida na Task 3 e usada só lá. Ids das sequências consistentes entre `SEQUENCIAS_FLEX` (Task 1) e o seed (Task 2) — o teste da Task 2 cruza os dois em vez de confiar.

**Risco conhecido:** a Task 5 troca exercícios que testes existentes podem estar protegendo (por exemplo uma regra "todo dia de glúteo tem abdução"). O Step 5 manda parar e reportar em vez de enfraquecer o teste — se a regra existir, o alvo da troca é que está errado, não a regra.

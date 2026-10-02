# Apresentação no Hoje (entrega B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sentar, andar, 8 com o quadril e gingado chegam até ela no Hoje — sentar nas micro-pausas do trabalho, o resto num item "Postura" às 20:15 com progressão — e o conteúdo deixa de mandar o que aperta ou desnivela a pelve.

**Architecture:** conteúdo novo/reescrito em `sequences-seed.ts` (com bump de `MOVEMENT_VERSION`); dois módulos puros novos (`postura-progression.ts` decide a sequência do dia, `sentar.ts` decide a dica de cada micro-pausa); `today-routine.ts` ganha o item; `Today.tsx` e `MicroPausaModal.tsx` só apresentam.

**Tech Stack:** React 18 + TypeScript, Dexie (`dexie-react-hooks`), Vitest + Testing Library (happy-dom), Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-02-apresentacao-no-hoje-design.md`

## Global Constraints

- Texto e comentário em **pt-BR com acentuação correta**; o conteúdo das sequências fala com ela no tom das sequências existentes (imperativo informal: "Anda", "Deixa", "Pratica").
- **Discrição:** rótulos e subtítulos do Hoje nunca expõem transição nem intimidade — a rede `tests/lib/discricao-rotulos.test.ts` vale para o item novo. O item chama **"Postura"**; a micro-pausa continua **"Micro-pausa"**.
- **Pelve desnivelada (2026-10-01):** nenhum texto de andar manda pisar **na** linha ou cruzar os pés; o certo é "perto da linha, sem cruzar os pés".
- **Sentar:** nada de "nunca abertas" nem cruzar no joelho como padrão; joelhos juntos só em blocos de 10–15 min; trocar de posição a cada 20–30 min.
- Módulos puros (`postura-progression.ts`, `sentar.ts`, `today-routine.ts`): **sem `db`, sem `new Date()`**.
- Rodízio **por dia do ano**, nunca por dia da semana.
- Seed mudou → `MOVEMENT_VERSION` sobe para **13**, com o pino do teste atualizado.
- Rede de texto proíbe a **afirmação**, não a palavra (lição 5.2).
- Teste de tela aguarda texto que depende do estado carregado.
- `npm run test`, `npm run build` e `npm run build:app` limpos. Branch `feat/apresentacao`; **nunca** `git push`.

## Review Focus

- Dia em que nenhuma prática foi feita ainda (0 práticas) → o item mostra caminhada ou oito, nunca gingado. (Task 2)
- `diaDoAno` 0, negativo ou `NaN` → não quebra o rodízio. (Task 2)
- Fim de semana → o item Postura também aparece (ela tem tempo; a noite existe nos 7 dias). (Task 3)
- Expediente configurado com só 1 micro-pausa → o bloco de joelhos juntos nunca aparece, e isso não quebra nada. (Task 4)
- Ela concluir o gingado antes da 14ª prática (abrindo pelo Movimento) → conta para a trilha e o item do dia se marca. (Task 2/3)

---

### Task 1: Conteúdo — sentar, andar, 8 com o quadril, gingado

**Files:**
- Modify: `src/data/sequences-seed.ts` (sequências `corporal-postura-sentar`, `corporal-caminhada`, `sensual-andar-gingado`; nova `corporal-oito-quadril` logo depois de `corporal-caminhada`)
- Modify: `src/lib/movement-seed.ts` (`MOVEMENT_VERSION` 12 → 13, com linha de histórico no comentário)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts` (pino `toBe(12)` → `toBe(13)`)
- Test: `tests/data/sequences-apresentacao.test.ts`

**Interfaces:**
- Produces: sequência `corporal-oito-quadril` (categoria `apresentacao`). Ids `corporal-caminhada` e `sensual-andar-gingado` mantidos (histórico de `practiceLogs`).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/data/sequences-apresentacao.test.ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const seq = (id: string) => SEQUENCES.find((s) => s.id === id)!;
const texto = (id: string) => JSON.stringify(seq(id));
const ANDAR = ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"];

describe("apresentação — o que conversamos em 2026-09-30/10-01", () => {
  it("o 8 com o quadril existe, é de apresentação e tem as três partes", () => {
    const s = seq("corporal-oito-quadril");
    expect(s.category).toBe("apresentacao");
    expect(s.moves.length).toBeGreaterThanOrEqual(4);
    expect(texto("corporal-oito-quadril")).toMatch(/[Dd]eslizar/);
    expect(texto("corporal-oito-quadril")).toMatch(/[Gg]irar/);
  });

  // Pelve desnivelada: pisar NA linha (passarela) acentua a assimetria.
  // Proíbe a afirmação; onde "linha" aparece, tem que vir com "sem cruzar".
  it("nenhuma sequência de andar manda pisar na linha ou cruzar os pés", () => {
    for (const id of ANDAR) {
      const t = texto(id);
      expect({ id, naLinha: /\bna linha\b|em cima da linha|pé na linha/i.test(t) }).toEqual({ id, naLinha: false });
      if (/linha/i.test(t)) expect({ id, semCruzar: /sem cruzar/i.test(t) }).toEqual({ id, semCruzar: true });
    }
  });

  it("sentar não manda 'nunca abertas' nem cruzar no joelho como padrão, e fala em blocos e em trocar", () => {
    const t = texto("corporal-postura-sentar");
    expect(t).not.toMatch(/nunca abertas/i);
    expect(t).not.toMatch(/cruza uma perna sobre a outra no joelho/i);
    expect(t).toMatch(/10[–-]15 min/);
    expect(t).toMatch(/20[–-]30 min/);
  });

  it("andar ensina joelho macio e passo curto", () => {
    const t = texto("corporal-caminhada");
    expect(t).toMatch(/passo curto/i);
    expect(t).toMatch(/joelho/i);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/data/sequences-apresentacao.test.ts`
Expected: FAIL — `corporal-oito-quadril` não existe; textos antigos com "pé na linha" e "nunca abertas".

- [ ] **Step 3: Implementar**

Em `src/data/sequences-seed.ts`, substitua o objeto inteiro de `corporal-postura-sentar` por:

```ts
  {
    id: "corporal-postura-sentar",
    name: "Postura e como sentar",
    category: "apresentacao",
    level: "iniciante",
    durationMin: 6,
    focus: "Sentar feminina não é manter as pernas grudadas o dia inteiro — isso cansa, aperta a parte íntima e desnivela a pelve. O padrão é uma posição de pouco esforço; joelhos juntos vêm em blocos curtos, que é o que vira hábito. Troca de posição a cada 20–30 min, seja qual for.",
    moves: [
      { name: "Alinhamento em pé", description: "Em pé, imagina um fio puxando o topo da cabeça pro teto. Ombros relaxam pra trás e pra baixo, costelas descem, queixo paralelo ao chão. Segura 30s memorizando a sensação — é ela que você leva pra cadeira.", durationSec: 60 },
      { name: "Ajustar a cadeira", description: "Senta no FUNDO da cadeira, lombar apoiada, pelve reta. Pés no chão e joelhos na altura do quadril ou um pouco abaixo — joelho acima do quadril deixa fechar as pernas bem mais difícil. Se a cadeira não regula, um apoio baixo nos pés resolve.", durationSec: 60 },
      { name: "Posições de pouco esforço", description: "Pratica as três, 30s cada: (1) joelhos juntos e as duas pernas inclinadas em diagonal pro mesmo lado — os joelhos se apoiam um no outro; (2) tornozelos cruzados, joelhos próximos; (3) joelhos a um palmo, pés um pouco afastados. Faz a (1) dos dois lados.", durationSec: 120 },
      { name: "Bloco de joelhos juntos", description: "Joelhos juntos, pés juntos ou levemente afastados, 1 min agora. No trabalho, a meta é um bloco de 10–15 min de cada vez, umas 3–4 vezes por dia — para quando virar esforço, não no limite. Solta na hora se formigar, se a lombar reclamar ou se perceber que prendeu a respiração.", durationSec: 60 },
      { name: "Conforto por baixo", description: "Peça íntima firme (slip ou calcinha de tecido firme, nunca samba-canção), com tudo apontado pra cima e rente ao corpo: assim, quando as coxas fecham, não há nada no meio delas apertando. É a maior parte da solução, sem risco nenhum.", durationSec: 30 },
      { name: "Alternar e trocar", description: "Pratica a troca: inclinada pra esquerda → tornozelos cruzados → inclinada pra direita, devagar, sem jogar o corpo. Alternar os lados ajuda a nivelar a pelve. No dia a dia: troca a cada 20–30 min.", durationSec: 60 },
    ],
  },
```

Substitua o objeto inteiro de `corporal-caminhada` por:

```ts
  {
    id: "corporal-caminhada",
    name: "Andar · passo curto e joelho macio",
    category: "apresentacao",
    level: "iniciante",
    durationMin: 6,
    focus: "O balanço do andar feminino não vem de empurrar o quadril — ele aparece quando você SOLTA: joelho que não trava, passo curto, peito calmo. Pé perto da linha, sem cruzar os pés: com a pelve desnivelada, andar de passarela acentua a assimetria.",
    moves: [
      { name: "Peso de um pé pro outro", description: "Pés na largura do quadril, joelhos levemente dobrados. Passa o peso de uma perna pra outra devagar: o quadril desliza pro lado que recebe o peso e a outra metade da pelve desce um pouco. Ombros parados. 1 min, no espelho.", durationSec: 60 },
      { name: "Câmera lenta", description: "Anda devagar, passo curto, pisando perto da linha — sem cruzar os pés. O joelho da perna de apoio nunca estica 100%. A cada passo, espera o quadril 'cair' pro lado do apoio antes de dar o próximo. 2 min, ida e volta.", durationSec: 120 },
      { name: "Peito calmo, braços soltos", description: "Continua andando. Peito aberto, costelas pra baixo, barriga firme mas não contraída. Braços soltos, balançando mais pra trás do que pra frente, mãos relaxadas. Se os ombros acompanharem o quadril, o passo está grande demais. 1 min.", durationSec: 60 },
      { name: "Acelerar aos poucos", description: "Sobe o ritmo até o normal sem perder o que apareceu no lento. Travou de novo? Volta pro lento por 20s e tenta outra vez. 1 min.", durationSec: 60 },
      { name: "Dose discreta", description: "Mesma caminhada com metade da amplitude: passo curto, joelho macio, peito calmo. É essa versão que vai pra rua e pro trabalho — passa como seu jeito de andar, não como performance. 1 min.", durationSec: 60 },
    ],
  },
```

Logo depois dele, insira:

```ts
  {
    id: "corporal-oito-quadril",
    name: "8 com o quadril",
    category: "apresentacao",
    level: "iniciante",
    durationMin: 5,
    focus: "O 8 é o desenho que o quadril faz no chão visto de cima, um 8 deitado (∞). É a base do rebolado e um pedaço dele aparece em cada passo. Quem mexe são os joelhos e o quadril, nunca a lombar; o peito fica parado. Pequeno e devagar vale mais que grande.",
    moves: [
      { name: "Posição base", description: "Pés na largura do quadril, joelhos levemente dobrados (sem isso o 8 não sai), peito aberto, mãos na cintura pra sentir. 20s respirando, soltando o ar devagar.", durationSec: 20 },
      { name: "Deslizar pro lado", description: "Leva o quadril pra direita e pra esquerda, reto, como uma gaveta abrindo. Ombros parados. 30s.", durationSec: 30 },
      { name: "Girar cada lado pra frente", description: "Leva o lado direito do quadril pra frente, volta ao meio, leva o lado esquerdo pra frente. Quem faz são os joelhos: o direito dobra um pouco mais e o quadril direito vai. O tronco continua olhando pra frente. 30s.", durationSec: 30 },
      { name: "Juntar: o 8", description: "Desliza pra direita → gira esse lado pra frente passando pelo meio até a esquerda → leva o lado esquerdo pra trás e gira pra frente, passando pelo meio de novo. Cada lado desenha um círculo e os dois se encontram no meio. Bem devagar, uns 4 segundos por 8. 1 min.", durationSec: 60 },
      { name: "Com música", description: "Uma música lenta e deixa o ritmo dela guiar o 8, do tamanho de um prato. 1 min.", durationSec: 60 },
      { name: "Conferir os erros", description: "Mãos no peito: se ele se mexe, diminui o 8. Joelho travado deixa o balanço duro. Prender a respiração trava tudo. Lombar reclamou = 8 grande demais. Um lado mais redondo que o outro é a pelve desnivelada — o lado travado vai mais devagar, sem forçar. 1 min.", durationSec: 60 },
    ],
  },
```

Em `sensual-andar-gingado`, troque o movimento `"Pé na linha + balanço"` por:

```ts
      { name: "Perto da linha + balanço", description: "Imagina uma linha no chão. Anda pisando perto dela, sem cruzar os pés — com a pelve desnivelada, cruzar acentua a assimetria. O passo curto já joga o quadril de lado. Junta com o molejo dos joelhos. Devagar, ida e volta. 2 min.", durationSec: 120 },
```

Em `src/lib/movement-seed.ts`, depois da linha de histórico `// v12: ...` (3 linhas), acrescente:

```ts
// v13: entrega B (2026-10-02) — sentar e andar reescritos (sem "nunca abertas",
// sem pisar na linha: a pelve dela é desnivelada), o 8 com o quadril novo e o
// gingado "perto da linha, sem cruzar os pés".
```

e troque `export const MOVEMENT_VERSION = 12;` por `export const MOVEMENT_VERSION = 13;`. Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, `expect(MOVEMENT_VERSION).toBe(12);` → `toBe(13)`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/data/sequences-apresentacao.test.ts tests/lib/seeds-chegam-no-aparelho.test.ts tests/data`
Expected: PASS. Se algum teste antigo citar o nome antigo "Caminhada feminina" (ex.: `src/lib/daily-routine.ts` tem esse rótulo em `PRESENCE_ITEMS`) e falhar, **pare e reporte** — não mude rótulos fora deste arquivo.

- [ ] **Step 5: Commit**

```bash
git add src/data/sequences-seed.ts src/lib/movement-seed.ts tests/lib/seeds-chegam-no-aparelho.test.ts tests/data/sequences-apresentacao.test.ts
git commit -m "feat(apresentacao): sentar e andar reescritos, 8 com o quadril, gingado sem cruzar os pés"
```

---

### Task 2: Progressão da Postura (módulo puro + contagem)

**Files:**
- Create: `src/lib/postura-progression.ts`
- Modify: `src/lib/practice-log-helpers.ts` (função nova `contarPraticasPostura`, ao lado de `contarPraticasFlex`)
- Test: `tests/lib/postura-progression.test.ts`

**Interfaces:**
- Produces: `SEQUENCIAS_POSTURA: readonly ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"]`; `ATE_GINGADO = 14`; `interface PosturaDoDia { sequenceId: string; etapa: string }`; `posturaDoDia(diaDoAno: number, praticasFeitas: number): PosturaDoDia`; `contarPraticasPostura(): Promise<number>`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/postura-progression.test.ts
import { describe, it, expect } from "vitest";
import { posturaDoDia, SEQUENCIAS_POSTURA, ATE_GINGADO } from "../../src/lib/postura-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

const ids = (praticas: number) => new Set(Array.from({ length: 30 }, (_, d) => posturaDoDia(d + 1, praticas).sequenceId));

describe("postura do dia", () => {
  it("antes de 14 práticas alterna só andar e 8 — gingado não aparece", () => {
    expect(ids(0)).toEqual(new Set(["corporal-caminhada", "corporal-oito-quadril"]));
    expect(ids(ATE_GINGADO - 1).has("sensual-andar-gingado")).toBe(false);
  });

  it("a partir de 14 entram as três", () => {
    expect(ids(ATE_GINGADO)).toEqual(new Set(SEQUENCIAS_POSTURA));
  });

  it("dias seguidos não repetem a mesma sequência", () => {
    for (const p of [0, ATE_GINGADO]) {
      for (let d = 1; d < 40; d++) expect(posturaDoDia(d, p).sequenceId).not.toBe(posturaDoDia(d + 1, p).sequenceId);
    }
  });

  // Review Focus: entrada inválida
  it("dia do ano 0, negativo ou NaN e práticas inválidas não quebram", () => {
    for (const d of [0, -5, Number.NaN]) {
      expect(SEQUENCIAS_POSTURA).toContain(posturaDoDia(d, Number.NaN).sequenceId);
    }
  });

  it("toda sequência da trilha existe no catálogo e tem movimentos", () => {
    for (const id of SEQUENCIAS_POSTURA) {
      const s = SEQUENCES.find((x) => x.id === id);
      expect({ id, existe: !!s, movs: (s?.moves.length ?? 0) >= 4 }).toEqual({ id, existe: true, movs: true });
    }
  });

  it("a etapa diz o que é sem expor nada", () => {
    expect(posturaDoDia(1, 0).etapa).toMatch(/\S/);
    expect(posturaDoDia(1, ATE_GINGADO).etapa).toMatch(/\S/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/postura-progression.test.ts`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

`src/lib/postura-progression.ts`:

```ts
// src/lib/postura-progression.ts
// Qual prática de postura fazer hoje às 20:15. Módulo puro — sem I/O, sem Date.
//
// Pedido dela (2026-09-30/10-01): sair do andar "travado", aprender o 8 com o
// quadril e o gingado. Decisão dela (2026-10-02): o gingado só entra depois que
// o andar e o 8 assentaram — começar o molejo ainda travada sai forçado.
//
// Rodízio por DIA DO ANO, nunca dia da semana: com lista de 2 ou 3 itens o
// dia da semana repetiria a mesma prática na mesma noite toda semana.

/** Ordem didática: a base (andar), o mecanismo (8) e o resultado (gingado). */
export const SEQUENCIAS_POSTURA = ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"] as const;

/** ~2 semanas de prática diária alternando andar e 8. */
export const ATE_GINGADO = 14;

export interface PosturaDoDia {
  sequenceId: string;
  /** O que o item do Hoje diz embaixo do rótulo. Neutro: o Hoje fica aberto
   *  em ambiente não receptivo. */
  etapa: string;
}

const ETAPA: Record<(typeof SEQUENCIAS_POSTURA)[number], string> = {
  "corporal-caminhada": "Andar — passo curto, joelho macio",
  "corporal-oito-quadril": "8 com o quadril — pequeno e devagar",
  "sensual-andar-gingado": "Gingado — o andar com molejo",
};

export function posturaDoDia(diaDoAno: number, praticasFeitas: number): PosturaDoDia {
  const p = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const d = Number.isFinite(diaDoAno) && diaDoAno > 0 ? Math.floor(diaDoAno) : 0;
  const trilha = p < ATE_GINGADO ? SEQUENCIAS_POSTURA.slice(0, 2) : SEQUENCIAS_POSTURA;
  const sequenceId = trilha[d % trilha.length];
  return { sequenceId, etapa: ETAPA[sequenceId] };
}
```

Em `src/lib/practice-log-helpers.ts`, importe `SEQUENCIAS_POSTURA` de `./postura-progression` e acrescente, logo depois de `contarPraticasFlex`:

```ts
/** Práticas concluídas da trilha de postura (andar, 8, gingado). Decide quando
 *  o gingado entra no rodízio — e conta também o que ela abrir pelo Movimento,
 *  porque praticar é praticar, venha de onde vier. */
export async function contarPraticasPostura(): Promise<number> {
  const ids = SEQUENCIAS_POSTURA as readonly string[];
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && ids.includes(l.sequenceId)).length;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/postura-progression.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/postura-progression.ts src/lib/practice-log-helpers.ts tests/lib/postura-progression.test.ts
git commit -m "feat(apresentacao): progressão da postura — gingado depois de 14 práticas"
```

---

### Task 3: Item "Postura" na rotina e no Hoje

**Files:**
- Modify: `src/lib/today-routine.ts` (tipo `RoutineLinkKey` + item no array `NOITE`)
- Modify: `src/pages/Today.tsx` (contagem, rótulo, `to`, `trilhaDoItem`)
- Test: `tests/lib/today-routine-postura.test.ts`; acrescentar caso em `tests/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `posturaDoDia`, `SEQUENCIAS_POSTURA` (Task 2); `contarPraticasPostura` (Task 2); `rotuloDaSequencia` (`src/lib/sequence-label.ts`, já existe); `diaDoAno` (`src/lib/today-date.ts`, já importado no Hoje).
- Produces: item de rotina `id: "postura"`, `linkKey: "postura"`, `defaultTime: "20:15"`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/today-routine-postura.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("item Postura na rotina", () => {
  it("existe na noite dos sete dias, às 20:15, entre o skincare e a voz", () => {
    for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
      const noite = buildDayRoutine(dow, 2).blocks.find((b) => b.id === "noite")!.items;
      const i = noite.findIndex((x) => x.id === "postura");
      expect({ dow, achou: i >= 0 }).toEqual({ dow, achou: true });
      expect(noite[i]).toMatchObject({ label: "Postura", linkKey: "postura", defaultTime: "20:15" });
      expect(noite.findIndex((x) => x.id === "skincare-noite")).toBeLessThan(i);
      expect(noite.findIndex((x) => x.id === "voz")).toBeGreaterThan(i);
    }
  });
});
```

Em `tests/pages/Today.test.tsx`, dentro de `describe("Today (backbone)")`:

```tsx
  it("o item Postura leva pra sequência do dia e mostra a duração", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    const link = await screen.findByRole("link", { name: /Postura · \d+ min/ });
    expect(link.getAttribute("href")).toMatch(/^\/treino\/movimento\/(corporal-caminhada|corporal-oito-quadril)$/);
  });
```

(Se o item renderiza o rótulo fora de um `<a>` acessível, ajuste a consulta para achar o texto `Postura · N min` e o `href` do link mais próximo, sem mudar o que o teste afirma: rótulo com duração e destino = sequência do dia, nunca gingado com 0 práticas.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/today-routine-postura.test.ts tests/pages/Today.test.tsx`
Expected: FAIL — item não existe.

- [ ] **Step 3: Implementar**

Em `src/lib/today-routine.ts`:
- `RoutineLinkKey` ganha `| "postura"`;
- no array `NOITE`, logo depois do item `skincare-noite`:

```ts
  // Sentar ficou nas micro-pausas; aqui é andar, 8 e gingado (decisão dela,
  // 2026-10-02: cada prática no momento em que ela é usada). Rótulo neutro de
  // propósito — o Hoje fica aberto em ambiente não receptivo.
  { id: "postura", block: "noite", label: "Postura", subtitle: "Andar, 8 com o quadril e gingado, um por dia", to: "/treino/movimento", linkKey: "postura", defaultTime: "20:15" },
```

Em `src/pages/Today.tsx`:
- imports: `contarPraticasPostura` (junto de `contarPraticasFlex`), `posturaDoDia, SEQUENCIAS_POSTURA` de `../lib/postura-progression`;
- logo depois do bloco do rebolado (`const reboladoHoje = ...`):

```tsx
  // Postura (andar → 8 → gingado), com o gingado liberado pela contagem —
  // mesmo padrão dos alongamentos.
  const praticasPostura = useLiveQuery(() => contarPraticasPostura(), []);
  const posturaHoje = posturaDoDia(diaDoAno(today), praticasPostura ?? 0);
  const posturaRotulo = rotuloFlexDoDia("Postura", posturaHoje);
```

  (`rotuloFlexDoDia` recebe `{ sequenceId, etapa }` — `PosturaDoDia` tem o mesmo formato.)
- em `trilhaDoItem`, acrescente `postura: SEQUENCIAS_POSTURA,`;
- em `subtitleFor`, junto dos outros `linkKey`: `if (item.linkKey === "postura") return posturaRotulo.subtitle;`
- onde os rótulos dos `linkKey` são trocados (o bloco com `if (item.linkKey === "flexNoite") return flexNoiteRotulo.label;`): `if (item.linkKey === "postura") return posturaRotulo.label;`
- em `toFor`: `if (item.linkKey === "postura") return \`/treino/movimento/${posturaHoje.sequenceId}\`;`

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/today-routine-postura.test.ts tests/pages/Today.test.tsx tests/lib/discricao-rotulos.test.ts tests/lib`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-routine.ts src/pages/Today.tsx tests/lib/today-routine-postura.test.ts tests/pages/Today.test.tsx
git commit -m "feat(apresentacao): item Postura às 20:15 no Hoje, com a sequência do dia"
```

---

### Task 4: Sentar nas micro-pausas

**Files:**
- Create: `src/lib/sentar.ts`
- Modify: `src/components/MicroPausaModal.tsx` (prop `diaDoAno`, seção "Ao voltar pra cadeira")
- Modify: `src/pages/Today.tsx` (passa `diaDoAno={diaDoAno(today)}` ao `MicroPausaModal`)
- Test: `tests/lib/sentar.test.ts`, `tests/components/MicroPausaModal.test.tsx`

**Interfaces:**
- Produces: `interface DicaSentar { titulo: string; como: string }`; `sentarDaVez(n: number, diaDoAno: number): DicaSentar`; `MicroPausaModal` props `{ n; diaDoAno; onClose; onFeito }`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/sentar.test.ts
import { describe, it, expect } from "vitest";
import { sentarDaVez } from "../../src/lib/sentar";

describe("sentar na volta da micro-pausa", () => {
  it("o bloco de joelhos juntos aparece só na pausa nº 1 do dia", () => {
    expect(sentarDaVez(1, 10).titulo).toMatch(/[Jj]oelhos juntos/);
    for (const n of [0, 2, 3, 4, 5]) expect(sentarDaVez(n, 10).titulo).not.toMatch(/[Jj]oelhos juntos/);
  });

  it("o bloco é curto e diz quando soltar", () => {
    const c = sentarDaVez(1, 10).como;
    expect(c).toMatch(/10[–-]15 min/);
    expect(c).toMatch(/formigar/);
  });

  it("o lado da posição inclinada alterna entre pausas e entre dias", () => {
    const lados = [0, 2, 4, 6].map((n) => sentarDaVez(n, 10)).filter((d) => /inclinad/i.test(d.titulo)).map((d) => /esquerd/.test(d.como) ? "e" : "d");
    expect(new Set(lados).size).toBeGreaterThan(0);
    const inclinada = (dia: number) => [0, 2, 3, 4, 5, 6].map((n) => sentarDaVez(n, dia)).find((d) => /inclinad/i.test(d.titulo))!;
    expect(/esquerd/.test(inclinada(10).como)).not.toBe(/esquerd/.test(inclinada(11).como));
  });

  it("toda dica lembra de trocar de posição", () => {
    for (let n = 0; n < 8; n++) expect(sentarDaVez(n, 3).como).toMatch(/20[–-]30 min/);
  });

  // Review Focus: valores estranhos não quebram
  it("n e dia inválidos devolvem uma dica", () => {
    for (const v of [-1, Number.NaN]) expect(sentarDaVez(v, v).titulo).toMatch(/\S/);
  });
});
```

```tsx
// tests/components/MicroPausaModal.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MicroPausaModal } from "../../src/components/MicroPausaModal";

describe("micro-pausa com a dica de sentar", () => {
  it("mostra 'Ao voltar pra cadeira' com a dica da vez", () => {
    render(<MicroPausaModal n={1} diaDoAno={10} onClose={() => {}} onFeito={() => {}} />);
    expect(screen.getByText("Ao voltar pra cadeira")).toBeInTheDocument();
    expect(screen.getByText("Joelhos juntos · bloco do dia")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/sentar.test.ts tests/components/MicroPausaModal.test.tsx`
Expected: FAIL — módulo não existe / prop desconhecida.

- [ ] **Step 3: Implementar**

`src/lib/sentar.ts`:

```ts
// src/lib/sentar.ts
// A dica de sentar que acompanha cada micro-pausa. Módulo puro.
//
// Decisão dela (2026-10-02): sentar se treina na cadeira do trabalho, não em
// casa. Conversa de 2026-10-01: joelhos juntos o dia inteiro cansa, aperta a
// parte íntima e desnivela a pelve — o padrão é uma posição de pouco esforço,
// e os joelhos juntos vêm num bloco curto por dia, que é o que vira hábito.

export interface DicaSentar {
  titulo: string;
  como: string;
}

const TROCA = "Troca de posição a cada 20–30 min, seja qual for.";

/** Pausa do dia em que entra o bloco de joelhos juntos: a segunda, quando o
 *  expediente já começou e ainda tem energia — uma vez só por dia. */
const PAUSA_DO_BLOCO = 1;

const inteiro = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

export function sentarDaVez(n: number, diaDoAno: number): DicaSentar {
  const i = inteiro(n);
  const d = inteiro(diaDoAno);
  if (i === PAUSA_DO_BLOCO) {
    return {
      titulo: "Joelhos juntos · bloco do dia",
      como: `Joelhos juntos por 10–15 min, pés juntos ou levemente afastados. Para quando virar esforço, não no limite. Solta na hora se formigar, se a lombar reclamar ou se perceber que prendeu a respiração. ${TROCA}`,
    };
  }
  // O lado alterna entre pausas e entre dias, pra nenhum lado da pelve
  // ficar sempre com a mesma carga.
  const lado = (i + d) % 2 === 0 ? "esquerda" : "direita";
  const opcoes: DicaSentar[] = [
    {
      titulo: "Pernas inclinadas pro lado",
      como: `Joelhos juntos e as duas pernas descendo em diagonal pra ${lado}. Os joelhos se apoiam um no outro, então quase não gasta força. Fundo da cadeira, lombar apoiada. ${TROCA}`,
    },
    {
      titulo: "Tornozelos cruzados",
      como: `Cruza os tornozelos (hoje o ${lado === "esquerda" ? "esquerdo" : "direito"} por cima), joelhos próximos sem colar. Aperta bem menos que cruzar no joelho. ${TROCA}`,
    },
    {
      titulo: "Joelhos próximos",
      como: `Joelhos a um palmo ou menos, pés um pouco afastados, pés no chão. De fora, lê como pernas juntas. ${TROCA}`,
    },
  ];
  return opcoes[(i + d) % opcoes.length];
}
```

Em `src/components/MicroPausaModal.tsx`:
- import `sentarDaVez` de `../lib/sentar`;
- a assinatura passa a `{ n, diaDoAno, onClose, onFeito }: { n: number; diaDoAno: number; onClose: () => void; onFeito: () => void }`;
- `const sentar = sentarDaVez(n, diaDoAno);`
- entre o `</ol>` e o botão "Feito ✓":

```tsx
        {/* Sentar se treina na cadeira — a dica vem na volta da pausa. O
            rótulo do item no Hoje continua "Micro-pausa": isto só aparece
            quando ela toca. */}
        <div className="border-t border-bg-border pt-3 mb-4">
          <p className="text-muted text-xs uppercase tracking-wider">Ao voltar pra cadeira</p>
          <p className="text-nude-warm text-sm font-medium mt-1">{sentar.titulo}</p>
          <p className="text-muted text-xs mt-1 leading-relaxed">{sentar.como}</p>
        </div>
```

Em `src/pages/Today.tsx`, no `<MicroPausaModal ... />`, acrescente `diaDoAno={diaDoAno(today)}`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/sentar.test.ts tests/components/MicroPausaModal.test.tsx tests/pages/Today.test.tsx`
Expected: PASS. (Se o teste de lados com `new Set(lados).size > 0` for fraco demais na sua leitura, mantenha-o — o caso forte é o de dias 10 × 11 logo abaixo.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/sentar.ts src/components/MicroPausaModal.tsx src/pages/Today.tsx tests/lib/sentar.test.ts tests/components/MicroPausaModal.test.tsx
git commit -m "feat(apresentacao): dica de sentar na volta de cada micro-pausa"
```

---

### Task 5: Suíte, builds e registro

**Files:**
- Modify: `docs/CONTINUAR-AQUI.md`

- [ ] **Step 1:** `npm run test`, `npm run build`, `npm run build:app` — tudo limpo.
- [ ] **Step 2:** Em `docs/CONTINUAR-AQUI.md`:
  - seção 1, depois da linha "A · Treinador":

```markdown
| B · Apresentação no Hoje | item Postura 20:15 (andar → 8 → gingado depois de 14 práticas), dica de sentar em cada micro-pausa, sentar/andar reescritos e 8 com o quadril novos (MOVEMENT_VERSION 13) | spec `docs/superpowers/specs/2026-10-02-apresentacao-no-hoje-design.md` · plano `docs/superpowers/plans/2026-10-02-apresentacao-no-hoje.md` |
```

  - seção 3, acrescente:

```markdown
| 10-02 | Apresentação **separada por momento**: sentar nas micro-pausas do trabalho; andar, 8 e gingado num item "Postura" às 20:15. Gingado só depois de 14 práticas. |
| 10-02 | Andar: pé **perto da linha, sem cruzar** — a "perna maior" dela é pelve desnivelada (teste de 10-01). |
```

  - seção 9, "Anteriores":

```markdown
- `PRESENCE_ITEMS`/`presenceSuggestionForDay` (`src/lib/daily-routine.ts`) não aparecem em tela nenhuma — só o agendador antigo do PWA os lê; o rodízio de postura da entrega B substituiu a parte de apresentação. Remover ou realocar na entrega E.
```

- [ ] **Step 3: Commit**

```bash
git add docs/CONTINUAR-AQUI.md
git commit -m "docs: entrega B (apresentação no Hoje) registrada"
```

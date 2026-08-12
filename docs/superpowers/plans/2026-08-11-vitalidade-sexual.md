# Frente 2 — Vitalidade sexual · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao app a metade que falta do assoalho pélvico — soltar, não só contrair — e o protocolo de streak que a usuária escolheu, para tratar precocidade, firmeza e conforto ao receber.

**Architecture:** Um módulo puro novo (`src/lib/vitalidade.ts`) calcula o streak a partir dos dias marcados; um campo opcional em `DailyLog` guarda a marcação; cinco sequências novas entram no seed existente e a progressão de assoalho pélvico ganha uma quarta fase. Uma página nova em Trilha reúne tudo, e o Hoje ganha um quarto card de streak.

**Tech Stack:** React 18 · TypeScript · Vite · Dexie 4 · React Router 7 · Vitest · Tailwind

## Global Constraints

- Todo texto de usuário e comentário em **pt-BR com acentuação correta**. Nunca substituir acento por ASCII.
- Módulos em `src/lib/` são **puros**: sem `new Date()`, sem I/O, sem `db`. Quem chama injeta a data.
- Comentário de código explica o **porquê**, não o quê.
- **Nível de explicitude: técnico e direto.** O app nomeia parte do corpo, ângulo, pressão, ritmo e duração. **Não narra cena e não usa linguagem erótica.** Régua: cada frase tem que ser executável na hora.
- **`pelvic-start-stop` NUNCA quebra o streak.** Um protocolo que pune o próprio tratamento força a escolher entre fazer o exercício e manter o número.
- **O alvo não é abstinência.** É 2–3 vezes por semana, com pelo menos uma sendo start-stop, sem tela.
- **O rótulo do card no Hoje é "Vitalidade"** — o nome do módulo, nunca a descrição do que conta. Decisão de privacidade da usuária.
- Teto declarado de volume seminal: ~1,5–5 mL é normal; otimizar leva de baixo-normal a alto-normal. **Nenhum suplemento de "volume" é recomendado.**
- `npm run test` verde e `npm run build` limpo são condição de commit.
- **Todo seed alterado precisa de bump de versão**, senão a mudança não chega no aparelho dela.

---

### Task 1: `src/lib/vitalidade.ts` — o cálculo do streak

**Files:**
- Create: `src/lib/vitalidade.ts`
- Test: `tests/lib/vitalidade.test.ts`

**Interfaces:**
- Produces: `calcularStreak(diasComGasto: string[], hojeISO: string, inicioISO: string): StreakVitalidade` onde `StreakVitalidade = { atual: number; recorde: number }`. Tasks 5 e 7 consomem.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/vitalidade.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calcularStreak } from "../../src/lib/vitalidade";

describe("streak de vitalidade", () => {
  it("sem nenhum gasto registrado, conta desde o início do acompanhamento", () => {
    expect(calcularStreak([], "2026-08-11", "2026-08-01")).toEqual({ atual: 10, recorde: 10 });
  });

  it("conta os dias desde o último gasto", () => {
    expect(calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01").atual).toBe(6);
  });

  it("marcar hoje zera o atual", () => {
    expect(calcularStreak(["2026-08-11"], "2026-08-11", "2026-08-01").atual).toBe(0);
  });

  it("guarda o recorde quando o streak zera — o número que ela perde não some", () => {
    // 01 a 09 limpos (9 dias), gasto no 10, hoje é 11 (1 dia limpo)
    const r = calcularStreak(["2026-08-10"], "2026-08-11", "2026-08-01");
    expect(r).toEqual({ atual: 1, recorde: 9 });
  });

  it("o recorde é a maior sequência limpa entre dois gastos", () => {
    // gastos em 03, 05 e 20 — a corrida de 06 a 19 tem 14 dias
    const r = calcularStreak(["2026-08-03", "2026-08-05", "2026-08-20"], "2026-08-21", "2026-08-01");
    expect(r.recorde).toBe(14);
  });

  it("o streak atual entra na disputa do recorde", () => {
    const r = calcularStreak(["2026-08-02"], "2026-08-30", "2026-08-01");
    expect(r).toEqual({ atual: 28, recorde: 28 });
  });

  it("datas fora de ordem e repetidas não quebram a conta", () => {
    const r = calcularStreak(["2026-08-10", "2026-08-05", "2026-08-10"], "2026-08-11", "2026-08-01");
    expect(r).toEqual({ atual: 1, recorde: 4 });
  });

  it("gasto anterior ao início do acompanhamento é ignorado", () => {
    expect(calcularStreak(["2026-07-20"], "2026-08-11", "2026-08-01").atual).toBe(10);
  });

  it("é puro — não usa a data do sistema", () => {
    const a = calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01");
    const b = calcularStreak(["2026-08-05"], "2026-08-11", "2026-08-01");
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/vitalidade.test.ts`
Expected: FAIL — não resolve `../../src/lib/vitalidade`

- [ ] **Step 3: Implementar**

Criar `src/lib/vitalidade.ts`:

```ts
// src/lib/vitalidade.ts
// Cálculo do streak de dias sem gasto automático. Módulo puro — sem I/O, sem Date.
//
// A usuária escolheu protocolo com contagem, na forma de streak, com a ressalva
// de risco registrada: contador que zera pode virar vergonha. Por isso o RECORDE
// é parte do contrato, e não enfeite — quando o número cai, ela ainda vê o que já
// conseguiu, e o esforço não desaparece junto com a sequência.
//
// O que quebra: pornografia OU masturbação no automático. O que NÃO quebra:
// sessão de `pelvic-start-stop`, que é o tratamento e exige masturbação — um
// protocolo que pune o próprio remédio faz ela escolher o número em vez da cura.

export interface StreakVitalidade {
  /** Dias limpos consecutivos terminando hoje. Hoje marcado ⇒ 0. */
  atual: number;
  /** A maior sequência limpa já alcançada, incluindo a atual. */
  recorde: number;
}

const MS_POR_DIA = 86_400_000;

/** Dias inteiros de `a` até `b`. Datas ISO "YYYY-MM-DD". */
function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / MS_POR_DIA);
}

/**
 * `diasComGasto` — dias marcados como gasto automático, em qualquer ordem.
 * `inicioISO` — primeiro dia de acompanhamento. Sem ele não dá pra saber se
 * "nenhum gasto" significa sequência longa ou ausência de registro, e inventar
 * um recorde que ela não fez seria a mesma mentira que este app existe pra tirar.
 */
export function calcularStreak(
  diasComGasto: string[],
  hojeISO: string,
  inicioISO: string,
): StreakVitalidade {
  const marcos = [...new Set(diasComGasto)]
    .filter((d) => diasEntre(inicioISO, d) >= 0)
    .sort();

  if (marcos.length === 0) {
    const limpo = diasEntre(inicioISO, hojeISO) + 1;
    return { atual: limpo, recorde: limpo };
  }

  const atual = diasEntre(marcos[marcos.length - 1], hojeISO);

  // Corrida inicial: do começo do acompanhamento até o dia anterior ao 1º gasto.
  const corridas = [diasEntre(inicioISO, marcos[0])];
  for (let i = 1; i < marcos.length; i++) {
    corridas.push(diasEntre(marcos[i - 1], marcos[i]) - 1);
  }

  return { atual, recorde: Math.max(atual, ...corridas) };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/vitalidade.test.ts`
Expected: PASS (9 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/vitalidade.ts tests/lib/vitalidade.test.ts
git commit -m "feat(vitalidade): calculo puro do streak, com recorde preservado

A usuaria escolheu streak, com a ressalva de risco registrada: contador que
zera pode virar vergonha. Por isso o recorde e parte do contrato — quando o
numero cai, ela ainda ve o que ja conseguiu.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: O dado — marcar o dia

**Files:**
- Modify: `src/lib/db.ts` (interface `DailyLog`, ~236-246)
- Modify: `src/lib/daily-log-helpers.ts`
- Test: `tests/lib/vitalidade-registro.test.ts`

**Interfaces:**
- Consumes: `db.dailyLog` (chave `date`)
- Produces: campo `DailyLog.gastoAutomatico?: boolean`; `registrarGastoAutomatico(date: string, marcado: boolean): Promise<void>`; `diasComGasto(): Promise<string[]>`; `inicioDoAcompanhamento(): Promise<string | null>`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/vitalidade-registro.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import {
  registrarGastoAutomatico,
  diasComGasto,
  inicioDoAcompanhamento,
} from "../../src/lib/daily-log-helpers";

describe("registro de gasto automático", () => {
  beforeEach(async () => {
    await db.dailyLog.clear();
  });

  it("marca o dia sem apagar o resto do registro", async () => {
    await db.dailyLog.put({ date: "2026-08-11", waterMl: 800, activeBreakCount: 3 });
    await registrarGastoAutomatico("2026-08-11", true);
    const log = await db.dailyLog.get("2026-08-11");
    expect(log).toMatchObject({ gastoAutomatico: true, waterMl: 800, activeBreakCount: 3 });
  });

  it("cria o registro do dia se ainda não existir", async () => {
    await registrarGastoAutomatico("2026-08-11", true);
    expect((await db.dailyLog.get("2026-08-11"))?.gastoAutomatico).toBe(true);
  });

  it("desmarcar volta atrás — engano não vira dívida permanente", async () => {
    await registrarGastoAutomatico("2026-08-11", true);
    await registrarGastoAutomatico("2026-08-11", false);
    expect((await db.dailyLog.get("2026-08-11"))?.gastoAutomatico).toBe(false);
  });

  it("lista só os dias marcados", async () => {
    await db.dailyLog.put({ date: "2026-08-09", waterMl: 0, activeBreakCount: 0 });
    await registrarGastoAutomatico("2026-08-10", true);
    await registrarGastoAutomatico("2026-08-11", true);
    expect((await diasComGasto()).sort()).toEqual(["2026-08-10", "2026-08-11"]);
  });

  it("o início do acompanhamento é o dia mais antigo com registro", async () => {
    await db.dailyLog.put({ date: "2026-08-09", waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: "2026-08-11", waterMl: 0, activeBreakCount: 0 });
    expect(await inicioDoAcompanhamento()).toBe("2026-08-09");
  });

  it("sem nenhum registro, não há início", async () => {
    expect(await inicioDoAcompanhamento()).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/vitalidade-registro.test.ts`
Expected: FAIL — `registrarGastoAutomatico is not a function`

- [ ] **Step 3: Acrescentar o campo em `src/lib/db.ts`**

Na interface `DailyLog`, depois de `sleepAt`:

```ts
  /** Dia em que houve gasto automático — pornografia ou masturbação no
   *  automático. Quebra o streak de Vitalidade. Sessão de `pelvic-start-stop`
   *  NÃO marca aqui: ela é o tratamento, e é registrada em `practiceLogs` como
   *  qualquer outra prática. Campo novo em objeto existente — o Dexie não
   *  precisa de bump de versão para isso. */
  gastoAutomatico?: boolean;
```

- [ ] **Step 4: Implementar os helpers**

Acrescentar em `src/lib/daily-log-helpers.ts`:

```ts
/** Marca (ou desmarca) o dia como gasto automático. Lê e escreve na mesma
 *  transação pelo mesmo motivo de `creditarPasseio`: dois toques rápidos em
 *  paralelo liam o mesmo registro e uma das escritas se perdia. */
export async function registrarGastoAutomatico(date: string, marcado: boolean): Promise<void> {
  await db.transaction("rw", db.dailyLog, async () => {
    const log = await db.dailyLog.get(date);
    if (log) {
      await db.dailyLog.update(date, { gastoAutomatico: marcado });
    } else {
      await db.dailyLog.put({ date, waterMl: 0, activeBreakCount: 0, gastoAutomatico: marcado });
    }
  });
}

/** Dias marcados como gasto automático. */
export async function diasComGasto(): Promise<string[]> {
  const logs = await db.dailyLog.toArray();
  return logs.filter((l) => l.gastoAutomatico).map((l) => l.date);
}

/** Dia mais antigo com registro diário — serve de início do acompanhamento pro
 *  streak. Sem isso, "nenhum gasto" seria indistinguível de "nunca registrou",
 *  e o app inventaria um recorde que ela não fez. */
export async function inicioDoAcompanhamento(): Promise<string | null> {
  const logs = await db.dailyLog.orderBy("date").limit(1).toArray();
  return logs[0]?.date ?? null;
}
```

Se `db.dailyLog` não tiver índice em `date` que permita `orderBy`, usar
`(await db.dailyLog.toArray()).map(l => l.date).sort()[0] ?? null` e comentar por quê.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/vitalidade-registro.test.ts`
Expected: PASS (6 testes)

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm run test`
Expected: PASS. Conferir `tests/lib/backup.test.ts` — se ele fixa o formato do
`DailyLog`, o campo novo pode exigir ajuste.

- [ ] **Step 7: Commit**

```bash
git add src/lib/db.ts src/lib/daily-log-helpers.ts tests/lib/vitalidade-registro.test.ts
git commit -m "feat(vitalidade): registro do dia de gasto automatico

Campo opcional no registro diario que ja existe. Sem tabela nova, sem
sincronizacao — continua tudo no aparelho dela.

Desmarcar volta atras de proposito: engano de toque nao pode virar divida
permanente num contador que ela escolheu justamente por ser motivador.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: As cinco sequências novas

**Files:**
- Modify: `src/data/sequences-seed.ts`
- Modify: `src/lib/movement-seed.ts` (`MOVEMENT_VERSION`, linha 4: 7 → 8)
- Test: `tests/data/sequences-soltura.test.ts`
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts`

**Interfaces:**
- Consumes: tipo de sequência já usado no arquivo (`id`, `name`, `category`, `level`, `durationMin`, `focus`, `moves[]` com `name`, `description`, `durationSec`, `repeat?`)
- Produces: ids `pelvic-soltura-identificacao`, `pelvic-soltura-sustentada`, `pelvic-alternancia`, `pelvic-start-stop`, `pelvic-receber-preparo`. Task 4 consome.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/sequences-soltura.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const NOVAS = [
  "pelvic-soltura-identificacao",
  "pelvic-soltura-sustentada",
  "pelvic-alternancia",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
];

describe("as sequências de soltura", () => {
  it("todas existem e são da categoria pelvic", () => {
    const faltando = NOVAS.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
    for (const id of NOVAS) {
      expect(SEQUENCES.find((s) => s.id === id)!.category).toBe("pelvic");
    }
  });

  it("todas têm foco e pelo menos 3 movimentos", () => {
    for (const id of NOVAS) {
      const s = SEQUENCES.find((x) => x.id === id)!;
      expect({ id, temFoco: !!s.focus, movimentos: s.moves.length >= 3 })
        .toEqual({ id, temFoco: true, movimentos: true });
    }
  });

  it("a identificação da soltura entra pela respiração diafragmática — é o único caminho que funciona", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-soltura-identificacao")!;
    const texto = JSON.stringify(s).toLowerCase();
    expect(texto).toMatch(/respira/);
    expect(texto).toMatch(/diafragm|abd[oô]men|barriga/);
  });

  it("o start-stop se declara treino, não deslize — é o que sustenta a regra do streak", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-start-stop")!;
    expect(JSON.stringify(s).toLowerCase()).toMatch(/treino|exerc[íi]cio/);
  });

  it("o start-stop diz explicitamente que é sem tela", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-start-stop")!;
    expect(JSON.stringify(s).toLowerCase()).toMatch(/sem tela|sem pornografia/);
  });

  it("o preparo pra receber aponta pro relaxamento, não pra força", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-receber-preparo")!;
    const texto = JSON.stringify(s).toLowerCase();
    expect(texto).toMatch(/relax|solt/);
    expect(texto).toMatch(/lubrific/);
  });

  it("nenhuma sequência nova propõe strap-on — a noiva recusou, e propor de novo é não escutar", () => {
    for (const id of NOVAS) {
      expect(JSON.stringify(SEQUENCES.find((x) => x.id === id)!).toLowerCase()).not.toMatch(/strap|pr[óo]tese pen/);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/sequences-soltura.test.ts`
Expected: FAIL — as cinco não existem

- [ ] **Step 3: Acrescentar as sequências**

Em `src/data/sequences-seed.ts`, logo depois de `pelvic-pre-prazer`, no mesmo estilo dos vizinhos:

```ts
  {
    id: "pelvic-soltura-identificacao",
    name: "Achar a soltura (reverse Kegel)",
    category: "pelvic",
    level: "iniciante",
    durationMin: 5,
    focus: "A metade que falta. Contrair você já treina; SOLTAR é mais difícil e é o que trata precocidade — assoalho que vive tenso dispara antes, não depois. Ninguém relaxa isso por comando direto: o caminho é a respiração. Inspira pro abdômen e deixa o períneo descer junto.",
    moves: [
      { name: "Respiração diafragmática", description: "Deitada, joelhos dobrados, uma mão na barriga e outra no peito. Inspira pelo nariz fazendo SÓ a mão da barriga subir. Expira devagar pela boca. A mão do peito fica quieta. 10 respirações.", durationSec: 90, repeat: 10 },
      { name: "Sentir o períneo descer", description: "Mesma respiração. Na inspiração, presta atenção na região entre o púbis e o cóccix: ela desce e se alarga levemente. É isso que você quer achar. Não empurra, não força — só permite. 8 respirações.", durationSec: 90, repeat: 8 },
      { name: "Contraste (contrai → solta)", description: "Contrai o PC por 3s e depois SOLTA deliberadamente, indo além do repouso, deixando descer com a inspiração. É o contraste que ensina onde fica a soltura. 8 ciclos.", durationSec: 90, repeat: 8 },
      { name: "Só soltura", description: "Sem contrair antes. Só inspira e deixa descer. Mais difícil do que parece: se você não sentir nada, volta pro contraste — é normal levar dias.", durationSec: 60, repeat: 6 },
      { name: "Checagem", description: "Glúteo solto, coxa solta, mandíbula solta. Assoalho pélvico e mandíbula andam juntos: se a mandíbula está travada, o assoalho está também.", durationSec: 30 },
    ],
  },
  {
    id: "pelvic-soltura-sustentada",
    name: "Soltura sustentada",
    category: "pelvic",
    level: "iniciante",
    durationMin: 5,
    focus: "Manter a soltura por mais tempo, não só achá-la. É a habilidade que você vai usar para receber com conforto e para segurar o ponto de não-retorno no sexo.",
    moves: [
      { name: "Aquecimento respiratório", description: "5 respirações diafragmáticas lentas, mão na barriga, checando que o peito fica quieto.", durationSec: 60, repeat: 5 },
      { name: "Soltura de 10s", description: "Inspira soltando o períneo e mantém a soltura por 10s respirando normal por cima. O reflexo é contrair de volta — resistir a isso é o exercício. 6 repetições.", durationSec: 120, repeat: 6 },
      { name: "Soltura de 20s", description: "Mesma coisa, 20s. Se perder a soltura no meio, recomeça sem se cobrar: perder é parte, é músculo aprendendo posição nova.", durationSec: 120, repeat: 4 },
      { name: "Soltura em posição de quadril aberto", description: "Borboleta sentada ou happy baby deitada, mantendo a soltura por 30s. Quadril aberto facilita — é assim que você vai estar na hora que importa.", durationSec: 90, repeat: 3 },
    ],
  },
  {
    id: "pelvic-alternancia",
    name: "Alternância contrair ↔ soltar",
    category: "pelvic",
    level: "intermediario",
    durationMin: 6,
    focus: "A coordenação, que vale mais que força bruta. Firmeza vem de contrair na hora certa; controle vem de soltar na hora certa. Quem só treina um lado fica forte e descoordenada.",
    moves: [
      { name: "Aquecimento", description: "5 respirações diafragmáticas + 5 contrações leves de 2s pra acordar os dois sentidos.", durationSec: 60 },
      { name: "Alternância lenta (5s / 5s)", description: "Contrai firme 5s, solta deliberadamente 5s indo além do repouso. 10 ciclos, sem pressa. A soltura tem que ser tão ativa quanto a contração.", durationSec: 120, repeat: 10 },
      { name: "Alternância rápida (2s / 2s)", description: "Mesmo ciclo em 2s cada. Aqui aparece a descoordenação: se a soltura vira só 'parar de contrair', volta pro ritmo lento.", durationSec: 90, repeat: 12 },
      { name: "Escada", description: "Contrai em 3 níveis (leve, médio, forte), depois desce pelos mesmos 3 e vai além, até a soltura. 6 subidas e descidas. É o controle fino que serve na cama.", durationSec: 120, repeat: 6 },
      { name: "Cooldown", description: "Termina em soltura, não em contração. Assoalho pélvico não deve sair do treino tenso.", durationSec: 30 },
    ],
  },
  {
    id: "pelvic-start-stop",
    name: "Start-stop (controle ejaculatório)",
    category: "pelvic",
    level: "intermediario",
    durationMin: 15,
    focus: "É TREINO, não deslize — a intervenção com melhor evidência para precocidade, e ela exige masturbação. Por isso não quebra o streak. Regras: sem tela, sem pressa, e pegada leve. Objetivo é reconhecer o ponto de não-retorno e recuar antes dele, não gozar rápido nem aguentar sofrendo.",
    moves: [
      { name: "Preparação", description: "Sem tela e sem pornografia — o estímulo é a sensação, não a imagem. Lubrificante ajuda: pegada seca e forte é o que dessensibiliza com o tempo.", durationSec: 60 },
      { name: "Subir até 7 de 10", description: "Estimula até uns 7 numa escala de 10, onde 10 é o ponto de não-retorno. Para ANTES de 8. Deixa a excitação cair até uns 4.", durationSec: 180 },
      { name: "Repetir 3 vezes", description: "Sobe a 7, para, desce a 4. Três ciclos. Cada parada é o treino — o objetivo é aprender onde fica o 8, que é o ponto que você hoje ultrapassa sem perceber.", durationSec: 300, repeat: 3 },
      { name: "Contrair na descida", description: "Durante a pausa, contrai o assoalho pélvico por 5s duas ou três vezes. É a contração que segura, e treiná-la sob excitação é diferente de treiná-la deitada no chão.", durationSec: 60, repeat: 3 },
      { name: "Encerrar", description: "Pode terminar gozando ou não — os dois valem como sessão. Terminar sem gozar não é mérito extra; terminar gozando depois de 3 ciclos de controle já é o exercício feito.", durationSec: 60 },
    ],
  },
  {
    id: "pelvic-receber-preparo",
    name: "Preparo pra receber",
    category: "pelvic",
    level: "intermediario",
    durationMin: 10,
    focus: "Relaxamento voluntário sob pressão gradual, para receber com conforto. A via é mão e dedos — carne dos dois lados, sensação mútua. A habilidade que sustenta tudo é a soltura da fase 2: sem ela, o corpo fecha e dói. Progressão de meses, não de dias.",
    moves: [
      { name: "Aquecimento de quadril", description: "Borboleta e happy baby, 2 min, respirando fundo. Quadril fechado torna tudo mais difícil.", durationSec: 120 },
      { name: "Soltura sem pressão", description: "Encontra a soltura como na fase 2 e mantém 30s. Repete 4 vezes. Sem nada envolvido ainda — a habilidade vem primeiro.", durationSec: 120, repeat: 4 },
      { name: "Lubrificante, de sobra", description: "Muito mais do que parece necessário, e reaplicado. A região não produz lubrificação própria: economia aqui é o que causa dor e microlesão.", durationSec: 60 },
      { name: "Pressão externa com soltura", description: "Pressão suave por fora, mantendo a soltura na inspiração. Se o corpo fechar, para, respira, recomeça. Fechar é informação, não fracasso.", durationSec: 120 },
      { name: "Entrada de um dedo, com respiração", description: "Um dedo, devagar, entrando na INSPIRAÇÃO (é quando o assoalho desce). Fica parada, respirando, até a sensação de pressão virar só presença. Sem movimento nenhum nesse estágio.", durationSec: 180 },
      { name: "Progressão em semanas", description: "Só aumenta quando o estágio anterior estiver confortável em duas sessões seguidas. Pressa aqui custa semanas de recuo. Fisting é o horizonte distante dessa escada, não o próximo degrau.", durationSec: 60 },
    ],
  },
```

- [ ] **Step 4: Bumpar a versão do seed**

Em `src/lib/movement-seed.ts`, linha 4: `const MOVEMENT_VERSION = 7;` → `= 8;`

Sem isso as cinco sequências **não chegam no aparelho dela** — o app só regrava quando a versão sobe.

- [ ] **Step 5: Estender o teste de chegada**

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, acrescentar caso que confirme que as
cinco sequências novas existem no banco depois de rodar o seed de movimento.

- [ ] **Step 6: Rodar tudo**

Run: `npm run test`
Expected: PASS. Se `tests/lib/movement-seed.test.ts` fixar a contagem de sequências,
ajustar o número.

- [ ] **Step 7: Commit**

```bash
git add src/data/sequences-seed.ts src/lib/movement-seed.ts tests/
git commit -m "feat(vitalidade): as cinco sequencias de soltura

O app tinha 8 sequencias de assoalho pelvico e todas eram de contracao.
Faltava a metade que resolve: soltar trata precocidade (assoalho tenso
dispara antes), permite receber com conforto, e abre o quadril.

A soltura entra pela respiracao diafragmatica porque nao existe outro
caminho — mandar 'relaxe' vira tentativa frustrada e abandono.

MOVEMENT_VERSION 7 -> 8, senao nada disso chega no aparelho.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: A progressão ganha a quarta fase

**Files:**
- Modify: `src/lib/pelvic-progression.ts`
- Test: `tests/lib/pelvic-progression.test.ts` (existente — estender)

**Interfaces:**
- Consumes: ids da Task 3
- Produces: `pelvicDoDia(praticasFeitas: number): PelvicDoDia` com as 4 fases. Assinatura **não muda** — Today.tsx já consome.

- [ ] **Step 1: Escrever o teste que falha**

Acrescentar a `tests/lib/pelvic-progression.test.ts`:

```ts
describe("a soltura entra na fase 2, antes das variações", () => {
  it("as 5 primeiras práticas são identificação da contração", () => {
    for (let n = 0; n < 5; n++) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-identificacao");
    }
  });

  it("da 6ª à 10ª, treina achar a soltura", () => {
    for (let n = 5; n < 10; n++) {
      expect(pelvicDoDia(n).sequenceId).toBe("pelvic-soltura-identificacao");
    }
  });

  it("a fase 3 alterna Kegel clássico e alternância", () => {
    const ids = [];
    for (let n = 10; n < 17; n++) ids.push(pelvicDoDia(n).sequenceId);
    expect(new Set(ids)).toEqual(new Set(["pelvic-kegel-classico", "pelvic-alternancia"]));
  });

  it("a rotação da fase 4 inclui start-stop e preparo pra receber", () => {
    const ids = new Set<string>();
    for (let n = 17; n < 60; n++) ids.add(pelvicDoDia(n).sequenceId);
    expect(ids.has("pelvic-start-stop")).toBe(true);
    expect(ids.has("pelvic-receber-preparo")).toBe(true);
  });

  it("a rotação nunca volta pra identificação — base não se refaz", () => {
    for (let n = 17; n < 60; n++) {
      expect(pelvicDoDia(n).sequenceId).not.toBe("pelvic-identificacao");
      expect(pelvicDoDia(n).sequenceId).not.toBe("pelvic-soltura-identificacao");
    }
  });

  it("cada fase se anuncia — exercício cego não constrói nada", () => {
    for (const n of [0, 6, 12, 20]) {
      expect(pelvicDoDia(n).etapa.length).toBeGreaterThan(10);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/pelvic-progression.test.ts`
Expected: FAIL — na 6ª prática ainda devolve `pelvic-kegel-classico`

- [ ] **Step 3: Reescrever a progressão**

Substituir o corpo de `src/lib/pelvic-progression.ts` mantendo a assinatura:

```ts
/** As sequências em ordem didática. A soltura entra CEDO, e de propósito:
 *  contrair um músculo que já vive tenso piora o controle. */
export const PELVIC_ORDEM = [
  "pelvic-identificacao",
  "pelvic-soltura-identificacao",
  "pelvic-kegel-classico",
  "pelvic-alternancia",
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-soltura-sustentada",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
  "pelvic-dance-integration",
  "pelvic-pre-prazer",
] as const;

const ATE_SOLTURA = 5;
const ATE_FASE_3 = 10;
const ATE_ROTACAO = 17;

/** Fase 3 alterna força e coordenação em dias consecutivos. */
const FASE_3 = ["pelvic-kegel-classico", "pelvic-alternancia"] as const;

/** Fase 4 — tudo que não é base. Inclui start-stop e preparo pra receber. */
const ROTACAO = [
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-soltura-sustentada",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
  "pelvic-dance-integration",
  "pelvic-pre-prazer",
] as const;

export function pelvicDoDia(praticasFeitas: number): PelvicDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;

  if (n < ATE_SOLTURA) {
    return {
      sequenceId: "pelvic-identificacao",
      etapa: `Fase 1 · achar o músculo (${n}/${ATE_SOLTURA}) — sem isso o resto é glúteo disfarçado`,
    };
  }

  if (n < ATE_FASE_3) {
    return {
      sequenceId: "pelvic-soltura-identificacao",
      etapa: `Fase 2 · achar a soltura (${n - ATE_SOLTURA + 1}/${ATE_FASE_3 - ATE_SOLTURA}) — é ela que trata a precocidade`,
    };
  }

  if (n < ATE_ROTACAO) {
    return {
      sequenceId: FASE_3[(n - ATE_FASE_3) % FASE_3.length],
      etapa: `Fase 3 · força e coordenação (${n - ATE_FASE_3 + 1}/${ATE_ROTACAO - ATE_FASE_3})`,
    };
  }

  return {
    sequenceId: ROTACAO[(n - ATE_ROTACAO) % ROTACAO.length],
    etapa: "Fase 4 · controle fino, start-stop e preparo",
  };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/pelvic-progression.test.ts`
Expected: PASS

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npm run test`
Expected: PASS. `PELVIC_ORDEM` é usada em `src/pages/Today.tsx` para contar práticas —
conferir que a contagem continua funcionando com a lista maior.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pelvic-progression.ts tests/lib/pelvic-progression.test.ts
git commit -m "feat(vitalidade): a soltura entra na fase 2, nao no fim

Soltar e mais dificil que contrair, e quem so treina contracao passa meses
fortalecendo um musculo que ja vive tenso — o que PIORA o controle
ejaculatorio em vez de melhorar.

Quatro fases: achar o musculo, achar a soltura, forca e coordenacao, e a
rotacao com start-stop e preparo pra receber.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: A página Vitalidade

**Files:**
- Create: `src/pages/path/Vitalidade.tsx`
- Modify: `src/main.tsx` (rota, junto das outras de `trilha`, ~linha 133)
- Modify: `src/components/ShortcutsGrid.tsx` (`SHORTCUTS`, linha 5)
- Test: `tests/pages/vitalidade.smoke.test.tsx`

**Interfaces:**
- Consumes: `calcularStreak` (Task 1); `diasComGasto`, `inicioDoAcompanhamento`, `registrarGastoAutomatico` (Task 2); `pelvicDoDia`, `PELVIC_ORDEM` (Task 4)
- Produces: rota `/trilha/vitalidade`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/pages/vitalidade.smoke.test.tsx`, seguindo o padrão dos outros smoke
tests de página do projeto (ver `tests/pages/silhueta.smoke.test.tsx` para o
formato de render com router e Dexie). Cobrir:

```tsx
it("mostra o streak atual e o recorde", async () => {
  // com dailyLog semeado: início em 2026-08-01, gasto em 2026-08-10
  // espera ver o número atual e o recorde na tela
});

it("marcar o dia zera o atual sem apagar o recorde", async () => {
  // clica no controle de marcar, espera atual 0 e recorde preservado
});

it("mostra a fase atual do assoalho pélvico", async () => {
  // espera texto de fase vindo de pelvicDoDia
});

it("não usa a palavra pornografia no rótulo do atalho nem no título da página", async () => {
  // decisão de privacidade: o nome é Vitalidade
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/pages/vitalidade.smoke.test.tsx`
Expected: FAIL — a página não existe

- [ ] **Step 3: Criar a página**

`src/pages/path/Vitalidade.tsx` — usa `useLiveQuery` do `dexie-react-hooks` como as
outras páginas, `hojeISO` de `src/lib/today-date.ts` para a data (a lógica pura
recebe a data, não a busca), e os componentes que já existem (`card`, `StreakCard`).

Estrutura da tela:

1. **Streak** — número grande do atual, recorde ao lado, e o botão de marcar o dia.
   O texto ao lado do botão explica a regra em uma frase: pornografia e masturbação
   no automático quebram; sessão de start-stop não.
2. **Assoalho pélvico** — fase atual vinda de `pelvicDoDia`, práticas acumuladas, e
   link para a sequência do dia.
3. **Painel** — Task 6.

O alvo declarado aparece na tela: **2–3 vezes por semana, com pelo menos uma sendo
start-stop, sem tela.** Não é abstinência, e a tela diz isso — senão o streak vira
uma corrida para zero que trabalha contra a própria fisiologia.

- [ ] **Step 4: Rota e atalho**

Em `src/main.tsx`, junto das rotas de `trilha`:

```tsx
        { path: "trilha/vitalidade", element: <Vitalidade /> },
```

Em `src/components/ShortcutsGrid.tsx`, no array `SHORTCUTS`:

```ts
  { icon: "◉", label: "Vitalidade", sub: "assoalho pélvico · firmeza · controle", to: "/trilha/vitalidade" },
```

O `sub` **não menciona pornografia** — decisão de privacidade da usuária, registrada
no spec.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test -- tests/pages/vitalidade.smoke.test.tsx`
Expected: PASS

- [ ] **Step 6: Suíte e build**

Run: `npm run test` e `npm run build`
Expected: PASS e build limpo. `tests/components/ShortcutsGrid.test.tsx` existe —
se fixar a quantidade de atalhos, ajustar.

- [ ] **Step 7: Commit**

```bash
git add src/pages/path/Vitalidade.tsx src/main.tsx src/components/ShortcutsGrid.tsx tests/pages/vitalidade.smoke.test.tsx tests/components/
git commit -m "feat(vitalidade): a pagina, a rota e o atalho

O atalho diz 'assoalho pelvico · firmeza · controle' e nunca a palavra
pornografia — decisao de privacidade dela, e o modulo inteiro respeita.

A tela declara o alvo: 2-3 vezes por semana, uma delas start-stop, sem
tela. Nao e abstinencia, e dizer isso importa: streak sem alvo declarado
vira corrida pro zero, que trabalha contra a fisiologia.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: O painel de firmeza, controle e volume

**Files:**
- Modify: `src/pages/path/Vitalidade.tsx`
- Create: `src/data/vitalidade-guide-seed.ts`
- Test: `tests/data/vitalidade-guide.test.ts`

**Interfaces:**
- Consumes: `GuideSection` de `src/components/GuideAccordion`; `CONSUMO`, `FASES`, `MEDIDAS_PARTIDA` de `src/lib/objetivo.ts`
- Produces: `VITALIDADE_GUIA: GuideSection[]`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/vitalidade-guide.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { VITALIDADE_GUIA } from "../../src/data/vitalidade-guide-seed";

const texto = JSON.stringify(VITALIDADE_GUIA);

describe("guia de firmeza, controle e volume", () => {
  it("declara o teto de volume em vez de prometer multiplicação", () => {
    expect(texto).toMatch(/1,5|5 mL|alto-normal/);
  });

  it("não recomenda suplemento de volume", () => {
    expect(texto.toLowerCase()).not.toMatch(/suplemento de volume|pílula de volume/);
    expect(texto.toLowerCase()).toMatch(/sem evid[êe]ncia/);
  });

  it("nomeia as alavancas reais", () => {
    for (const alavanca of [/intervalo/i, /hidrata/i, /assoalho/i, /sono/i, /cintura|abdominal/i, /zinco/i]) {
      expect(texto).toMatch(alavanca);
    }
  });

  it("aponta a castanha de caju como a fonte local de zinco", () => {
    expect(texto.toLowerCase()).toMatch(/castanha de caju/);
  });

  it("registra que hormonizar derrubaria o volume — reforça as duas trilhas", () => {
    expect(texto.toLowerCase()).toMatch(/estrog[êe]nio|hormoniz/);
  });

  it("não trata a terapia hormonal como etapa agendada", () => {
    expect(texto).not.toMatch(/quando a TRH/i);
    expect(texto).not.toMatch(/in[íi]cio da TRH/i);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/vitalidade-guide.test.ts`
Expected: FAIL — o seed não existe

- [ ] **Step 3: Criar o guia**

`src/data/vitalidade-guide-seed.ts`, no formato de `horizontes-seed.ts`. Seções:
o teto declarado; as alavancas na ordem de peso (intervalo, hidratação, assoalho,
sono e gordura abdominal, zinco, edging); e o que não funciona.

Conteúdo obrigatório: volume normal é ~1,5–5 mL e otimizar leva de baixo-normal a
alto-normal; o intervalo é a maior alavanca e sobe até o 5º–7º dia — **o próprio
streak é o tratamento principal**; hidratação falha em Aracaju com 5 km a pé por dia;
o bulbocavernoso é o músculo que expulsa; gordura abdominal converte testosterona em
estrogênio; castanha de caju é a fonte local de zinco; suplemento de volume de
farmácia é, na maioria, **sem evidência**; e hormonizar derrubaria o volume a quase
zero, o que reforça as duas trilhas da frente 1.

- [ ] **Step 4: Ligar ao dado real na página**

Na `Vitalidade.tsx`, o painel puxa: água de hoje contra a meta, streak de sono
(mesmo cálculo que o Hoje já faz), última cintura medida, e práticas acumuladas de
assoalho pélvico. Texto solto ao lado de dado dela vale menos que dado dela.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test -- tests/data/vitalidade-guide.test.ts` e `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/vitalidade-guide-seed.ts src/pages/path/Vitalidade.tsx tests/data/vitalidade-guide.test.ts
git commit -m "feat(vitalidade): painel de firmeza, controle e volume

Com teto declarado (1,5-5 mL e normal; otimizar leva de baixo-normal a
alto-normal) e sem recomendar suplemento nenhum.

Quase toda alavanca ja estava no plano — e a maior delas, o intervalo entre
ejaculacoes, e o proprio streak que ela escolheu.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: O quarto card de streak no Hoje

**Files:**
- Modify: `src/pages/Today.tsx` (grid de streaks, ~278-282)
- Test: `tests/pages/hoje-streak-vitalidade.test.tsx`

**Interfaces:**
- Consumes: `calcularStreak` (Task 1), `diasComGasto` e `inicioDoAcompanhamento` (Task 2)

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/pages/hoje-streak-vitalidade.test.tsx`:

```tsx
it("o Hoje mostra quatro streaks, e o quarto se chama Vitalidade", async () => {
  // render do Today com dailyLog semeado
  // espera encontrar os rótulos Treino, Skincare, Sono e Vitalidade
});

it("o rótulo não descreve o que o streak conta — é decisão de privacidade", async () => {
  // o texto renderizado não contém "pornografia" nem "masturbação"
});

it("o número mostrado é o streak atual, não o recorde", async () => {
  // com gasto em 2026-08-10 e hoje 2026-08-11, mostra 1
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/pages/hoje-streak-vitalidade.test.tsx`
Expected: FAIL — só existem três streaks

- [ ] **Step 3: Implementar**

Em `src/pages/Today.tsx`, buscar os dias marcados e o início pelos helpers da Task 2
via `useLiveQuery`, calcular com `calcularStreak(dias, todayISO, inicio)` e
acrescentar o quarto card:

```tsx
        <StreakCard label="Vitalidade" count={streakVitalidade.atual} />
```

O grid é `grid-cols-3` hoje. Com quatro cards, trocar para `grid-cols-2` em duas
linhas ou `grid-cols-4` — escolher pelo que não estoura em tela estreita, e conferir
lendo o CSS existente. **Não passar `total`**: os outros três são "de 7 dias"; este
não tem teto, e mostrar "19 / 7" seria absurdo.

**O rótulo é "Vitalidade" e nada mais.** Ela escolheu o streak visível no Hoje; a
mitigação combinada é o rótulo não descrever o assunto.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/pages/hoje-streak-vitalidade.test.tsx`
Expected: PASS

- [ ] **Step 5: Suíte e build**

Run: `npm run test` e `npm run build`
Expected: PASS e build limpo. Conferir se algum teste existente do Hoje fixa a
quantidade de `StreakCard`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Today.tsx tests/pages/hoje-streak-vitalidade.test.tsx
git commit -m "feat(vitalidade): o quarto streak no Hoje

Ela escolheu o streak visivel no Hoje, contra a minha recomendacao de
esconder — decisao dela, registrada no spec. A mitigacao e o rotulo:
'Vitalidade' e o nome do modulo, nao a descricao do que conta. Ao lado de
'Sono · 5', quem olha por cima do ombro nao deduz nada.

Sem 'total': os outros tres sao de 7 dias, este nao tem teto.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Self-review

**Cobertura do spec:**

| Requisito | Task |
|---|---|
| Módulo Vitalidade dentro de Trilha, com atalho no Hoje | 5 |
| Item diário de assoalho pélvico continua como está | 4 (só o destino muda) |
| Progressão de 4 fases, soltura na fase 2 | 4 |
| 5 sequências novas | 3 |
| Soltura entra pela respiração diafragmática | 3 (teste explícito) |
| Streak com recorde preservado | 1 |
| Pornografia e masturbação automática quebram | 2 |
| Start-stop **não** quebra | 1, 3 (é `practiceLogs`, nunca `gastoAutomatico`) |
| Alvo declarado (2–3/semana, não abstinência) | 5 |
| Quarto StreakCard rotulado "Vitalidade" | 7 |
| Painel de volume com teto declarado | 6 |
| Bump de `MOVEMENT_VERSION` | 3 |

**Consistência de tipos:** `StreakVitalidade { atual, recorde }` definido na Task 1 e
consumido nas 5 e 7 com os mesmos nomes. `registrarGastoAutomatico`, `diasComGasto` e
`inicioDoAcompanhamento` definidos na Task 2 e consumidos nas 5 e 7. `pelvicDoDia`
mantém a assinatura antiga na Task 4, então `Today.tsx` não quebra.

**Risco conhecido:** a Task 5 e a Task 7 dependem do formato dos testes de página do
projeto, que os Steps mandam ler antes de escrever (`tests/pages/silhueta.smoke.test.tsx`).
Se o ambiente de teste não suportar render com Dexie na página nova, o implementador
deve reportar em vez de improvisar.

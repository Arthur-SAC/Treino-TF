# Frente 4 — Repertório íntimo · plano de implementação

> **Para agentes:** executado tarefa a tarefa, com verificação entre cada uma.
> Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Goal:** corrigir o conteúdo de intimidade para a configuração real dela (sempre
por cima), acrescentar as duas vias que faltam (esfregar com roupa e receber por
mão e dedos) e transformar o rebolado em progressão de resistência — porque a
queixa dela é de condicionamento, não de técnica.

**Architecture:** sem tela nova. As sequências vivem em `sequences-seed.ts` com
`category: "intimidade"` (já filtrada na biblioteca de movimento), e a
progressão de resistência ganha módulo puro `src/lib/rebolado-progression.ts`, no
mesmo padrão de `pelvic-progression.ts` e `flex-progression.ts`. A contagem de
práticas entra em `practice-log-helpers.ts`, que já é o lugar onde esse critério
mora para não divergir entre telas.

**Tech Stack:** TypeScript · React 18 · Dexie (IndexedDB) · Vitest.

## Global Constraints

- Texto e comentário em **pt-BR com acentuação correta**.
- **Explicitude: técnica e direta.** Nomeia parte do corpo, ângulo, pressão,
  ritmo e duração, como manual. **Não narra cena e não usa linguagem erótica.**
  Régua: cada frase tem que ser executável na hora; se for só excitante, sai.
- **Nenhuma sequência propõe strap-on.** A noiva recusou; repropor é não escutar.
- **Nada assume que a noiva fica por cima.** Ela fica sempre por cima.
- Módulos em `src/lib/` são puros: sem `db`, sem `new Date()`.
- Comentário de código explica o **porquê**.
- **Rede mira a afirmação, não a palavra** — seis ocorrências já custaram caro,
  duas delas nesta reforma. Toda rede nova deste plano precisa ser conferida
  quanto a isso e provada por mutação.
- `npm run test` verde e `npm run build` limpo são condição de commit.
- **Se um teste falhar contra o conteúdo do plano, pare e reporte.**

---

## Estado atual (levantado, não suposto)

| Fato | Onde |
|---|---|
| 3 sequências `category: "intimidade"` | `sequences-seed.ts:696,714,732` |
| `intimidade-grinding` — 9 min, "comunica com ela", sem regra de congelar | `sequences-seed.ts:732` |
| `intimidade-cavalgar` — já é honesta sobre ereção sob compressão | `sequences-seed.ts:714` |
| **Não existe id `rebolado-basico`** — o que há é um *move* de 90s dentro de `danca-semana-1` | `sequences-seed.ts:156` |
| `MOVEMENT_VERSION = 9`, **local, não exportada** | `src/lib/movement-seed.ts:4` |
| A biblioteca já filtra `category === "intimidade"` e `"danca"` | `MovementHome.tsx:49,52` |
| `PRESENCE_ITEMS` / `presenceSuggestionForDay` **não são usados por nenhuma tela** | só por `tests/lib/daily-routine.test.ts` |

**Duas armadilhas de chegada específicas desta frente:**

1. `MOVEMENT_VERSION` é local — precisa ser exportada e travada, senão nada
   disto chega no aparelho dela (é a sétima repetição da mesma lição).
2. `presenceSuggestionForDay` faz `dayOfWeek % PRESENCE_ITEMS.length` e
   `dayOfWeek` só vai de 0 a 6. **Se a lista passar de 7 itens, os índices 7+
   nunca são alcançados.** Hoje ela tem exatamente 7. Acrescentar sequências ali
   sem trocar a chave do rodízio criaria conteúdo invisível — exatamente o modo
   de falha nº 2 da lista das sete vezes. Tratado na Task 5.

---

## Task 1: grinding reescrito para a configuração real

**Files:**
- Modify: `src/data/sequences-seed.ts` (`intimidade-grinding`, `intimidade-cavalgar`)
- Test: `tests/data/intimidade-configuracao.test.ts` (criar)
- Test: `tests/data/intimidade-strapon.test.ts` (criar)

- [ ] **Step 1: escrever as duas redes**

Criar `tests/data/intimidade-configuracao.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const intimas = SEQUENCES.filter((s) => s.category === "intimidade");
const textoDe = (s: (typeof SEQUENCES)[number]) =>
  `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;

describe("o conteúdo íntimo assume a configuração real dela", () => {
  it("existem sequências de intimidade", () => {
    expect(intimas.length).toBeGreaterThanOrEqual(5);
  });

  // Ela fica SEMPRE por cima; a noiva por cima "não rola por enquanto".
  // Metade das dicas antigas pressupunha revezamento.
  it("nenhuma sequência pressupõe a noiva por cima ou revezamento de posição", () => {
    const PRESSUPOSTOS = [
      /ela (por )?em cima de você/i,
      /quando (for )?a vez dela (de )?(ficar )?por cima/i,
      /revez(am|ar|e)/i,
      /troca(m|r) de posição/i,
    ];
    const achados = intimas.flatMap((s) =>
      PRESSUPOSTOS.filter((re) => re.test(textoDe(s))).map((re) => `${s.id} :: ${re}`),
    );
    expect(achados).toEqual([]);
  });

  const grinding = () => SEQUENCES.find((s) => s.id === "intimidade-grinding")!;

  it("o grinding diz que o movimento é frente-e-trás, não estocada", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/frente[- ]e[- ]tr[áa]s|frente e tr[áa]s/i);
    expect(t).toMatch(/estocada/i); // citada para ser negada — ver teste abaixo
  });

  // A regra que decide o resultado. O erro quase universal é acelerar quando a
  // outra pessoa responde.
  it("o grinding manda congelar as variáveis quando a respiração dela mudar", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/congel/i);
    expect(t).toMatch(/respira[çc][ãa]o/i);
    expect(t).toMatch(/mesma velocidade|mesmo ritmo/i);
  });

  it("o grinding orienta o pinto para cima, preso contra a barriga, e diz que não é tuck", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/pra cima|para cima/i);
    expect(t).toMatch(/barriga/i);
    expect(t).toMatch(/não é tuck|nao e tuck/i);
  });

  it("o grinding dá o tempo real — 15 a 25 min contínuos", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/15\s*(a|-|–)\s*25/);
  });

  it("o grinding nomeia as mãos dela na bunda como canal de comando", () => {
    expect(textoDe(grinding())).toMatch(/m[ãa]os dela/i);
  });

  // "Estocada" e "tuck" aparecem NEGADAS. Se um dia alguém proibir as palavras
  // em vez das afirmações, este teste é o que acusa a perda.
  it("onde 'estocada' e 'tuck' aparecem, elas estão sendo negadas", () => {
    const t = textoDe(grinding());
    for (const frase of t.split(/[.;]/).filter((f) => /estocada|tuck/i.test(f))) {
      expect({ frase: frase.trim(), nega: /não|nao|nunca|em vez de|serve para outra/i.test(frase) })
        .toEqual({ frase: frase.trim(), nega: true });
    }
  });
});
```

Criar `tests/data/intimidade-strapon.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A noiva recusou strap-on ("não acha legal um treco"). Repropor é o app não
// escutar. A rede vale para TODAS as sequências, não só as de intimidade: a
// tentação de sugerir aparece em qualquer conteúdo sobre penetração.
const todas = SEQUENCES.map(
  (s) => `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`,
).join("\n");

describe("nenhuma sequência propõe strap-on", () => {
  it("o termo não aparece em nenhuma forma", () => {
    expect(todas).not.toMatch(/strap-?on|cinta[- ]?p[êe]nis|pr[óo]tese peniana|consolo de cinta/i);
  });

  // A via que ela aceita é mão e dedos — carne dos dois lados. Se um dia o
  // conteúdo de receber sumir, esta rede sozinha passaria (não achar strap-on
  // é fácil quando não há conteúdo nenhum).
  it("e a via que a noiva aceita está escrita", () => {
    expect(todas).toMatch(/dedos?/i);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/intimidade-configuracao.test.ts tests/data/intimidade-strapon.test.ts
```

Esperado: **FAIL** na contagem de sequências (há 3, exige 5) e em todas as regras
do grinding. O teste de strap-on deve **passar** já (nada propõe hoje) — confira
que passa por ausência de proposta, não por ausência de conteúdo.

- [ ] **Step 3: reescrever `intimidade-grinding`**

Substituir a sequência inteira (`sequences-seed.ts:732`):

```ts
  {
    id: "intimidade-grinding",
    name: "Grinding pélvico · por cima",
    category: "intimidade",
    level: "intermediario",
    durationMin: 12,
    focus:
      "Treino do atrito que faz ela gozar com você por cima — que é a sua configuração, sempre. Quatro coisas decidem o resultado, e três delas são contraintuitivas: o movimento é FRENTE-E-TRÁS (estocada é para penetração e não faz nada pelo clitóris); o contato NUNCA se rompe; quando a respiração dela mudar, você CONGELA as variáveis em vez de acelerar; e o tempo real é 15 a 25 minutos contínuos, não 5. Grinding falha quase sempre por ser tratado como preliminar e interrompido no meio. Aqui você treina o movimento e a resistência dele sozinha, com o corpo, pra na hora não ser o seu quadril que desiste primeiro.",
    videoUrl: "https://www.youtube.com/results?search_query=body+roll+hip+roll+tutorial+slow",
    moves: [
      {
        name: "Aquecimento — onda corporal lenta",
        description:
          "Em pé, joelhos suaves. Onda lenta: cabeça → peito → quadril descendo, depois subindo. 1 min. Entra no ritmo lento de propósito: a velocidade do grinding é menor do que a intuição pede.",
        durationSec: 60,
      },
      {
        name: "Frente-e-trás com contato constante",
        description:
          "De quatro ou em pé, desliza a pélvis PARA FRENTE e para trás num plano só, como quem esfrega — não para baixo e para cima. Estocada é movimento de penetração e não estimula o clitóris; o que estimula é o seu púbis deslizando contra o dela sem nunca perder o contato. Se o contato se rompe a cada repetição, o estímulo reinicia do zero. 2 min contínuos.",
        durationSec: 120,
      },
      {
        name: "Posição: o pinto vai pra cima, preso contra a barriga",
        description:
          "Antes de começar, ajeita pra cima, por dentro do cós da cueca. Três motivos ao mesmo tempo: o seu púbis (osso) é a superfície que faz a pressão nela, e ele precisa estar livre; assim ele não é dobrado a cada movimento; e a glande sai da linha de frente do atrito, o que melhora o SEU controle e adia o seu orgasmo. Cueca justa segura, cueca larga deixa escapar. Isto NÃO é tuck — tuck é para aparência com roupa e é incompatível com ereção.",
        durationSec: 30,
      },
      {
        name: "Sentada por cima (no ar) — 3 min contínuos",
        description:
          "Sentada como se estivesse sobre ela, joelhos ao lado do quadril dela, peso nas suas pernas. Rolê pélvico para frente e para baixo, comandado pelo core, sem pressa. Segura 3 min sem parar. Se o flexor de quadril ou a lombar reclamarem antes do tempo, é aí que está o seu limite real — e é ele que a trilha de resistência do rebolado trabalha.",
        durationSec: 180,
      },
      {
        name: "Deitada por cima (no ar) — o formato do carro",
        description:
          "Apoiada nos antebraços e joelhos, tronco estável, move só a pélvis num rolê para frente e para baixo. É este o formato que serve em espaço apertado — com ela reclinada no banco do passageiro, você não tem altura para nada vertical. 2 min.",
        durationSec: 120,
      },
      {
        name: "Congelar as variáveis",
        description:
          "A regra que decide o resultado. Quando a respiração dela mudar — ficar mais curta, mais alta, presa —, você NÃO acelera e NÃO aumenta a pressão. Mantém a mesma velocidade, a mesma pressão e o mesmo ângulo até o fim. Acelerar quando a pessoa responde é o erro quase universal, e ele reinicia a subida dela. Vai ficar monótono pra você muito antes de ficar pra ela; aguentar essa monotonia é a habilidade inteira. Treina aqui: escolhe um ritmo, põe 2 min no relógio e não muda nada.",
        durationSec: 120,
      },
      {
        name: "As mãos dela na bunda são o canal de comando",
        description:
          "Você não cede o controle da posição, mas as mãos dela já ficam exatamente onde o comando mora: puxar para baixo = mais pressão; segurar parado = mantém assim; empurrar = alivia. Combina isso com ela uma vez, fora da hora, e depois não precisa mais falar nada — resolve a calibragem sem quebrar o ritmo.",
        durationSec: 30,
      },
      {
        name: "Cooldown",
        description: "Criança + respiração lenta pra soltar lombar e flexor de quadril. 1 min.",
        durationSec: 60,
      },
    ],
  },
```

- [ ] **Step 4: ajustar `intimidade-cavalgar` para "sempre por cima"**

No `focus` da sequência (`sequences-seed.ts:714`), substituir a frase final para
tirar a sugestão implícita de alternância e apontar a via nova:

```ts
    focus:
      "Aguentar e controlar a posição de montaria por cima: sentar com as pernas dobradas, mover o quadril pelo glúteo+core (não pela lombar) e cansar menos. HONESTIDADE: cavalgar PENETRANDO ela depende de manter a ereção sob compressão e do alinhamento com a posição dela — nem sempre dá, e isso não é falha sua. O grinding, na sequência ao lado, é o plano mais garantido; e quando o que ela quer é penetrar você, a via é mão e dedos (sequência 'Receber por mão e dedos'). Joelhos sentem a montaria ajoelhada — pose de treino, não horas seguidas.",
```

- [ ] **Step 5: rodar**

```
npx vitest run tests/data/
```

Esperado: as regras do grinding **passam**; a contagem de ≥5 sequências ainda
**falha** (só existem 3) — ela fecha nas Tasks 2 e 3.

- [ ] **Step 6: provar por mutação**

Trocar "congela" por "aumenta" no move "Congelar as variáveis", confirmar **FAIL**
no teste correspondente, e reverter. Depois trocar "NÃO é tuck" por "é um tuck",
confirmar **FAIL** no teste de negação, e reverter.

- [ ] **Step 7: commit**

```bash
git add src/data/sequences-seed.ts tests/data/intimidade-configuracao.test.ts tests/data/intimidade-strapon.test.ts
git commit -m "fix(intimidade): o grinding assume a configuração real — ela sempre por cima"
```

---

## Task 2: esfregar com roupa vira conteúdo próprio

**Files:**
- Modify: `src/data/sequences-seed.ts` (sequência nova)
- Test: `tests/data/intimidade-esfregar.test.ts` (criar)

- [ ] **Step 1: escrever a rede**

Criar `tests/data/intimidade-esfregar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const seq = () => SEQUENCES.find((s) => s.id === "intimidade-esfregar-roupa");
const texto = () => {
  const s = seq()!;
  return `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;
};

// É sequência separada do grinding porque o fator decisivo aqui não é o corpo,
// é o TECIDO — e nenhuma técnica compensa a costura errada.
describe("esfregar com roupa", () => {
  it("a sequência existe e é de intimidade", () => {
    expect(seq()).toBeDefined();
    expect(seq()!.category).toBe("intimidade");
  });

  it("nomeia a costura frontal do jeans como a vilã", () => {
    expect(texto()).toMatch(/costura frontal/i);
    expect(texto()).toMatch(/jeans/i);
  });

  it("diz o que vestir no lugar", () => {
    expect(texto()).toMatch(/malha|moletom|legging/i);
  });

  // Desconforto dela aos 15 min é abrasão, não falta de tesão. Sem isso escrito,
  // ela lê o próprio corpo errado.
  it("avisa que atrito seco assa, e nomeia isso como abrasão", () => {
    expect(texto()).toMatch(/abras/i);
    expect(texto()).toMatch(/15/);
  });

  it("descreve a escada de camadas, e que tirar roupa cedo destrói o mecanismo", () => {
    expect(texto()).toMatch(/camada/i);
    expect(texto()).toMatch(/barreira/i);
  });

  // Serve à usuária também: é a melhor situação para treinar o próprio
  // controle — excitação alta, estímulo indireto, sem o gatilho da penetração.
  it("aponta o uso como treino de controle dela — start-stop a dois", () => {
    expect(texto()).toMatch(/start-?stop/i);
    expect(texto()).toMatch(/controle/i);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

Esperado: **FAIL** — a sequência não existe.

- [ ] **Step 3: criar a sequência**

Acrescentar ao array `SEQUENCES`, junto das outras de intimidade:

```ts
  {
    id: "intimidade-esfregar-roupa",
    name: "Esfregar com roupa (dry humping)",
    category: "intimidade",
    level: "iniciante",
    durationMin: 10,
    focus:
      "Vocês já fazem isso, e dá pra terminar em orgasmo — mas o fator que decide não é o corpo, é o TECIDO. É por isso que isto é uma sequência separada do grinding. Duas coisas quebram a maioria das tentativas: a costura frontal do jeans (grossa, rígida, e cai exatamente sobre o clitóris — nenhuma roupa de baixo compensa) e o atrito seco, que assa a pele depois de uns 15 minutos. Bônus real pra você: é a melhor situação que existe pra treinar o seu próprio controle, porque tem excitação alta com estímulo indireto e sem o gatilho da penetração.",
    videoUrl: "",
    moves: [
      {
        name: "Escolha do tecido — antes de qualquer coisa",
        description:
          "Jeans está fora, nos dois corpos: a costura frontal central é uma crista grossa e rígida que cai em cima do clitóris dela e concentra todo o atrito numa linha. Nenhuma calcinha por baixo compensa isso. O que serve: malha, moletom fino, legging — qualquer coisa lisa, sem costura grossa na frente. Passa a mão na costura antes; se você sente a crista com o dedo, ela vai sentir multiplicado em 20 minutos.",
        durationSec: 30,
      },
      {
        name: "A escada de camadas — meia hora",
        description:
          "Começa com as duas completamente vestidas e vai tirando uma camada de cada vez ao longo de ~30 min. A barreira é o que faz o mecanismo funcionar: ela transforma pressão direta em pressão difusa e sustentada, que é o que constrói. Tirar roupa cedo demais destrói isso — vira estímulo direto, que sobe rápido e satura. Regra prática: só sai camada quando as duas já estão bem, nunca pra 'apressar'.",
        durationSec: 60,
      },
      {
        name: "Treino do movimento — frente-e-trás, contato constante",
        description:
          "Mesmo movimento do grinding: pélvis deslizando para frente e para trás num plano só, contato que não se rompe. Com roupa o atrito é maior, então a velocidade cai ainda mais. Treina 2 min contínuos aqui, no seco, pra medir o seu fôlego.",
        durationSec: 120,
      },
      {
        name: "Abrasão: o limite é físico, e não é falta de tesão",
        description:
          "Depois de uns 15 min de atrito seco, a pele dela assa — e a dela é mais fina ali que a sua. Se ela ficar desconfortável, muda de posição ou reduz a pressão nesse ponto, isso é ABRASÃO, não desinteresse, e ler como desinteresse é erro seu, não sinal dela. Duas saídas: trocar o ângulo pra mudar o ponto de contato, ou reduzir uma camada (o tecido de baixo desliza mais que o de cima).",
        durationSec: 30,
      },
      {
        name: "Uso pra treinar o seu controle — start-stop a dois",
        description:
          "Esta é a melhor situação que existe pra você treinar controle: excitação alta, estímulo indireto pela roupa, e sem o gatilho da penetração. Aplica o start-stop que você já treina sozinha (trilha de assoalho pélvico): quando chegar perto do ponto de não-retorno, para o movimento do quadril e mantém o contato parado, respirando, até a onda baixar. Retoma. Três paradas numa sessão é um treino melhor que qualquer série sozinha.",
        durationSec: 120,
      },
      {
        name: "Resistência específica — 3 min sem parar",
        description:
          "Fecha com 3 min contínuos do movimento, sem pausa, medindo onde o seu quadril cansa. Lombar, flexor de quadril e glúteo são o que falha primeiro — e é exatamente isso que a trilha de resistência do rebolado constrói.",
        durationSec: 180,
      },
      {
        name: "Cooldown",
        description: "Criança e respiração lenta pra soltar lombar e flexor. 1 min.",
        durationSec: 60,
      },
    ],
  },
```

- [ ] **Step 4: rodar, provar por mutação, commitar**

```
npx vitest run tests/data/intimidade-esfregar.test.ts
```

Mutação: apagar a palavra "abrasão" do move correspondente, confirmar **FAIL**,
reverter.

```bash
git add src/data/sequences-seed.ts tests/data/intimidade-esfregar.test.ts
git commit -m "feat(intimidade): esfregar com roupa — o tecido é o que decide"
```

---

## Task 3: a via que a noiva aceita — receber por mão e dedos

**Files:**
- Modify: `src/data/sequences-seed.ts` (sequência nova)
- Test: `tests/data/intimidade-receber.test.ts` (criar)

**Interfaces:**
- Consome: a fase 2 da progressão pélvica (soltura) — `pelvic-progression.ts`.
  Esta frente **usa** aquilo e não redefine nada.

- [ ] **Step 1: escrever a rede**

Criar `tests/data/intimidade-receber.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { PROGRESSAO_PELVICA } from "../../src/lib/pelvic-progression";

const seq = () => SEQUENCES.find((s) => s.id === "intimidade-receber-maos");
const texto = () => {
  const s = seq()!;
  return `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;
};

describe("receber por mão e dedos", () => {
  it("a sequência existe e é de intimidade", () => {
    expect(seq()).toBeDefined();
    expect(seq()!.category).toBe("intimidade");
  });

  // É a via que a noiva quer e aceita: carne dos dois lados, sensação mútua —
  // coisa que strap-on nenhum entrega, e é por isso que ela recusou o strap-on.
  it("nomeia a sensação mútua como a razão da via", () => {
    expect(texto()).toMatch(/nas duas|m[úu]tua|as duas sentem/i);
  });

  it("manda lubrificante em quantidade que parece exagero", () => {
    expect(texto()).toMatch(/lubrificante/i);
    expect(texto()).toMatch(/exagero|mais do que parece/i);
  });

  // A habilidade que sustenta tudo é o relaxamento voluntário do assoalho —
  // que é a fase 2 da frente 2. Esta frente CONSOME aquilo.
  it("aponta a soltura do assoalho pélvico como pré-requisito, sem redefini-la", () => {
    expect(texto()).toMatch(/soltura|relaxa(r|mento) (voluntário )?do assoalho/i);
    // O id citado tem que ser um da progressão real, não um inventado no texto.
    const citados = PROGRESSAO_PELVICA.filter((id) => texto().includes(id));
    expect(citados.length).toBeGreaterThanOrEqual(1);
  });

  it("progride em escada e dá o horizonte em meses, não em sessões", () => {
    expect(texto()).toMatch(/meses/i);
    expect(texto()).toMatch(/um dedo/i);
  });

  // Fisting é horizonte distante, nomeado como tal. Nomear evita que ela
  // descubra por conta própria que existe e tente pular etapas.
  it("nomeia fisting como horizonte distante, não como próximo passo", () => {
    const frases = texto().split(/[.;]/).filter((f) => /fisting/i.test(f));
    expect(frases.length).toBeGreaterThanOrEqual(1);
    for (const f of frases) {
      expect({ f: f.trim(), distante: /distante|anos|não é o próximo|nao e o proximo|longe/i.test(f) })
        .toEqual({ f: f.trim(), distante: true });
    }
  });

  it("não propõe strap-on em lugar nenhum", () => {
    expect(texto()).not.toMatch(/strap-?on/i);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

- [ ] **Step 3: criar a sequência**

```ts
  {
    id: "intimidade-receber-maos",
    name: "Receber por mão e dedos",
    category: "intimidade",
    level: "intermediario",
    durationMin: 14,
    focus:
      "A via que ela quer e aceita. Ela quer te penetrar e recusou usar um objeto pra isso — e a razão é boa: com mão e dedos há carne dos dois lados, as duas sentem, e nenhum equipamento entrega isso. O que sustenta esta via inteira não é tolerância a dor: é o relaxamento VOLUNTÁRIO do assoalho pélvico, que é a fase 2 da sua trilha de assoalho (sequência `pelvic-soltura-sustentada`). Sem isso treinado, o corpo fecha por reflexo e dói — com isso treinado, a progressão anda sozinha. A escala aqui é de MESES, e apressar é o único jeito garantido de atrasar.",
    videoUrl: "",
    moves: [
      {
        name: "Pré-requisito, não sugestão: soltura treinada",
        description:
          "Antes de qualquer progressão aqui, você precisa conseguir soltar o assoalho pélvico por vontade, não por sorte — é o que a sequência `pelvic-soltura-sustentada` constrói, e é a fase 2 da sua trilha. O teste é simples: deitada, você consegue relaxar a região e MANTER relaxada por 30 segundos, respirando, sem ela voltar a fechar sozinha. Se ainda não, o trabalho é lá, não aqui.",
        durationSec: 60,
      },
      {
        name: "Lubrificante — a quantidade certa parece exagero",
        description:
          "Muito mais do que parece necessário, e reaplicado durante, não só no começo. Não é conforto: é a diferença entre deslizar e arrastar, e arrastar é o que causa fissura. Base de água combina com tudo e reidrata com um pouco de água; base de silicone dura mais tempo sem reaplicar. Se em algum momento você sentir 'agarrar', é sinal de reaplicar, não de forçar.",
        durationSec: 30,
      },
      {
        name: "Preparo externo — 5 min antes de qualquer entrada",
        description:
          "Ela trabalha só a região externa com a mão lubrificada: pressão circular lenta, sem entrar. O objetivo aqui é o esfíncter externo relaxar por conta, com você respirando. Cinco minutos disso mudam completamente o que acontece depois. Você respira devagar e solta na expiração — mesma coisa que treina na soltura.",
        durationSec: 300,
      },
      {
        name: "Um dedo — semanas, não minutos",
        description:
          "Ela entra com UM dedo, lubrificado, devagar, e para assim que entrar. Não move. Você respira e solta ao redor dele — é aqui que a soltura treinada aparece. Só depois de você estar confortável parada é que vem movimento lento. Este estágio dura semanas de repetições, e a pressa aqui é o que produz a dor que faz o corpo aprender a fechar.",
        durationSec: 180,
      },
      {
        name: "Progressão em escada",
        description:
          "A escada é: externo → um dedo parado → um dedo com movimento → dois dedos → dois com movimento. Cada degrau só sobe quando o anterior está confortável em pelo menos três encontros diferentes, não um. A escala honesta desta progressão inteira é de MESES. Retroceder um degrau num dia ruim é parte do processo, não recaída.",
        durationSec: 60,
      },
      {
        name: "Sensação mútua — a razão de ser desta via",
        description:
          "É isto que o objeto não faz: ela sente com os dedos ao mesmo tempo que você sente, e as duas ajustam pelo retorno da outra em tempo real. A mão livre dela pode estar em você ao mesmo tempo. Se em algum momento a conversa voltar a 'seria mais fácil com um treco', a resposta já está dada — o que ela quer é sentir junto, e é isso que esta via entrega.",
        durationSec: 60,
      },
      {
        name: "Grinding coxa a coxa — o 'sentir junto' sem nada disso",
        description:
          "A resposta direta ao que ela já elogia: você monta a coxa dela, ela monta a sua, e as duas esfregam ao mesmo tempo. Prazer simultâneo, zero equipamento, zero preparo. Vale como sessão inteira, não só como aquecimento — e é a opção pros dias em que a progressão acima não é o que vocês querem.",
        durationSec: 120,
      },
      {
        name: "Onde isso vai dar, com honestidade",
        description:
          "Fisting é o horizonte distante desta via — anos, se um dia. Está nomeado aqui só pra você saber que a escada continua e não tentar pular degraus achando que o topo é dois dedos. Não é o próximo passo e nem deve ser tratado como meta. O próximo passo é sempre o degrau imediatamente acima do que já está confortável.",
        durationSec: 30,
      },
      {
        name: "Cooldown",
        description:
          "Respiração diafragmática lenta, 2 min, deixando a região solta. Fecha a sessão relaxada — o corpo grava o estado em que a coisa terminou.",
        durationSec: 120,
      },
    ],
  },
```

- [ ] **Step 4: rodar, provar por mutação, commitar**

Mutação: trocar `pelvic-soltura-sustentada` por `pelvic-soltura-inventada`,
confirmar **FAIL** no teste que cruza com `PROGRESSAO_PELVICA`, e reverter. Essa
rede existe porque texto citando id que não existe é ponteiro quebrado silencioso.

```bash
git add src/data/sequences-seed.ts tests/data/intimidade-receber.test.ts
git commit -m "feat(intimidade): receber por mão e dedos — a via que ela aceita"
```

---

## Task 4: o rebolado vira progressão de resistência

**Files:**
- Create: `src/lib/rebolado-progression.ts`
- Modify: `src/data/sequences-seed.ts` (4 sequências novas)
- Modify: `src/lib/practice-log-helpers.ts`
- Test: `tests/lib/rebolado-progression.test.ts` (criar)

**Interfaces:**
- Produces:
  ```ts
  export const SEQUENCIAS_REBOLADO: readonly string[];  // 4 ids, fase 1 → 4
  export const ATE_REBOLADO_FASE_2 = 12;
  export const ATE_REBOLADO_FASE_3 = 30;
  export const ATE_REBOLADO_FASE_4 = 60;
  export interface ReboladoDoDia { sequenceId: string; etapa: string; alvoMin: number; }
  export function reboladoDoDia(praticasFeitas: number): ReboladoDoDia;
  export const ALVO_REAL_MIN = 20;
  ```
- E em `practice-log-helpers.ts`: `contarPraticasRebolado(): Promise<number>`.

**Nota de nomenclatura:** as constantes carregam `REBOLADO` de propósito.
`flex-progression.ts` já ensinou que dois módulos com corte de fase de nome
genérico (`ATE_FASE_2`) devolvem números plausíveis e completamente diferentes
quando importados do módulo errado — e corte de fase errado não estoura, só
serve a fase errada em silêncio por semanas.

- [ ] **Step 1: escrever a rede**

Criar `tests/lib/rebolado-progression.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  SEQUENCIAS_REBOLADO,
  reboladoDoDia,
  ATE_REBOLADO_FASE_2,
  ATE_REBOLADO_FASE_3,
  ATE_REBOLADO_FASE_4,
  ALVO_REAL_MIN,
} from "../../src/lib/rebolado-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A queixa dela não é de técnica, é de fôlego: ela desiste antes da noiva, e
// isso é condicionamento de lombar, flexor de quadril e glúteo. O que existia
// era 3×1 min, que não constrói resistência pra 20 min contínuos.
describe("progressão de resistência do rebolado", () => {
  it("tem quatro fases, todas existindo no seed", () => {
    expect(SEQUENCIAS_REBOLADO).toHaveLength(4);
    const faltando = SEQUENCIAS_REBOLADO.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
  });

  it("os cortes de fase são crescentes", () => {
    expect(ATE_REBOLADO_FASE_2).toBeLessThan(ATE_REBOLADO_FASE_3);
    expect(ATE_REBOLADO_FASE_3).toBeLessThan(ATE_REBOLADO_FASE_4);
  });

  it("a fase avança conforme as práticas concluídas", () => {
    expect(reboladoDoDia(0).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_2 - 1).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_2).sequenceId).toBe(SEQUENCIAS_REBOLADO[1]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_3).sequenceId).toBe(SEQUENCIAS_REBOLADO[2]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_4).sequenceId).toBe(SEQUENCIAS_REBOLADO[3]);
    expect(reboladoDoDia(9999).sequenceId).toBe(SEQUENCIAS_REBOLADO[3]);
  });

  it("o alvo de minutos contínuos cresce a cada fase", () => {
    const alvos = [0, ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4].map(
      (n) => reboladoDoDia(n).alvoMin,
    );
    expect(alvos).toEqual([...alvos].sort((a, b) => a - b));
    expect(new Set(alvos).size).toBe(4);
  });

  it("entrada inválida cai na fase 1 em vez de quebrar", () => {
    for (const n of [-5, Number.NaN, Number.POSITIVE_INFINITY * 0]) {
      expect(reboladoDoDia(n as number).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    }
  });

  it("toda fase diz em que etapa ela está", () => {
    for (const n of [0, ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4]) {
      expect(reboladoDoDia(n).etapa.trim().length).toBeGreaterThan(0);
    }
  });

  // O alvo real não é a fase 4: é aguentar o tempo que a coisa dura de verdade.
  it("o alvo real declarado bate com o tempo que o grinding pede", () => {
    expect(ALVO_REAL_MIN).toBeGreaterThanOrEqual(15);
    const grinding = SEQUENCES.find((s) => s.id === "intimidade-grinding")!;
    expect(grinding.focus).toContain(String(ALVO_REAL_MIN));
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

- [ ] **Step 3: criar o módulo**

Criar `src/lib/rebolado-progression.ts`:

```ts
// src/lib/rebolado-progression.ts
// Qual sessão de rebolado fazer hoje. Módulo puro — sem I/O, sem Date.
//
// A queixa dela não é de técnica: é que ela desiste antes da noiva. Isso não é
// falta de tesão, é condicionamento — manter 20 minutos por cima, em espaço
// apertado, é tarefa de resistência de lombar, flexor de quadril e glúteo. O
// que o app tinha era um bloco de 3×1 min dentro da dança, que ensina o
// movimento e não constrói fôlego nenhum.
//
// Isto NÃO soma tempo de academia: mora nas sequências de movimento, que são
// separadas do treino de força (a sessão de academia não cresce — restrição
// antiga do programa).

export interface ReboladoDoDia {
  sequenceId: string;
  /** Em que fase ela está, pro item não virar exercício cego. */
  etapa: string;
  /** Minutos contínuos que a fase pede. É o número que ela persegue. */
  alvoMin: number;
}

/** Ordem da trilha, fase 1 → 4. */
export const SEQUENCIAS_REBOLADO: readonly string[] = [
  "rebolado-resistencia-1",
  "rebolado-resistencia-2",
  "rebolado-resistencia-3",
  "rebolado-resistencia-4",
];

// Os nomes carregam REBOLADO de propósito. `flex-progression.ts` e
// `pelvic-progression.ts` já exportam cortes de fase; nomes genéricos fariam o
// import errado devolver um número plausível, e corte de fase errado não
// estoura — só serve a fase errada, em silêncio, por semanas.
/** ~2 semanas praticando quase todo dia. */
export const ATE_REBOLADO_FASE_2 = 12;
/** ~1 mês. */
export const ATE_REBOLADO_FASE_3 = 30;
/** ~2 meses. */
export const ATE_REBOLADO_FASE_4 = 60;

/** O tempo que a coisa dura de verdade — a fase 4 é o degrau, este é o alvo.
 *  Bate com o tempo declarado em `intimidade-grinding`, e há teste amarrando os
 *  dois: se um mudar sem o outro, a trilha passa a construir para um número que
 *  o conteúdo não pede mais. */
export const ALVO_REAL_MIN = 20;

const FASES: ReadonlyArray<{ etapa: string; alvoMin: number }> = [
  { etapa: "Fase 1 · o movimento — 3 × 1 min, aprendendo a mover só a pélvis", alvoMin: 1 },
  { etapa: "Fase 2 · continuidade — 3 × 2 min sem parar entre as repetições", alvoMin: 2 },
  { etapa: "Fase 3 · carga — 2 × 4 min contínuos, já sob fadiga", alvoMin: 4 },
  { etapa: "Fase 4 · resistência — 5+ min contínuos sem perder o ritmo", alvoMin: 5 },
];

export function reboladoDoDia(praticasFeitas: number): ReboladoDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const i =
    n < ATE_REBOLADO_FASE_2 ? 0 : n < ATE_REBOLADO_FASE_3 ? 1 : n < ATE_REBOLADO_FASE_4 ? 2 : 3;
  return { sequenceId: SEQUENCIAS_REBOLADO[i], ...FASES[i] };
}
```

- [ ] **Step 4: criar as quatro sequências**

Acrescentar ao `SEQUENCES`, `category: "danca"` (que já tem filtro na
biblioteca — categoria nova sem entrada no filtro é o modo de falha nº 5 da
lista das sete vezes). O conteúdo de cada uma segue o mesmo esqueleto,
mudando o bloco contínuo:

```ts
  // === REBOLADO · resistência (aguentar o tempo que a coisa dura) ===
  // Quatro fases, servidas por rebolado-progression.ts. O que muda entre elas é
  // só o tamanho do bloco contínuo — o movimento é o mesmo desde a fase 1.
  {
    id: "rebolado-resistencia-1",
    name: "Rebolado · resistência 1 (3 × 1 min)",
    category: "danca",
    level: "iniciante",
    durationMin: 8,
    focus:
      "Fase 1 de quatro. Aqui o alvo ainda é o movimento certo: pélvis isolada, tronco parado, comando vindo do core e do glúteo — não da lombar. Blocos de 1 min com pausa. Se a lombar arde, o movimento subiu pra coluna: diminui a amplitude e volta pra pélvis.",
    videoUrl: "https://www.youtube.com/results?search_query=hip+roll+endurance+drill",
    moves: [
      { name: "Aquecimento", description: "Círculos de quadril 8x cada sentido + cat-cow 8x. Lombar e quadril mornos antes de qualquer bloco contínuo.", durationSec: 90 },
      { name: "Bloco contínuo 1", description: "Rebolado frente-e-trás, ritmo lento e constante, 1 min sem parar. Tronco parado, abdômen ativo.", durationSec: 60 },
      { name: "Pausa", description: "30s parada, respirando. A pausa faz parte do treino nesta fase.", durationSec: 30 },
      { name: "Bloco contínuo 2", description: "Mais 1 min contínuo, mesmo ritmo do primeiro. Não acelera pra compensar cansaço.", durationSec: 60 },
      { name: "Pausa", description: "30s.", durationSec: 30 },
      { name: "Bloco contínuo 3", description: "Último minuto contínuo. Se o ritmo caiu, terminou certo — é o limite de hoje.", durationSec: 60 },
      { name: "Extensão isométrica de lombar", description: "Deitada de bruços, levanta peito e pernas alguns centímetros e SEGURA 20s. 3x. É a lombar que falha primeiro no tempo real, e ela cansa por resistência, não por força.", durationSec: 120, repeat: 3 },
      { name: "Cooldown", description: "Criança + alongamento de flexor de quadril, 30s cada lado.", durationSec: 90 },
    ],
  },
```

As fases 2, 3 e 4 repetem essa estrutura com os blocos crescendo. Copie o
objeto acima e altere, em cada uma:

- **`rebolado-resistencia-2`** — `name: "Rebolado · resistência 2 (3 × 2 min)"`,
  `durationMin: 11`, blocos de `durationSec: 120` (três deles), pausas de 30s,
  e o `focus`: *"Fase 2 de quatro. O movimento você já tem; agora o alvo é
  continuidade. Três blocos de 2 min contínuos, com 30s de pausa. O ponto em que
  o ritmo cai é a informação — anota mentalmente onde foi e persegue esse
  minuto."*
- **`rebolado-resistencia-3`** — `name: "Rebolado · resistência 3 (2 × 4 min)"`,
  `durationMin: 13`, dois blocos de `durationSec: 240`, pausa de 60s entre eles,
  e o `focus`: *"Fase 3 de quatro. Dois blocos de 4 min contínuos. Aqui já é
  fadiga de verdade, e o erro típico aparece: acelerar quando cansa, porque
  rápido parece mais fácil que constante. Não é — constante é o que serve na
  hora."*
- **`rebolado-resistencia-4`** — `name: "Rebolado · resistência 4 (5+ min contínuos)"`,
  `durationMin: 14`, um bloco de `durationSec: 300` e um segundo de `durationSec: 300`
  opcional, e o `focus`: *"Fase 4 de quatro. Cinco minutos contínuos sem perder o
  ritmo, e depois mais um se der. O alvo real do outro lado disto é 20 min — não
  se chega lá por um bloco só, se chega por conseguir repetir este bloco quatro
  vezes numa noite sem o quadril desistir."*

Todas as quatro mantêm o bloco de extensão isométrica de lombar e o cooldown.

- [ ] **Step 5: contagem de práticas**

Em `src/lib/practice-log-helpers.ts`, acrescentar:

```ts
/** Práticas concluídas da trilha de resistência do rebolado. Mesmo motivo de
 *  `contarPraticasFlex`: o critério é lido por tela e decide fase, então mora
 *  aqui e não inline — duplicado, diverge em silêncio. */
export async function contarPraticasRebolado(): Promise<number> {
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && SEQUENCIAS_REBOLADO.includes(l.sequenceId)).length;
}
```

com `import { SEQUENCIAS_REBOLADO } from "./rebolado-progression";` no topo.

- [ ] **Step 6: rodar, provar por mutação, commitar**

Mutação: trocar `ATE_REBOLADO_FASE_3 = 30` por `= 5` (ficando menor que o corte
da fase 2), confirmar **FAIL** no teste de cortes crescentes, e reverter.

```bash
git add src/lib/rebolado-progression.ts src/lib/practice-log-helpers.ts src/data/sequences-seed.ts tests/lib/rebolado-progression.test.ts
git commit -m "feat(intimidade): o rebolado vira progressão de resistência"
```

---

## Task 5: tudo isso chega no aparelho dela

**Files:**
- Modify: `src/lib/movement-seed.ts` (exportar e bumpar `MOVEMENT_VERSION`)
- Modify: `src/lib/daily-routine.ts` (o rodízio que esconde os índices 7+)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts`
- Modify: `tests/lib/daily-routine.test.ts`

**As duas armadilhas desta frente, juntas nesta task.**

- [ ] **Step 1: escrever as redes**

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, no import:

```ts
import { seedMovement, MOVEMENT_VERSION } from "../../src/lib/movement-seed";
```

No `describe` do pino de versão:

```ts
  it("MOVEMENT_VERSION é a versão revisada nesta rodada", () => {
    expect(MOVEMENT_VERSION).toBe(10);
  });
```

E no `describe("sequências de movimento")`:

```ts
  it("o repertório íntimo alcança quem estava na versão anterior", async () => {
    await db.settings.put({ key: "movementSeeded", value: true });
    await db.settings.put({ key: "movementVersion", value: MOVEMENT_VERSION - 1 });

    await seedMovement();

    // As sequências novas chegam…
    for (const id of ["intimidade-esfregar-roupa", "intimidade-receber-maos", "rebolado-resistencia-4"]) {
      expect(await db.danceSequences.get(id)).toBeDefined();
    }
    // …e a reescrita do grinding também, que é o que um teste de contagem não pegaria.
    const grinding = await db.danceSequences.get("intimidade-grinding");
    expect(grinding?.focus).toMatch(/congel/i);
    expect(grinding?.focus).toMatch(/15\s*(a|-|–)\s*25/);
  });
```

Em `tests/lib/daily-routine.test.ts`, acrescentar:

```ts
// `presenceSuggestionForDay` fazia `dayOfWeek % PRESENCE_ITEMS.length` com
// dayOfWeek ∈ [0,6]. Com 7 itens funcionava por coincidência; no oitavo, o
// índice 7 nunca seria alcançado e a sequência ficaria invisível — o modo de
// falha que já custou seis correções perdidas neste projeto.
it("toda sugestão de presença é alcançável por algum dia da semana", () => {
  const alcancados = new Set(
    Array.from({ length: 7 }, (_, d) => presenceSuggestionForDay(d).id),
  );
  const invisiveis = PRESENCE_ITEMS.filter((i) => !alcancados.has(i.id)).map((i) => i.id);
  expect(invisiveis).toEqual([]);
});
```

- [ ] **Step 2: rodar e confirmar que falha**

Esperado: **FAIL** no import de `MOVEMENT_VERSION` (não exportada). O teste do
rodízio deve **passar** enquanto a lista tiver 7 itens — ele é a rede que
protege o passo seguinte.

- [ ] **Step 3: exportar e bumpar**

Em `src/lib/movement-seed.ts`:

```ts
// Exportada (e não mais local) pelo mesmo motivo das outras versões de seed: o
// teste de chegada precisa plantar a versão imediatamente anterior, e derivar
// "anterior = atual − 1" é a única forma de esse número não destoar do código.
// Era a última versão de seed grande sem essa rede.
//
// v9 (histórico): as sequências de flexibilidade das fases 2 e 3.
// v10: o repertório íntimo — grinding reescrito pra configuração real dela,
// esfregar com roupa, receber por mão e dedos, e as quatro fases de resistência
// do rebolado. Sem este bump, tudo isso fica só no repositório.
export const MOVEMENT_VERSION = 10;
```

- [ ] **Step 4: acrescentar as sequências novas ao rodízio, sem torná-las invisíveis**

Em `src/lib/daily-routine.ts`, acrescentar as duas sequências novas a
`PRESENCE_ITEMS` **e** trocar a chave do rodízio, que deixaria os índices 7 e 8
inalcançáveis:

```ts
export const PRESENCE_ITEMS: PresenceItem[] = [
  { id: "postura-silhueta-diaria", label: "Postura & silhueta", to: "/treino/movimento/postura-silhueta-diaria" },
  { id: "corporal-caminhada", label: "Caminhada feminina", to: "/treino/movimento/corporal-caminhada" },
  { id: "sensual-andar-gingado", label: "Andar com gingado", to: "/treino/movimento/sensual-andar-gingado" },
  { id: "soltura-tronco-quadril", label: "Soltura de tronco e quadril", to: "/treino/movimento/soltura-tronco-quadril" },
  { id: "intimidade-flex-passiva", label: "Flexibilidade passiva a dois", to: "/treino/movimento/intimidade-flex-passiva" },
  { id: "intimidade-grinding", label: "Grinding pélvico · por cima", to: "/treino/movimento/intimidade-grinding" },
  { id: "intimidade-cavalgar", label: "Cavalgar com controle", to: "/treino/movimento/intimidade-cavalgar" },
  { id: "intimidade-esfregar-roupa", label: "Esfregar com roupa", to: "/treino/movimento/intimidade-esfregar-roupa" },
  { id: "intimidade-receber-maos", label: "Receber por mão e dedos", to: "/treino/movimento/intimidade-receber-maos" },
];

/** O rodízio anda por DIA DO ANO, não por dia da semana. Com dia da semana
 *  (0-6) e a lista passando de sete itens, os índices 7 e 8 nunca seriam
 *  alcançados: as duas sequências novas existiriam no app e nunca apareceriam
 *  — é literalmente o modo de falha nº 2 da lista de conteúdo que não chega.
 *  Há teste cobrando que toda sugestão seja alcançável. */
export function presenceSuggestionForDay(dayOfYear: number): PresenceItem {
  const n = Number.isFinite(dayOfYear) && dayOfYear > 0 ? Math.floor(dayOfYear) : 0;
  return PRESENCE_ITEMS[n % PRESENCE_ITEMS.length];
}
```

Ajustar o teste do rodízio (`tests/lib/daily-routine.test.ts`) que hoje afirma
`presenceSuggestionForDay(0) === presenceSuggestionForDay(7)`: com 9 itens o
ciclo é de 9, então a asserção correta passa a ser
`presenceSuggestionForDay(0) === presenceSuggestionForDay(PRESENCE_ITEMS.length)`.
E o teste novo do Step 1 deve varrer `PRESENCE_ITEMS.length` dias, não 7.

- [ ] **Step 5: rodar**

```
npx vitest run tests/lib/ tests/data/
```

- [ ] **Step 6: provar por mutação — a prova que mais importa**

1. Reverter `MOVEMENT_VERSION` para 9 e confirmar **FAIL** no pino.
2. Voltar `presenceSuggestionForDay` para `% PRESENCE_ITEMS.length` com varredura
   de 7 dias e confirmar **FAIL** no teste de alcançabilidade, acusando
   `intimidade-esfregar-roupa` e `intimidade-receber-maos` como invisíveis.

Reverter as duas.

- [ ] **Step 7: commit**

```bash
git add src/lib/movement-seed.ts src/lib/daily-routine.ts tests/lib/
git commit -m "fix(seed): o repertório íntimo chega no aparelho dela"
```

---

## Task 6: verificação final

- [ ] **Step 1:** `npm run test` — verde, contagem acima de 812.
- [ ] **Step 2:** `npm run build` — limpo.
- [ ] **Step 3:** conferir que nenhuma sequência nova ficou fora da biblioteca:
      `grep -n 'category === "intimidade"\|category === "danca"' src/pages/workout/MovementHome.tsx`
      deve existir para as duas categorias usadas.
- [ ] **Step 4:** atualizar `docs/CONTINUAR-AQUI.md` — a reforma inteira fecha.
- [ ] **Step 5:** commit, merge, push.

---

## Self-review contra o spec

| Requisito do spec | Onde |
|---|---|
| Decisão 1 — técnico e direto, sem narrar cena | Constraint global; conteúdo das Tasks 1-4 |
| Decisão 2 — grinding com ela sempre por cima | Task 1 |
| Decisão 2 — frente-e-trás, não estocada | Task 1 |
| Decisão 2 — congelar variáveis na mudança de respiração | Task 1 |
| Decisão 2 — mãos dela na bunda como canal de comando | Task 1 |
| Decisão 2 — pinto pra cima, não é tuck | Task 1 |
| Decisão 2 — 15 a 25 min | Task 1, amarrado a `ALVO_REAL_MIN` na Task 4 |
| Decisão 3 — esfregar com roupa: costura do jeans, abrasão, escada de camadas, start-stop | Task 2 |
| Decisão 4 — receber por mão e dedos, sensação mútua, lubrificante, escada em meses | Task 3 |
| Decisão 4 — consome a soltura da frente 2 sem redefinir | Task 3 (teste cruza com `PROGRESSAO_PELVICA`) |
| Decisão 4 — fisting como horizonte distante | Task 3 |
| Decisão 4 — grinding coxa a coxa | Task 3 |
| Decisão 5 — quatro fases de resistência | Task 4 |
| Decisão 5 — complementos (lombar, flexor, glúteo) sem somar academia | Task 4 (dentro das sequências de movimento) |
| Arquitetura — `MOVEMENT_VERSION` bumpada | Task 5 |
| Testes — os cinco arquivos previstos | Tasks 1-5 |
| Fora de escopo — assoalho pélvico e flexibilidade | Nenhuma task redefine os dois |

**Achado fora do spec, incluído:** `presenceSuggestionForDay` esconderia as duas
sequências novas (Task 5). O spec não previa porque a falha só aparece quando a
lista passa de sete itens, que é o que esta frente faz.

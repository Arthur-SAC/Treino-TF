# Frente 6 — Três modos de estilo · plano de implementação

> **Para agentes:** este plano é executado tarefa a tarefa, com verificação entre
> cada uma. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Goal:** reorganizar o módulo Estilo por **contexto de vestir** (Público, Casa,
Íntimo) em vez de por tipo de peça, migrar o dado de dois valores para três sem
perder o que ela cadastrou, separar peça **de ver** de peça **de usar**, e
corrigir o texto que descreve o modo público como masculino.

**Architecture:** `Garment.discretion` (dois valores) vira `Garment.mode` (três),
com migração versionada em `style-seed.ts` — o mesmo mecanismo que já reescreve
peças e combinações. Dois campos novos e opcionais carregam o que a spec
descobriu: `homeEffect` (marca por contato × por contraste) e `intimateUse` (de
ver × de usar). A navegação passa a abrir pelos três modos, com Paleta, Peças,
Combinações, Looks e Wishlist como ferramentas dentro deles.

**Tech Stack:** TypeScript · React 18 · React Router · Dexie (IndexedDB) ·
Vitest + Testing Library · Tailwind.

## Global Constraints

Valem para **todas** as tarefas:

- Texto e comentário em **pt-BR com acentuação correta**.
- Comentário de código explica o **porquê**, não o quê.
- Módulos em `src/lib/` e seeds em `src/data/` são **puros**: sem `db`, sem `new Date()`
  (exceto `style-seed.ts`, que é o seeder e já usa `db` por natureza).
- **Nenhum texto trata a terapia hormonal como etapa futura agendada**
  (`tests/data/sem-trh-agendada.test.ts` varre todo o `src/`).
- **Nenhuma sequência ou peça propõe strap-on.** A noiva recusou.
- Falar **sem amenizar**.
- **A rede mira a afirmação, não a palavra.** O teste de "público não é masculino"
  proíbe *afirmar* que o modo público é masculino, e separadamente **exige** que,
  onde a palavra aparecer, ela esteja negando. Proibir a string `masculin` cegamente
  apagaria "cintura baixa empurra a silhueta pro masculino" e "peitoral pesado
  constrói um peito que lê como masculino" — dois avisos corretos que precisam ficar.
- **Dado dela sempre vence.** Migração nunca sobrescreve peça que ela criou ou editou.
- `npm run test` verde e `npm run build` limpo são condição de commit.
- **Se um teste deste plano falhar contra o conteúdo do plano, pare e reporte.**

---

## Estado atual (levantado, não suposto)

| Fato | Onde |
|---|---|
| `Garment.discretion: "discreto" \| "livre"` | `src/lib/db.ts:192` |
| 37 peças no seed, todas com `discretion` | `src/data/garments-seed.ts` |
| 12 peças com `category: "intimate"`, **todas "de ver"** (renda, cetim, transparência) | `garments-seed.ts:236-316` |
| **Nenhuma peça "de usar" existe hoje** | — |
| `STYLE_SEED_VERSION = 3`, **local, não exportada** | `src/lib/style-seed.ts:39` |
| "masculina em público" | `src/data/estilo-discreto-seed.ts:9` |
| 7 abas por tipo de coisa | `src/components/StyleTabs.tsx` |
| `GarmentsView` filtra por `discretion` e exclui `intimate` | `src/pages/beauty/style/GarmentsView.tsx:18-31` |
| `IntimateView` lista `category === "intimate"` | `src/pages/beauty/style/IntimateView.tsx:9` |
| `DiscreetView` só renderiza `ESTILO_DISCRETO` | `src/pages/beauty/style/DiscreetView.tsx` |

**A lição das sete vezes:** `STYLE_SEED_VERSION` é local. Exportar e travar por
teste é parte da Task 7 — sem isso, nada desta frente chega no aparelho dela.

---

## Task 1: o dado vira três modos, sem perder o que é dela

**Files:**
- Modify: `src/lib/db.ts:184-194`
- Modify: `src/lib/style-seed.ts`
- Test: `tests/lib/style-seed-migracao.test.ts` (criar)

**Interfaces:**
- Produces:
  ```ts
  export type StyleMode = "publico" | "casa" | "intimo";
  // em Garment: mode: StyleMode  (substitui discretion)
  export const STYLE_SEED_VERSION = 4;  // exportada de style-seed.ts
  ```

- [ ] **Step 1: escrever o teste de migração**

Criar `tests/lib/style-seed-migracao.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedStyle } from "../../src/lib/style-seed";

// A migração precisa transformar dois valores em três SEM perder nada. O valor
// "livre" agrupava casa e íntimo indistintamente, então ele é o único que exige
// decisão: peça íntima vira "intimo", o resto vira "casa".
describe("migração de discretion (2 valores) para mode (3 modos)", () => {
  beforeEach(async () => {
    await db.garments.clear();
    await db.outfits.clear();
    await db.stylePalette.clear();
    await db.settings.clear();
  });

  it("discreto vira publico", async () => {
    await db.garments.put({
      id: "calca-cintura-alta",
      name: "Calça de cintura alta",
      category: "bottom",
      occasion: ["casual"],
      whyItWorks: "…",
      discretion: "discreto",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const g = await db.garments.get("calca-cintura-alta");
    expect(g?.mode).toBe("publico");
  });

  it("livre + intimate vira intimo; livre + resto vira casa", async () => {
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const body = await db.garments.get("body-de-renda");
    const saia = await db.garments.get("saia-rodada");
    expect({ body: body?.mode, saia: saia?.mode }).toEqual({ body: "intimo", saia: "casa" });
  });

  // Peça que ela criou não tem id do seed e não pode ser tocada além do modo.
  it("a peça que ela criou sobrevive à migração, com o texto dela intacto", async () => {
    await db.garments.put({
      id: "peca-dela-123",
      name: "Aquela blusa que eu amo",
      category: "top",
      occasion: ["casual"],
      whyItWorks: "porque sim",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const dela = await db.garments.get("peca-dela-123");
    expect(dela).toBeDefined();
    expect(dela?.name).toBe("Aquela blusa que eu amo");
    expect(dela?.whyItWorks).toBe("porque sim");
    expect(dela?.mode).toBe("casa");
  });

  it("nenhuma peça fica sem modo depois da migração", async () => {
    await seedStyle();
    const sem = (await db.garments.toArray()).filter((g) => !g.mode).map((g) => g.id);
    expect(sem).toEqual([]);
  });

  it("rodar de novo não duplica peça nem combinação", async () => {
    await seedStyle();
    const g1 = await db.garments.count();
    const o1 = await db.outfits.count();
    await seedStyle();
    expect({ g: await db.garments.count(), o: await db.outfits.count() }).toEqual({ g: g1, o: o1 });
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/lib/style-seed-migracao.test.ts
```

Esperado: **FAIL** — `mode` não existe no tipo nem no dado.

- [ ] **Step 3: mudar o tipo**

Em `src/lib/db.ts`, substituir a interface `Garment`:

```ts
/** Contexto em que a peça é usada. Substitui o par discreto/livre, que não
 *  cobria o que ela descreveu: são três contextos, não dois — e o antigo
 *  "livre" agrupava casa e íntimo como se fossem a mesma coisa. */
export type StyleMode = "publico" | "casa" | "intimo";

export interface Garment {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "intimate";
  occasion: string[];
  whyItWorks: string;
  cautions?: string;
  imagePath?: string;
  mode: StyleMode;
  fitTip?: string;
  /** Só no modo Casa. Ela nomeou as duas técnicas sem perceber que eram duas:
   *  "justas ou folgadas mas que marquem bem". Justa marca por CONTATO;
   *  folgada marca por CONTRASTE (ombro solto sobre cintura marcada faz o
   *  quadril parecer maior). Servem à mesma meta por mecanismos opostos, e
   *  saber qual é qual é o que deixa ela escolher pelo efeito. */
  homeEffect?: "contato" | "contraste";
  /** Só no modo Íntimo. "De ver" é para ela olhar; "de usar" é para grinding e
   *  sexo. A peça mais funcional é a menos glamourosa — renda rala em 15-25 min
   *  de atrito contínuo e machuca a noiva —, e o app precisa dizer isso em vez
   *  de deixar ela descobrir doendo. */
  intimateUse?: "ver" | "usar";
}
```

- [ ] **Step 4: escrever a migração**

Em `src/lib/style-seed.ts`, substituir o bloco de versão (linhas 34-66) por:

```ts
// Daqui em diante, versão numerada em vez de flag booleana: as duas flags acima
// só sabiam responder "já rodou?", então texto corrigido em peça ou combinação
// nunca chegava a quem já tinha o app instalado — foi assim que "gola alta com
// ombros largos vira look masculino" sobreviveu no aparelho dela depois de sair
// do arquivo.
//
// Exportada (e não mais local) porque era o único seed grande cuja versão
// nenhum teste de chegada alcançava — a mesma configuração que já custou seis
// correções perdidas neste projeto.
//
// v3 (histórico): peças e combinações passaram a ser reescritas por versão.
// v4: `discretion` (discreto/livre) vira `mode` (publico/casa/intimo). O valor
// "livre" agrupava casa e íntimo, então ele é o único que exige decisão por
// peça — e é decisão que só a migração pode tomar, porque no banco dela já não
// há como distinguir depois.
export const STYLE_SEED_VERSION = 4;

/** Traduz o dado antigo. `intimate` é o desempate do "livre": era o único jeito
 *  de separar o que é da noiva do que é de andar pela casa. */
function modoDoValorAntigo(g: { discretion?: string; category?: string; mode?: string }): StyleMode {
  if (g.mode === "publico" || g.mode === "casa" || g.mode === "intimo") return g.mode;
  if (g.discretion === "discreto") return "publico";
  return g.category === "intimate" ? "intimo" : "casa";
}

export async function migrarModos(): Promise<void> {
  const todas = await db.garments.toArray();
  for (const g of todas) {
    const modo = modoDoValorAntigo(g as never);
    if (g.mode === modo && !("discretion" in g)) continue;
    // `discretion` sai do registro junto: deixar o campo velho ao lado do novo
    // é convite pra uma tela ler o antigo e outra o novo, que é exatamente como
    // regra duplicada diverge em silêncio.
    const { discretion: _antigo, ...resto } = g as Garment & { discretion?: string };
    await db.garments.put({ ...resto, mode: modo } as Garment);
  }
}
```

E no bloco versionado, chamar a migração **antes** de reescrever o seed (para
que peças dela, que o seed não conhece, também sejam migradas):

```ts
  const sv = await db.settings.get("styleSeedVersion");
  if (((sv?.value as number) ?? 0) < STYLE_SEED_VERSION) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      // Primeiro migra TUDO o que está no banco — inclusive as peças que ela
      // criou, que o seed não conhece e nunca reescreveria.
      await migrarModos();
      // Peça tem id do seed: put sobrescreve a mesma linha e não duplica.
      for (const g of GARMENTS) {
        await db.garments.put(g);
      }
      // …resto do bloco de combinações, inalterado…
      await db.settings.put({ key: "styleSeedVersion", value: STYLE_SEED_VERSION });
    });
  }
```

Acrescentar `import type { Garment, StyleMode } from "./db";` ao topo do arquivo.

- [ ] **Step 5: trocar `discretion` por `mode` nas 37 peças do seed**

Em `src/data/garments-seed.ts`, substituir cada `discretion: "discreto",` por
`mode: "publico",` e cada `discretion: "livre",` por `mode: "casa",` — **exceto**
nas 12 peças com `category: "intimate"` (linhas ~236-316), onde `discretion:
"livre"` vira `mode: "intimo",`.

Comando de apoio (confira o resultado antes de commitar):

```bash
# as íntimas primeiro (o bloco começa na linha do comentário "=== ÍNTIMO")
# e depois as demais — revise à mão, são 37 ocorrências
grep -n "discretion" src/data/garments-seed.ts
```

Atualizar também o comentário de seção da linha 177:

```ts
  // === MODO PÚBLICO (dia a dia, andrógino com teto de segurança, pró-barriga) ===
```

- [ ] **Step 6: consertar os consumidores do campo antigo**

`src/pages/beauty/style/GarmentsView.tsx:18-31` — o filtro:

```tsx
const MODES: Array<{ value: Garment["mode"] | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "publico", label: "Público" },
  { value: "casa", label: "Casa" },
];

export function GarmentsView() {
  const [filter, setFilter] = useState<Garment["category"] | "all">("all");
  const [mode, setMode] = useState<Garment["mode"] | "all">("all");
  const garments = useLiveQuery(async () => {
    const all = await db.garments.toArray();
    return all
      .filter((g) => g.category !== "intimate") // íntimas têm tela própria
      .filter((g) => filter === "all" || g.category === filter)
      .filter((g) => mode === "all" || g.mode === mode);
  }, [filter, mode]);
```

E trocar as referências a `discretion`/`setDiscretion` no JSX do mesmo arquivo
pelas de `mode`/`setMode`. Rodar `grep -rn "discretion" src/` e corrigir **todo**
resultado — se sobrar um, o build de TypeScript acusa.

- [ ] **Step 7: rodar**

```
npx vitest run tests/lib/style-seed-migracao.test.ts && npm run build
```

Esperado: **PASS** e build limpo.

- [ ] **Step 8: provar por mutação**

Trocar o `return g.category === "intimate" ? "intimo" : "casa";` por
`return "casa";`, rodar o teste, confirmar **FAIL** no caso do `body-de-renda`, e
reverter.

- [ ] **Step 9: commit**

```bash
git add src/lib/db.ts src/lib/style-seed.ts src/data/garments-seed.ts src/pages/beauty/style/GarmentsView.tsx tests/lib/style-seed-migracao.test.ts
git commit -m "refactor(estilo): dois valores de discrição viram três modos de contexto"
```

---

## Task 2: peça de ver × peça de usar, e o que falta no guarda-roupa íntimo

**Files:**
- Modify: `src/data/garments-seed.ts` (bloco íntimo)
- Test: `tests/data/intimo-ver-usar.test.ts` (criar)

**Interfaces:**
- Consumes: `intimateUse` do tipo `Garment` (Task 1).
- Produces: ao menos 3 peças `intimateUse: "usar"`, nenhuma delas de renda.

**Por que esta task existe:** as 12 peças íntimas do seed são **todas** de ver —
renda, cetim, transparência, cinta-liga. Ela fica sempre por cima, 15-25 min de
atrito contínuo, e a peça que o app recomenda hoje é a que machuca a noiva.

- [ ] **Step 1: escrever o teste**

Criar `tests/data/intimo-ver-usar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { GARMENTS } from "../../src/data/garments-seed";

const intimas = GARMENTS.filter((g) => g.mode === "intimo");

// A divisão que o app não tinha: peça pra ELA OLHAR e peça pra USAR no atrito.
// Renda é abrasiva em 15-25 min de contato contínuo e machuca a noiva; costura
// frontal central é uma crista que rala. A peça mais funcional é a menos
// glamourosa, e escrever isso é o que evita ela descobrir doendo.
describe("peça de ver × peça de usar", () => {
  it("toda peça íntima declara para que serve", () => {
    const mudas = intimas.filter((g) => g.intimateUse !== "ver" && g.intimateUse !== "usar");
    expect(mudas.map((g) => g.id)).toEqual([]);
  });

  it("existe guarda-roupa de USAR de verdade, não uma peça simbólica", () => {
    expect(intimas.filter((g) => g.intimateUse === "usar").length).toBeGreaterThanOrEqual(3);
  });

  // A afirmação proibida é RECOMENDAR renda para o atrito — não citar renda.
  it("nenhuma peça de renda ou transparência é marcada como de usar", () => {
    const erradas = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => /renda|transparen|cetim|tule/i.test(`${g.name} ${g.whyItWorks}`));
    expect(erradas.map((g) => g.id)).toEqual([]);
  });

  it("toda peça de usar diz que não tem costura frontal — é a crista que rala", () => {
    const semAviso = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => !/sem costura|costura frontal|liso/i.test(`${g.whyItWorks} ${g.cautions ?? ""}`));
    expect(semAviso.map((g) => g.id)).toEqual([]);
  });

  // Cós alto serve às três funções de uma vez — alonga a bunda, comprime a
  // barriga e segura o pinto pra cima, que é o que o grinding pede.
  it("existe peça de cós alto no guarda-roupa de usar", () => {
    const comCos = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => /cós alto|cintura alta/i.test(`${g.name} ${g.whyItWorks} ${g.fitTip ?? ""}`));
    expect(comCos.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/intimo-ver-usar.test.ts
```

Esperado: **FAIL** nos quatro primeiros — nenhuma peça declara `intimateUse` e
nenhuma peça de usar existe.

- [ ] **Step 3: marcar as 12 peças existentes como "de ver"**

Em `src/data/garments-seed.ts`, acrescentar `intimateUse: "ver",` a cada uma das
12 peças com `mode: "intimo"` — todas são de olhar, e é isso que elas fazem bem.
Acrescentar `cautions` às três que hoje não têm aviso e que são abrasivas:

Em `body-de-renda`:
```ts
    cautions: "É peça de VER. Renda em 15-25 min de atrito contínuo rala — e não é você que sente primeiro, é ela. Pra grinding, troca por peça lisa.",
```

Em `conjunto-tanga-sutia`:
```ts
    cautions: "Se o conjunto for de renda, vale como peça de ver. A parte de baixo sai antes do atrito começar.",
```

Em `cinta-liga-meia`, acrescentar ao `cautions` existente:
```ts
    cautions: "Combine com calcinha que pegue bem na cintura, não na linha do quadril. Peça de ver: a cinta atravessa a coxa e entra no caminho de qualquer coisa que envolva ela por cima.",
```

- [ ] **Step 4: acrescentar as peças de usar**

Ao final do array `GARMENTS`, antes do `];`:

```ts
  // === ÍNTIMO · DE USAR ===
  // O app tinha doze peças íntimas e todas eram de OLHAR. Ela fica sempre por
  // cima, 15-25 min de atrito contínuo, e a peça que estava recomendada era
  // justamente a que machuca a noiva. Estas quatro são o contrário: nenhuma é
  // bonita de perto, todas funcionam.
  {
    id: "boxer-microfibra-liso",
    name: "Boxer de microfibra liso (sem costura frontal)",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks:
      "Microfibra lisa desliza em vez de ralar, e é a única superfície que aguenta 20 min de contato contínuo sem irritar a pele dela. Sem costura frontal central — a costura é uma crista fina que concentra todo o atrito numa linha só.",
    cautions: "Confira a costura com a mão antes de comprar: muita marca põe costura frontal mesmo em peça lisa, e ela só aparece no uso.",
    mode: "intimo",
    intimateUse: "usar",
    fitTip: "Compra pelo QUADRIL e pela coxa, nunca pela cintura. Apertado na coxa achata a bunda.",
  },
  {
    id: "calcinha-cos-alto-compressao",
    name: "Calcinha de cós alto com compressão firme",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks:
      "O cós alto faz três coisas de uma vez: alonga a linha da bunda, comprime a barriga (que é o teu ponto mais largo hoje) e segura tudo pra cima e preso contra o corpo, que é exatamente a posição que o grinding pede. Tecido liso, sem renda no corpo da peça.",
    cautions: "Compressão firme, não sufocante — se marcar vinco na pele em 10 min, está pequena.",
    mode: "intimo",
    intimateUse: "usar",
    fitTip: "Pelo quadril: 114 hoje. A tabela muda por marca — confira a faixa que contém 114, não o nome do tamanho.",
  },
  {
    id: "short-compressao-casa",
    name: "Short de compressão liso (por baixo de tudo)",
    category: "intimate",
    occasion: ["intimo", "casa", "diario"],
    whyItWorks:
      "Cobre a coxa inteira, então elimina o atrito pele-com-pele e o de qualquer costura de fora. Serve de camada de baixo em qualquer coisa — inclusive sob calça larga em público, sem ninguém ver.",
    cautions: "Tecido liso, sem costura interna na virilha. Costura ali é a que mais incomoda em movimento repetido.",
    mode: "intimo",
    intimateUse: "usar",
    fitTip: "Comprimento até o meio da coxa. Curto demais enrola e vira um cordão que aperta.",
  },
  {
    id: "top-sem-costura",
    name: "Top de microfibra sem costura",
    category: "intimate",
    occasion: ["intimo", "casa", "diario"],
    whyItWorks:
      "Peça de contato para quando o peito está envolvido: liso, sem aro, sem renda, sem fecho nas costas pra marcar. Não cria volume — cria superfície que não machuca.",
    cautions: "Não é peça de volume: se o que você quer é forma, essa não é a peça. Essa é a que aguenta o uso.",
    mode: "intimo",
    intimateUse: "usar",
  },
];
```

- [ ] **Step 5: rodar**

```
npx vitest run tests/data/intimo-ver-usar.test.ts
```

Esperado: **PASS**.

- [ ] **Step 6: provar por mutação**

Trocar `intimateUse: "usar"` por `"ver"` no `boxer-microfibra-liso`, confirmar
**FAIL** no teste de contagem, e reverter. Depois pôr a palavra "renda" no
`whyItWorks` do mesmo boxer, confirmar **FAIL** no teste de abrasão, e reverter.

- [ ] **Step 7: commit**

```bash
git add src/data/garments-seed.ts tests/data/intimo-ver-usar.test.ts
git commit -m "feat(estilo): peça de ver e peça de usar — o guarda-roupa que aguenta o atrito"
```

---

## Task 3: público é andrógino, não masculino

**Files:**
- Modify: `src/data/estilo-discreto-seed.ts:9`
- Test: `tests/data/publico-nao-e-masculino.test.ts` (criar)

**Interfaces:** nenhuma nova.

**Correção herdada:** o spec da frente 1 registrou "público masculino é escolha
declarada dela". Ela corrigiu em 2026-08-11: *"eu queria público meio andrógino
mas com uma pegada segura pro ambiente que vivo"*. Andrógino não é ponto fixo —
é faixa dentro da qual ela sobe e desce, e a escada de níveis é o calibrador.

- [ ] **Step 1: escrever o teste — com as duas metades**

Criar `tests/data/publico-nao-e-masculino.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ATENÇÃO ao formato desta rede. Quatro vezes neste projeto um teste proibiu uma
// PALAVRA e com isso proibiu também NEGÁ-LA — e quase apagou justamente o texto
// que existia pra proteger. Aqui a palavra "masculino" precisa continuar podendo
// aparecer: "cintura baixa empurra a silhueta pro masculino" e "peitoral pesado
// constrói um peito que lê como masculino" são avisos corretos.
//
// Então a rede tem duas metades:
//   1. proíbe a AFIRMAÇÃO (descrever o modo público como masculino);
//   2. exige que, onde a palavra aparecer perto de "público", ela esteja negando.
function arquivosDeTexto(dir: string): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivosDeTexto(caminho));
    else if (/\.(ts|tsx)$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

const fontes = arquivosDeTexto("src").map((f) => ({ f, texto: readFileSync(f, "utf8") }));

describe("o modo público é andrógino com teto de segurança, não masculino", () => {
  // A afirmação proibida, em suas formas concretas.
  const AFIRMACOES = [
    /masculin\w*\s+em\s+p[úu]blico/i,
    /p[úu]blico\s*[:·—-]?\s*masculin/i,
    /masculina\s+em\s+p[úu]blico/i,
    /modo\s+p[úu]blico[^.]{0,40}masculin/i,
  ];

  it("nenhum texto do app descreve o modo público como masculino", () => {
    const achados = fontes.flatMap(({ f, texto }) =>
      AFIRMACOES.filter((re) => re.test(texto)).map((re) => `${f} :: ${re}`),
    );
    expect(achados).toEqual([]);
  });

  it("a escada de níveis nomeia o público como andrógino", () => {
    const escada = fontes.find(({ f }) => f.includes("estilo-discreto-seed"))!.texto;
    expect(escada).toMatch(/andr[óo]gin/i);
  });

  // A outra metade: os avisos legítimos que usam a palavra continuam de pé.
  it("os avisos que usam a palavra 'masculino' pra NEGAR continuam existindo", () => {
    const todos = fontes.map(({ texto }) => texto).join("\n");
    expect(todos).toMatch(/empurra silhueta pra estilo masculino|empurra a silhueta pro masculino/i);
    expect(todos).toMatch(/l[êe] como masculino|peit[ãa]o masculino/i);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/data/publico-nao-e-masculino.test.ts
```

Esperado: **FAIL** no primeiro teste — `estilo-discreto-seed.ts:9` diz
"masculina em público".

- [ ] **Step 3: corrigir a escada**

Em `src/data/estilo-discreto-seed.ts`, substituir o `intro` da seção `escada`:

```ts
    intro: "Três modos, três contextos, todos escolhidos por você: andrógino em público (com o teto que o ambiente comporta), você mesma em casa, safada na intimidade. Público não é ponto fixo — é uma faixa, e você sobe e desce de degrau conforme o dia. Nenhum degrau é derrota nem estação de passagem.",
```

E o nível 4, para deixar claro que o teto do público é o nível 3 por causa do
ambiente, não por causa dela:

```ts
      "Nível 4 (ousado, só em espaço seguro — casa, com a amada, ambientes queer): maquiagem completa, cor nas unhas, silhueta feminina marcada, vestido/saia, lingerie. Este nível fica fora do público por causa do ambiente onde você mora, não porque seja demais pra você.",
```

- [ ] **Step 4: rodar e provar por mutação**

```
npx vitest run tests/data/publico-nao-e-masculino.test.ts
```

Esperado: **PASS**. Depois: reescrever o intro com "masculina em público",
confirmar **FAIL** no primeiro teste, reverter. Depois apagar o `cautions` da
`saia-lapis` ("empurra silhueta pra estilo masculino"), confirmar **FAIL** no
terceiro teste — é a metade da rede que protege a negação —, e reverter.

- [ ] **Step 5: commit**

```bash
git add src/data/estilo-discreto-seed.ts tests/data/publico-nao-e-masculino.test.ts
git commit -m "fix(estilo): público é andrógino com teto de segurança, não masculino"
```

---

## Task 4: os três modos viram a navegação

**Files:**
- Modify: `src/components/StyleTabs.tsx`
- Create: `src/pages/beauty/style/HomeModeView.tsx`
- Modify: `src/pages/beauty/style/DiscreetView.tsx` (vira a tela de Público)
- Modify: `src/pages/beauty/style/IntimateView.tsx` (separa ver × usar)
- Modify: `src/main.tsx`
- Test: `tests/pages/tres-modos.test.tsx` (criar)

**Interfaces:**
- Consumes: `StyleMode`, `homeEffect`, `intimateUse` (Tasks 1 e 2).
- Produces: rotas `/beleza/estilo/publico`, `/beleza/estilo/casa`,
  `/beleza/estilo/intimo`.

- [ ] **Step 1: escrever o teste**

Criar `tests/pages/tres-modos.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { seedStyle } from "../../src/lib/style-seed";
import { IntimateView } from "../../src/pages/beauty/style/IntimateView";
import { HomeModeView } from "../../src/pages/beauty/style/HomeModeView";

describe("as telas dos três modos", () => {
  beforeEach(async () => {
    await db.garments.clear();
    await db.outfits.clear();
    await db.stylePalette.clear();
    await db.settings.clear();
    await seedStyle();
  });

  it("o Íntimo separa o que é de ver do que é de usar", async () => {
    render(
      <MemoryRouter>
        <IntimateView />
      </MemoryRouter>,
    );
    // Aguarda o useLiveQuery liquidar — ler antes disso observa a lista vazia
    // e passa verde com a tela quebrada.
    await waitFor(() => expect(screen.getByText(/De usar/i)).toBeInTheDocument());
    expect(screen.getByText(/De ver/i)).toBeInTheDocument();
    expect(screen.getByText(/Boxer de microfibra liso/)).toBeInTheDocument();
  });

  it("a tela de Casa explica as duas técnicas de marcar", async () => {
    render(
      <MemoryRouter>
        <HomeModeView />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText(/contato/i)).toBeInTheDocument());
    expect(screen.getByText(/contraste/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```
npx vitest run tests/pages/tres-modos.test.tsx
```

Esperado: **FAIL** — `HomeModeView` não existe.

- [ ] **Step 3: as abas viram os três modos**

Substituir `ITEMS` em `src/components/StyleTabs.tsx`:

```tsx
// A ordem é a do dia dela, não a do banco: sai de casa (público), volta pra
// casa, e o íntimo é o de dentro. Paleta, Peças, Combinações, Looks e Wishlist
// continuam existindo — são ferramentas que atravessam os três modos, e por
// isso vêm depois, não antes.
const ITEMS = [
  { to: "/beleza/estilo/publico", label: "Público" },
  { to: "/beleza/estilo/casa", label: "Casa" },
  { to: "/beleza/estilo/intimo", label: "Íntimo" },
  { to: "/beleza/estilo", label: "Paleta", end: true },
  { to: "/beleza/estilo/pecas", label: "Peças" },
  { to: "/beleza/estilo/combinacoes", label: "Combinações" },
  { to: "/beleza/estilo/looks", label: "Looks" },
  { to: "/beleza/estilo/wishlist", label: "Wishlist" },
];
```

- [ ] **Step 4: criar a tela de Casa**

Criar `src/pages/beauty/style/HomeModeView.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

export function HomeModeView() {
  const garments = useLiveQuery(
    async () => (await db.garments.toArray()).filter((g) => g.mode === "casa"),
    [],
  );
  const porContato = garments?.filter((g) => g.homeEffect === "contato") ?? [];
  const porContraste = garments?.filter((g) => g.homeEffect === "contraste") ?? [];
  const resto = garments?.filter((g) => !g.homeEffect) ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Casa</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3">
        <p className="text-nude-warm text-sm leading-relaxed">
          Sem teto de segurança aqui. O eixo não é esconder ou mostrar — é o que valoriza o que você
          está construindo: bunda, cintura, perna.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          Você nomeou duas técnicas sem separar que eram duas: <span className="text-nude-warm">justa
          marca por contato</span> e <span className="text-nude-warm">folgada marca por contraste</span>.
          A justa mostra a curva encostando nela. A folgada mostra pelo que ela deixa de tocar — ombro
          solto sobre cintura marcada faz o quadril parecer maior. Servem à mesma coisa por caminhos
          opostos, e escolher pelo efeito é diferente de escolher pelo caimento.
        </p>
      </div>

      {[
        { titulo: "Marca por contato (justa)", itens: porContato },
        { titulo: "Marca por contraste (folgada)", itens: porContraste },
        { titulo: "Outras peças de casa", itens: resto },
      ].map(({ titulo, itens }) =>
        itens.length === 0 ? null : (
          <div key={titulo} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider mb-2">{titulo}</h2>
            <div className="space-y-2">
              {itens.map((g) => <GarmentCard key={g.id} garment={g} />)}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
```

- [ ] **Step 5: o Íntimo separa ver de usar**

Substituir o corpo de `src/pages/beauty/style/IntimateView.tsx` (mantendo os
imports, e trocando o filtro de `category` por `mode`):

```tsx
export function IntimateView() {
  const garments = useLiveQuery(
    async () => (await db.garments.toArray()).filter((g) => g.mode === "intimo"),
    [],
  );
  const deUsar = garments?.filter((g) => g.intimateUse === "usar") ?? [];
  const deVer = garments?.filter((g) => g.intimateUse !== "usar") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Íntimo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-nude-warm text-sm leading-relaxed">
          Duas prateleiras, e elas não se substituem.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          <span className="text-nude-warm">De ver</span> é pra você se olhar: renda, transparência,
          detalhe. <span className="text-nude-warm">De usar</span> é pro atrito: microfibra lisa, sem
          costura frontal, cós alto. Renda em 20 minutos de contato contínuo rala — e quem sente
          primeiro é ela, não você. A peça mais funcional é a menos bonita de perto, e isso não é
          defeito da peça.
        </p>
      </div>

      {[
        { titulo: "De usar", itens: deUsar },
        { titulo: "De ver", itens: deVer },
      ].map(({ titulo, itens }) =>
        itens.length === 0 ? null : (
          <div key={titulo} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider mb-2">{titulo}</h2>
            <div className="space-y-2">
              {itens.map((g) => <GarmentCard key={g.id} garment={g} />)}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
```

- [ ] **Step 6: `DiscreetView` vira a tela de Público**

Em `src/pages/beauty/style/DiscreetView.tsx`, trocar o título e o texto do
disclaimer:

```tsx
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Público</h1>
```

```tsx
      <DisclaimerCard text="Andrógino, com o teto que o ambiente comporta — e o teto é do ambiente, não seu. A escada abaixo é o calibrador do dia: sobe e desce de degrau conforme onde você vai estar. Ficar num degrau o tempo que quiser não é atraso." />
```

- [ ] **Step 7: rotas**

Em `src/main.tsx`, acrescentar o import de `HomeModeView` e as rotas:

```tsx
        { path: "beleza/estilo/publico", element: <DiscreetView /> },
        { path: "beleza/estilo/casa", element: <HomeModeView /> },
```

Manter `beleza/estilo/discreto` apontando para `DiscreetView` — é link antigo
que pode estar em outras telas, e quebrar navegação existente não faz parte
desta frente. Rodar `grep -rn "estilo/discreto" src/` e migrar os que houver.

- [ ] **Step 8: rodar**

```
npx vitest run tests/pages/tres-modos.test.tsx && npm run build
```

Esperado: **PASS** e build limpo.

- [ ] **Step 9: commit**

```bash
git add src/components/StyleTabs.tsx src/pages/beauty/style/ src/main.tsx tests/pages/tres-modos.test.tsx
git commit -m "feat(estilo): a navegação abre por contexto — público, casa, íntimo"
```

---

## Task 5: as peças de casa dizem qual técnica usam

**Files:**
- Modify: `src/data/garments-seed.ts` (peças `mode: "casa"`)
- Test: `tests/data/tres-modos.test.ts` (criar)

- [ ] **Step 1: escrever o teste**

Criar `tests/data/tres-modos.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { GARMENTS } from "../../src/data/garments-seed";

describe("toda peça tem um contexto, e o contexto é um dos três", () => {
  it("nenhuma peça ficou sem modo nem com valor antigo", () => {
    const MODOS = ["publico", "casa", "intimo"];
    const erradas = GARMENTS.filter((g) => !MODOS.includes(g.mode)).map((g) => g.id);
    expect(erradas).toEqual([]);
  });

  it("toda peça íntima está no modo íntimo, e vice-versa", () => {
    const desalinhadas = GARMENTS.filter(
      (g) => (g.category === "intimate") !== (g.mode === "intimo"),
    ).map((g) => ({ id: g.id, category: g.category, mode: g.mode }));
    expect(desalinhadas).toEqual([]);
  });

  // Justa marca por contato, folgada marca por contraste. Sem a etiqueta, a
  // tela de Casa não consegue separar, e ela volta a escolher pelo caimento em
  // vez de pelo efeito.
  it("toda peça de casa declara por qual técnica ela marca", () => {
    const mudas = GARMENTS.filter((g) => g.mode === "casa")
      .filter((g) => g.homeEffect !== "contato" && g.homeEffect !== "contraste")
      .map((g) => g.id);
    expect(mudas).toEqual([]);
  });

  it("as duas técnicas estão representadas — não é uma etiqueta só com dois nomes", () => {
    const casa = GARMENTS.filter((g) => g.mode === "casa");
    expect(casa.filter((g) => g.homeEffect === "contato").length).toBeGreaterThanOrEqual(3);
    expect(casa.filter((g) => g.homeEffect === "contraste").length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

Esperado: **FAIL** nos dois últimos — nenhuma peça de casa tem `homeEffect`.

- [ ] **Step 3: etiquetar as peças de casa**

Em `src/data/garments-seed.ts`, acrescentar `homeEffect` a cada peça com
`mode: "casa"`. O critério, escrito uma vez aqui e aplicado peça a peça:

- **`"contato"`** — a peça encosta na curva e mostra a forma direto: saia lápis,
  vestido justo, top justo, legging, body, malha que abraça, peplum, decotes.
- **`"contraste"`** — a peça é solta e mostra a curva pelo que ela **deixa** de
  tocar: saia rodada, vestido evasê, blusa oversized, cardigã largo, camisa
  ampla, calça flare, qualquer coisa com volume que emoldure uma cintura marcada.

Peça que faz as duas coisas (ex.: vestido com corpo justo e saia rodada) recebe
`"contato"` — o que decide é onde está a cintura, e nesses casos a cintura marca
por contato.

- [ ] **Step 4: rodar e provar por mutação**

```
npx vitest run tests/data/tres-modos.test.ts
```

Esperado: **PASS**. Depois, apagar o `homeEffect` de uma peça de casa, confirmar
**FAIL** no terceiro teste, e reverter.

- [ ] **Step 5: commit**

```bash
git add src/data/garments-seed.ts tests/data/tres-modos.test.ts
git commit -m "feat(estilo): cada peça de casa diz se marca por contato ou por contraste"
```

---

## Task 6: tamanho e compra ficam registrados

**Files:**
- Create: `src/data/tamanhos-seed.ts`
- Modify: `src/pages/beauty/style/WishlistView.tsx`
- Test: `tests/data/tamanhos-compra.test.ts` (criar)

**Interfaces:**
- Consumes: `MEDIDAS_PARTIDA`, `FASES`, `MARCOS_CINTURA` de `src/lib/objetivo.ts`.
- Produces:
  ```ts
  export interface GuiaTamanho { id: string; titulo: string; corpo: string; }
  export const GUIA_TAMANHOS: readonly GuiaTamanho[];
  ```

**Regra que não pode ser reescrita à mão:** os números de medida vêm de
`objetivo.ts`. Copiar 114 ou 99 para dentro deste seed é criar a segunda cópia
que diverge em silêncio.

- [ ] **Step 1: escrever o teste**

Criar `tests/data/tamanhos-compra.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { GUIA_TAMANHOS } from "../../src/data/tamanhos-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = GUIA_TAMANHOS.map((g) => `${g.titulo} ${g.corpo}`).join("\n");

describe("guia de tamanho e compra", () => {
  // Cueca é vendida por cintura, calcinha por quadril, e ela tem 15 cm de
  // diferença entre as duas com coxa grossa. Comprar pela cintura entrega peça
  // que aperta a coxa — e peça que aperta a coxa achata a bunda.
  it("diz para comprar pelo quadril e pela coxa, nunca pela cintura", () => {
    expect(texto).toMatch(/quadril/i);
    expect(texto).toMatch(/coxa/i);
    expect(texto).toMatch(/nunca pela cintura|não pela cintura/i);
  });

  it("avisa que a tabela muda por marca", () => {
    expect(texto).toMatch(/marca/i);
  });

  // O aviso mais caro: o tamanho tem data de validade. Cintura 99 → 84 e
  // quadril 114 → 106 na fase 1, e o quadril volta a 114 na fase 2.
  it("avisa para não comprar enxoval completo agora", () => {
    expect(texto).toMatch(/2 ou 3 peças|poucas peças|enxoval/i);
  });

  // Os números vêm de objetivo.ts. Se um dia o alvo mudar lá, o guia acompanha
  // sozinho — e este teste é o que garante que ninguém digitou o número aqui.
  it("os números de medida saem de objetivo.ts, não estão digitados no seed", () => {
    const fase1 = FASES.find((f) => f.id === "fase-1")!;
    const fase2 = FASES.find((f) => f.id === "fase-2")!;
    expect(texto).toContain(String(MEDIDAS_PARTIDA.quadrilCm));
    expect(texto).toContain(String(fase1.cinturaCm));
    expect(texto).toContain(String(fase2.quadrilCm));
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

Esperado: **FAIL** — o módulo não existe.

- [ ] **Step 3: criar o seed**

Criar `src/data/tamanhos-seed.ts`:

```ts
import { MEDIDAS_PARTIDA, FASES, MARCOS_CINTURA } from "../lib/objetivo";

// Módulo puro. Os números de medida NÃO são digitados aqui — são interpolados
// de objetivo.ts, que é a fonte única. Digitar "114" neste arquivo criaria a
// segunda cópia que diverge em silêncio quando o alvo mudar, que é o modo de
// falha mais caro deste projeto.

export interface GuiaTamanho {
  id: string;
  titulo: string;
  corpo: string;
}

const FASE_1 = FASES.find((f) => f.id === "fase-1")!;
const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const MARCO_88 = MARCOS_CINTURA.find((m) => m.cinturaCm === 88)!;

export const GUIA_TAMANHOS: readonly GuiaTamanho[] = [
  {
    id: "pelo-quadril",
    titulo: "Compra pelo quadril e pela coxa — nunca pela cintura",
    corpo:
      `Cueca é vendida por cintura, calcinha por quadril, e você tem ${MEDIDAS_PARTIDA.quadrilCm - MEDIDAS_PARTIDA.cinturaCm} cm ` +
      `de diferença entre as duas (cintura ${MEDIDAS_PARTIDA.cinturaCm}, quadril ${MEDIDAS_PARTIDA.quadrilCm}) e coxa de ` +
      `${MEDIDAS_PARTIDA.coxaCm}. Se comprar pelo número da cintura, a peça aperta a coxa — e peça que aperta a coxa achata ` +
      `a bunda, que é exatamente o oposto do que você está construindo. Procura sempre a faixa da tabela que contém ` +
      `${MEDIDAS_PARTIDA.quadrilCm} de quadril, e ignora o nome do tamanho.`,
  },
  {
    id: "tabela-por-marca",
    titulo: "A tabela muda por marca — confere sempre",
    corpo:
      `Hoje você é GG em cueca e 52 em calcinha plus, mas isso é o nome, não a medida. Na tabela Lupo o GG cobre cintura ` +
      `96–101 e quadril 111–116, e as suas duas medidas caem no meio. Na Zorba o GG começa em cintura 100 e você fica de ` +
      `fora. Mesma letra, peça diferente. Confere a faixa que contém ${MEDIDAS_PARTIDA.quadrilCm} antes de comprar, marca por marca.`,
  },
  {
    id: "validade-do-tamanho",
    titulo: "O tamanho tem data de validade — compra pouco agora",
    corpo:
      `Em 6 a 8 meses a cintura vai de ${MEDIDAS_PARTIDA.cinturaCm} para ${FASE_1.cinturaCm} e o quadril de ` +
      `${MEDIDAS_PARTIDA.quadrilCm} para cerca de ${FASE_1.quadrilCm}. Depois, na fase 2, o quadril volta a ` +
      `${FASE_2.quadrilCm} — mesmo número, feito de músculo. Ou seja, o teu tamanho desce e depois sobe de novo. ` +
      `Enxoval completo hoje é dinheiro com data marcada: compra 2 ou 3 peças até a cintura chegar a ` +
      `${MARCO_88.cinturaCm} (mês ${MARCO_88.mesMin}–${MARCO_88.mesMax}), e o resto depois.`,
  },
  {
    id: "de-usar-primeiro",
    titulo: "Se for comprar pouco, compra o de usar",
    corpo:
      `A peça de ver você já tem, e ela continua servindo mesmo se ficar folgada — renda e cetim perdoam. ` +
      `A de usar não perdoam: compressão folgada não comprime, e peça que enrola vira cordão que aperta. ` +
      `Então, na dúvida, as 2 ou 3 peças de agora são de usar.`,
  },
];
```

- [ ] **Step 4: mostrar o guia na Wishlist**

Em `src/pages/beauty/style/WishlistView.tsx`, importar `GUIA_TAMANHOS` e
renderizar acima da lista:

```tsx
      <div className="space-y-2 mb-4">
        {GUIA_TAMANHOS.map((g) => (
          <div key={g.id} className="card">
            <h2 className="text-nude-warm font-medium text-sm mb-1">{g.titulo}</h2>
            <p className="text-muted text-xs leading-relaxed">{g.corpo}</p>
          </div>
        ))}
      </div>
```

- [ ] **Step 5: rodar e provar por mutação**

```
npx vitest run tests/data/tamanhos-compra.test.ts
```

Esperado: **PASS**. Depois, trocar `${MEDIDAS_PARTIDA.quadrilCm}` por `114`
digitado à mão em `pelo-quadril` e mudar `FASES` na cabeça (não faça isso no
arquivo — apenas confirme, lendo, que o teste compara com a constante). A
mutação real: trocar `${FASE_1.cinturaCm}` por `85`, confirmar **FAIL** no
último teste, e reverter.

- [ ] **Step 6: commit**

```bash
git add src/data/tamanhos-seed.ts src/pages/beauty/style/WishlistView.tsx tests/data/tamanhos-compra.test.ts
git commit -m "feat(estilo): tamanho se compra pelo quadril, e o tamanho tem validade"
```

---

## Task 7: tudo isso chega no aparelho dela

**Files:**
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts`
- Modify: `src/lib/style-seed.ts` (só se a versão não estiver exportada da Task 1)

- [ ] **Step 1: estender o teste de chegada**

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, no import do topo:

```ts
import { seedStyle, STYLE_SEED_VERSION } from "../../src/lib/style-seed";
```

No `describe` do pino de versão:

```ts
  it("STYLE_SEED_VERSION é a versão revisada nesta rodada", () => {
    expect(STYLE_SEED_VERSION).toBe(4);
  });
```

E, no `describe("estilo")`, um teste novo:

```ts
  it("os três modos alcançam quem estava no par discreto/livre", async () => {
    // Reconstrói o banco dela: peças já semeadas na v3, com o campo antigo — e
    // uma peça que é dela, que o seed não conhece e nunca reescreveria.
    await db.garments.put({
      id: "body-de-renda",
      name: "Body de renda",
      category: "intimate",
      occasion: ["intimo"],
      whyItWorks: "…",
      discretion: "livre",
    } as never);
    await db.garments.put({
      id: "peca-dela-999",
      name: "Blusa que eu comprei",
      category: "top",
      occasion: ["casual"],
      whyItWorks: "anotação dela",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: STYLE_SEED_VERSION - 1 });

    await seedStyle();

    const body = await db.garments.get("body-de-renda");
    const dela = await db.garments.get("peca-dela-999");
    expect(body?.mode).toBe("intimo");
    expect(dela?.mode).toBe("casa");
    expect(dela?.name).toBe("Blusa que eu comprei");
    // Nenhuma peça pode sobrar com o campo velho ao lado do novo.
    const comCampoAntigo = (await db.garments.toArray()).filter((g) => "discretion" in g);
    expect(comCampoAntigo.map((g) => g.id)).toEqual([]);
    // E as peças de usar, que não existiam na v3, chegam.
    expect((await db.garments.get("boxer-microfibra-liso"))?.intimateUse).toBe("usar");
  });
```

- [ ] **Step 2: rodar**

```
npx vitest run tests/lib/seeds-chegam-no-aparelho.test.ts
```

Esperado: **PASS** (a versão já foi para 4 na Task 1).

- [ ] **Step 3: provar por mutação — a que mais importa**

Reverter `STYLE_SEED_VERSION` para 3 em `src/lib/style-seed.ts`, sem tocar em
mais nada. Rodar o teste e confirmar **FAIL** no pino da versão. Reverter para 4.

- [ ] **Step 4: commit**

```bash
git add src/lib/style-seed.ts tests/lib/seeds-chegam-no-aparelho.test.ts
git commit -m "fix(seed): os três modos chegam no aparelho dela"
```

---

## Task 8: verificação final da frente

- [ ] **Step 1: suíte completa**

```
npm run test
```

Esperado: **PASS**, com contagem maior que os 780 de antes desta frente.

- [ ] **Step 2: build limpo**

```
npm run build
```

- [ ] **Step 3: nenhum resquício do campo antigo**

```
grep -rn "discretion" src/ tests/
```

Esperado: só as ocorrências dentro de `migrarModos` (que lê o campo antigo de
propósito) e dos testes de migração.

- [ ] **Step 4: atualizar o ponto de retomada**

Em `docs/CONTINUAR-AQUI.md`: marcar a frente 6 como no ar; remover da seção 7 o
bloco da frente 6; acrescentar às decisões dela a linha dos três modos e a de
peça de ver × peça de usar.

- [ ] **Step 5: commit**

```bash
git add docs/CONTINUAR-AQUI.md
git commit -m "docs: a frente 6 fecha"
```

---

## Self-review contra o spec

| Requisito do spec | Onde é atendido |
|---|---|
| Correção herdada — público não é masculino | Task 3 |
| Decisão 1 — três modos viram o eixo da navegação | Task 4 |
| Decisão 1 — Público entre níveis 1-3, escada como calibrador | Task 3 (escada) e Task 4 (DiscreetView) |
| Decisão 1 — Casa: justa marca por contato × folgada por contraste | Tasks 4 (tela) e 5 (etiqueta por peça) |
| Decisão 1 — Íntimo: de ver × de usar | Task 2 (dado e peças) e Task 4 (tela) |
| Decisão 2 — modos não são exclusivos (lingerie sob roupa larga) | Task 2 (`short-compressao-casa`, camada de baixo sob calça larga) |
| Decisão 2 — cós alto serve às três funções | Task 2 (`calcinha-cos-alto-compressao`) |
| Decisão 3 — migração de dois valores para três | Task 1 |
| Decisão 3 — peça dela sobrevive | Tasks 1 e 7 |
| Decisão 4 — compra pelo quadril e coxa, tabela por marca, validade do tamanho | Task 6 |
| Arquitetura — bump de `styleSeedVersion` | Tasks 1 e 7 |
| Testes — os cinco arquivos previstos | Tasks 1, 2, 3, 5, 6, 7 |
| Fora de escopo — maquiagem, cabelo, unhas, depilação | Nenhuma task toca neles |

**Lacuna assumida do spec:** ele previa que "Paleta/Wishlist ficam dentro" dos
modos. Aqui elas continuam como abas próprias, depois dos três modos. Motivo:
paleta e wishlist atravessam os três contextos (a mesma cor vale em público e no
íntimo), e duplicá-las dentro de cada modo criaria três telas que precisam
concordar entre si — a forma de divergência que este projeto mais paga caro. Os
três modos vêm primeiro na barra, que é o que a decisão pedia.

# Frente 1 — Verdade e objetivo · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar a TRH do caminho crítico do app e substituir os objetivos difusos por números reais derivados da medição de 13/05/2026, num módulo que seja fonte única.

**Architecture:** Um módulo puro novo (`src/lib/objetivo.ts`) passa a guardar todos os números-alvo, que hoje estão dissolvidos em prosa dentro de seeds — foi exatamente essa dispersão que permitiu o app se contradizer no passado. Os seeds e páginas passam a ler dele ou a citá-lo. Um teste de varredura sobre todo o `src/` impede que a linguagem de "TRH agendada" volte.

**Tech Stack:** React 18 · TypeScript · Vite · Dexie 4 · React Router 7 · Vitest · Tailwind

## Global Constraints

- Idioma de todo texto de usuário e comentário: **pt-BR com acentuação correta**.
- Módulos em `src/lib/` são **puros**: sem `new Date()`, sem I/O, sem acesso a `db`. Quem chama injeta.
- Comentário de código explica **por quê**, não o quê — é o padrão do repo.
- **Nenhum texto do app pode tratar a TRH como etapa futura agendada.** Ela existe como possibilidade sem data. Proibido: "início da TRH", "alinhar com a TRH", "enquanto a TRH não vem", "quando a TRH começar", "a TRH vai arredondar".
- Palavras exatas quando algo é inalcançável sem TRH: **"impossível"**, não "difícil".
- Modos de apresentação (público masculino, casa feminina, íntimo safada) são **escolhas declaradas dela**. Proibido: "passar despercebido" como limitação, "por enquanto", "até lá".
- Faixas de resultado sempre **duplas** (provável × execução excelente). Número único ilude ou desanima.
- Rodar `npm run test` antes de cada commit. Suíte verde é condição de commit.

---

### Task 1: Terreno — medidas de partida no banco e privacidade

Sem a medição de 13/05 dentro do Trein-Final, `getLatestWaist()` devolve `null`, `resolveGoal` cai em `"manutencao"` para sempre e nenhum marco de cintura dispara. O app fica inerte por falta de dado, não por bug. Esta task destrava as outras.

**Files:**
- Modify: `src/lib/seed.ts` (adicionar bloco versionado ao fim de `seedDatabase`)
- Modify: `.gitignore`
- Test: `tests/lib/seed-medidas.test.ts`

**Interfaces:**
- Consumes: `db.measurements` (schema em `src/lib/db.ts`: `date`, `waistCm`, `hipCm`, `shouldersCm`, …)
- Produces: chave de setting `medidasPartidaSeeded`; garante ao menos uma linha em `db.measurements` com `waistCm: 99`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/seed-medidas.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedMedidasPartida } from "../../src/lib/seed";

describe("medidas de partida (13/05/2026)", () => {
  beforeEach(async () => {
    await db.measurements.clear();
    await db.settings.clear();
  });

  it("insere a medição real quando não há nenhuma", async () => {
    await seedMedidasPartida();
    const todas = await db.measurements.toArray();
    expect(todas).toHaveLength(1);
    expect(todas[0]).toMatchObject({ date: "2026-05-13", waistCm: 99, hipCm: 114, shouldersCm: 120.5 });
  });

  it("é idempotente — rodar duas vezes não duplica", async () => {
    await seedMedidasPartida();
    await seedMedidasPartida();
    expect(await db.measurements.count()).toBe(1);
  });

  it("não sobrescreve medições que ela já registrou", async () => {
    await db.measurements.add({ date: "2026-08-01", waistCm: 95 } as never);
    await seedMedidasPartida();
    const todas = await db.measurements.toArray();
    expect(todas).toHaveLength(1);
    expect(todas[0].waistCm).toBe(95);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/seed-medidas.test.ts`
Expected: FAIL — `seedMedidasPartida is not a function`

- [ ] **Step 3: Implementar**

Adicionar em `src/lib/seed.ts` (função exportada própria, chamada ao fim de `seedDatabase`):

```ts
/** Medição real de 13/05/2026, trazida de fora do app. Sem ao menos uma
 *  medição com cintura, `resolveGoal` cai em manutenção para sempre e nenhum
 *  marco de cintura dispara — o app fica inerte por falta de dado. Só semeia
 *  se ela ainda não tiver registrado nada: medição dela sempre vence. */
export async function seedMedidasPartida(): Promise<void> {
  const jaTem = await db.measurements.count();
  if (jaTem > 0) return;
  await db.measurements.add({
    date: "2026-05-13",
    neckCm: 40,
    shouldersCm: 120.5,
    bustCm: 106.5,
    waistCm: 99,
    hipCm: 114,
    thighLeftCm: 82.5,
    thighRightCm: 82.5,
    armCm: 34,
    weightKg: 96,
  } as never);
}
```

Conferir os nomes reais dos campos em `src/lib/db.ts` e ajustar o objeto pra bater com a interface `Measurement` — remover os que não existirem no schema em vez de inventar.

Chamar ao fim de `seedDatabase()`:

```ts
  await seedMedidasPartida();
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/seed-medidas.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Fechar a fresta de privacidade**

Em `.gitignore`, no bloco que já existe sob o comentário `# Fotos pessoais e capturas de tela — PRIVACIDADE, nunca versionar`, adicionar abaixo de `*.jpeg`:

```
*.png
```

O bloco já cobre `eu/`, `objetivo/`, `*.jpg` e `*.jpeg`. Print de tela no Windows sai PNG por padrão, e este repositório publica em GitHub Pages. É prevenção — não há PNG solto na raiz agora.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/seed.ts tests/lib/seed-medidas.test.ts .gitignore
git commit -m "feat(medidas): a medicao de 13/05 entra no app, e PNG entra no gitignore

Sem nenhuma medicao com cintura, getLatestWaist devolve null, resolveGoal
cai em manutencao para sempre e nenhum marco de cintura dispara. O app
ficava inerte por falta de dado. A semeadura so acontece se ela ainda nao
tiver registrado nada — medicao dela sempre vence.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `src/lib/objetivo.ts` — fonte única dos números

**Files:**
- Create: `src/lib/objetivo.ts`
- Test: `tests/lib/objetivo.test.ts`

**Interfaces:**
- Produces: `MEDIDAS_PARTIDA`, `razaoCinturaQuadril(cinturaCm, quadrilCm): number`, `razaoOmbroQuadril(ombrosCm, quadrilCm): number`, `FASES: readonly FaseObjetivo[]`, `CONSUMO`, `MARCOS_CINTURA: readonly MarcoCintura[]`. Tasks 3, 6 e 7 consomem.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/objetivo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  MEDIDAS_PARTIDA, FASES, CONSUMO, MARCOS_CINTURA,
  razaoCinturaQuadril, razaoOmbroQuadril,
} from "../../src/lib/objetivo";

describe("derivadas das medidas de partida", () => {
  it("cintura÷quadril de partida é 0,87", () => {
    expect(razaoCinturaQuadril(MEDIDAS_PARTIDA.cinturaCm, MEDIDAS_PARTIDA.quadrilCm)).toBe(0.87);
  });

  it("ombro÷quadril é 1,06 — já é faixa feminina, o ombro nunca foi o gargalo", () => {
    expect(razaoOmbroQuadril(MEDIDAS_PARTIDA.ombrosCm, MEDIDAS_PARTIDA.quadrilCm)).toBe(1.06);
  });
});

describe("fases", () => {
  const fase1 = FASES.find((f) => f.id === "fase-1")!;
  const fase2 = FASES.find((f) => f.id === "fase-2")!;

  it("a fase 1 seca: cintura e peso caem em relação à partida", () => {
    expect(fase1.cinturaCm).toBeLessThan(MEDIDAS_PARTIDA.cinturaCm);
    expect(fase1.pesoKgMax).toBeLessThan(MEDIDAS_PARTIDA.pesoKg);
  });

  it("na fase 2 a balança SOBE de propósito", () => {
    expect(fase2.pesoKgMin).toBeGreaterThan(fase1.pesoKgMax);
  });

  it("o quadril termina no mesmo número da partida, feito de músculo", () => {
    expect(fase2.quadrilCm).toBeGreaterThanOrEqual(MEDIDAS_PARTIDA.quadrilCm);
  });

  it("o piso de cintura respeita a caixa torácica — nunca abaixo de 80", () => {
    for (const f of FASES) expect(f.cinturaCm).toBeGreaterThanOrEqual(80);
  });

  it("a razão melhora fase a fase", () => {
    expect(fase2.whrProvavel).toBeLessThan(fase1.whrProvavel);
  });

  it("a fase 2 declara as DUAS faixas — provável e execução excelente", () => {
    expect(fase2.whrExcelente).toBeDefined();
    expect(fase2.whrExcelente!).toBeLessThan(fase2.whrProvavel);
  });

  it("as fases se encadeiam sem buraco nem sobreposição", () => {
    expect(fase2.mesInicio).toBe(fase1.mesFim);
  });
});

describe("consumo", () => {
  it("a meta é déficit contra o gasto estimado", () => {
    expect(CONSUMO.metaKcal).toBeLessThan(CONSUMO.gastoEstimadoKcalMin);
  });

  it("proteína ≥ 1,8 g por kg do peso-alvo da fase 1 — é o que protege o músculo", () => {
    const alvo = FASES.find((f) => f.id === "fase-1")!.pesoKgMax;
    expect(CONSUMO.proteinaGMin / alvo).toBeGreaterThanOrEqual(1.8);
  });

  it("existe verba diária de besteira declarada", () => {
    expect(CONSUMO.discricionariaKcal).toBeGreaterThan(0);
  });
});

describe("marcos de cintura", () => {
  it("o primeiro marco é a trava do superávit (88)", () => {
    expect(MARCOS_CINTURA[0].cinturaCm).toBe(88);
  });

  it("os marcos descem e as datas sobem", () => {
    for (let i = 1; i < MARCOS_CINTURA.length; i++) {
      expect(MARCOS_CINTURA[i].cinturaCm).toBeLessThan(MARCOS_CINTURA[i - 1].cinturaCm);
      expect(MARCOS_CINTURA[i].mesMin).toBeGreaterThan(MARCOS_CINTURA[i - 1].mesMin);
    }
  });

  it("o último marco fecha na cintura da fase 1", () => {
    const ultimo = MARCOS_CINTURA[MARCOS_CINTURA.length - 1];
    expect(ultimo.cinturaCm).toBe(FASES.find((f) => f.id === "fase-1")!.cinturaCm);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/objetivo.test.ts`
Expected: FAIL — não resolve `../../src/lib/objetivo`

- [ ] **Step 3: Implementar**

Criar `src/lib/objetivo.ts`:

```ts
// src/lib/objetivo.ts
// Fonte única dos números do objetivo. Módulo puro — sem I/O, sem Date.
//
// Antes deste módulo, cada número de objetivo era prosa dentro de um seed. Foi
// exatamente essa dispersão que permitiu o app se contradizer: a Silhueta
// prometia um superávit que o plano alimentar negava. Toda tela que AFIRMA algo
// sobre o objetivo lê daqui.

/** A medição real de 13/05/2026 — o ponto de partida de tudo. */
export const MEDIDAS_PARTIDA = {
  data: "2026-05-13",
  alturaM: 1.73,
  pesoKg: 96,
  pescocoCm: 40,
  ombrosCm: 120.5,
  bustoCm: 106.5,
  cinturaCm: 99,
  quadrilCm: 114,
  coxaCm: 82.5,
  bracoCm: 34,
} as const;

const arredonda2 = (n: number) => Math.round(n * 100) / 100;

/** Cintura ÷ quadril. Abaixo de ~0,85 é faixa feminina. */
export function razaoCinturaQuadril(cinturaCm: number, quadrilCm: number): number {
  return arredonda2(cinturaCm / quadrilCm);
}

/** Ombro ÷ quadril. Homem cis típico fica entre 1,15 e 1,25 — ela está em 1,06,
 *  que já é faixa feminina. É por isso que o ombro nunca foi o gargalo. */
export function razaoOmbroQuadril(ombrosCm: number, quadrilCm: number): number {
  return arredonda2(ombrosCm / quadrilCm);
}

export interface FaseObjetivo {
  id: "fase-1" | "fase-2";
  nome: string;
  resumo: string;
  mesInicio: number;
  mesFim: number;
  pesoKgMin: number;
  pesoKgMax: number;
  cinturaCm: number;
  quadrilCm: number;
  /** Resultado provável com execução normal. */
  whrProvavel: number;
  /** Resultado de execução muito boa. Faixa única ilude ou desanima. */
  whrExcelente?: number;
}

export const FASES: readonly FaseObjetivo[] = [
  {
    id: "fase-1",
    nome: "Tirar a barriga",
    resumo:
      "A cintura é o problema inteiro: hoje ela é o ponto mais largo do tronco. Enquanto for, não existe silhueta possível.",
    mesInicio: 0,
    mesFim: 8,
    pesoKgMin: 80,
    pesoKgMax: 82,
    cinturaCm: 84,
    // O quadril também cai — tem gordura nele. Isso é esperado, não perda.
    quadrilCm: 106,
    whrProvavel: 0.79,
  },
  {
    id: "fase-2",
    nome: "Construir glúteo",
    resumo:
      "A balança sobe de propósito. O quadril volta ao mesmo 114 de hoje, feito de músculo — mesmo número, corpo irreconhecível. Compare por foto, não por fita.",
    mesInicio: 8,
    mesFim: 30,
    pesoKgMin: 85,
    pesoKgMax: 88,
    cinturaCm: 83,
    quadrilCm: 115,
    whrProvavel: 0.77,
    whrExcelente: 0.73,
  },
] as const;

/** Piso de cintura. Busto 106,5 significa caixa torácica larga, e costela não
 *  encolhe: abaixo disso não existe, por mais déficit que se faça. */
export const CINTURA_PISO_CM = 80;

export const CONSUMO = {
  /** Mifflin-St Jeor + 5 km a pé por dia + 1h de cães + força 4-5x/semana. */
  gastoEstimadoKcalMin: 2900,
  gastoEstimadoKcalMax: 3100,
  metaKcal: 2300,
  proteinaGMin: 150,
  proteinaGMax: 160,
  /** Verba de besteira, declarada e sem culpa. Não é indulgência: os dois pontos
   *  de falha dela (16h e o jantar) são déficit agudo depois de esforço, que é
   *  fisiologia funcionando certo. Plano que finge que besteira não acontece
   *  quebra na primeira semana e leva o resto junto. */
  discricionariaKcal: 250,
} as const;

export interface MarcoCintura {
  cinturaCm: number;
  mesMin: number;
  mesMax: number;
  titulo: string;
  porQue: string;
}

export const MARCOS_CINTURA: readonly MarcoCintura[] = [
  {
    cinturaCm: 88,
    mesMin: 3,
    mesMax: 4,
    titulo: "Cintura 88 — destrava o superávit",
    porQue:
      "É a trava de CINTURA_LIBERA_SUPERAVIT_CM em meal-plan.ts. Abaixo dela, superávit vira glúteo; acima, vira barriga.",
  },
  {
    cinturaCm: 84,
    mesMin: 6,
    mesMax: 8,
    titulo: "Cintura 84 — a silhueta vira",
    porQue:
      "Fim da fase 1. Não é o fim do caminho: é o ponto em que roupa justa passa a fazer o que você quer.",
  },
] as const;
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/objetivo.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/objetivo.ts tests/lib/objetivo.test.ts
git commit -m "feat(objetivo): fonte unica dos numeros do objetivo

Cada numero-alvo estava dissolvido em prosa dentro de um seed, e foi essa
dispersao que permitiu o app se contradizer (a Silhueta prometia um
superavit que o plano alimentar negava).

Os numeros vem da medicao real de 13/05: cintura 99, quadril 114, 96 kg,
1,73 m. Duas fases, com a fase 2 subindo a balanca de proposito e o quadril
voltando ao mesmo 114 feito de musculo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Horizontes — duas trilhas no lugar da escada com TRH no meio

`horizontes-seed.ts` é o arquivo que ela abre pra saber onde vai chegar, e é o que mais mente: tem uma linha do tempo inteira ancorada em "~28: começa a TRH".

**Files:**
- Modify: `src/data/horizontes-seed.ts` (substituição integral do array `HORIZONTES`)
- Test: `tests/data/horizontes-seed.test.ts` (já existe — reescrever as asserções)

**Interfaces:**
- Consumes: `GuideSection` de `src/components/GuideAccordion`; números de `src/lib/objetivo.ts`
- Produces: `HORIZONTES` com as seções `trilha-vestida`, `trilha-cama`, `cirurgia`, `linha-do-tempo`

- [ ] **Step 1: Escrever o teste que falha**

Substituir o conteúdo de `tests/data/horizontes-seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = JSON.stringify(HORIZONTES);

describe("horizontes: duas trilhas, não uma escada esperando a TRH", () => {
  it("tem as quatro seções previstas", () => {
    expect(HORIZONTES.map((s) => s.id)).toEqual([
      "trilha-vestida", "trilha-cama", "cirurgia", "linha-do-tempo",
    ]);
  });

  it("não trata a TRH como etapa agendada", () => {
    expect(texto).not.toMatch(/in[íi]cio da TRH/i);
    expect(texto).not.toMatch(/come[çc]a a TRH/i);
    expect(texto).not.toMatch(/depois da TRH/i);
    expect(texto).not.toMatch(/quando a TRH/i);
  });

  it("nomeia o que é inalcançável com a palavra 'impossível', não 'difícil'", () => {
    const vestida = HORIZONTES.find((s) => s.id === "trilha-vestida")!;
    expect(JSON.stringify(vestida)).toMatch(/imposs[íi]vel/i);
  });

  it("a trilha da cama diz que a configuração de hoje FAVORECE metade dos objetivos", () => {
    const cama = HORIZONTES.find((s) => s.id === "trilha-cama")!;
    expect(JSON.stringify(cama)).toMatch(/testosterona/i);
  });

  it("cita os números reais das medidas e das fases", () => {
    expect(texto).toContain(String(MEDIDAS_PARTIDA.cinturaCm));
    expect(texto).toContain(String(MEDIDAS_PARTIDA.quadrilCm));
    expect(texto).toContain(String(FASES[0].cinturaCm));
  });

  it("declara a faixa dupla de WHR, não um número só", () => {
    expect(texto).toMatch(/0,7[0-9].*0,7[0-9]/);
  });

  it("a linha do tempo não ancora nada em idade", () => {
    const linha = HORIZONTES.find((s) => s.id === "linha-do-tempo")!;
    expect(JSON.stringify(linha)).not.toMatch(/~?2[89]:/);
  });

  it("o BBL vem com o risco de mortalidade escrito", () => {
    const cir = HORIZONTES.find((s) => s.id === "cirurgia")!;
    expect(JSON.stringify(cir)).toMatch(/mortalidade|embolia/i);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/horizontes-seed.test.ts`
Expected: FAIL — ids atuais são `sem-trh`, `com-trh`, `bbl-mama`, `linha-do-tempo`

- [ ] **Step 3: Implementar**

Substituir integralmente o array `HORIZONTES` em `src/data/horizontes-seed.ts` (manter o `import type { GuideSection }`):

```ts
// Onde dá pra chegar, dito sem adoçante. A TRH não tem data — então este
// arquivo NÃO é uma escada esperando por ela. São duas trilhas simultâneas,
// uma com teto e outra favorecida pela configuração de hoje.
export const HORIZONTES: GuideSection[] = [
  {
    id: "trilha-vestida",
    title: "Trilha 1 — o corpo vestida",
    intro: "O que treino e dieta constroem, e onde está o teto.",
    tips: [
      "Vem: cintura de 99 para 84, glúteo grande e denso, e a razão cintura÷quadril saindo de 0,87 para 0,75-0,78 — 0,72-0,74 se a execução for muito boa.",
      "Seu ombro nunca foi o problema: ombro÷quadril já está em 1,06, que é faixa feminina (homem cis típico fica entre 1,15 e 1,25). A cintura é o problema inteiro.",
      "NÃO vem sem hormônio: gordura macia no quadril e na coxa, mama, pele mais fina, menos pelo no corpo, mudança na gordura do rosto. Isso é impossível, não difícil — nenhum treino do mundo entrega.",
      "Então o contorno que você constrói é ampulheta ATLÉTICA: cintura seca sobre glúteo grande, em esqueleto estreito. Não é a mesma linha das referências que você guardou — o degrau de quadril delas é gordura estrogênica na lateral do quadril, e glúteo cresce para trás e para cima, não para o lado. É outro material, não outro esforço.",
      "Seu quadril termina nos mesmos 114 cm de hoje, feito de outra coisa. Mesmo número, corpo irreconhecível — por isso a fita sozinha engana e a foto lado a lado não.",
    ],
  },
  {
    id: "trilha-cama",
    title: "Trilha 2 — o corpo na cama",
    intro: "A parte que a configuração de hoje favorece.",
    tips: [
      "Força para levantar sua noiva, ganho de músculo rápido, libido, ereção, firmeza e controle: tudo isso depende de testosterona.",
      "Hormonizar custaria esses. Então não é uma espera — é um conflito real entre dois objetivos seus, e conflito se decide, não se aguarda.",
      "Flexibilidade de quadril para as posições que você quer: 3 a 6 meses de trabalho diário resolvem praticamente tudo. É a coisa mais rápida da sua lista, e espacate não é necessário para nada disso.",
      "Assoalho pélvico treinado nos DOIS sentidos — contrair e relaxar — é o que sustenta firmeza, controle e conforto ao receber. Frequência importa mais que duração.",
      "A barriga também está aqui: gordura abdominal converte testosterona em estrogênio. Ela é ao mesmo tempo o problema da silhueta e parte do problema da firmeza. Uma frente só, não duas.",
    ],
  },
  {
    id: "cirurgia",
    title: "Se um dia quiser cirurgia",
    intro: "BBL é a única alavanca que dá volume de gordura macia no quadril sem hormônio.",
    tips: [
      "Precisa de gordura corporal para colher — não dá para fazer no auge da secura.",
      "É historicamente a cirurgia estética com maior mortalidade, por embolia gordurosa. A técnica subfascial reduziu muito esse risco, mas ele não é zero. Isso entra na conta.",
      "Feita sobre glúteo já treinado, rende muito mais: o cirurgião tem estrutura para trabalhar e o resultado dura.",
      "A ordem certa é a que você já está seguindo: treino agora, cirurgia depois dos 30 se ainda quiser. Treinar não atrasa — prepara.",
    ],
  },
  {
    id: "linha-do-tempo",
    title: "Linha do tempo",
    intro: "Prazos contados a partir da medição de 13/05/2026. O que define o ritmo é adesão, não idade.",
    tips: [
      "Semana 8-10: a primeira mudança que aparece em foto.",
      "Mês 3-4: cintura em 88. É a trava que destrava o superávit no app.",
      "Mês 6-8: cintura em 84, peso por volta de 81 kg. É aqui que a silhueta vira.",
      "Mês 8-30: fase 2. A balança SOBE de propósito, até 85-88 kg, e o quadril volta aos 114-116 de músculo. Ver 85 kg nessa fase é o sinal de que deu certo, não de que falhou.",
      "Destreinada com cerca de 28% de gordura é a configuração que responde mais rápido que existe: dá para perder gordura e ganhar músculo ao mesmo tempo. Essa janela fecha.",
    ],
  },
];
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/data/horizontes-seed.test.ts`
Expected: PASS

- [ ] **Step 5: Conferir a tela que consome**

Run: `npm run dev` e abrir `/treino/horizontes` (rota em `src/pages/workout/Horizontes.tsx`). Confirmar que as quatro seções renderizam e que não sobrou nenhum título antigo. Se `Horizontes.tsx` tiver texto próprio citando TRH, corrigir aqui.

- [ ] **Step 6: Commit**

```bash
git add src/data/horizontes-seed.ts tests/data/horizontes-seed.test.ts src/pages/workout/Horizontes.tsx
git commit -m "feat(horizontes): duas trilhas no lugar da escada esperando a TRH

O arquivo que ela abre para saber onde vai chegar era o que mais mentia:
tinha uma linha do tempo ancorada em '~28: comeca a TRH' e um WHR sem TRH
de 0,83-0,85 que assumia quadril parado.

Agora sao duas trilhas simultaneas — corpo vestida, com teto declarado e a
palavra 'impossivel' onde cabe; e corpo na cama, favorecido pela
testosterona que ela tem. Numeros reais e faixa dupla de WHR.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: A zona 2 sai dos templates — a caminhada de 5 km já a entrega

O app prescreve 15-20 min de zona 2 no fim de todo dia de inferior. Ela caminha 5 km do trabalho para casa **todo dia**. A prescrição duplicada alonga a sessão em 20 min, empurra o jantar para as 20h — e 20h é exatamente quando o jantar descontrolado acontece. Uma remoção conserta três coisas.

**Files:**
- Modify: `src/data/cycles-seed.ts` (12 ocorrências de `cardio-zona2`)
- Modify: `src/data/entrada-seed.ts` (12 ocorrências)
- Modify: `src/data/workout-plan-seed.ts` (3 ocorrências)
- Test: `tests/data/zona2-caminhada.test.ts` (novo)
- Modify: `tests/lib/session-order.test.ts`, `tests/lib/session-warmup.test.ts`, `tests/data/correcoes-ciclo.test.ts` (asseveram presença de zona 2 — precisam mudar de lado)

**Interfaces:**
- Consumes: `ALL_TEMPLATES` de `src/data/all-templates`
- Produces: nenhum template contém `cardio-zona2`. O exercício **continua no catálogo** (`exercises-seed.ts`) — a prescrição migra para a caminhada na Task 7.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/zona2-caminhada.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("zona 2 saiu dos treinos — a caminhada de 5 km já entrega", () => {
  it("nenhum template prescreve cardio-zona2", () => {
    const comZona2 = ALL_TEMPLATES
      .filter((t) => t.exercises.some((e) => e.exerciseId === "cardio-zona2"))
      .map((t) => t.id);
    expect(comZona2).toEqual([]);
  });

  it("o exercício continua no catálogo — a prescrição migrou, não sumiu", () => {
    expect(EXERCISES.find((e) => e.id === "cardio-zona2")).toBeDefined();
  });

  it("o aquecimento na esteira continua nos dias de força", () => {
    const comAquecimento = ALL_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "cardio-leve-esteira"),
    );
    expect(comAquecimento.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/zona2-caminhada.test.ts`
Expected: FAIL — lista de templates com zona 2 não vazia

- [ ] **Step 3: Remover as linhas dos três seeds**

Em `src/data/cycles-seed.ts`, `src/data/entrada-seed.ts` e `src/data/workout-plan-seed.ts`, apagar toda linha da forma:

```ts
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15-20min", restSec: 0 },
```

Localizar com: `grep -n "cardio-zona2" src/data/cycles-seed.ts src/data/entrada-seed.ts src/data/workout-plan-seed.ts`

Atualizar também o comentário de cabeçalho de `cycles-seed.ts`, que hoje diz:

```
// ZONA 2: fecha os dias de inferior — os que têm hip thrust, agachamento,
// stiff ou good-morning — e só eles. Dá 3 dias por semana em todo ciclo, que é
// a dose que o guia da tela de sessão promete (3-4x/semana). Cardio no fim,
// nunca antes: antes rouba a energia do glúteo.
```

Substituir por:

```
// ZONA 2 NÃO ENTRA AQUI: ela caminha 5 km do trabalho para casa todo dia, o
// que já é zona 2 e em dose melhor (diária, não 3x/semana). Prescrever de novo
// no fim do treino alongava a sessão em 20 min e empurrava o jantar para as
// 20h — que é exatamente quando o jantar sai do controle. O aquecimento leve
// na esteira continua: aquecer não é a mesma coisa que dosar cardio.
```

- [ ] **Step 4: Rodar o teste novo**

Run: `npm run test -- tests/data/zona2-caminhada.test.ts`
Expected: PASS

- [ ] **Step 5: Rodar a suíte inteira e virar os testes que defendiam a zona 2**

Run: `npm run test`
Expected: FAIL em `tests/lib/session-order.test.ts`, `tests/lib/session-warmup.test.ts` e/ou `tests/data/correcoes-ciclo.test.ts`

Esses testes afirmam que a zona 2 fecha a sessão. A regra mudou, então eles mudam de lado — não se apagam. Em cada um, trocar a asserção "zona 2 é o último item" por "não há zona 2 na sessão", preservando as asserções vizinhas sobre ordem de aquecimento e ativação, que continuam válidas. Exemplo do formato:

```ts
  it("a sessão não termina mais em zona 2 — a caminhada diária assumiu esse papel", () => {
    const ids = ordenarSessao(template).map((e) => e.exerciseId);
    expect(ids).not.toContain("cardio-zona2");
  });
```

Usar o nome real da função de ordenação lida no topo do arquivo de teste em questão.

- [ ] **Step 6: Rodar a suíte até verde**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/data/cycles-seed.ts src/data/entrada-seed.ts src/data/workout-plan-seed.ts tests/
git commit -m "fix(cardio): a zona 2 sai dos treinos — a caminhada de 5 km ja entrega

O app prescrevia 15-20 min de zona 2 no fim de todo dia de inferior. Ela
caminha 5 km do trabalho para casa TODO DIA — ja e zona 2, e em dose melhor
que a prescrita (diaria, nao 3x/semana).

A prescricao duplicada alongava a sessao em 20 min e empurrava o jantar
para as 20h, que e exatamente quando o jantar sai do controle. Uma remocao
conserta tres coisas. O aquecimento leve na esteira fica.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Ciclos, plano de treino e silhueta param de esperar a TRH

**Files:**
- Modify: `src/data/cycles-seed.ts` (linhas ~7, ~301-303, ~312, ~408)
- Modify: `src/data/workout-plan-seed.ts` (linha ~17)
- Modify: `src/lib/silhouette.ts` (linha ~52)
- Test: `tests/lib/silhouette.test.ts` (existente — acrescentar) e `tests/data/templates-integridade.test.ts` (existente — acrescentar)

**Interfaces:**
- Consumes: nada novo
- Produces: `leverGuidance("superavit").why` sem menção a TRH como provisório

- [ ] **Step 1: Escrever os testes que falham**

Acrescentar a `tests/lib/silhouette.test.ts`:

```ts
import { leverGuidance } from "../../src/lib/silhouette";

describe("leverGuidance não trata a ausência de TRH como provisório", () => {
  it("o conselho de superávit explica a vigilância da cintura sem prometer hormônio", () => {
    const g = leverGuidance("superavit");
    expect(g.why).not.toMatch(/TRH/i);
    expect(g.why).toMatch(/cintura/i);
  });

  it("nenhum dos três conselhos cita TRH", () => {
    for (const meta of ["deficit", "manutencao", "superavit"] as const) {
      expect(leverGuidance(meta).why).not.toMatch(/TRH/i);
    }
  });
});
```

Acrescentar a `tests/data/templates-integridade.test.ts`:

```ts
import { CYCLES } from "../../src/data/cycles-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";

describe("nenhuma fase de treino existe para alinhar com a TRH", () => {
  it("as descrições dos ciclos não citam TRH", () => {
    const comTRH = CYCLES.filter((c) => /TRH/i.test(c.description)).map((c) => c.id);
    expect(comTRH).toEqual([]);
  });

  it("os propósitos dos templates não citam TRH", () => {
    const comTRH = ALL_TEMPLATES
      .filter((t) => /TRH/i.test(t.purpose ?? ""))
      .map((t) => t.id);
    expect(comTRH).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm run test -- tests/lib/silhouette.test.ts tests/data/templates-integridade.test.ts`
Expected: FAIL nos quatro testes novos

- [ ] **Step 3: Corrigir `src/lib/silhouette.ts`**

Trocar o ramo `superavit` de `leverGuidance`:

```ts
  if (cycleGoal === "superavit")
    return {
      focus: "quadril",
      why: "Ciclo em superávit: a alavanca é crescer quadril e glúteo. Vigie a cintura — a gordura do seu corpo se deposita na barriga, então superávit sem vigilância vira barriga em vez de bumbum. A trava dos 88 cm existe justamente por isso.",
    };
```

- [ ] **Step 4: Corrigir `src/data/cycles-seed.ts`**

Comentário de cabeçalho (~linha 7) — trocar `manutenção (segura a forma; fase ideal pra alinhar com o início da TRH)` por `manutenção (segura a forma quando o objetivo do momento é consolidar, não crescer)`.

Comentário do bloco `MAINTENANCE` (~linhas 301-303) — substituir:

```ts
// Ciclo 5 — MANUTENÇÃO — segura a forma com volume reduzido. Serve para
// consolidar depois de uma fase de crescimento, ou para atravessar um período
// em que a vida não comporta volume alto. Não é sala de espera de nada.
```

Propósito do template `m-seg-gluteo` (~linha 312):

```ts
    purpose: "Manutenção do glúteo: segura o que você construiu sem forçar — volume menor, carga mantida.",
```

Descrição do ciclo `manutencao` em `CYCLES` (~linha 408):

```ts
  { id: "manutencao", name: "Manutenção", description: "Segura a forma com volume reduzido. Para consolidar depois de crescer, ou atravessar um período apertado.", threshold: 120 },
```

- [ ] **Step 5: Corrigir `src/data/workout-plan-seed.ts`**

Linha ~17 — substituir o `purpose`:

```ts
    purpose: "Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum. É a alavanca mais forte que você tem, e responde rápido porque você está começando.",
```

- [ ] **Step 6: Rodar e confirmar que passam**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/silhouette.ts src/data/cycles-seed.ts src/data/workout-plan-seed.ts tests/
git commit -m "feat(ciclos): nenhuma fase de treino existe para alinhar com a TRH

O ciclo de manutencao se descrevia como 'fase ideal pra alinhar com o
inicio da TRH', o template de gluteo prometia 'a fundacao que a TRH vai
arredondar depois', e a Silhueta explicava o limite do superavit como
provisorio. Tres lugares vendendo a mesma espera.

Manutencao passa a ser o que ela e: consolidar depois de crescer, ou
atravessar um periodo apertado.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Marcos com os números novos

**Files:**
- Modify: `src/data/milestones-seed.ts` (`BODY_GOAL_MILESTONES`, linhas 57-100; o marco de TRH em `MILESTONES` linha 43 perde a data implícita de sequência)
- Test: `tests/data/milestones-objetivo.test.ts` (novo)

**Interfaces:**
- Consumes: `MARCOS_CINTURA`, `FASES`, `CONSUMO` de `src/lib/objetivo.ts`
- Produces: `BODY_GOAL_MILESTONES` com um marco por entrada de `MARCOS_CINTURA`

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/milestones-objetivo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { BODY_GOAL_MILESTONES } from "../../src/data/milestones-seed";
import { MARCOS_CINTURA, FASES } from "../../src/lib/objetivo";

const texto = JSON.stringify(BODY_GOAL_MILESTONES);

describe("marcos do objetivo", () => {
  it("existe um marco para cada trava de cintura", () => {
    for (const m of MARCOS_CINTURA) {
      expect(texto).toContain(String(m.cinturaCm));
    }
  });

  it("nenhum marco existe para alinhar com a TRH", () => {
    expect(texto).not.toMatch(/TRH/i);
  });

  it("avisa que na fase 2 a balança sobe de propósito", () => {
    expect(texto).toMatch(/sobe/i);
    expect(texto).toContain(String(FASES[1].pesoKgMin));
  });

  it("as calorias citadas são as novas (2.300), não as antigas (2.200)", () => {
    expect(texto).not.toContain("2.200");
    expect(texto).toMatch(/2\.?300/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/milestones-objetivo.test.ts`
Expected: FAIL — o marco da linha 96 cita TRH e a linha 62 cita 2.200 kcal

- [ ] **Step 3: Implementar**

Substituir integralmente `BODY_GOAL_MILESTONES` em `src/data/milestones-seed.ts`:

```ts
// Roadmap do objetivo físico. Os números vêm de src/lib/objetivo.ts — este
// arquivo NARRA, não decide. Se um número mudar lá, muda aqui.
export const BODY_GOAL_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "◆Fase 1 — Tirar a barriga (início)",
    category: "fisico",
    notes: "2.300 kcal, 150-160 g de proteína e treino glúteo-prioritário. A cintura é o problema inteiro: hoje ela é o ponto mais largo do seu tronco. Destreinada com ~28% de gordura é a configuração que responde mais rápido que existe — dá para perder gordura e ganhar músculo ao mesmo tempo, e essa janela fecha.",
  },
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "▣Foto de partida (frente / lado / costas)",
    category: "fisico",
    notes: "Mesma luz, mesma roupa justa, mesmo horário. É a base de comparação, e vale mais que a fita: o quadril vai cair e voltar ao mesmo número feito de outra coisa. Repetir a cada 8-12 semanas.",
  },
  {
    datePlanned: isoFromMonthsFromNow(2),
    title: "▣Check-in 8-10 semanas — a primeira mudança visível",
    category: "fisico",
    notes: "É por volta daqui que a foto começa a mostrar diferença. Se não mostrar, o problema é adesão, não o plano — revise as 16h e o jantar antes de mexer em qualquer outra coisa.",
  },
  {
    datePlanned: isoFromMonthsFromNow(4),
    title: "▱Cintura 88 — destrava o superávit",
    category: "fisico",
    notes: "88 cm é a trava do app (CINTURA_LIBERA_SUPERAVIT_CM). Abaixo dela, comer a mais vira glúteo; acima, vira barriga. Partida: 99 cm.",
  },
  {
    datePlanned: isoFromMonthsFromNow(7),
    title: "▱Cintura 84 — a silhueta vira",
    category: "fisico",
    notes: "Fim da fase 1: peso por volta de 81 kg, cintura 84, razão cintura÷quadril em ~0,79. Não é o fim do caminho — é o ponto em que roupa justa passa a fazer o que você quer.",
  },
  {
    datePlanned: isoFromMonthsFromNow(8),
    title: "◆Fase 2 — Construir glúteo (a balança SOBE)",
    category: "fisico",
    notes: "Daqui em diante o peso sobe de propósito, de ~81 para 85-88 kg. Ver 85 kg nesta fase é o sinal de que deu certo, não de que falhou. O quadril volta aos 114-116 cm — o mesmo número de hoje, feito de músculo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(18),
    title: "▣Check-in 18 meses — comparar com a foto de partida",
    category: "fisico",
    notes: "Aqui a comparação por foto entrega o que a fita não consegue mostrar. Razão-alvo do fim da fase 2: 0,75-0,78 provável, 0,72-0,74 com execução muito boa.",
  },
];
```

Em `MILESTONES` (linha ~43), o marco do endocrinologista continua existindo, mas perde a moldura de sequência agendada. Substituir `notes`:

```ts
    notes: "Sem data marcada — é conversa para ter quando você quiser ter, não etapa do plano. Vale saber o caminho (preservação de fertilidade primeiro, depois hormônio) e o que cada escolha custa. Ginecologista/urologista pode entrar antes do endócrino.",
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/data/milestones-objetivo.test.ts`
Expected: PASS

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npm run test`
Expected: PASS. Se `tests/data/milestones-voice.test.ts` quebrar por contagem de marcos, ajustar o número esperado.

- [ ] **Step 6: Commit**

```bash
git add src/data/milestones-seed.ts tests/data/milestones-objetivo.test.ts
git commit -m "feat(marcos): os marcos passam a ter os numeros reais e prazos

Entram cintura 88 (mes 3-4, a trava do superavit) e cintura 84 (mes 6-8,
quando a silhueta vira). Sai a 'Fase 5 — Manutencao + alinhar com inicio
da TRH', e sai o deficit de 2.200 kcal, que estava calculado sem saber que
ela caminha 5 km por dia.

O marco da fase 2 avisa em voz alta que a balanca sobe de proposito: ver
85 kg naquela fase e o sinal de que deu certo.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: A rotina bate com o dia real

O dia real é: 16h sai do trabalho → 5 km a pé até ~17h → 1h de cães → treino → jantar. O app não sabia da caminhada e marcava o treino às 17:45, quando ela ainda está com os cachorros.

**Files:**
- Modify: `src/lib/today-routine.ts`
- Test: `tests/lib/today-routine-dia-real.test.ts` (novo)

**Interfaces:**
- Consumes: tipos `RoutineItem`, `RoutineBlockGroup` do próprio módulo
- Produces: item `caminhada-trabalho` (`control: "walk"`, `defaultTime: "16:00"`), presente só de segunda a sexta

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/lib/today-routine-dia-real.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itensDe = (dow: number) => buildDayRoutine(dow, 2).blocks.flatMap((b) => b.items);
const acha = (dow: number, id: string) => itensDe(dow).find((i) => i.id === id);

describe("a caminhada de 5 km do trabalho para casa", () => {
  it("existe de segunda a sexta", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      expect(acha(dow, "caminhada-trabalho")).toBeDefined();
    }
  });

  it("não existe no fim de semana — não há trabalho de onde voltar", () => {
    for (const dow of [0, 6]) {
      expect(acha(dow, "caminhada-trabalho")).toBeUndefined();
    }
  });

  it("conta como movimento do dia", () => {
    expect(acha(1, "caminhada-trabalho")!.control).toBe("walk");
  });

  it("começa às 16h, quando ela sai do trabalho", () => {
    expect(acha(1, "caminhada-trabalho")!.defaultTime).toBe("16:00");
  });

  it("leva à prescrição de zona 2, que saiu do treino e mora aqui agora", () => {
    expect(acha(1, "caminhada-trabalho")!.to).toContain("cardio-zona2");
  });
});

describe("horários da tarde batem com o dia real", () => {
  it("o lanche é às 15:30, comido na mesa antes de sair", () => {
    expect(acha(1, "lanche-saida")!.defaultTime).toBe("15:30");
  });

  it("no fim de semana o lanche continua às 16h — não há saída do trabalho", () => {
    expect(acha(6, "lanche-saida")!.defaultTime).toBe("16:00");
  });

  it("os cães são às 17:15, depois da caminhada", () => {
    expect(acha(1, "caes")!.defaultTime).toBe("17:15");
  });

  it("o treino é às 18:15, depois dos cães", () => {
    expect(acha(1, "treino")!.defaultTime).toBe("18:15");
  });

  it("o jantar é às 19:30", () => {
    expect(acha(1, "jantar")!.defaultTime).toBe("19:30");
  });

  it("a tarde de semana está em ordem cronológica", () => {
    const tarde = buildDayRoutine(1, 2).blocks.find((b) => b.id === "tarde")!;
    const horas = tarde.items.map((i) => i.defaultTime).filter(Boolean) as string[];
    expect([...horas]).toEqual([...horas].sort());
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/lib/today-routine-dia-real.test.ts`
Expected: FAIL — `caminhada-trabalho` não existe

- [ ] **Step 3: Implementar em `src/lib/today-routine.ts`**

Adicionar a constante, perto de `caes`:

```ts
/** A caminhada de 5 km do trabalho para casa, todos os dias úteis. São ~370
 *  kcal/dia que o app não contava, e é ela que empurra todo o resto da tarde.
 *  `to` aponta para o exercício de zona 2 porque a prescrição (tempo, ritmo,
 *  teste da conversa) saiu do fim do treino e passou a valer aqui — ver o
 *  comentário no topo de cycles-seed.ts. */
const CAMINHADA_TRABALHO: RoutineItem = {
  id: "caminhada-trabalho",
  block: "tarde",
  label: "Caminhada do trabalho para casa · 5 km",
  subtitle: "~1h em zona 2 — é ela que substitui o cardio do fim do treino",
  control: "walk",
  to: "/treino/exercicio/cardio-zona2",
  defaultTime: "16:00",
};
```

Em `lanche(dia)`, o horário passa a depender do tipo de dia — 15:30 na semana (comido na mesa, antes de encarar 5 km depois de 4h sem comer), 16:00 no fim de semana:

```ts
function lanche(dia: TipoDeDia): RoutineItem {
  const base = {
    id: "lanche-saida",
    block: "tarde",
    control: "recipe",
    mealType: "lanche",
    defaultTime: dia === "semana" ? "15:30" : "16:00",
  } as const;
```

Em `caes(dia)`, o horário de semana vai de `"16:40"` para `"17:15"`:

```ts
    defaultTime: fimDeSemana ? "18:15" : "17:15",
```

Em `tardeSemana()`, a caminhada entra antes dos cães e o treino muda de horário:

```ts
function tardeSemana(): RoutineItem[] {
  return [
    CAMINHADA_TRABALHO,
    caes("semana"),
    { id: "treino", block: "tarde", label: "Treino do dia", subtitle: "Sem cardio no fim — a caminhada das 16h já cobriu", to: "/treino", control: "link", linkKey: "workout", defaultTime: "18:15" },
  ];
}
```

Em `NOITE`, o jantar vai para 19:30:

```ts
  { id: "jantar", block: "noite", label: "Jantar (pós-treino)", subtitle: "Toque para ver a receita — deixe pronto de manhã, decidir com fome às 20h nunca dá certo", control: "recipe", mealType: "jantar", defaultTime: "19:30" },
```

Atualizar o subtítulo de `caes("semana")`, que hoje diz que o passeio "não substitui os 15-20 min contínuos de zona 2 no fim do treino" — essa frase deixou de ser verdade:

```ts
  return { ...base, subtitle: "NEAT — lento, com paradas; é o movimento fácil que soma em cima da caminhada das 16h" };
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test -- tests/lib/today-routine-dia-real.test.ts`
Expected: PASS

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npm run test`
Expected: possíveis falhas em `tests/lib/rotina-fim-de-semana.test.ts` e `tests/lib/routine-times.test.ts`, que contam itens ou afirmam horários. Ajustar as contagens e horários esperados — a regra mudou, os testes acompanham.

- [ ] **Step 6: Conferir na tela**

Run: `npm run dev`, abrir `/` num dia útil e confirmar: a caminhada aparece no bloco "Saída", o contador de movimento soma nela, e a ordem cronológica da tarde é caminhada → cães → treino.

- [ ] **Step 7: Commit**

```bash
git add src/lib/today-routine.ts tests/
git commit -m "feat(rotina): o dia da tela passa a ser o dia real dela

O app nao sabia que ela caminha 5 km do trabalho para casa todo dia. Por
isso marcava o lanche as 16h (a hora exata em que ela levanta da cadeira,
depois de 4h sem comer e antes de andar 5 km) e o treino as 17:45, quando
ela ainda esta com os cachorros.

Agora: lanche 15:30 comido na mesa, caminhada 16:00, caes 17:15, treino
18:15, jantar 19:30. A caminhada conta no movimento do dia e leva a
prescricao de zona 2, que saiu do fim do treino e mora nela.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Varredura final — a linguagem de espera não volta

**Files:**
- Modify: `src/pages/path/FertilityTRH.tsx`
- Modify: `src/data/estilo-discreto-seed.ts`
- Test: `tests/data/sem-trh-agendada.test.ts` (novo)
- Modify: `tests/pages/lacunas.test.tsx` (cita TRH — conferir se ainda vale)

**Interfaces:**
- Consumes: todo `src/**/*.{ts,tsx}` como texto cru, via `import.meta.glob`
- Produces: rede de proteção permanente contra a volta das frases proibidas

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/data/sem-trh-agendada.test.ts`:

```ts
import { describe, it, expect } from "vitest";

// Varre o código-fonte como TEXTO — pega comentário, copy de seed e JSX igual.
// A regra vale para o repositório inteiro, não para um arquivo específico.
const FONTES = import.meta.glob("../../src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PROIBIDOS: { re: RegExp; porque: string }[] = [
  { re: /in[íi]cio da TRH/i, porque: "a TRH não tem data — não existe 'início' a que se referir" },
  { re: /alinhar com [^.]{0,25}TRH/i, porque: "nenhuma fase existe para alinhar com a TRH" },
  { re: /enquanto a TRH n[ãa]o/i, porque: "linguagem de sala de espera" },
  { re: /quando a TRH (come[çc]ar|entrar)/i, porque: "trata a TRH como evento futuro certo" },
  { re: /a TRH vai /i, porque: "promessa sobre o que a TRH fará" },
  { re: /passar despercebid/i, porque: "estilo público é escolha declarada, não camuflagem forçada" },
];

describe("nenhum lugar do app trata a TRH como etapa agendada", () => {
  for (const { re, porque } of PROIBIDOS) {
    it(`não usa /${re.source}/ — ${porque}`, () => {
      const culpados = Object.entries(FONTES)
        .filter(([, texto]) => re.test(texto))
        .map(([caminho]) => caminho.replace("../../", ""));
      expect(culpados).toEqual([]);
    });
  }
});

describe("a varredura realmente lê os arquivos", () => {
  it("carregou um número plausível de fontes", () => {
    expect(Object.keys(FONTES).length).toBeGreaterThan(100);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/sem-trh-agendada.test.ts`
Expected: FAIL apontando `src/pages/path/FertilityTRH.tsx` e `src/data/estilo-discreto-seed.ts`

- [ ] **Step 3: Corrigir `src/pages/path/FertilityTRH.tsx`**

Na seção `por-que-adiar`, trocar o título para `"Fertilidade e hormônio — as duas escolhas"` e substituir a tip que diz "Enquanto a TRH não começa…" por:

```ts
      "Sua feminização não depende de hormônio para acontecer: ela vem do treino (glúteo e cintura), da pele, do cabelo, da voz, do movimento e do estilo — tudo que o app já cuida, hoje, sem data marcada para nada.",
```

Na seção `o-que-esperar`, trocar o título para `"O que o hormônio faria, se um dia você quiser"` e substituir a tip que promete "A TRH é a maior alavanca da forma — mas ela PEGA O QUE VOCÊ JÁ CONSTRUIU…" por:

```ts
      "Hormonizar tem um custo que ninguém te conta: reduz ereção, firmeza, libido e a velocidade de ganho muscular. Metade do que você quer — durar, ficar dura, penetrar sua noiva, ter força para levantar ela — depende da testosterona que você tem hoje. Não é uma espera: é uma escolha entre dois conjuntos de coisas que você quer.",
```

- [ ] **Step 4: Corrigir `src/data/estilo-discreto-seed.ts`**

No `intro` da seção `escada`, deixar explícito que os níveis são modos escolhidos:

```ts
    intro: "Três modos, três contextos, todos escolhidos por você: masculina em público, feminina em casa, safada na intimidade. Sobe e desce de degrau quando quiser — nenhum deles é derrota nem estação de passagem.",
```

Trocar o rótulo do Nível 1, hoje `"Nível 1 (ninguém percebe)"`, por `"Nível 1 (leitura neutra — o que você usa no trabalho por escolha)"`. Ajustar qualquer outra ocorrência apontada pelo teste.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm run test -- tests/data/sem-trh-agendada.test.ts`
Expected: PASS

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm run test`
Expected: PASS. Conferir `tests/pages/lacunas.test.tsx`, que cita TRH — se afirmar a existência de texto agora removido, atualizar.

- [ ] **Step 7: Build limpo**

Run: `npm run build`
Expected: sucesso, sem erro de TypeScript.

- [ ] **Step 8: Commit**

```bash
git add src/pages/path/FertilityTRH.tsx src/data/estilo-discreto-seed.ts tests/
git commit -m "feat(tom): a linguagem de espera sai, e um teste impede que volte

A pagina de fertilidade dizia 'enquanto a TRH nao comeca' e prometia que
'a TRH pega o que voce ja construiu'. Agora ela nomeia o custo real de
hormonizar — ereçao, firmeza, libido e velocidade de ganho — que e
exatamente metade do que ela quer.

O estilo publico deixa de ser 'passar despercebido' e passa a ser um dos
tres modos que ela escolhe.

O teste varre src/ inteiro como texto cru, entao comentario, copy de seed
e JSX caem na mesma rede.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Self-review

**Cobertura do spec:**

| Requisito do spec | Task |
|---|---|
| Números do objetivo em fonte única | 2 |
| Fase 2 sobe a balança, quadril volta a 114 | 2, 3, 6 |
| Faixa dupla de WHR | 2, 3 |
| TRH fora do caminho crítico | 3, 5, 6, 8 |
| Duas trilhas (vestida × cama) | 3 |
| BBL com as três verdades | 3 |
| Prazos reais (semana 8-10, mês 3-4, 6-8) | 3, 6 |
| Caminhada de 5 km + horários 15:30/18:15/19:30 | 7 |
| Zona 2 fora dos dias de perna | 4 |
| 2.300 kcal, 150-160 g de proteína, 250 discricionárias | 2, 6 |
| Tom sem amenização, três modos de estilo | 8 |
| `.gitignore` com `*.png` | 1 |
| `CINTURA_LIBERA_SUPERAVIT_CM = 88` intocado | — (nenhuma task altera) |
| Medidas de 13/05 no banco (item aberto do spec) | 1 |

**Consistência de tipos:** `FaseObjetivo` e `MarcoCintura` são definidos na Task 2 e consumidos nas Tasks 3 e 6 com os mesmos nomes de campo (`cinturaCm`, `quadrilCm`, `pesoKgMin`, `pesoKgMax`, `whrProvavel`, `whrExcelente`, `mesMin`, `mesMax`). `seedMedidasPartida` é definida e consumida só na Task 1.

**Risco conhecido:** a Task 1 grava um objeto em `db.measurements` cujos campos precisam bater com a interface `Measurement` de `src/lib/db.ts`. Só três campos foram confirmados por leitura (`shouldersCm`, `waistCm`, `hipCm`); o Step 3 manda conferir os demais no schema e remover os que não existirem, em vez de inventar.

---

### Task 9: O plano alimentar de déficit passa a valer 2.300 kcal

Acrescentada em 2026-08-11, durante a execução. A Task 6 escreveu **2.300 kcal** nos marcos, mas `src/data/meal-plan-seed.ts` tem comida real somando **2.200** — o número que foi calculado sem saber que ela caminha 5 km por dia. Duas metas calóricas em telas diferentes é exatamente o defeito que esta frente existe para eliminar.

Isto **não** é a reforma de comida da frente 5 (tirar ultraprocessado, receita preguiçosa de Aracaju). Aqui só se recalibra a quantidade.

**Files:**
- Modify: `src/data/meal-plan-seed.ts` (`INITIAL_PLAN` e os slots do plano de déficit)
- Modify: `src/lib/objetivo.ts` (só comentário: proteína é piso, não teto)
- Test: `tests/data/meal-plan-coerencia.test.ts` (novo)

**Interfaces:**
- Consumes: `CONSUMO` de `src/lib/objetivo.ts` (`metaKcal: 2300`, `proteinaGMin: 150`, `proteinaGMax: 160`, `discricionariaKcal: 250`)
- Produces: plano de déficit com `kcalDaily` igual a `CONSUMO.metaKcal`

- [ ] **Step 1: Medir antes de mexer**

Somar, por variante 0 de cada slot, `kcal` e `proteinG` dos `foods`, e comparar com `targetKcal` do slot e com `kcalDaily`/`proteinG` declarados em `INITIAL_PLAN` (hoje 2200 / 180).

Registrar a tabela no relatório. Sem essa medição não dá para saber se o plano já era coerente consigo mesmo antes da mudança — e se não era, isso é um defeito anterior que precisa aparecer.

- [ ] **Step 2: Escrever o teste que falha**

Criar `tests/data/meal-plan-coerencia.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { CONSUMO } from "../../src/lib/objetivo";

const somaDaVariante0 = (plan: (typeof ALL_MEAL_PLANS)[number]) =>
  plan.slots.reduce(
    (acc, slot) => {
      const foods = slot.variants[0]?.foods ?? [];
      return {
        kcal: acc.kcal + foods.reduce((s, f) => s + (f.kcal ?? 0), 0),
        proteinG: acc.proteinG + foods.reduce((s, f) => s + (f.proteinG ?? 0), 0),
      };
    },
    { kcal: 0, proteinG: 0 },
  );

describe("plano de déficit bate com a meta declarada em objetivo.ts", () => {
  const deficit = ALL_MEAL_PLANS.find((p) => p.goal === "deficit")!;

  it("a meta declarada do plano é a meta do módulo de objetivo", () => {
    expect(deficit.kcalDaily).toBe(CONSUMO.metaKcal);
  });

  it("a comida de verdade soma a meta declarada, com 5% de tolerância", () => {
    const { kcal } = somaDaVariante0(deficit);
    const desvio = Math.abs(kcal - deficit.kcalDaily) / deficit.kcalDaily;
    expect({ kcal, alvo: deficit.kcalDaily, dentroDe5pct: desvio <= 0.05 })
      .toMatchObject({ dentroDe5pct: true });
  });

  it("a proteína entregue respeita o piso — exceder é bom, ficar abaixo não", () => {
    const { proteinG } = somaDaVariante0(deficit);
    expect(proteinG).toBeGreaterThanOrEqual(CONSUMO.proteinaGMin);
  });

  it("o nome do plano não contradiz o número", () => {
    expect(deficit.name).not.toContain("2200");
    expect(deficit.name).toContain(String(CONSUMO.metaKcal));
  });
});
```

- [ ] **Step 3: Rodar e confirmar que falha**

Run: `npm run test -- tests/data/meal-plan-coerencia.test.ts`
Expected: FAIL — `kcalDaily` é 2200, nome diz "2200 kcal"

- [ ] **Step 4: Recalibrar**

Subir ~100 kcal distribuídas nos slots, ajustando **quantidades de alimentos que já existem** — não introduzir alimento novo, que é escopo da frente 5. Preferir aumentar fonte de proteína ou carboidrato de verdade (ovo, whey, arroz, macaxeira, fruta) a aumentar gordura.

Atualizar em `INITIAL_PLAN`:

```ts
  name: "Plano padrão · emagrecimento (2300 kcal)",
  kcalDaily: 2300,
```

Ajustar `proteinG`, `carbG` e `fatG` declarados para bater com a soma real depois do ajuste, e os `targetKcal` dos slots que mudarem.

- [ ] **Step 5: Proteína é piso, não teto**

O plano entrega 180 g de proteína e `CONSUMO.proteinaGMax` é 160. Isso não é erro nutricional — proteína alta em déficit protege músculo. É erro de modelagem: a faixa está escrita como se 160 fosse um limite.

Em `src/lib/objetivo.ts`, **só no comentário** dos campos de proteína, registrar que a faixa é **alvo mínimo**, que exceder é desejável em déficit, e que por isso o teste do plano assevera piso e não intervalo. Não alterar valor nenhum.

- [ ] **Step 6: Rodar tudo**

Run: `npm run test -- tests/data/meal-plan-coerencia.test.ts` → PASS
Run: `npm run test` → PASS. Se `tests/data/meal-plan-seed.test.ts`, `tests/lib/phase-nutrition.test.ts` ou `tests/lib/diet-export.test.ts` quebrarem por número fixo, ler cada um antes de editar: o teste de `phase-nutrition` assevera que déficit < manutenção < superávit, e 2300 < 2450 continua verdadeiro.

- [ ] **Step 7: Registrar a dívida dos outros dois planos**

Manutenção (2.450) e superávit (2.700) foram calculados contra um gasto estimado de ~2.700. Com a caminhada contada, o gasto real é 2.900–3.100 — o plano chamado "manutenção" é na verdade um déficit de ~550 kcal.

**Não recalibrar aqui.** Ela só usa esses planos depois da cintura chegar a 88 (mês 3–4), e a frente 5 vai reconstruir as refeições de qualquer jeito. Acrescentar um comentário em `meal-plan-seed.ts`, acima dos dois planos, registrando o número, o porquê e que a recalibração é da frente 5 — dívida escrita é dívida que alguém paga; dívida silenciosa vira mentira.

- [ ] **Step 8: Commit**

```bash
git add src/data/meal-plan-seed.ts src/lib/objetivo.ts tests/data/meal-plan-coerencia.test.ts
git commit -m "feat(comida): o plano de deficit passa a valer 2.300 kcal

Os marcos ja diziam 2.300 e o prato somava 2.200 — o numero antigo foi
calculado sem saber que ela caminha 5 km do trabalho pra casa todo dia.

O teste novo amarra as duas pontas: a meta declarada do plano tem que ser
a do modulo de objetivo, e a comida de verdade tem que somar essa meta.
Proteina passa a ser piso explicito, nao teto — exceder em deficit protege
musculo.

Manutencao e superavit ficam registrados como divida da frente 5: com a
caminhada contada, 2.450 nao e manutencao, e um deficit de ~550.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

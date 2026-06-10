# Onda Treino/Equipamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar o pilar Treino com o equipamento real da academia (polia, espaldar, bola, step), refinar o trabalho de busto, adicionar peso sugerido inicial e dicas pra maximizar resultado — tudo sem apagar histórico e sem tela nova.

**Architecture:** Update de conteúdo via seeds do IndexedDB (Dexie), com re-seed idempotente por versão. Dois campos opcionais novos em `Exercise` (`startLoadKg`, `proTips`) surfaçados em 3 telas existentes. Sem migração de schema.

**Tech Stack:** React + TypeScript + Vite, Dexie.js (IndexedDB), Tailwind, Vitest.

Spec: `docs/superpowers/specs/2026-06-10-onda-treino-equipamento-design.md`

---

## File Structure

- `src/lib/db.ts` — interface `Exercise`: adiciona `startLoadKg?: number` e `proTips?: string[]`.
- `src/data/exercises-seed.ts` — +12 exercícios; `proTips` em todos; `startLoadKg` nos com carga.
- `src/data/workout-plan-seed.ts` — trocas nos 5 templates do ciclo `adaptacao`.
- `src/lib/seed.ts` — bump `EXERCISE_SEED_VERSION` 3→4 e `TEMPLATE_SEED_VERSION` 2→3.
- `src/components/SessionRecorder.tsx` — sugestão inicial via `startLoadKg`; rótulo "Peso corporal".
- `src/components/ExerciseInfoModal.tsx` — seção "Dicas pra maximizar".
- `src/pages/workout/ExerciseDetail.tsx` — seção "Dicas pra maximizar".
- `tests/lib/seed.test.ts` — invariantes de conteúdo (proTips, startLoadKg, ids dos templates).

---

## Task 1: Campos novos no tipo Exercise

**Files:**
- Modify: `src/lib/db.ts:30-43`

- [ ] **Step 1: Adicionar os campos opcionais**

Em `src/lib/db.ts`, na interface `Exercise`, depois de `exposureLevel`:

```ts
export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  difficulty: "iniciante" | "intermediario" | "avancado";
  videoUrl?: string;
  gifPath?: string;
  description: string;
  commonMistakes: string[];
  easierVariation?: string;
  harderVariation?: string;
  exposureLevel: 1 | 2 | 3 | 4 | 5;
  startLoadKg?: number; // peso sugerido inicial (só exercícios com carga externa)
  proTips?: string[]; // dicas pra maximizar resultado
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos (campos opcionais não quebram nada existente).

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat(treino): campos startLoadKg e proTips no tipo Exercise"
```

---

## Task 2: Testes de invariantes de conteúdo (falham primeiro)

**Files:**
- Modify: `tests/lib/seed.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao `describe("seedDatabase", ...)` em `tests/lib/seed.test.ts`:

```ts
  it("todo exercício tem proTips não-vazio", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    for (const ex of exercises) {
      expect(Array.isArray(ex.proTips), `${ex.id} sem proTips`).toBe(true);
      expect((ex.proTips ?? []).length, `${ex.id} proTips vazio`).toBeGreaterThan(0);
    }
  });

  it("exercícios com carga têm startLoadKg > 0 e os de peso corporal não têm", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    const loaded = ["halteres", "halter", "barra", "anilhas", "polia", "step",
      "maquina-abdutor", "maquina-adutor", "maquina-remada", "maquina-puxada",
      "maquina-voador", "leg-press", "caneleira"];
    for (const ex of exercises) {
      const hasLoad = ex.equipment.some((e) => loaded.includes(e));
      if (hasLoad) {
        expect(ex.startLoadKg, `${ex.id} deveria ter startLoadKg`).toBeGreaterThan(0);
      } else {
        expect(ex.startLoadKg, `${ex.id} não deveria ter startLoadKg`).toBeUndefined();
      }
    }
  });

  it("todo exerciseId dos templates existe na biblioteca", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    const ids = new Set(exercises.map((e) => e.id));
    const templates = await db.workoutTemplates.toArray();
    for (const tpl of templates) {
      for (const te of tpl.exercises) {
        expect(ids.has(te.exerciseId), `template ${tpl.id} → ${te.exerciseId} inexistente`).toBe(true);
      }
    }
  });

  it("contém os 12 exercícios novos da onda", async () => {
    await seedDatabase();
    const ids = new Set((await db.exercises.toArray()).map((e) => e.id));
    const novos = [
      "coice-gluteo-polia", "pull-through-polia", "abducao-quadril-polia",
      "crucifixo-polia", "face-pull-polia", "voador-maquina",
      "along-isquios-espaldar", "abertura-quadril-espaldar",
      "agachamento-assistido-espaldar", "espacate-progressao",
      "ponte-gluteo-bola", "step-up-gluteo",
    ];
    for (const id of novos) expect(ids.has(id), `falta ${id}`).toBe(true);
  });
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- seed`
Expected: FAIL (proTips ausente, startLoadKg ausente, ids novos faltando).

- [ ] **Step 3: Commit dos testes**

```bash
git add tests/lib/seed.test.ts
git commit -m "test(treino): invariantes de proTips, startLoadKg e ids dos templates"
```

---

## Task 3: 12 exercícios novos no seed

**Files:**
- Modify: `src/data/exercises-seed.ts` (acrescentar ao fim do array `EXERCISES`, antes do `];`)

- [ ] **Step 1: Adicionar os 12 objetos**

```ts
  // === ONDA EQUIPAMENTO: POLIA ===
  {
    id: "coice-gluteo-polia",
    name: "Coice de glúteo na polia baixa",
    category: "gluteo",
    equipment: ["polia", "caneleira"],
    difficulty: "iniciante",
    description: "Tornozeleira clipada no mosquetão da polia baixa. Em pé de frente pra máquina, leve inclinação do tronco, mãos apoiadas. Leva a perna pra trás esticada (extensão de quadril) apertando o glúteo no topo. Controla a volta sem deixar a anilha bater. 12-15 cada perna.",
    commonMistakes: ["Arquear a lombar pra subir mais", "Girar o quadril pra fora", "Deixar a pilha bater (perde tensão)"],
    easierVariation: "Coice em pé com caneleira (sem polia)",
    harderVariation: "Pausa de 1s no topo + cadência lenta na volta",
    exposureLevel: 3,
    startLoadKg: 5,
    proTips: [
      "Tensão constante da polia > caneleira: vá devagar na volta pra sentir o glúteo segurando",
      "Imagina empurrar uma parede atrás de você com o calcanhar",
      "Tronco firme — quem se move é só o quadril, não a lombar",
    ],
  },
  {
    id: "pull-through-polia",
    name: "Pull-through na polia",
    category: "gluteo",
    equipment: ["polia"],
    difficulty: "intermediario",
    description: "De costas pra polia baixa, corda/puxador entre as pernas. Pés afastados, joelhos levemente flexionados. Empurra o quadril pra trás (dobradiça de quadril) descendo o tronco com coluna neutra, depois volta apertando o glúteo à frente. 12-15 reps.",
    commonMistakes: ["Agachar em vez de empurrar o quadril pra trás", "Curvar a lombar", "Usar os braços pra puxar (são só ganchos)"],
    easierVariation: "Stiff com halteres",
    harderVariation: "Pausa de 1-2s no alongamento",
    exposureLevel: 3,
    startLoadKg: 10,
    proTips: [
      "É dobradiça de quadril, não agachamento: o movimento é pra TRÁS, não pra baixo",
      "Os braços só seguram a corda — a força vem do glúteo e do posterior",
      "Termina apertando o glúteo e fechando a costela, sem estourar a lombar",
    ],
  },
  {
    id: "abducao-quadril-polia",
    name: "Abdução de quadril na polia",
    category: "gluteo",
    equipment: ["polia", "caneleira"],
    difficulty: "iniciante",
    description: "Tornozeleira na polia baixa, de lado pra máquina (a perna de fora trabalha). Mão apoiada pra equilíbrio. Abre a perna lateralmente contra o cabo o máximo sem inclinar o tronco. Controla a volta. Glúteo médio. 12-15 cada perna.",
    commonMistakes: ["Inclinar o tronco pro lado oposto", "Levar a perna pra frente em vez de pro lado", "Impulso em vez de controle"],
    easierVariation: "Abdução em pé com caneleira",
    harderVariation: "Pausa de 1s no topo da abertura",
    exposureLevel: 2,
    startLoadKg: 5,
    proTips: [
      "Glúteo médio é o que arredonda a lateral do quadril — capricha aqui",
      "Movimento pequeno e limpo vale mais que jogar a perna alto",
      "Mantém a ponta do pé apontando pra frente (não pra cima)",
    ],
  },
  // === ONDA EQUIPAMENTO: BUSTO / POSTURA ===
  {
    id: "crucifixo-polia",
    name: "Crucifixo na polia (de baixo pra cima)",
    category: "peitoral",
    equipment: ["polia"],
    difficulty: "iniciante",
    description: "Puxadores nas polias baixas (ou uma de cada vez). Em pé, leve inclinação à frente, braços levemente flexionados. Junta as mãos num arco subindo até a altura do peito, apertando o centro do peito (linha do colo). CARGA LEVE, 12-15 reps.",
    commonMistakes: ["Carga pesada (queremos tônus, não volume quadrado)", "Dobrar os cotovelos e virar press", "Subir os ombros pra orelha"],
    easierVariation: "Crucifixo inclinado com halteres leves",
    harderVariation: "Pausa de 1s apertando o centro",
    exposureLevel: 2,
    startLoadKg: 3,
    proTips: [
      "Foco na LINHA do colo: imagina abraçar um barril e apertar no meio",
      "Leve e lento — peito feminino redondo, nunca peitoral de placa",
      "De baixo pra cima recruta a parte de cima do peito, que dá a 'prateleira'",
    ],
  },
  {
    id: "face-pull-polia",
    name: "Face pull na polia",
    category: "postura",
    equipment: ["polia"],
    difficulty: "iniciante",
    description: "Corda na polia alta. Puxa em direção ao rosto/testa abrindo os cotovelos pra fora e pra cima, apertando as escápulas e girando os ombros pra trás. Postura — abre os ombros e levanta o busto. 15-20 reps, carga leve.",
    commonMistakes: ["Subir o trapézio (ombro na orelha)", "Carga pesada e balanço", "Não girar os ombros pra trás no fim"],
    easierVariation: "Crucifixo invertido com halteres leves",
    harderVariation: "Pausa de 2s na contração",
    exposureLevel: 1,
    startLoadKg: 5,
    proTips: [
      "Postura ereta + ombros pra trás faz o busto parecer mais cheio — esse é o segredo",
      "Puxa pra TESTA, não pro peito, e gira os punhos pra trás no fim",
      "Reps altas e leve: é saúde de ombro e postura, não força bruta",
    ],
  },
  {
    id: "voador-maquina",
    name: "Voador / pec deck na multiestação",
    category: "peitoral",
    equipment: ["maquina-voador"],
    difficulty: "iniciante",
    description: "Sentada na multiestação, antebraços/mãos nos apoios. Fecha os braços à frente apertando o centro do peito, controla a abertura. Desenha a linha interna do peito. CARGA LEVE, 12-15 reps.",
    commonMistakes: ["Carga pesada demais", "Estufar/curvar para ganhar amplitude com o tronco", "Soltar rápido na volta"],
    easierVariation: "Crucifixo na polia leve",
    harderVariation: "Pausa de 1-2s no fechamento",
    exposureLevel: 1,
    startLoadKg: 10,
    proTips: [
      "Aperta e segura 1s no centro — a contração é onde mora a linha do colo",
      "Leve sempre: o objetivo é redondo e macio, não quadrado",
      "Costas coladas no encosto, ombros baixos",
    ],
  },
  // === ONDA EQUIPAMENTO: FLEXIBILIDADE NO ESPALDAR ===
  {
    id: "along-isquios-espaldar",
    name: "Alongamento de isquiotibiais no espaldar",
    category: "mobilidade",
    equipment: ["espaldar"],
    difficulty: "iniciante",
    description: "Apoia um calcanhar numa barra do espaldar na altura confortável (quadril, depois mais alto com o tempo). Perna esticada, tronco à frente com coluna neutra até sentir alongar atrás da coxa. 30-60s cada perna, respirando.",
    commonMistakes: ["Curvar a lombar pra 'chegar mais longe'", "Prender a respiração", "Forçar a ponto de dor (deve puxar, não doer)"],
    harderVariation: "Subir o pé pra uma barra mais alta",
    exposureLevel: 2,
    proTips: [
      "Vai pela dobradiça do quadril (peito pra frente), não arredondando as costas",
      "Ganho de flexibilidade vem da constância: todo dia um pouco > forçar 1x",
      "Expira soltando o ar a cada vez que avança mais um pouco",
    ],
  },
  {
    id: "abertura-quadril-espaldar",
    name: "Abertura de quadril apoiada (straddle) no espaldar",
    category: "mobilidade",
    equipment: ["espaldar"],
    difficulty: "iniciante",
    description: "De frente pro espaldar, mãos segurando as barras, pernas bem afastadas e pontas dos pés pra fora. Desce o quadril controlando com os braços, abrindo a virilha. Sobe e desce no limite confortável. 8-10 descidas + 30s de pausa no fundo.",
    commonMistakes: ["Joelhos caindo pra dentro (mantém na linha dos pés)", "Forçar antes de aquecer", "Descer rápido sem controle dos braços"],
    harderVariation: "Pausa mais longa no fundo, mãos numa barra mais baixa",
    exposureLevel: 2,
    proTips: [
      "Os braços no espaldar te dão segurança pra relaxar a virilha — confia neles",
      "Mobilidade de quadril ajuda na vida e na intimidade: capricha sem pressa",
      "Aquece com a bike reclinada antes — quadril aquecido abre muito mais",
    ],
  },
  {
    id: "agachamento-assistido-espaldar",
    name: "Agachamento profundo assistido no espaldar",
    category: "mobilidade",
    equipment: ["espaldar"],
    difficulty: "iniciante",
    description: "Segura uma barra do espaldar na altura do peito, pés na largura dos ombros. Desce até o agachamento mais profundo possível usando as mãos pra controlar, mantendo calcanhares no chão. Pausa 30s-1min abrindo quadril e tornozelo. Sobe.",
    commonMistakes: ["Calcanhar levantando", "Jogar o peso todo nos braços (é apoio, não tração total)", "Curvar a lombar no fundo"],
    harderVariation: "Soltar levemente as mãos no fundo, só pra equilíbrio",
    exposureLevel: 1,
    proTips: [
      "Esse é o melhor 'destravador' de quadril pra quem passa o dia sentada",
      "No fundo, empurra os joelhos pra fora com os cotovelos pra abrir mais",
      "Respira fundo no fundo do agachamento — relaxa em vez de tensionar",
    ],
  },
  {
    id: "espacate-progressao",
    name: "Progressão de espacate apoiada",
    category: "mobilidade",
    equipment: ["espaldar", "colchonete"],
    difficulty: "intermediario",
    description: "Progressão gradual da abertura frontal (espacate). Com o espaldar ao lado pra apoio das mãos, deslize uma perna à frente e outra atrás até o limite confortável, controlando o peso nos braços. Segura 30s, troca o lado. Avança 1cm por semana, sem pressa.",
    commonMistakes: ["Querer chegar ao chão rápido (lesão)", "Quadril torto (mantém de frente)", "Pular o aquecimento"],
    easierVariation: "Avanço/afundo apoiado, sem buscar amplitude máxima",
    exposureLevel: 3,
    proTips: [
      "Espacate é maratona, não sprint: 1cm por semana e você chega sem se machucar",
      "Sempre MUITO aquecida antes — nunca tente frio",
      "Mantém o quadril 'quadrado' (apontando pra frente) pra abrir o lugar certo",
    ],
  },
  // === ONDA EQUIPAMENTO: BOLA E STEP ===
  {
    id: "ponte-gluteo-bola",
    name: "Ponte de glúteo na bola suíça",
    category: "gluteo",
    equipment: ["bola-suica"],
    difficulty: "intermediario",
    description: "Ombros/parte alta das costas apoiados na bola, pés no chão na largura do quadril, joelhos a 90°. Sobe o quadril até alinhar tronco-joelho apertando o glúteo, controla a descida. A instabilidade da bola recruta mais glúteo + core. 12-15 reps.",
    commonMistakes: ["Arquear a lombar em vez de subir pelo glúteo", "Pés muito longe/perto", "Deixar a bola escorregar (controle)"],
    easierVariation: "Ponte de glúteo no chão",
    harderVariation: "Ponte na bola com uma perna só, ou com halter na pelve",
    exposureLevel: 3,
    proTips: [
      "A bola te obriga a estabilizar — sente o core e o glúteo trabalhando juntos",
      "Aperta o glúteo no topo 1-2s, não sobe só por subir",
      "Empurra pelos calcanhares pra tirar a coxa da frente do movimento",
    ],
  },
  {
    id: "step-up-gluteo",
    name: "Step-up pra glúteo no step",
    category: "gluteo",
    equipment: ["step", "halteres"],
    difficulty: "intermediario",
    description: "Halteres nas mãos, um pé inteiro no step (quanto mais alto, mais glúteo). Sobe empurrando pelo CALCANHAR da perna de cima, sem dar impulso com a perna de baixo. Controla a descida. 10-12 cada perna.",
    commonMistakes: ["Impulsionar com a perna de trás", "Apoiar a ponta do pé (vira quadríceps)", "Step baixo demais (perde o foco no glúteo)"],
    easierVariation: "Step mais baixo ou sem halteres",
    harderVariation: "Step mais alto + pausa no topo sem encostar o outro pé",
    exposureLevel: 3,
    startLoadKg: 4,
    proTips: [
      "Empurra pelo calcanhar e pensa em 'subir com o glúteo', não com o joelho",
      "Step mais alto = mais glúteo (desde que mantenha o calcanhar apoiado)",
      "Não dá pulinho com a perna de baixo — ela só toca de leve pra equilíbrio",
    ],
  },
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/data/exercises-seed.ts
git commit -m "feat(treino): 12 exercícios novos (polia, espaldar, bola, step)"
```

---

## Task 4: proTips + startLoadKg nos exercícios existentes (~30)

**Files:**
- Modify: `src/data/exercises-seed.ts` (cada objeto existente)

`startLoadKg` por exercício existente (conservador; só os com carga). Exercícios de peso
corporal / mobilidade / dança / alongamento **não recebem** `startLoadKg`.

| id | startLoadKg |
|---|---|
| hip-thrust-barra | 20 |
| agachamento-livre | 15 |
| agachamento-goblet | 6 |
| abdutor-maquina | 15 |
| abdutor-band-em-pe | 1 |
| stiff | 8 |
| remada-curvada | 6 |
| remada-baixa-maquina | 15 |
| puxada-frente-maquina | 15 |
| face-pull | 2 |
| supino-inclinado-halteres | 4 |
| cross-over-cabo | 3 |
| ativacao-gluteo-band-walks | 1 |
| kickback-cabo | 1 |
| abdutor-cabo-em-pe | 1 |
| hip-thrust-unilateral | 6 |
| agachamento-bulgaro | 6 |
| stiff-unilateral | 5 |
| smith-squat | 20 |
| cross-over-baixo | 3 |
| adutora-maquina | 15 |
| agachamento-sumo | 8 |

**Sem `startLoadKg`** (peso corporal): ponte-gluteo-band, elevacao-pelvica-banco, prancha,
dead-bug, bird-dog, prancha-lateral, retracao-escapular, mobilidade-quadril-90-90,
alongamento-flexor-quadril, alongamento-piriforme, cat-cow, rotacao-quadril-em-pe,
rebolado-basico, isolamento-quadril-lateral, aquecimento-articular, cardio-leve-esteira,
borboleta, agachamento-profundo-pausa, happy-baby, abdutor-deitada, clamshell,
abdominal-prancha-instavel.

- [ ] **Step 1: Adicionar `proTips` (2-4 dicas) a cada exercício existente e `startLoadKg` conforme a tabela**

Escrever as dicas na voz do app (didática, calorosa, alinhada ao objetivo: glúteo
redondo, cintura fina, busto feminilizado, postura). Exemplos completos do padrão:

`hip-thrust-barra` → adicionar:
```ts
    startLoadKg: 20,
    proTips: [
      "Pausa de 1-2s apertando o glúteo lá no topo vale mais que adicionar peso",
      "Empurra pelos calcanhares, queixo pra baixo e costela fechada — protege a lombar e isola o glúteo",
      "É o maior construtor de bumbum que existe: priorize ele e seja paciente com a carga",
    ],
```

`prancha` (sem startLoadKg) → adicionar:
```ts
    proTips: [
      "Aperta glúteo e abdômen ao mesmo tempo — prancha é exercício de tensão, não de tempo",
      "Qualidade > minutos: 30s perfeitos batem 2min com quadril caído",
      "Respira normal; se começar a tremer com a forma certa, é sinal que tá funcionando",
    ],
```

`supino-inclinado-halteres` → adicionar:
```ts
    startLoadKg: 4,
    proTips: [
      "Leve e controlado: aqui a meta é a 'prateleira' do busto, não peitão masculino",
      "Inclinado joga o estímulo pra parte de cima do peito, que levanta o visual do busto",
      "Desce devagar sentindo o alongamento; sobe sem estufar os ombros",
    ],
```

Repetir o padrão pra TODOS os exercícios existentes (cada um com 2-4 dicas próprias e
coerentes com o movimento). Nenhum exercício pode ficar sem `proTips`.

- [ ] **Step 2: Rodar os testes de conteúdo**

Run: `npm test -- seed`
Expected: PASS (proTips e startLoadKg agora satisfeitos; ids novos presentes).

- [ ] **Step 3: Commit**

```bash
git add src/data/exercises-seed.ts
git commit -m "feat(treino): dicas pra maximizar + peso inicial em todos os exercícios"
```

---

## Task 5: Trocas nos templates (ciclo adaptacao)

**Files:**
- Modify: `src/data/workout-plan-seed.ts`

Aplicar conforme a seção 6 do spec. Manter ordem e contagem de blocos pra preservar ~1h.

- [ ] **Step 1: Terça (`ter-cintura-costas`) — busto**

Trocar o exercício `face-pull` por `face-pull-polia` e inserir `crucifixo-polia` logo após o supino:

```ts
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (LEVE)", restSec: 60, notes: "Base de busto — carga leve" },
      { exerciseId: "crucifixo-polia", sets: 3, repsTarget: "15 (LEVE)", restSec: 45, notes: "Linha do colo — aperta o centro" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, notes: "Postura — multiestação" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
```
(remover a linha antiga do `face-pull`; manter `dead-bug` e `prancha`).

- [ ] **Step 2: Quarta (`qua-mobilidade-danca`) — flexibilidade no espaldar**

Inserir os 3 alongamentos do espaldar logo após `alongamento-flexor-quadril`:

```ts
      { exerciseId: "agachamento-assistido-espaldar", sets: 2, repsTarget: "30-60s", restSec: 20, notes: "Destrava o quadril de quem fica sentada" },
      { exerciseId: "along-isquios-espaldar", sets: 1, repsTarget: "45s cada", restSec: 0 },
      { exerciseId: "abertura-quadril-espaldar", sets: 2, repsTarget: "8 + pausa", restSec: 20 },
```

- [ ] **Step 3: Quinta (`qui-gluteo-coxa`) — step-up**

Inserir `step-up-gluteo` após `agachamento-bulgaro`:

```ts
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "10 cada", restSec: 60, notes: "Empurra pelo calcanhar — glúteo da perna de cima" },
```

- [ ] **Step 4: Sexta (`sex-peitoral-postura`) — polia + bola**

Trocar `kickback-cabo` → `coice-gluteo-polia`; inserir `pull-through-polia`; trocar `elevacao-pelvica-banco` → `ponte-gluteo-bola`:

```ts
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15-20 (bombeamento)", restSec: 45, notes: "Reps altas, carga média — bomba de sangue no glúteo" },
      { exerciseId: "pull-through-polia", sets: 3, repsTarget: "15", restSec: 45, notes: "Dobradiça de quadril — glúteo + posterior" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo com tensão constante" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-bola", sets: 3, repsTarget: "15", restSec: 45, notes: "Instabilidade recruta mais glúteo + core" },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
```

- [ ] **Step 5: Verificar tipos e ids**

Run: `npx tsc --noEmit && npm test -- seed`
Expected: PASS (todos os `exerciseId` resolvem).

- [ ] **Step 6: Commit**

```bash
git add src/data/workout-plan-seed.ts
git commit -m "feat(treino): trocas nos treinos — polia, busto, flexibilidade, bola, step"
```

---

## Task 6: Bump das versões de seed

**Files:**
- Modify: `src/lib/seed.ts:54` e `src/lib/seed.ts:69`

- [ ] **Step 1: Bumpar as constantes**

```ts
  const EXERCISE_SEED_VERSION = 4;
```
```ts
  const TEMPLATE_SEED_VERSION = 3;
```

- [ ] **Step 2: Rodar testes de seed (idempotência)**

Run: `npm test -- seed`
Expected: PASS (não duplica; conteúdo novo presente).

- [ ] **Step 3: Commit**

```bash
git add src/lib/seed.ts
git commit -m "chore(treino): bump seed versions pra propagar conteúdo novo"
```

---

## Task 7: Peso sugerido inicial no SessionRecorder

**Files:**
- Modify: `src/components/SessionRecorder.tsx:140-148`

- [ ] **Step 1: Usar startLoadKg quando não há histórico + rótulo "Peso corporal"**

Substituir o bloco que renderiza a sugestão (linhas ~140-148) por:

```tsx
      {suggested !== null ? (
        <button
          type="button"
          onClick={applySuggestion}
          className="text-xs text-nude underline mb-3 block"
        >
          Sugestão: {suggested} kg (aplicar em todas)
        </button>
      ) : exercise.startLoadKg ? (
        <button
          type="button"
          onClick={() => setSets((prev) => prev.map((s) => ({ ...s, weight: String(exercise.startLoadKg) })))}
          className="text-xs text-nude underline mb-3 block"
        >
          Sugestão inicial: {exercise.startLoadKg} kg (aplicar em todas)
        </button>
      ) : (
        <p className="text-xs text-muted mb-3">Peso corporal</p>
      )}
```

- [ ] **Step 2: Verificar tipos e build**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/SessionRecorder.tsx
git commit -m "feat(treino): peso sugerido inicial antes de haver histórico"
```

---

## Task 8: Seção "Dicas pra maximizar" no modal e na tela de detalhe

**Files:**
- Modify: `src/components/ExerciseInfoModal.tsx` (após a seção "Erros comuns", ~linha 61)
- Modify: `src/pages/workout/ExerciseDetail.tsx` (após a seção "Erros comuns", ~linha 37)

- [ ] **Step 1: ExerciseInfoModal — adicionar a seção**

Após o `</section>` de "Erros comuns" (linha ~61):

```tsx
          {exercise.proTips && exercise.proTips.length > 0 && (
            <section>
              <h3 className="text-nude-warm font-medium mb-1">Dicas pra maximizar</h3>
              <ul className="space-y-1 text-sm list-disc pl-5">
                {exercise.proTips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          )}
```

- [ ] **Step 2: ExerciseDetail — adicionar a seção**

Após o `</div>` do card "Erros comuns" (linha ~37):

```tsx
      {ex.proTips && ex.proTips.length > 0 && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Dicas pra maximizar</h2>
          <ul className="space-y-1 text-sm list-disc pl-5">
            {ex.proTips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExerciseInfoModal.tsx src/pages/workout/ExerciseDetail.tsx
git commit -m "feat(treino): seção 'Dicas pra maximizar' no modal e no detalhe"
```

---

## Task 9: Verificação final

- [ ] **Step 1: Suíte completa + build**

Run: `npm test && npm run build`
Expected: todos os testes PASS; build sem erro.

- [ ] **Step 2: Conferência manual rápida (opcional)**

Run: `npm run dev` → abrir um treino → ver "Sugestão inicial: X kg" num exercício com
carga e "Peso corporal" num de mobilidade → abrir "como fazer" → ver "Dicas pra maximizar".

---

## Self-Review (preenchido)

- **Cobertura do spec:** §5 (12 exercícios) → Task 3; §6 (trocas) → Task 5; §6b (peso
  inicial) → Tasks 1,4,7; §6c (proTips) → Tasks 1,4,8; §7 (técnico/bump) → Tasks 1,6;
  §8 (testes) → Task 2. Sem lacunas.
- **Placeholders:** nenhum — código completo em cada step; conteúdo de proTips dos
  existentes é autoral por exercício (padrão e exemplos dados).
- **Consistência de tipos:** `startLoadKg?: number`, `proTips?: string[]` usados igual em
  db.ts, seed, recorder, modal e detalhe. ids novos batem entre Task 3, Task 5 e o teste.

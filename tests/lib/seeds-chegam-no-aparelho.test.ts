import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase, EXERCISE_SEED_VERSION, TEMPLATE_SEED_VERSION } from "../../src/lib/seed";
import { seedPath, MEAL_PLAN_VERSION } from "../../src/lib/path-seed";
import { seedStyle, STYLE_SEED_VERSION } from "../../src/lib/style-seed";
import { seedMovement, MOVEMENT_VERSION } from "../../src/lib/movement-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";

// Conteúdo de seed vive no IndexedDB, não no arquivo: sem bump de versão, texto
// corrigido no repositório nunca chega ao aparelho de quem já usa o app. Estes
// testes reconstroem o banco parado na versão anterior e cobram a chegada.
//
// QUATRO REGRAS, aprendidas em duas rodadas de revisão desta frente — os
// casos de exercício e de template passavam sem morder nenhuma delas:
//
// 1. A versão plantada tem que ser a IMEDIATAMENTE ANTERIOR à atual. Plantar a
//    versão 7 quando o código está na 9 faz o teste passar com 8 OU com 9, ou
//    seja, ele não distingue "o bump aconteceu" de "o bump foi esquecido".
// 2. A asserção tem que ser sobre conteúdo que só existe DEPOIS do bump. O caso
//    de templates aferia `ALL_TEMPLATES[0].name` e a contagem total — dois
//    valores que troca de exercício não muda. As 11 trocas da frente não fariam
//    esse teste falhar se o bump tivesse sido esquecido.
// 3. As versões "anteriores" (ANTERIOR_EXERCICIOS/ANTERIOR_TEMPLATES) são
//    DERIVADAS de EXERCISE_SEED_VERSION/TEMPLATE_SEED_VERSION — exportadas de
//    `seed.ts`, nunca digitadas de novo aqui. Um número solto (`= 9`) é só a
//    opinião do dia em que foi escrito; nada nele impede que a versão em
//    `seed.ts` suba sem que este arquivo acompanhe.
// 4. MAS a derivação pura, sozinha, tem um ponto cego: como ANTERIOR_X é
//    sempre "o que estiver em EXERCISE_SEED_VERSION, menos um", se alguém
//    baixar a própria versão em `seed.ts` — ou, o caso real, mudar conteúdo e
//    ESQUECER de bumpá-la — ANTERIOR_X desliza junto, o gatilho da migração
//    (`armazenado < EXERCISE_SEED_VERSION`) continua verdadeiro e o teste de
//    chegada passa verde mesmo sem bump nenhum. Comprovado por mutação:
//    reverter EXERCISE_SEED_VERSION de 10 pra 9 em `seed.ts`, sem tocar em
//    conteúdo, não derruba nenhum teste deste arquivo — ANTERIOR_EXERCICIOS
//    acompanha para 8 e a migração roda de qualquer forma. Isso é
//    estritamente pior que os números fixos que este arquivo tinha antes de
//    ser derivado: `= 9` fixo, ao encontrar EXERCISE_SEED_VERSION revertida
//    pra 9, vira `9 < 9` (falso) — migração NÃO roda, conteúdo antigo fica, e
//    os testes de conteúdo abaixo quebram de verdade. Por isso a versão
//    ATUAL também é fixada no bloco abaixo: é o número que fecha o ponto
//    cego da regra 3 sem reabrir o da regra 1 — qualquer bump de
//    EXERCISE_SEED_VERSION/TEMPLATE_SEED_VERSION sem tocar nesses dois
//    números quebra o teste na hora (força a atualização deliberada), e
//    ANTERIOR_X, por ser derivado, acompanha sozinho a partir daí.

/** Versões imediatamente anteriores às que `seed.ts` carrega hoje — derivadas
 *  das constantes exportadas, nunca digitadas de novo (regra 3). Sozinha essa
 *  derivação tem o ponto cego da regra 4; quem fecha é o pino da versão atual
 *  logo abaixo. */
const ANTERIOR_EXERCICIOS = EXERCISE_SEED_VERSION - 1;
const ANTERIOR_TEMPLATES = TEMPLATE_SEED_VERSION - 1;
const ANTERIOR_PLANO_ALIMENTAR = MEAL_PLAN_VERSION - 1;

describe("a rede que prende a versão atual (fecha o ponto cego da regra 4)", () => {
  // Únicos números escritos à mão neste arquivo — de propósito: são a versão
  // revisada nesta rodada, e atualizá-los é o preço proposital de qualquer
  // bump futuro em `seed.ts`. Comprovado por mutação: decrementar
  // EXERCISE_SEED_VERSION/TEMPLATE_SEED_VERSION em `seed.ts` sem atualizar
  // estes dois números faz o teste correspondente falhar na hora — e só ele:
  // os testes de conteúdo abaixo, sozinhos, não bastam (ver regra 4).
  it("EXERCISE_SEED_VERSION é a versão revisada nesta rodada", () => {
    expect(EXERCISE_SEED_VERSION).toBe(10);
  });

  it("TEMPLATE_SEED_VERSION é a versão revisada nesta rodada", () => {
    expect(TEMPLATE_SEED_VERSION).toBe(12);
  });

  // O plano alimentar era o único seed grande fora deste arquivo: a versão dele
  // vivia privada dentro de path-seed.ts, e nada aqui alcançava. Foi a mesma
  // configuração que deixou seedStyle rodar sem versão nenhuma por meses.
  it("MEAL_PLAN_VERSION é a versão revisada nesta rodada", () => {
    expect(MEAL_PLAN_VERSION).toBe(10);
  });

  // A versão do estilo também vivia privada dentro do módulo — era o último
  // seed grande sem pino. Com ela exportada, os três grandes (exercícios,
  // templates, plano alimentar) e o estilo têm a mesma rede.
  it("STYLE_SEED_VERSION é a versão revisada nesta rodada", () => {
    expect(STYLE_SEED_VERSION).toBe(4);
  });

  // Com esta, as CINCO versões de seed do app têm pino: exercícios, templates,
  // plano alimentar, estilo e movimento. Era a última que vivia privada.
  it("MOVEMENT_VERSION é a versão revisada nesta rodada", () => {
    expect(MOVEMENT_VERSION).toBe(10);
  });
});

describe("exercícios", () => {
  beforeEach(async () => {
    await db.exercises.clear();
    await db.settings.clear();
  });

  it("o cardio zona 2 reescrito alcança quem estava na versão anterior", async () => {
    await db.exercises.put({
      id: "cardio-zona2",
      name: "Cardio zona 2 (fim do treino)",
      category: "cardio",
      equipment: ["esteira"],
      difficulty: "iniciante",
      description: "Vai no FIM do treino.",
      commonMistakes: [],
      exposureLevel: 1,
      videoUrl: "https://exemplo/video-dela",
    } as never);
    await db.settings.put({ key: "seeded", value: true });
    await db.settings.put({ key: "cyclesSeeded", value: true });
    await db.settings.put({ key: "exerciseSeedVersion", value: ANTERIOR_EXERCICIOS });

    await seedDatabase();

    const ex = await db.exercises.get("cardio-zona2");
    expect(ex?.name).toContain("caminhada do trabalho");
    expect(ex?.description).toContain("5 km");
    // O link que ela colou é dela e continua lá.
    expect(ex?.videoUrl).toBe("https://exemplo/video-dela");
  });

  it("os dois exercícios do padrão de levantar chegam, com o texto e o nível desta versão", async () => {
    await db.settings.put({ key: "seeded", value: true });
    await db.settings.put({ key: "cyclesSeeded", value: true });
    await db.settings.put({ key: "exerciseSeedVersion", value: ANTERIOR_EXERCICIOS });

    await seedDatabase();

    const carregamento = await db.exercises.get("carregamento-frontal");
    const prancha = await db.exercises.get("prancha-antirrotacao");
    expect({ carregamento: !!carregamento, prancha: !!prancha })
      .toEqual({ carregamento: true, prancha: true });

    // O que a versão 10 corrigiu, e que sem bump ficaria só no repositório:
    // a variação difícil que não dizia onde o peso fica, a exposição
    // subestimada e os vídeos que faltavam nos dois.
    expect(carregamento?.harderVariation).toContain("PEITO");
    expect(carregamento?.exposureLevel).toBe(3);
    expect({ c: !!carregamento?.videoUrl, p: !!prancha?.videoUrl }).toEqual({ c: true, p: true });
  });
});

describe("templates de treino", () => {
  beforeEach(async () => {
    await db.workoutTemplates.clear();
    await db.settings.clear();
  });

  it("os ciclos reescritos alcançam quem estava na versão anterior", async () => {
    const alvo = ALL_TEMPLATES[0];
    await db.workoutTemplates.put({ ...alvo, name: "Nome antigo" } as never);
    await db.settings.put({ key: "seeded", value: true });
    await db.settings.put({ key: "cyclesSeeded", value: true });
    await db.settings.put({ key: "templateSeedVersion", value: ANTERIOR_TEMPLATES });

    await seedDatabase();

    const tpl = await db.workoutTemplates.get(alvo.id);
    expect(tpl?.name).toBe(alvo.name);
    expect(await db.workoutTemplates.count()).toBe(ALL_TEMPLATES.length);
  });

  // Nome e contagem total não mudam quando um exercício é trocado por outro —
  // então o teste acima, sozinho, aprovaria uma troca que nunca sai do
  // repositório. O par (template, exerciseId) é o que a troca de fato move.
  it("as trocas do padrão de levantar chegam — pelo par (template, exercício)", async () => {
    await db.settings.put({ key: "seeded", value: true });
    await db.settings.put({ key: "cyclesSeeded", value: true });
    await db.settings.put({ key: "templateSeedVersion", value: ANTERIOR_TEMPLATES });

    await seedDatabase();

    const TROCAS: [string, string][] = [
      // adaptação — o ciclo que ela alcança em ~3 semanas
      ["seg-gluteo-mobilidade", "agachamento-goblet"],
      ["ter-cintura-costas", "carregamento-frontal"],
      ["ter-cintura-costas", "prancha-antirrotacao"],
      // e os ciclos de construção
      ["v-seg-gluteo-unilateral", "agachamento-goblet"],
      ["v-ter-cintura-costas", "prancha-antirrotacao"],
    ];
    const faltando: string[] = [];
    for (const [templateId, exerciseId] of TROCAS) {
      const t = await db.workoutTemplates.get(templateId);
      if (!t?.exercises.some((e) => e.exerciseId === exerciseId)) faltando.push(`${templateId} → ${exerciseId}`);
    }
    expect(faltando).toEqual([]);

    // E o que SAIU também não pode voltar pelo banco parado.
    const seg = await db.workoutTemplates.get("seg-gluteo-mobilidade");
    expect(seg?.exercises.some((e) => e.exerciseId === "abdutor-maquina")).toBe(false);
  });
});

describe("estilo", () => {
  beforeEach(async () => {
    await db.garments.clear();
    await db.outfits.clear();
    await db.stylePalette.clear();
    await db.settings.clear();
  });

  it("a peça reescrita alcança quem só tinha as flags booleanas antigas", async () => {
    await db.garments.put({
      id: "decote-v-profundo",
      name: "Top/blusa com decote V profundo",
      category: "top",
      occasion: ["casual"],
      whyItWorks: "…",
      cautions: "Evite com gola alta sem decote — gola alta junto com ombros largos vira look masculino.",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });

    await seedStyle();

    const g = await db.garments.get("decote-v-profundo");
    expect(g?.cautions).not.toContain("look masculino");
    expect(g?.cautions).toContain("vertical do decote");
  });

  it("a combinação é reescrita sem perder o que é dela", async () => {
    // Reconstrói o banco dela: combinações já semeadas, uma delas com o texto
    // antigo e com estado que é dela por cima.
    await seedStyle();
    const antes = (await db.outfits.toArray()).find((o) => o.name === "Aconchego sensual em casa");
    await db.outfits.update(antes!.id!, {
      whyItWorks: "Ritual de autoimagem em casa, na paleta amazona, sem peso de 'passar despercebido'.",
      status: "tenho",
      notes: "anotação dela",
    });
    await db.settings.delete("styleSeedVersion");

    await seedStyle();

    const iguais = (await db.outfits.toArray()).filter((o) => o.name === "Aconchego sensual em casa");
    expect(iguais).toHaveLength(1);
    expect(iguais[0].whyItWorks).not.toContain("passar despercebido");
    expect(iguais[0].status).toBe("tenho");
    expect(iguais[0].notes).toBe("anotação dela");
  });

  it("rodar de novo não duplica combinação", async () => {
    await seedStyle();
    const antes = await db.outfits.count();
    await seedStyle();
    expect(await db.outfits.count()).toBe(antes);
  });

  it("os três modos alcançam quem estava no par discreto/livre", async () => {
    // Reconstrói o banco dela: peças já semeadas na versão anterior, com o
    // campo antigo — e uma peça que é dela, que o seed não conhece e nunca
    // reescreveria. É essa que prova a migração: nas peças do seed, o put
    // logo depois traz o modo já escrito no arquivo.
    await db.garments.put({
      id: "peca-dela-999",
      name: "Blusa que eu comprei",
      category: "intimate",
      occasion: ["intimo"],
      whyItWorks: "anotação dela",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: STYLE_SEED_VERSION - 1 });

    await seedStyle();

    const dela = await db.garments.get("peca-dela-999");
    expect({ nome: dela?.name, modo: dela?.mode, texto: dela?.whyItWorks })
      .toEqual({ nome: "Blusa que eu comprei", modo: "intimo", texto: "anotação dela" });

    // Nenhuma peça pode sobrar com o campo velho ao lado do novo.
    const comCampoAntigo = (await db.garments.toArray()).filter((g) => "discretion" in g);
    expect(comCampoAntigo.map((g) => g.id)).toEqual([]);

    // E as peças de usar, que não existiam na versão anterior, chegam.
    expect((await db.garments.get("boxer-microfibra-liso"))?.intimateUse).toBe("usar");
    // Junto com a etiqueta de efeito das peças de casa.
    expect((await db.garments.get("saia-rodada"))?.homeEffect).toBe("contraste");
  });
});

describe("sequências de movimento", () => {
  beforeEach(async () => {
    await db.danceSequences.clear();
    await db.settings.clear();
  });

  it("as cinco sequências de soltura alcançam quem estava na versão anterior (7)", async () => {
    // Reconstrói o banco de quem já usava o app antes desta task: seed antigo
    // já rodou, mas parado na versão 7 — sem as cinco sequências de soltura.
    await db.settings.put({ key: "movementSeeded", value: true });
    await db.settings.put({ key: "movementVersion", value: 7 });

    await seedMovement();

    const ids = [
      "pelvic-soltura-identificacao",
      "pelvic-soltura-sustentada",
      "pelvic-alternancia",
      "pelvic-start-stop",
      "pelvic-receber-preparo",
    ];
    for (const id of ids) {
      const s = await db.danceSequences.get(id);
      expect(s).toBeDefined();
      expect(s?.category).toBe("pelvic");
    }
  });

  it("as quatro sequências de flexibilidade (fases 2 e 3) alcançam quem estava na versão anterior (8)", async () => {
    // Reconstrói o banco de quem já usava o app antes desta task: seed antigo
    // já rodou, mas parado na versão 8 — sem as quatro sequências que servem
    // a progressão de manhã/noite (flex-progression.ts).
    await db.settings.put({ key: "movementSeeded", value: true });
    await db.settings.put({ key: "movementVersion", value: 8 });

    await seedMovement();

    const ids = [
      "flex-manha-amplitude",
      "flex-manha-sustentacao",
      "flex-noite-amplitude",
      "flex-noite-sustentacao",
    ];
    for (const id of ids) {
      const s = await db.danceSequences.get(id);
      expect(s).toBeDefined();
      expect(s?.category).toBe("mobilidade");
    }
  });

  it("o repertório íntimo alcança quem estava na versão anterior", async () => {
    await db.settings.put({ key: "movementSeeded", value: true });
    await db.settings.put({ key: "movementVersion", value: MOVEMENT_VERSION - 1 });

    await seedMovement();

    // As sequências novas chegam…
    for (const id of [
      "intimidade-esfregar-roupa",
      "intimidade-receber-maos",
      "rebolado-resistencia-4",
    ]) {
      expect(await db.danceSequences.get(id)).toBeDefined();
    }

    // …e a REESCRITA do grinding também. Um teste de contagem não pegaria esta
    // parte: o id já existia antes, só o conteúdo mudou — e conteúdo corrigido
    // que não chega é exatamente o que este arquivo existe pra impedir.
    const grinding = await db.danceSequences.get("intimidade-grinding");
    expect(grinding?.focus).toMatch(/congel/i);
    expect(grinding?.focus).toMatch(/15\s*(a|-|–)\s*25/);
  });
});

describe("plano alimentar", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.milestones.clear();
    await db.settings.clear();
  });

  it("o cardápio de Aracaju alcança quem estava na versão anterior", async () => {
    // Reconstrói o banco dela: plano já semeado, parado na versão anterior —
    // com o peito de peru no lanche e a manutenção descalibrada.
    await db.settings.put({ key: "pathSeeded", value: true });
    await db.settings.put({ key: "milestoneSeedVersion", value: 7 });
    await db.settings.put({ key: "mealPlanVersion", value: ANTERIOR_PLANO_ALIMENTAR });
    await db.mealPlans.add({
      name: "Plano · manutenção (2450 kcal)",
      goal: "manutencao",
      kcalDaily: 2450,
      proteinG: 185,
      carbG: 266,
      fatG: 70,
      slots: [],
      defaultMeals: [],
    } as never);

    await seedPath();

    const manutencao = (await db.mealPlans.toArray()).find((p) => p.goal === "manutencao")!;
    expect(manutencao.kcalDaily).toBe(3000);
    expect(manutencao.name).toContain("3000");

    // E o ultraprocessado não pode sobreviver pelo banco parado.
    const todos = await db.mealPlans.toArray();
    const nomes = todos.flatMap((p) =>
      p.slots.flatMap((s) => s.variants.flatMap((v) => v.foods.map((f) => f.name))),
    );
    expect(nomes.filter((n) => /peito de peru/i.test(n))).toEqual([]);
    expect(nomes.some((n) => /patê de atum/i.test(n))).toBe(true);
  });
});

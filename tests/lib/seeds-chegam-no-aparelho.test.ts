import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase, EXERCISE_SEED_VERSION, TEMPLATE_SEED_VERSION } from "../../src/lib/seed";
import { seedStyle } from "../../src/lib/style-seed";
import { seedMovement } from "../../src/lib/movement-seed";
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
});

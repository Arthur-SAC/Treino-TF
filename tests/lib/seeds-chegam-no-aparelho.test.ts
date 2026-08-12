import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { seedStyle } from "../../src/lib/style-seed";
import { seedMovement } from "../../src/lib/movement-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";

// Conteúdo de seed vive no IndexedDB, não no arquivo: sem bump de versão, texto
// corrigido no repositório nunca chega ao aparelho de quem já usa o app. Estes
// testes reconstroem o banco parado na versão anterior e cobram a chegada.
//
// DUAS REGRAS, aprendidas na revisão final desta frente — os casos de exercício
// e de template passavam sem morder nenhuma das duas:
//
// 1. A versão plantada tem que ser a IMEDIATAMENTE ANTERIOR à atual. Plantar a
//    versão 7 quando o código está na 9 faz o teste passar com 8 OU com 9, ou
//    seja, ele não distingue "o bump aconteceu" de "o bump foi esquecido".
//    Quando o código bumpar de novo, estes números sobem junto — é de propósito
//    que dê trabalho: é o que mantém o teste ligado ao bump.
// 2. A asserção tem que ser sobre conteúdo que só existe DEPOIS do bump. O caso
//    de templates aferia `ALL_TEMPLATES[0].name` e a contagem total — dois
//    valores que troca de exercício não muda. As 11 trocas da frente não fariam
//    esse teste falhar se o bump tivesse sido esquecido.

/** Versões imediatamente anteriores às que `seed.ts` carrega hoje. Se algum
 *  bump subir e estes números não subirem junto, o teste vira decoração. */
const ANTERIOR_EXERCICIOS = 9;
const ANTERIOR_TEMPLATES = 11;

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

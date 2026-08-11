import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";
import { seedStyle } from "../../src/lib/style-seed";
import { seedMovement } from "../../src/lib/movement-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";

// Conteúdo de seed vive no IndexedDB, não no arquivo: sem bump de versão, texto
// corrigido no repositório nunca chega ao aparelho de quem já usa o app. Estes
// testes reconstroem o banco parado na versão anterior e cobram a chegada.

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
    await db.settings.put({ key: "exerciseSeedVersion", value: 7 });

    await seedDatabase();

    const ex = await db.exercises.get("cardio-zona2");
    expect(ex?.name).toContain("caminhada do trabalho");
    expect(ex?.description).toContain("5 km");
    // O link que ela colou é dela e continua lá.
    expect(ex?.videoUrl).toBe("https://exemplo/video-dela");
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
    await db.settings.put({ key: "templateSeedVersion", value: 9 });

    await seedDatabase();

    const tpl = await db.workoutTemplates.get(alvo.id);
    expect(tpl?.name).toBe(alvo.name);
    expect(await db.workoutTemplates.count()).toBe(ALL_TEMPLATES.length);
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
});

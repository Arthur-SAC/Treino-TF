import { describe, it, expect } from "vitest";
import { seedDatabase } from "../../src/lib/seed";
import { db } from "../../src/lib/db";

describe("seedDatabase", () => {
  it("popula exercícios e templates na primeira chamada", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    const templates = await db.workoutTemplates.toArray();
    expect(exercises.length).toBeGreaterThanOrEqual(30);
    expect(templates.length).toBeGreaterThanOrEqual(5);
  });

  it("não duplica em chamadas repetidas", async () => {
    await seedDatabase();
    const firstCount = (await db.exercises.toArray()).length;
    await seedDatabase();
    const secondCount = (await db.exercises.toArray()).length;
    expect(secondCount).toBe(firstCount);
  });

  it("todo exercício tem campos obrigatórios", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    for (const ex of exercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(Array.isArray(ex.commonMistakes)).toBe(true);
      expect([1, 2, 3, 4, 5]).toContain(ex.exposureLevel);
    }
  });

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
});

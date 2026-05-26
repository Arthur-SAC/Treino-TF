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
});

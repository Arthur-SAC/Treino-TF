import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

const allTemplates = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];
const referenced = allTemplates.flatMap((t) => t.exercises.map((e) => e.exerciseId));
const ids = new Set(EXERCISES.map((e) => e.id));

describe("troca da polia baixa", () => {
  it("não referencia mais os exercícios de polia baixa", () => {
    expect(referenced).not.toContain("coice-gluteo-polia");
    expect(referenced).not.toContain("pull-through-polia");
  });

  it("usa os substitutos com caneleira/barra", () => {
    expect(referenced).toContain("kickback");
    expect(referenced).toContain("good-morning");
  });

  it("todo exerciseId referenciado existe no catálogo", () => {
    const missing = [...new Set(referenced)].filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });
});

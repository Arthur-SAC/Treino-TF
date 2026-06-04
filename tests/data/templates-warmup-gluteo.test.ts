import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import type { WorkoutTemplate } from "../../src/lib/db";

const ALL: WorkoutTemplate[] = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("aquecimento e glúteo nos templates", () => {
  it("todo dia de força começa com cardio leve + articular", () => {
    const force = ALL.filter((t) => [1, 2, 4, 5].includes(t.dayOfWeek));
    expect(force.length).toBeGreaterThan(0);
    for (const t of force) {
      expect(t.exercises[0].exerciseId).toBe("cardio-leve-esteira");
      expect(t.exercises[1].exerciseId).toBe("aquecimento-articular");
    }
  });
  it("a Quarta tem aquecimento articular e bloco de glúteo", () => {
    const quartas = ALL.filter((t) => t.dayOfWeek === 3);
    expect(quartas.length).toBeGreaterThan(0);
    for (const t of quartas) {
      const ids = t.exercises.map((e) => e.exerciseId);
      expect(ids[0]).toBe("aquecimento-articular");
      expect(ids).toContain("ponte-gluteo-band");
      expect(ids).toContain("abdutor-deitada");
    }
  });
});

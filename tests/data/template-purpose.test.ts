import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

const all = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("propósito da sessão", () => {
  it("todo template tem purpose não-vazio", () => {
    const semProposito = all.filter((t) => !t.purpose || t.purpose.trim().length < 10).map((t) => t.id);
    expect(semProposito).toEqual([]);
  });
});

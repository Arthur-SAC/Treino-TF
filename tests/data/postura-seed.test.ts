import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

describe("sequência de postura", () => {
  it("existe postura-silhueta-diaria com ~7 movimentos", () => {
    const seq = SEQUENCES.find((s) => s.id === "postura-silhueta-diaria");
    expect(seq).toBeDefined();
    expect(seq?.category).toBe("mobilidade");
    expect(seq?.durationMin).toBeGreaterThanOrEqual(5);
    expect((seq?.moves.length ?? 0)).toBeGreaterThanOrEqual(6);
  });
});

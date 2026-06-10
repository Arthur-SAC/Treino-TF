import { describe, it, expect } from "vitest";
import { ESTILO_DISCRETO } from "../../src/data/estilo-discreto-seed";

describe("ESTILO_DISCRETO", () => {
  it("tem 3 seções com tips não-vazias e ids únicos", () => {
    expect(ESTILO_DISCRETO).toHaveLength(3);
    const ids = new Set<string>();
    for (const s of ESTILO_DISCRETO) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(3);
  });
});

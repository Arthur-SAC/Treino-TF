import { describe, it, expect } from "vitest";
import { CLAREAMENTO_GUIDE } from "../../src/data/clareamento-guide-seed";

describe("CLAREAMENTO_GUIDE", () => {
  it("tem 5 seções com tips não-vazias e ids únicos", () => {
    expect(CLAREAMENTO_GUIDE).toHaveLength(5);
    const ids = new Set<string>();
    for (const s of CLAREAMENTO_GUIDE) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(5);
  });
});

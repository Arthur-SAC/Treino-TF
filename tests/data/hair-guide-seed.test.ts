import { describe, it, expect } from "vitest";
import { HAIR_GUIDE } from "../../src/data/hair-guide-seed";

describe("HAIR_GUIDE", () => {
  it("tem 4 seções com tips não-vazias e ids únicos", () => {
    expect(HAIR_GUIDE).toHaveLength(4);
    const ids = new Set<string>();
    for (const s of HAIR_GUIDE) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(4);
  });
});

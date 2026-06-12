import { describe, it, expect } from "vitest";
import { FOLICULITE_GUIDE } from "../../src/data/foliculite-guide-seed";

describe("FOLICULITE_GUIDE", () => {
  it("tem 6 seções com tips não-vazias e ids únicos", () => {
    expect(FOLICULITE_GUIDE).toHaveLength(6);
    const ids = new Set<string>();
    for (const s of FOLICULITE_GUIDE) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(6);
  });
});

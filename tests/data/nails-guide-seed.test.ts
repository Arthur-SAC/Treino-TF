import { describe, it, expect } from "vitest";
import { NAILS_GUIDE } from "../../src/data/nails-guide-seed";

describe("NAILS_GUIDE", () => {
  it("tem 4 seções com tips não-vazias e ids únicos", () => {
    expect(NAILS_GUIDE).toHaveLength(4);
    const ids = new Set<string>();
    for (const s of NAILS_GUIDE) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.tips.length).toBeGreaterThan(0);
      ids.add(s.id);
    }
    expect(ids.size).toBe(4);
  });
});

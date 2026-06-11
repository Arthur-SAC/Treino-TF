import { describe, it, expect } from "vitest";
import { VOICE_MILESTONES } from "../../src/data/milestones-seed";

describe("VOICE_MILESTONES", () => {
  it("tem 5 marcos, todos categoria voz com título", () => {
    expect(VOICE_MILESTONES).toHaveLength(5);
    for (const m of VOICE_MILESTONES) {
      expect(m.category).toBe("voz");
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.datePlanned.length).toBe(10);
    }
  });
});

import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("walkGoalMin setting", () => {
  it("tem default de 30 min", async () => {
    expect(await getSetting("walkGoalMin")).toBe(30);
  });
});

import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("walkGoalMin setting", () => {
  it("tem default de 75 min (o passeio de 1h cobre a maior parte, com folga pequena)", async () => {
    expect(await getSetting("walkGoalMin")).toBe(75);
  });
});

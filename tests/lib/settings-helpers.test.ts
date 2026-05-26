import { describe, it, expect } from "vitest";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

describe("settings helpers", () => {
  it("setSetting + getSetting round-trip", async () => {
    await setSetting("morningReminderTime", "08:00");
    expect(await getSetting("morningReminderTime")).toBe("08:00");
  });

  it("getSetting retorna default se chave não existir", async () => {
    expect(await getSetting("activeBreakIntervalMin")).toBe(90);
  });

  it("aceita objeto", async () => {
    await setSetting("quietHours", { from: "22:00", to: "08:00" });
    expect(await getSetting("quietHours")).toEqual({ from: "22:00", to: "08:00" });
  });
});

// Type-only test: Settings keys are constrained
// @ts-expect-error invalid key
() => setSetting("invalidKey", "x");

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

describe("settings de silhueta", () => {
  it("tem defaults de altura e metas", async () => {
    expect(await getSetting("heightCm")).toBe(0);
    expect(await getSetting("targetWhr")).toBe(0.72);
    expect(await getSetting("targetShoulderHipRatio")).toBe(1.0);
  });
  it("persiste altura", async () => {
    await setSetting("heightCm", 165);
    expect(await getSetting("heightCm")).toBe(165);
  });
});

// Type-only test: Settings keys are constrained
// @ts-expect-error invalid key
() => setSetting("invalidKey", "x");

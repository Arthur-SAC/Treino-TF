import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("settings de lembrete", () => {
  it("presença default 21:00", async () => {
    expect(await getSetting("presencaReminderTime")).toBe("21:00");
  });
  it("timestamp de último lembrete de presença começa vazio", async () => {
    expect(await getSetting("lastPresencaReminderAt")).toBe("");
  });
});

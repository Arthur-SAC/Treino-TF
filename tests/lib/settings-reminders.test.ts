import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";

describe("settings de lembrete", () => {
  it("postura default 19:00, caminhada default 12:00", async () => {
    expect(await getSetting("posturaReminderTime")).toBe("19:00");
    expect(await getSetting("walkReminderTime")).toBe("12:00");
  });
  it("timestamps de último lembrete começam vazios", async () => {
    expect(await getSetting("lastPosturaReminderAt")).toBe("");
    expect(await getSetting("lastWalkReminderAt")).toBe("");
  });
});

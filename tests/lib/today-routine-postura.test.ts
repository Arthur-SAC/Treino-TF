import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("item Postura na rotina", () => {
  // Spec 2026-11-19: 21:05 provisório, no bloco do app; sexta e sábado à noite são dela.
  it("existe na noite dos dias com bloco do app, às 21:05, entre o skincare e a voz", () => {
    for (const dow of [0, 1, 2, 3, 4]) {
      const noite = buildDayRoutine(dow, 2).blocks.find((b) => b.id === "noite")!.items;
      const i = noite.findIndex((x) => x.id === "postura");
      expect({ dow, achou: i >= 0 }).toEqual({ dow, achou: true });
      expect(noite[i]).toMatchObject({ label: "Postura", linkKey: "postura", defaultTime: "21:05" });
      expect(noite.findIndex((x) => x.id === "skincare-noite")).toBeLessThan(i);
      expect(noite.findIndex((x) => x.id === "voz")).toBeGreaterThan(i);
    }
  });
});

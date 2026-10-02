import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("item Postura na rotina", () => {
  it("existe na noite dos sete dias, às 20:15, entre o skincare e a voz", () => {
    for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
      const noite = buildDayRoutine(dow, 2).blocks.find((b) => b.id === "noite")!.items;
      const i = noite.findIndex((x) => x.id === "postura");
      expect({ dow, achou: i >= 0 }).toEqual({ dow, achou: true });
      expect(noite[i]).toMatchObject({ label: "Postura", linkKey: "postura", defaultTime: "20:15" });
      expect(noite.findIndex((x) => x.id === "skincare-noite")).toBeLessThan(i);
      expect(noite.findIndex((x) => x.id === "voz")).toBeGreaterThan(i);
    }
  });
});

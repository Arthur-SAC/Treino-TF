import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("catálogo de cardio", () => {
  it("tem a bike reclinada, e ela é discreta (sentada)", () => {
    const bike = EXERCISES.find((e) => e.id === "bike-reclinada");
    expect(bike).toBeDefined();
    expect(bike?.exposureLevel).toBe(1);
  });

  it("tem um item de zona 2 explícito, separado do aquecimento", () => {
    const z2 = EXERCISES.find((e) => e.id === "cardio-zona2");
    expect(z2).toBeDefined();
    expect(z2?.exposureLevel).toBe(1);
    expect(z2?.category).toBe("cardio");
  });
});

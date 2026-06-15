import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";

describe("horizontes de resultado", () => {
  it("tem as três etapas", () => {
    const ids = HORIZONTES.map((s) => s.id);
    expect(ids).toContain("sem-trh");
    expect(ids).toContain("com-trh");
    expect(ids).toContain("bbl-mama");
  });

  it("cada etapa tem dicas", () => {
    expect(HORIZONTES.every((s) => s.tips.length >= 3)).toBe(true);
  });
});

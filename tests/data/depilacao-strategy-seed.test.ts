import { describe, it, expect } from "vitest";
import { DEPILACAO_STRATEGY } from "../../src/data/depilacao-strategy-seed";

describe("DEPILACAO_STRATEGY", () => {
  it("tem 3 seções, cada uma com dicas", () => {
    expect(DEPILACAO_STRATEGY).toHaveLength(3);
    for (const s of DEPILACAO_STRATEGY) {
      expect(s.tips.length).toBeGreaterThan(0);
    }
  });

  it("cobre a camuflagem da sombra com corretivo alaranjado", () => {
    const all = DEPILACAO_STRATEGY.flatMap((s) => s.tips).join(" ").toLowerCase();
    expect(all).toContain("alaranjado");
  });
});

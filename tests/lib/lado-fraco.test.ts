import { describe, it, expect } from "vitest";
import { ehUnilateral } from "../../src/lib/lado-fraco";
import { DEFAULTS } from "../../src/lib/settings-helpers";

describe("lado fraco", () => {
  it("unilateral = 'cada', menos as trocas da prancha", () => {
    expect(ehUnilateral("12 cada")).toBe(true);
    expect(ehUnilateral("10-12 cada")).toBe(true);
    expect(ehUnilateral("6 trocas cada lado")).toBe(false);
    expect(ehUnilateral("10-12")).toBe(false);
  });

  it("padrão: sem lado", () => {
    expect(DEFAULTS.ladoFraco).toBe("");
  });
});

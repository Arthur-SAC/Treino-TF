import { describe, it, expect } from "vitest";
import { statusDaVersao } from "../../src/lib/versao-status";

describe("status da versão", () => {
  it("igual à publicada → atualizada", () => expect(statusDaVersao("5aa0e48", "5aa0e48")).toBe("atualizada"));
  it("diferente da publicada → nova", () => expect(statusDaVersao("350481b", "5aa0e48")).toBe("nova"));
  it("sem resposta ainda → conferindo; falhou → sem internet", () => {
    expect(statusDaVersao("5aa0e48", undefined)).toBe("conferindo");
    expect(statusDaVersao("5aa0e48", null)).toBe("sem-internet");
  });
  it("build local não finge estar atualizado", () => expect(statusDaVersao("dev", "5aa0e48")).toBe("dev"));
});

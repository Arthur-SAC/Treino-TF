import { describe, it, expect } from "vitest";
import { formatCm, formatKg, formatDateBR, formatRelativeDays } from "../../src/lib/format";

describe("formatCm", () => {
  it("formata com 1 casa decimal e sufixo cm", () => {
    expect(formatCm(99)).toBe("99,0 cm");
    expect(formatCm(99.5)).toBe("99,5 cm");
    expect(formatCm(99.55)).toBe("99,6 cm");
  });
});

describe("formatKg", () => {
  it("formata sem decimal se inteiro", () => {
    expect(formatKg(10)).toBe("10 kg");
  });
  it("formata com 1 decimal se fracionário", () => {
    expect(formatKg(10.5)).toBe("10,5 kg");
  });
});

describe("formatDateBR", () => {
  it("formata data ISO em dd/mm/yyyy", () => {
    expect(formatDateBR(new Date("2026-05-26T12:00:00Z"))).toBe("26/05/2026");
  });
});

describe("formatRelativeDays", () => {
  it("retorna 'hoje' pra 0 dias", () => {
    expect(formatRelativeDays(0)).toBe("hoje");
  });
  it("retorna 'ontem' pra 1 dia atrás", () => {
    expect(formatRelativeDays(1)).toBe("ontem");
  });
  it("retorna 'há X dias' pra mais", () => {
    expect(formatRelativeDays(5)).toBe("há 5 dias");
  });
  it("retorna 'em X dias' pra futuro", () => {
    expect(formatRelativeDays(-3)).toBe("em 3 dias");
  });
  it("usa singular 'dia' pra 2 dias futuros (limite)", () => {
    expect(formatRelativeDays(-1)).toBe("em 1 dia");
  });
  it("usa plural 'dias' pra ≥2 dias", () => {
    expect(formatRelativeDays(-2)).toBe("em 2 dias");
  });
});

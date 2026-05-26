import { describe, it, expect } from "vitest";
import { isWithinQuietHours, isWithinWorkingHours } from "../../src/lib/notifications";

describe("isWithinQuietHours", () => {
  it("dentro do range noturno (22h-08h)", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T23:00:00"), "22:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-05-26T06:00:00"), "22:00", "08:00")).toBe(true);
  });
  it("fora do range noturno", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T10:00:00"), "22:00", "08:00")).toBe(false);
    expect(isWithinQuietHours(new Date("2026-05-26T18:00:00"), "22:00", "08:00")).toBe(false);
  });
  it("range diurno (mesmo dia)", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T13:00:00"), "12:00", "14:00")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-05-26T15:00:00"), "12:00", "14:00")).toBe(false);
  });
});

describe("isWithinWorkingHours", () => {
  it("hora dentro do range", () => {
    expect(isWithinWorkingHours(new Date("2026-05-26T10:00:00"), 9, 18)).toBe(true);
    expect(isWithinWorkingHours(new Date("2026-05-26T17:59:00"), 9, 18)).toBe(true);
  });
  it("hora fora do range", () => {
    expect(isWithinWorkingHours(new Date("2026-05-26T08:00:00"), 9, 18)).toBe(false);
    expect(isWithinWorkingHours(new Date("2026-05-26T19:00:00"), 9, 18)).toBe(false);
  });
  it("respeita dias úteis (segunda a sexta)", () => {
    // Sábado (dia 6) 26 não — usar 30 (sábado)
    expect(isWithinWorkingHours(new Date("2026-05-30T10:00:00"), 9, 18)).toBe(false);
    // Domingo (31)
    expect(isWithinWorkingHours(new Date("2026-05-31T10:00:00"), 9, 18)).toBe(false);
  });
});

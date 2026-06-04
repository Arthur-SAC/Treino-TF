import { describe, it, expect } from "vitest";
import { isWithinQuietHours, isWithinWorkingHours, shouldRemindOncePerDay } from "../../src/lib/notifications";

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

describe("shouldRemindOncePerDay", () => {
  const base = { currentMin: 12 * 60, targetMin: 12 * 60, lastNotifiedDate: "", todayISO: "2026-06-04", done: false };
  it("dispara quando passou do horário, não feito e não notificou hoje", () => {
    expect(shouldRemindOncePerDay(base)).toBe(true);
  });
  it("não dispara antes do horário", () => {
    expect(shouldRemindOncePerDay({ ...base, currentMin: 11 * 60 })).toBe(false);
  });
  it("não dispara se já feito", () => {
    expect(shouldRemindOncePerDay({ ...base, done: true })).toBe(false);
  });
  it("não dispara se já notificou hoje", () => {
    expect(shouldRemindOncePerDay({ ...base, lastNotifiedDate: "2026-06-04" })).toBe(false);
  });
  it("não dispara se targetMin for NaN (horário malformado)", () => {
    expect(shouldRemindOncePerDay({ ...base, targetMin: NaN })).toBe(false);
  });
});

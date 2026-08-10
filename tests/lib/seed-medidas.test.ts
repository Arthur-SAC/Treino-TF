import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedMedidasPartida } from "../../src/lib/seed";

describe("medidas de partida (13/05/2026)", () => {
  beforeEach(async () => {
    await db.measurements.clear();
    await db.settings.clear();
  });

  it("insere a medição real quando não há nenhuma", async () => {
    await seedMedidasPartida();
    const todas = await db.measurements.toArray();
    expect(todas).toHaveLength(1);
    expect(todas[0]).toMatchObject({ date: "2026-05-13", waistCm: 99, hipCm: 114, shouldersCm: 120.5 });
  });

  it("é idempotente — rodar duas vezes não duplica", async () => {
    await seedMedidasPartida();
    await seedMedidasPartida();
    expect(await db.measurements.count()).toBe(1);
  });

  it("não sobrescreve medições que ela já registrou", async () => {
    await db.measurements.add({ date: "2026-08-01", waistCm: 95 } as never);
    await seedMedidasPartida();
    const todas = await db.measurements.toArray();
    expect(todas).toHaveLength(1);
    expect(todas[0].waistCm).toBe(95);
  });
});

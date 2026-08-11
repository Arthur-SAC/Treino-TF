import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedMedidasPartida } from "../../src/lib/seed";
import { MEDIDAS_PARTIDA } from "../../src/lib/objetivo";

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

  it("todos os valores vêm de MEDIDAS_PARTIDA, inclusive o busto", async () => {
    await seedMedidasPartida();
    const [m] = await db.measurements.toArray();
    expect(m).toMatchObject({
      date: MEDIDAS_PARTIDA.data,
      neckCm: MEDIDAS_PARTIDA.pescocoCm,
      shouldersCm: MEDIDAS_PARTIDA.ombrosCm,
      // O busto faltava no seed e é a justificativa declarada de
      // CINTURA_PISO_CM — sem ele o piso de cintura fica sem lastro no app.
      chestCm: MEDIDAS_PARTIDA.bustoCm,
      waistCm: MEDIDAS_PARTIDA.cinturaCm,
      hipCm: MEDIDAS_PARTIDA.quadrilCm,
      thighLeftCm: MEDIDAS_PARTIDA.coxaCm,
      thighRightCm: MEDIDAS_PARTIDA.coxaCm,
      armCm: MEDIDAS_PARTIDA.bracoCm,
      weightKg: MEDIDAS_PARTIDA.pesoKg,
    });
  });

  it("semeia a altura, senão a %BF fica sem calcular num app que afirma a %BF", async () => {
    await seedMedidasPartida();
    const altura = await db.settings.get("heightCm");
    expect(altura?.value).toBe(173);
  });

  it("não sobrescreve a altura que ela já informou", async () => {
    await db.settings.put({ key: "heightCm", value: 170 });
    await seedMedidasPartida();
    const altura = await db.settings.get("heightCm");
    expect(altura?.value).toBe(170);
  });

  it("semeia a altura mesmo quando já há medição dela — a altura não mora em measurements", async () => {
    await db.measurements.add({ date: "2026-08-01", waistCm: 95 } as never);
    await seedMedidasPartida();
    const altura = await db.settings.get("heightCm");
    expect(altura?.value).toBe(173);
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

  it("grava a chave de registro medidasPartidaSeeded ao semear", async () => {
    await seedMedidasPartida();
    const flag = await db.settings.get("medidasPartidaSeeded");
    expect(flag?.value).toBe(true);
  });

  it("grava a chave de registro medidasPartidaSeeded mesmo quando já havia medição (saída antecipada)", async () => {
    await db.measurements.add({ date: "2026-08-01", waistCm: 95 } as never);
    await seedMedidasPartida();
    const flag = await db.settings.get("medidasPartidaSeeded");
    expect(flag?.value).toBe(true);
  });
});

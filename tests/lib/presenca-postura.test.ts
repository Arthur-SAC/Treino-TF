import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { praticouPosturaHoje } from "../../src/lib/notification-scheduler";

const HOJE = "2026-10-02";
beforeEach(async () => {
  await db.practiceLogs.clear();
});

describe("lembrete de presença das 21h", () => {
  it("sem prática hoje: não foi feito", async () => {
    expect(await praticouPosturaHoje(HOJE)).toBe(false);
  });
  it("prática da trilha de postura hoje: feito", async () => {
    await db.practiceLogs.add({ date: HOJE, sequenceId: "corporal-oito-quadril" } as never);
    expect(await praticouPosturaHoje(HOJE)).toBe(true);
  });
  it("prática de outra coisa hoje não conta", async () => {
    await db.practiceLogs.add({ date: HOJE, sequenceId: "intimidade-grinding" } as never);
    expect(await praticouPosturaHoje(HOJE)).toBe(false);
  });
  it("prática de ontem não conta", async () => {
    await db.practiceLogs.add({ date: "2026-10-01", sequenceId: "corporal-oito-quadril" } as never);
    expect(await praticouPosturaHoje(HOJE)).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { carregarEstado, carregarConfig } from "../../src/lib/lembretes/estado";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const AGORA = new Date(2026, 8, 28, 5, 0); // segunda
beforeEach(async () => {
  await Promise.all([db.routineChecks, db.practiceLogs, db.dailyLog, db.workoutSessions, db.measurements, db.workoutTemplates, db.settings].map((t) => t.clear()));
});

describe("carregarEstado", () => {
  it("alongamento feito pelo check ou pela prática da trilha — a mesma regra do Hoje", async () => {
    await db.routineChecks.put({ date: "2026-09-28", itemId: "alongamento-manha", done: true });
    await db.practiceLogs.add({ date: "2026-09-28", sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true });
    const e = await carregarEstado(AGORA);
    expect([...e.feitosHoje].sort()).toEqual(["alongamento-manha", "alongamento-noite"]);
  });

  it("água, treino de hoje, última medida e vitamina D", async () => {
    await db.dailyLog.put({ date: "2026-09-28", waterMl: 1500, activeBreakCount: 0 });
    await db.workoutSessions.add({ date: "2026-09-28", templateId: "x", exercises: [] });
    await db.measurements.bulkAdd([{ date: "2026-09-10", waistCm: 90 }, { date: "2026-09-24", weightKg: 96 }]);
    await db.routineChecks.bulkPut([
      { date: "2026-09-27", itemId: "vitamina-d", done: true },
      { date: "2026-09-20", itemId: "vitamina-d", done: false },
    ]);
    const e = await carregarEstado(AGORA);
    expect(e.aguaHojeMl).toBe(1500);
    expect(e.treinouHoje).toBe(true);
    expect(e.ultimaMedida).toBe("2026-09-24");
    expect(e.vitaminaDFeitaEm).toEqual(["2026-09-27"]);
  });

  it("último backup: vazio se nunca, senão a data gravada", async () => {
    expect((await carregarEstado(AGORA)).ultimoBackupEm).toBe("");
    await db.settings.put({ key: "ultimoBackupEm", value: "2026-09-20" });
    expect((await carregarEstado(AGORA)).ultimoBackupEm).toBe("2026-09-20");
  });

  it("treino por dia vem só do ciclo ativo", async () => {
    await db.settings.put({ key: "activeCycle", value: "entrada-1" });
    await db.workoutTemplates.bulkPut([
      { id: "a", name: "Inferior A", dayOfWeek: 1, exercises: [], cycle: "entrada-1" } as never,
      { id: "b", name: "Outro ciclo", dayOfWeek: 2, exercises: [], cycle: "hipertrofia" } as never,
    ]);
    const e = await carregarEstado(AGORA);
    expect([...e.treinoPorDia]).toEqual([[1, "Inferior A"]]);
  });
});

describe("carregarConfig", () => {
  it("usa os padrões quando ela não mudou nada", async () => {
    const c = await carregarConfig();
    expect(c.alongamentoManhaTime).toBe("06:00");
    expect(c.dormirReminderTime).toBe("22:00");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { toggleRoutineCheck } from "../../src/hooks/useRoutineChecks";

beforeEach(async () => {
  await db.routineChecks.clear();
});

describe("toggleRoutineCheck", () => {
  it("marca um item como feito na primeira chamada", async () => {
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    const row = await db.routineChecks.get(["2026-07-16", "alongamento-manha"]);
    expect(row?.done).toBe(true);
  });

  it("desmarca ao chamar de novo (toggle)", async () => {
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    await toggleRoutineCheck("2026-07-16", "alongamento-manha");
    const row = await db.routineChecks.get(["2026-07-16", "alongamento-manha"]);
    expect(row?.done).toBe(false);
  });

  it("isola por data — marcar hoje não afeta ontem", async () => {
    await toggleRoutineCheck("2026-07-16", "diario");
    const ontem = await db.routineChecks.get(["2026-07-15", "diario"]);
    expect(ontem).toBeUndefined();
  });

  // Quem chama precisa saber pra onde o item foi, pra creditar o efeito
  // colateral na direção certa (os 60 min do passeio, a hora de deitar).
  // Antes isso era deduzido do Set já renderizado, que é do render anterior.
  it("devolve o novo estado do check, não o antigo", async () => {
    expect(await toggleRoutineCheck("2026-07-16", "caes")).toBe(true);
    expect(await toggleRoutineCheck("2026-07-16", "caes")).toBe(false);
    expect(await toggleRoutineCheck("2026-07-16", "caes")).toBe(true);
  });

  it("dois toques rápidos (em paralelo) acabam desmarcado, um para cada direção", async () => {
    const [a, b] = await Promise.all([
      toggleRoutineCheck("2026-07-16", "caes"),
      toggleRoutineCheck("2026-07-16", "caes"),
    ]);
    expect([a, b].filter(Boolean)).toHaveLength(1);
    expect((await db.routineChecks.get(["2026-07-16", "caes"]))?.done).toBe(false);
  });
});

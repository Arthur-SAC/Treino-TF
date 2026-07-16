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
});

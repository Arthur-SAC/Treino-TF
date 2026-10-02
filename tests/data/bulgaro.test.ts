import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";
import { estimarDuracaoMin } from "../../src/lib/session-duration";

const tpl = (id: string) => [...WORKOUT_PLAN, ...CYCLE_TEMPLATES].find((t) => t.id === id)!;
const ex = (t: ReturnType<typeof tpl>, id: string) => t.exercises.find((e) => e.exerciseId === id);

describe("búlgaro (entrega C)", () => {
  it("não entra na adaptação (revisão de 2026-07-27)", () => {
    expect(ex(tpl("qua-mobilidade-danca"), "agachamento-bulgaro")).toBeUndefined();
  });

  it("substitui o goblet na variação de quarta; o goblet fica no Inferior A", () => {
    const qua = tpl("v-qua-mobilidade-danca");
    expect(ex(qua, "agachamento-bulgaro")).toMatchObject({ sets: 3, repsTarget: "10-12 cada" });
    expect(ex(qua, "agachamento-goblet")).toBeUndefined();
    expect(ex(tpl("v-seg-gluteo-unilateral"), "agachamento-goblet")).toBeDefined();
  });

  it("a sessão da variação continua em até 60 min, com a duração do estimador", () => {
    for (const id of ["v-qua-mobilidade-danca"]) {
      const t = tpl(id);
      expect({ id, d: t.durationMin }).toEqual({ id, d: estimarDuracaoMin(t) });
      expect(t.durationMin).toBeLessThanOrEqual(60);
    }
  });

  it("a descrição tem viés de glúteo e o lado fraco primeiro", () => {
    const b = EXERCISES.find((e) => e.id === "agachamento-bulgaro")!;
    expect(b.description).toMatch(/levemente inclinado/);
    expect(b.description).toMatch(/lado mais fraco/);
    expect(b.commonMistakes.join(" ")).not.toMatch(/Inclinar tronco demais pra frente/);
  });
});

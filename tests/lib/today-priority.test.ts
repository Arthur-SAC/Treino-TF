import { describe, it, expect } from "vitest";
import { computeFocus } from "../../src/lib/today-priority";
import type { FocusState } from "../../src/lib/today-priority";

const empty: FocusState = {
  cycleAdvice: null,
  waistGuardTriggered: false,
  workoutToday: null,
  daysSinceMeasurement: null,
  daysSincePhoto: null,
};

describe("computeFocus", () => {
  it("null quando nada pendente", () => {
    expect(computeFocus(empty)).toBeNull();
  });

  it("trava de cintura tem prioridade máxima", () => {
    const f = computeFocus({
      ...empty,
      waistGuardTriggered: true,
      cycleAdvice: { recommend: true, reason: "x" },
      workoutToday: { done: false, name: "Glúteo A", to: "/x" },
    });
    expect(f?.to).toBe("/corpo/silhueta");
  });

  it("ciclo vem antes do treino", () => {
    const f = computeFocus({
      ...empty,
      cycleAdvice: { recommend: true, reason: "porque sim" },
      workoutToday: { done: false, name: "Glúteo A", to: "/treino/sessao/x" },
    });
    expect(f?.to).toBe("/treino/ciclos");
    expect(f?.subtitle).toBe("porque sim");
  });

  it("treino de hoje não feito", () => {
    const f = computeFocus({ ...empty, workoutToday: { done: false, name: "Glúteo A", to: "/treino/sessao/x" } });
    expect(f?.to).toBe("/treino/sessao/x");
  });

  it("treino feito não vira foco; cai pra medida atrasada", () => {
    const f = computeFocus({
      ...empty,
      workoutToday: { done: true, name: "Glúteo A", to: "/treino/sessao/x" },
      daysSinceMeasurement: 40,
    });
    expect(f?.to).toBe("/corpo/medidas");
  });

  it("foto atrasada é o último critério", () => {
    expect(computeFocus({ ...empty, daysSincePhoto: 20 })?.to).toBe("/corpo/fotos");
  });
});

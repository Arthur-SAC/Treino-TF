import { describe, it, expect } from "vitest";
import { computeFocus, currentBlock, timeBlockFocus } from "../../src/lib/today-priority";
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

describe("currentBlock / timeBlockFocus", () => {
  it("mapeia a hora para o bloco certo", () => {
    expect(currentBlock(6)).toBe("manha");
    expect(currentBlock(13)).toBe("trabalho");
    expect(currentBlock(17)).toBe("tarde");
    expect(currentBlock(21)).toBe("noite");
  });

  it("à tarde num dia de semana, o foco chama o lanche + treino", () => {
    const f = timeBlockFocus(17, 3);
    expect(f.title.toLowerCase()).toContain("treino");
    expect(f.to).toBe("/treino");
  });

  it("no sábado à tarde o foco é a dança", () => {
    const f = timeBlockFocus(17, 6);
    expect(f.title.toLowerCase()).toContain("dança");
  });

  it("das 11h às 16h, dia de semana fala em trabalho/pausas; fim de semana não", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const f = timeBlockFocus(13, dow);
      const texto = `${f.title} ${f.subtitle}`.toLowerCase();
      expect({ dow, texto }).toEqual({ dow, texto: expect.stringMatching(/trabalho|pausas/) });
    }
    for (const dow of [0, 6]) {
      const f = timeBlockFocus(13, dow);
      const texto = `${f.title} ${f.subtitle}`.toLowerCase();
      expect({ dow, mencionaTrabalho: /trabalho|expediente|pausas/.test(texto) })
        .toEqual({ dow, mencionaTrabalho: false });
    }
  });
});

import { describe, it, expect } from "vitest";
import { segundosDeTrabalho, estimarDuracaoMin } from "../../src/lib/session-duration";

describe("segundos de trabalho por série", () => {
  it.each([
    ["5min", 300],
    ["15-20min", 1200],
    ["30-45s", 45],
    ["20m", 30],
    ["10-12", 36],
    ["12 (LEVE)", 36],
    ["15-20 (bombeamento)", 60],
    ["12 cada", 72],
    ["6 trocas cada lado", 36],
    ["sem número", 30],
  ])("%s → %i s", (reps, esperado) => {
    expect(segundosDeTrabalho(reps)).toBe(esperado);
  });
});

describe("estimativa da sessão", () => {
  it("soma séries × (trabalho + descanso) + 1 min de troca por exercício", () => {
    const min = estimarDuracaoMin({
      exercises: [
        { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0 },
        { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 90 },
      ],
    });
    // (300 + 60) + (3 × (36 + 90) + 60) = 360 + 438 = 798 s ≈ 13,3 min
    expect(min).toBe(13);
  });
});

import { describe, it, expect } from "vitest";
import { volumeSemanal, diasComExercicio, GRUPO_DO_EXERCICIO } from "../../src/lib/volume-muscular";

const t = (exercises: Array<{ exerciseId: string; sets: number }>) => ({
  exercises: exercises.map((e) => ({ ...e, repsTarget: "10", restSec: 60 })),
});

describe("volume semanal por grupo", () => {
  it("soma as séries do grupo primário de cada exercício na semana", () => {
    const v = volumeSemanal([
      t([{ exerciseId: "hip-thrust-barra", sets: 4 }, { exerciseId: "abdutor-maquina", sets: 3 }]),
      t([{ exerciseId: "abdutor-maquina", sets: 4 }, { exerciseId: "clamshell", sets: 3 }]),
    ]);
    expect(v["gluteo-max"]).toBe(4);
    expect(v["gluteo-medio"]).toBe(10);
  });

  it("exercício sem grupo mapeado (aquecimento, core, mobilidade) não conta", () => {
    const v = volumeSemanal([t([{ exerciseId: "vacuum-abdominal", sets: 3 }, { exerciseId: "cardio-leve-esteira", sets: 1 }])]);
    expect(Object.values(v).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("todo grupo aparece no resultado, mesmo zerado", () => {
    expect(Object.keys(volumeSemanal([])).sort()).toEqual(
      ["adutor", "biceps", "costas", "gluteo-max", "gluteo-medio", "peito", "posterior", "quadriceps", "triceps"],
    );
  });

  it("conta em quantos dias da semana um exercício aparece", () => {
    const semana = [t([{ exerciseId: "abdutor-maquina", sets: 3 }]), t([{ exerciseId: "clamshell", sets: 3 }]), t([{ exerciseId: "abdutor-maquina", sets: 4 }])];
    expect(diasComExercicio(semana, "abdutor-maquina")).toBe(2);
  });

  it("o leg press de pés altos conta como glúteo, e o de pés no meio como quadríceps", () => {
    expect(GRUPO_DO_EXERCICIO["smith-squat"]).toBe("gluteo-max");
    expect(GRUPO_DO_EXERCICIO["leg-press-pes-medios"]).toBe("quadriceps");
  });
});

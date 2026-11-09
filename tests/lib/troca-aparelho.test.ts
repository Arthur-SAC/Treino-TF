import { describe, it, expect } from "vitest";
import type { WorkoutTemplate } from "../../src/lib/db";
import { aplicarAusentes, podeMarcarAusente, type ItemTemplate } from "../../src/lib/troca-aparelho";

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object") {
    Object.values(o as object).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
}

const base = (): WorkoutTemplate => ({
  id: "t",
  name: "T",
  dayOfWeek: 1,
  durationMin: 30,
  exercises: [
    { exerciseId: "a", sets: 3, repsTarget: "10", restSec: 60, substitutoId: "b" },
    { exerciseId: "c", sets: 3, repsTarget: "10", restSec: 60 },
  ],
});

describe("aplicarAusentes", () => {
  it("troca o ausente pelo substituto e guarda o original", () => {
    const r = aplicarAusentes(base(), ["a"]);
    expect(r.exercises[0]).toMatchObject({ exerciseId: "b", originalId: "a" });
  });

  it("não mexe em item sem substituto", () => {
    const r = aplicarAusentes(base(), ["c"]);
    expect(r.exercises[1].exerciseId).toBe("c");
    expect((r.exercises[1] as ItemTemplate).originalId).toBeUndefined();
  });

  it("substituto também ausente → fica o substituto, sem laço", () => {
    const r = aplicarAusentes(base(), ["a", "b"]);
    expect(r.exercises[0]).toMatchObject({ exerciseId: "b", originalId: "a" });
  });

  it("não muta o template de entrada", () => {
    const t = deepFreeze(base());
    expect(() => aplicarAusentes(t, ["a"])).not.toThrow();
    expect(t.exercises[0].exerciseId).toBe("a");
  });
});

describe("podeMarcarAusente", () => {
  it("false para item com originalId e para item sem substitutoId", () => {
    expect(podeMarcarAusente({ ...base().exercises[0], originalId: "x" })).toBe(false);
    expect(podeMarcarAusente(base().exercises[1])).toBe(false);
    expect(podeMarcarAusente(base().exercises[0])).toBe(true);
  });
});

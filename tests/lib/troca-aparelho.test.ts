import { describe, it, expect } from "vitest";
import type { WorkoutTemplate } from "../../src/lib/db";
import { aplicarAusentes, podeMarcarAusente, UNILATERAIS, type ItemTemplate } from "../../src/lib/troca-aparelho";

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

describe("substituto unilateral", () => {
  const t = (repsTarget: string): WorkoutTemplate => ({
    id: "u", name: "U", dayOfWeek: 1, durationMin: 30,
    exercises: [{ exerciseId: "abdutor-maquina", sets: 3, repsTarget, restSec: 45, substitutoId: "abducao-quadril-polia" }],
  });

  it("acrescenta ' cada' quando o substituto é de um lado só — ela faz os dois", () => {
    expect(UNILATERAIS.has("abducao-quadril-polia")).toBe(true);
    expect(aplicarAusentes(t("15-20"), ["abdutor-maquina"]).exercises[0].repsTarget).toBe("15-20 cada");
  });

  it("não duplica quando o alvo já diz 'cada'", () => {
    expect(aplicarAusentes(t("12 cada"), ["abdutor-maquina"]).exercises[0].repsTarget).toBe("12 cada");
  });

  it("substituto bilateral herda o alvo como está", () => {
    const b: WorkoutTemplate = { ...t("10-12"), exercises: [{ exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "10-12", restSec: 90, substitutoId: "agachamento-goblet" }] };
    expect(aplicarAusentes(b, ["leg-press-pes-medios"]).exercises[0].repsTarget).toBe("10-12");
  });

  it("o item que não foi trocado não ganha 'cada'", () => {
    expect(aplicarAusentes(t("15-20"), []).exercises[0].repsTarget).toBe("15-20");
  });
});

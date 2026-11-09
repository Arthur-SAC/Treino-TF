import { describe, it, expect } from "vitest";
import type { WorkoutTemplate } from "../../src/lib/db";
import { aplicarAusentes, blocoDoEquipamento, podeMarcarAusente, repsDoSubstituto, UNILATERAIS, type ItemTemplate } from "../../src/lib/troca-aparelho";

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

describe("repsDoSubstituto", () => {
  it("acrescenta ' cada' só quando o substituto é unilateral e o alvo ainda não diz", () => {
    expect(repsDoSubstituto("15-20", "kickback")).toBe("15-20 cada");
    expect(repsDoSubstituto("12 cada", "kickback")).toBe("12 cada");
    expect(repsDoSubstituto("10-12", "hip-thrust-barra")).toBe("10-12");
  });
});

describe("bloco do substituto pelo equipamento", () => {
  const t = (): WorkoutTemplate => ({
    id: "b", name: "B", dayOfWeek: 1, durationMin: 30,
    exercises: [
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12", restSec: 30, block: "solo", substitutoId: "leg-press-pes-medios" },
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", substitutoId: "hip-thrust-barra" },
    ],
  });
  const equip = (id: string) => (id === "leg-press-pes-medios" ? ["leg-press"] : ["barra", "banco"]);

  it("blocoDoEquipamento: maquina-* e leg-press são aparelho; o resto é solo", () => {
    expect(blocoDoEquipamento(["maquina-hip-thrust"])).toBe("maquina");
    expect(blocoDoEquipamento(["leg-press"])).toBe("maquina");
    expect(blocoDoEquipamento(["barra", "banco"])).toBe("solo");
    expect(blocoDoEquipamento(["halteres"])).toBe("solo");
  });

  it("substituto sem aparelho sai do bloco maquina; com aparelho entra nele", () => {
    const r = aplicarAusentes(t(), ["hip-thrust-maquina", "coice-gluteo-polia"], equip);
    expect(r.exercises[0]).toMatchObject({ exerciseId: "hip-thrust-barra", block: "solo" });
    expect(r.exercises[1]).toMatchObject({ exerciseId: "leg-press-pes-medios", block: "maquina" });
  });

  it("aquecimento/final não mudam de bloco, e sem lookup o bloco original fica", () => {
    expect(aplicarAusentes(t(), ["cardio-leve-esteira"], equip).exercises[2].block).toBe("aquecimento");
    expect(aplicarAusentes(t(), ["hip-thrust-maquina"]).exercises[0].block).toBe("maquina");
  });
});

import { describe, it, expect } from "vitest";
import { recommendCycleChange } from "../../src/lib/cycle-advisor";
import { cargaPassouDaSugestao } from "../../src/lib/carga-ciclo";
import type { Exercise, WorkoutSession, WorkoutTemplate } from "../../src/lib/db";
import type { Trend } from "../../src/lib/measurement-trend";

const stable: Trend = { dir: "stable", deltaCm: 0, points: 3 };
const base = {
  activeCycle: "entrada-1" as const,
  sessionsInCycle: 2,
  threshold: 5,
  waistCm: 95 as number | null,
  cinturaFimFase1: 84,
  waistTrend: stable,
  hipTrend: stable,
  waistGuardTriggered: false,
  cargaAcimaDaSugerida: false,
};

describe("recommendCycleChange na Entrada pela carga", () => {
  it("entrada-1 com 2 sessões e carga acima recomenda entrada-2", () => {
    const r = recommendCycleChange({ ...base, cargaAcimaDaSugerida: true });
    expect(r?.recommend).toBe(true);
    expect(r?.toCycle).toBe("entrada-2");
    expect(r?.reason).toMatch(/carga/i);
  });
  it("carga igual (ou menor) não recomenda antes do piso", () => {
    expect(recommendCycleChange(base)).toBeNull();
  });
  it("entrada-2 e entrada-3 também avançam pela carga", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "entrada-2", cargaAcimaDaSugerida: true })?.toCycle).toBe("entrada-3");
    expect(recommendCycleChange({ ...base, activeCycle: "entrada-3", cargaAcimaDaSugerida: true })?.toCycle).toBe("adaptacao");
  });
  it("o piso de sessões continua valendo sem a carga", () => {
    expect(recommendCycleChange({ ...base, sessionsInCycle: 5 })?.recommend).toBe(true);
  });
  it("adaptação em diante ignora a carga", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "adaptacao", threshold: 20, cargaAcimaDaSugerida: true })).toBeNull();
    expect(recommendCycleChange({ ...base, activeCycle: "variacao", threshold: 60, cargaAcimaDaSugerida: true })).toBeNull();
  });
});

const ex = (id: string, extra: Partial<Exercise> = {}): Exercise =>
  ({ id, name: id, category: "gluteo", equipment: ["maquina-abdutora"], startLoadKg: 15, ...extra }) as Exercise;
const exercicios = new Map<string, Exercise>([
  ["abdutora", ex("abdutora")],
  ["extensora", ex("extensora", { equipment: ["maquina-extensora"] })],
  ["prancha", ex("prancha", { equipment: ["peso-corporal"], startLoadKg: undefined })],
  ["semcarga", ex("semcarga", { startLoadKg: undefined })],
]);
const templates = new Map<string, WorkoutTemplate>([
  ["t1", { id: "t1", exercises: [{ exerciseId: "abdutora", repsTarget: "12-15" }] } as unknown as WorkoutTemplate],
]);
const sess = (id: number, date: string, exs: Array<[string, number[]]>, difficultySelf: "easy" | "medium" | "hard" = "medium"): WorkoutSession => ({
  id, date, templateId: "t1", difficultySelf,
  exercises: exs.map(([exerciseId, ws]) => ({ exerciseId, sets: ws.map((weight) => ({ reps: 15, weight })) })),
});

describe("cargaPassouDaSugestao", () => {
  it("sem histórico anterior compara com a carga inicial do exercício", () => {
    expect(cargaPassouDaSugestao([sess(1, "2026-11-10", [["abdutora", [48]]])], exercicios, templates, 1)).toBe(true);
    expect(cargaPassouDaSugestao([sess(1, "2026-11-10", [["abdutora", [15]]])], exercicios, templates, 1)).toBe(false);
  });
  it("sem histórico e sem carga inicial, o exercício não passa", () => {
    expect(cargaPassouDaSugestao([sess(1, "2026-11-10", [["semcarga", [30]]])], exercicios, templates, 1)).toBe(false);
  });
  it("com histórico usa suggestNextLoad: fácil em 20 sugere 25", () => {
    const antes = sess(1, "2026-11-10", [["abdutora", [20, 20]]], "easy");
    const igual = sess(2, "2026-11-12", [["abdutora", [25]]]);
    const acima = sess(2, "2026-11-12", [["abdutora", [30]]]);
    expect(cargaPassouDaSugestao([antes, igual], exercicios, templates, 2)).toBe(false);
    expect(cargaPassouDaSugestao([antes, acima], exercicios, templates, 2)).toBe(true);
  });
  it("só a última sessão conta", () => {
    const a = sess(1, "2026-11-10", [["abdutora", [48]]]);
    const b = sess(2, "2026-11-12", [["abdutora", [15]]]);
    expect(cargaPassouDaSugestao([a, b], exercicios, templates, 2)).toBe(false);
  });
  it("todo exercício com peso precisa passar", () => {
    const s = sess(1, "2026-11-10", [["abdutora", [48]], ["extensora", [15]]]);
    expect(cargaPassouDaSugestao([s], exercicios, templates, 1)).toBe(false);
    const t = sess(1, "2026-11-10", [["abdutora", [48]], ["extensora", [48]]]);
    expect(cargaPassouDaSugestao([t], exercicios, templates, 1)).toBe(true);
  });
  it("exercício sem peso é ignorado; sem nenhum com peso, falso", () => {
    const s = sess(1, "2026-11-10", [["abdutora", [48]], ["prancha", [0]]]);
    expect(cargaPassouDaSugestao([s], exercicios, templates, 1)).toBe(true);
    expect(cargaPassouDaSugestao([sess(1, "2026-11-10", [["prancha", [0]]])], exercicios, templates, 1)).toBe(false);
  });
  it("sem sessão no ciclo, falso", () => {
    expect(cargaPassouDaSugestao([sess(1, "2026-11-10", [["abdutora", [48]]])], exercicios, templates, 0)).toBe(false);
    expect(cargaPassouDaSugestao([], exercicios, templates, 1)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { volumeSemanal, diasComExercicio, type GrupoMuscular } from "../../src/lib/volume-muscular";
import { estimarDuracaoMin } from "../../src/lib/session-duration";
import type { WorkoutTemplate } from "../../src/lib/db";
import { foraDaFaixa } from "./faixas";

// Régua da fase 2 na Smartfit Jardins (docs/OBJETIVO.md §8.3), irmã da
// tests/data/fase1-chun-li.test.ts. Hipertrofia no topo, refinamento no meio,
// manutenção nunca deixa o glúteo médio abaixo de 12.
const doCiclo = (c: string) => CYCLE_TEMPLATES.filter((t) => t.cycle === c);
const VARIACAO = doCiclo("variacao");
const HIPERTROFIA = doCiclo("hipertrofia");
const REFINAMENTO = doCiclo("refinamento");
const MANUTENCAO = doCiclo("manutencao");
const FASE2 = [...HIPERTROFIA, ...REFINAMENTO, ...MANUTENCAO];

describe("fase 2 — Smartfit Jardins", () => {
  it("são 5 sessões por ciclo, de segunda a sexta", () => {
    for (const ts of [HIPERTROFIA, REFINAMENTO, MANUTENCAO]) {
      expect(ts.map((t) => t.dayOfWeek).sort()).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it("a hipertrofia fica dentro das faixas e nunca abaixo da variação", () => {
    const h = volumeSemanal(HIPERTROFIA);
    const v = volumeSemanal(VARIACAO);
    expect(foraDaFaixa(h)).toEqual([]);
    const abaixo = (Object.keys(h) as GrupoMuscular[]).filter((g) => h[g] < v[g]).map((g) => `${g}: ${h[g]} < ${v[g]}`);
    expect(abaixo).toEqual([]);
  });

  it("o refinamento fica dentro das faixas", () => {
    expect(foraDaFaixa(volumeSemanal(REFINAMENTO))).toEqual([]);
  });

  it("a manutenção nunca passa do refinamento, segura o glúteo médio em 12+ e usa a abdutora", () => {
    const m = volumeSemanal(MANUTENCAO);
    const r = volumeSemanal(REFINAMENTO);
    const passam = (Object.keys(m) as GrupoMuscular[]).filter((g) => m[g] > r[g]).map((g) => `${g}: ${m[g]} > ${r[g]}`);
    expect(passam).toEqual([]);
    expect(m["gluteo-medio"]).toBeGreaterThanOrEqual(12);
    expect(diasComExercicio(MANUTENCAO, "abdutor-maquina")).toBeGreaterThanOrEqual(1);
  });

  it("toda sessão da fase 2 cabe em 60 min, e o número anunciado bate com o estimador", () => {
    const erradas = FASE2
      .map((t) => ({ id: t.id, anunciado: t.durationMin, estimado: estimarDuracaoMin(t) }))
      .filter((r) => r.anunciado > 60 || r.anunciado !== r.estimado);
    expect(erradas).toEqual([]);
  });

  it("toda sessão da fase 2 declara blocos contíguos", () => {
    for (const t of FASE2) {
      expect({ id: t.id, semBloco: t.exercises.filter((e) => !e.block).length }).toEqual({ id: t.id, semBloco: 0 });
      const seq = t.exercises.map((e) => e.block).filter((b, i, arr) => b !== arr[i - 1]);
      expect({ id: t.id, contiguo: seq.length === new Set(seq).size }).toEqual({ id: t.id, contiguo: true });
    }
  });

  it("o smith nunca é exercício principal — a unidade não confirmou que tem", () => {
    const comSmith = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN, ...CYCLE_TEMPLATES]
      .filter((t) => t.exercises.some((e) => e.exerciseId === "smith-squat"))
      .map((t) => t.id);
    expect(comSmith).toEqual([]);
  });

  it("o posterior vem da flexora: mais séries de flexora que de stiff + good-morning, em todo ciclo", () => {
    const DOBRADICAS = ["stiff", "stiff-unilateral", "good-morning"];
    const soma = (ts: WorkoutTemplate[], f: (id: string) => boolean) =>
      ts.flatMap((t) => t.exercises).filter((e) => f(e.exerciseId)).reduce((a, e) => a + e.sets, 0);
    const todos = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN, ...CYCLE_TEMPLATES];
    const ciclos = [...new Set(todos.map((t) => t.cycle))];
    const errados = ciclos.flatMap((c) => {
      const ts = todos.filter((t) => t.cycle === c);
      const flexora = soma(ts, (id) => id.startsWith("flexora-"));
      const dobradica = soma(ts, (id) => DOBRADICAS.includes(id));
      if (dobradica > 0) return flexora > dobradica ? [] : [`${c}: flexora ${flexora} ≤ dobradiça ${dobradica}`];
      if ((c ?? "").startsWith("entrada")) return [];
      return flexora >= 1 ? [] : [`${c}: sem flexora`];
    });
    expect(errados).toEqual([]);
  });
});

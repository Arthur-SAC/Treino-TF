import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";
import { volumeSemanal, diasComExercicio, type GrupoMuscular } from "../../src/lib/volume-muscular";
import { estimarDuracaoMin } from "../../src/lib/session-duration";

const ADAPTACAO = WORKOUT_PLAN;
const VARIACAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "variacao");
const MANUTENCAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "manutencao");
const FASE1 = [...ADAPTACAO, ...VARIACAO];

const FAIXA_VARIACAO: Record<GrupoMuscular, [number, number]> = {
  "gluteo-max": [18, 22], "gluteo-medio": [15, 21], quadriceps: [12, 16], adutor: [6, 6],
  posterior: [6, 8], peito: [9, 12], costas: [9, 12], biceps: [6, 6], triceps: [6, 6],
};

describe("fase 1 — Chun-Li macia", () => {
  it("a variação (topo da fase 1) fica dentro das faixas da spec em todo grupo", () => {
    const v = volumeSemanal(VARIACAO);
    const fora = (Object.keys(FAIXA_VARIACAO) as GrupoMuscular[])
      .filter((g) => v[g] < FAIXA_VARIACAO[g][0] || v[g] > FAIXA_VARIACAO[g][1])
      .map((g) => `${g}: ${v[g]} (faixa ${FAIXA_VARIACAO[g].join("-")})`);
    expect(fora).toEqual([]);
  });

  it("a adaptação sobe até a variação — nunca passa dela em grupo nenhum", () => {
    const a = volumeSemanal(ADAPTACAO);
    const v = volumeSemanal(VARIACAO);
    const passam = (Object.keys(a) as GrupoMuscular[]).filter((g) => a[g] > v[g]);
    expect(passam).toEqual([]);
  });

  it("a abdutora de máquina aparece em 3 dias da semana, na adaptação e na variação", () => {
    expect(diasComExercicio(ADAPTACAO, "abdutor-maquina")).toBe(3);
    expect(diasComExercicio(VARIACAO, "abdutor-maquina")).toBe(3);
  });

  it("toda sessão da fase 1 cabe em 60 min, e o número anunciado bate com o estimador", () => {
    const erradas = FASE1
      .map((t) => ({ id: t.id, anunciado: t.durationMin, estimado: estimarDuracaoMin(t) }))
      .filter((r) => r.anunciado > 60 || r.anunciado !== r.estimado);
    expect(erradas).toEqual([]);
  });

  it("toda sessão da fase 1 declara blocos contíguos — a reordenação depende disso", () => {
    for (const t of FASE1) {
      expect({ id: t.id, semBloco: t.exercises.filter((e) => !e.block).length }).toEqual({ id: t.id, semBloco: 0 });
      const seq = t.exercises.map((e) => e.block).filter((b, i, arr) => b !== arr[i - 1]);
      expect({ id: t.id, contiguo: seq.length === new Set(seq).size }).toEqual({ id: t.id, contiguo: true });
    }
  });

  it("os ids dos templates de adaptação e variação são os de sempre — o histórico dela aponta pra eles", () => {
    expect(ADAPTACAO.map((t) => t.id)).toEqual([
      "seg-gluteo-mobilidade", "ter-cintura-costas", "qua-mobilidade-danca", "qui-gluteo-coxa", "sex-peitoral-postura",
    ]);
    expect(VARIACAO.map((t) => t.id)).toEqual([
      "v-seg-gluteo-unilateral", "v-ter-cintura-costas", "v-qua-mobilidade-danca", "v-qui-gluteo-stiff", "v-sex-peitoral-postura",
    ]);
  });

  it("nenhum template usa exercício que masculiniza o tronco", () => {
    const nome = new Map(EXERCISES.map((e) => [e.id, e.name.toLowerCase()]));
    const PROIBIDO = /desenvolvimento|eleva[çc][ãa]o lateral|encolhimento|supino reto|declinado|obl[íi]quo com carga/;
    const achados = ALL_TEMPLATES.flatMap((t) =>
      t.exercises
        .filter((e) => e.exerciseId === "puxada-frente-maquina" || PROIBIDO.test(nome.get(e.exerciseId) ?? ""))
        .map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(achados).toEqual([]);
  });

  it("o rebolado saiu da quarta — fica no sábado e na progressão de vitalidade", () => {
    const quartas = FASE1.filter((t) => t.dayOfWeek === 3);
    expect(quartas.flatMap((t) => t.exercises.map((e) => e.exerciseId))).not.toContain("rebolado-basico");
  });

  it("a manutenção nunca deixa o glúteo médio abaixo de 12, e com máquina", () => {
    expect(volumeSemanal(MANUTENCAO)["gluteo-medio"]).toBeGreaterThanOrEqual(12);
    expect(diasComExercicio(MANUTENCAO, "abdutor-maquina")).toBeGreaterThanOrEqual(1);
  });
});

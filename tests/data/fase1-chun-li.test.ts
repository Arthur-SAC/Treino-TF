import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";
import { volumeSemanal, diasComExercicio, type GrupoMuscular } from "../../src/lib/volume-muscular";
import { estimarDuracaoMin } from "../../src/lib/session-duration";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { FAIXA_VARIACAO } from "./faixas";

const ADAPTACAO = WORKOUT_PLAN;
const VARIACAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "variacao");
const MANUTENCAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "manutencao");
const FASE1 = [...ADAPTACAO, ...VARIACAO];
// A Entrada também é fase 1 (Smartfit, 2026-11-09): mesmas réguas de duração e
// de blocos, com teto de 40 min.
const FASE1_COM_ENTRADA = [...ENTRADA_TEMPLATES, ...FASE1];
const eqDe = new Map(EXERCISES.map((e) => [e.id, e.equipment ?? []]));
const MIOLO = (b?: string) => b === "maquina" || b === "solo";
const SEMANA_DE_APRENDER = "Semana de aprender: ache o aparelho, regule e use carga leve — sobra fôlego no fim de cada série";

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

  it("toda sessão da fase 1 cabe em 60 min (40 na Entrada), e o número anunciado bate com o estimador", () => {
    const erradas = FASE1_COM_ENTRADA
      .map((t) => ({ id: t.id, anunciado: t.durationMin, estimado: estimarDuracaoMin(t), teto: (t.cycle ?? "").startsWith("entrada") ? 40 : 60 }))
      .filter((r) => r.anunciado > r.teto || r.anunciado !== r.estimado);
    expect(erradas).toEqual([]);
  });

  it("toda sessão da fase 1 declara blocos contíguos — a reordenação depende disso", () => {
    for (const t of FASE1_COM_ENTRADA) {
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

  it("a Entrada mantém a divisão da variação: inferior seg/qua/sex, superior ter/qui, nas três semanas", () => {
    for (const cycle of ["entrada-1", "entrada-2", "entrada-3"]) {
      const dias = ENTRADA_TEMPLATES.filter((t) => t.cycle === cycle).map((t) => t.dayOfWeek).sort();
      expect({ cycle, dias }).toEqual({ cycle, dias: [1, 2, 3, 4, 5] });
    }
    const inferior = (t: (typeof ENTRADA_TEMPLATES)[number]) => t.exercises.some((e) => e.exerciseId === "abdutor-maquina");
    for (const t of ENTRADA_TEMPLATES) {
      expect({ id: t.id, inferior: inferior(t) }).toEqual({ id: t.id, inferior: [1, 3, 5].includes(t.dayOfWeek) });
    }
  });

  it("o miolo da Entrada é só máquina e polia (core de peso do corpo pode)", () => {
    const CORE_LIVRE = ["vacuum-abdominal", "ponte-gluteo-band"];
    const fora = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises
        .filter((e) => MIOLO(e.block) && !CORE_LIVRE.includes(e.exerciseId))
        .filter((e) => !(eqDe.get(e.exerciseId) ?? []).some((q) => q.startsWith("maquina-") || q === "leg-press" || q === "polia"))
        .map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(fora).toEqual([]);
    expect(ENTRADA_TEMPLATES.flatMap((t) => t.exercises).some((e) => e.exerciseId === "smith-squat")).toBe(false);
  });

  it("semana 1: 2 séries por exercício, carga leve escrita em todo item do miolo, hip thrust na máquina", () => {
    const s1 = ENTRADA_TEMPLATES.filter((t) => t.cycle === "entrada-1");
    const errados = s1.flatMap((t) =>
      t.exercises.filter((e) => MIOLO(e.block)).filter((e) => e.sets !== 2 || e.notes !== SEMANA_DE_APRENDER).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(errados).toEqual([]);
    expect(s1.find((t) => t.dayOfWeek === 1)!.exercises.map((e) => e.exerciseId)).toContain("hip-thrust-maquina");
  });

  it("semana 2 com 2-3 séries e semana 3 com 3 séries por exercício do miolo", () => {
    const series = (c: string) => ENTRADA_TEMPLATES.filter((t) => t.cycle === c).flatMap((t) => t.exercises.filter((e) => MIOLO(e.block)).map((e) => e.sets));
    expect(series("entrada-2").every((s) => s === 2 || s === 3)).toBe(true);
    expect(series("entrada-2").some((s) => s === 3)).toBe(true);
    expect(series("entrada-3").every((s) => s === 3)).toBe(true);
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

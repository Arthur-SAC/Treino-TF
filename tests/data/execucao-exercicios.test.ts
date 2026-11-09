import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";
import { problemasDaExecucao } from "../../src/lib/execucao";

// Ela disse que as explicações eram complicadas e que tinha que pesquisar tudo
// fora do app. Todo exercício que o treino mostra — e todo substituto que o
// "Ocupado"/"Não tem aqui" pode trocar — tem o formato fixo, validado.
// Cardio e aquecimento articular ficam de fora: não são exercício de técnica.
const FORA = new Set(["cardio-pos-treino", "cardio-leve-esteira", "aquecimento-articular"]);

const IDS_DO_TREINO = [
  ...new Set(
    ALL_TEMPLATES.flatMap((t) =>
      t.exercises.flatMap((e) => [e.exerciseId, ...(e.substitutoId ? [e.substitutoId] : [])]),
    ),
  ),
]
  .filter((id) => !FORA.has(id))
  .sort();

const porId = new Map(EXERCISES.map((e) => [e.id, e]));

describe("execução de todos os exercícios do treino", () => {
  it("todo id do treino existe no catálogo", () => {
    expect(IDS_DO_TREINO.filter((id) => !porId.has(id))).toEqual([]);
  });

  it("todo exercício e substituto do treino tem execução", () => {
    expect(IDS_DO_TREINO.filter((id) => !porId.get(id)?.execucao)).toEqual([]);
  });

  it("toda execução passa no validador do formato", () => {
    const ruins = IDS_DO_TREINO.flatMap((id) => {
      const e = porId.get(id);
      if (!e?.execucao) return [];
      return problemasDaExecucao(e.execucao, e.equipment).map((p) => `${id}: ${p}`);
    });
    expect(ruins).toEqual([]);
  });

  it("'Pra render mais' nunca pede mais carga", () => {
    const ruins = IDS_DO_TREINO.flatMap((id) =>
      (porId.get(id)?.execucao?.renderMais ?? [])
        .filter((r) => /(mais|aumente?a?r?|sob[ea]r?) (a )?(carga|peso)|carga maior|peso maior/i.test(r))
        .map((r) => `${id}: ${r}`),
    );
    expect(ruins).toEqual([]);
  });

  it("nada acima da cabeça", () => {
    const ruins = IDS_DO_TREINO.flatMap((id) => {
      const x = porId.get(id)?.execucao;
      if (!x) return [];
      const textos = [x.posicao, ...x.movimento, x.ondeSentir, ...x.renderMais];
      return textos.filter((t) => /acima da cabe[çc]a/i.test(t) && !/n[ãa]o|nunca/i.test(t)).map((t) => `${id}: ${t}`);
    });
    expect(ruins).toEqual([]);
  });
});

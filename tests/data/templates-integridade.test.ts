import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES, CYCLES } from "../../src/data/cycles-seed";

describe("integridade dos templates", () => {
  it("ALL_TEMPLATES junta os três conjuntos, sem sobra nem falta", () => {
    expect(ALL_TEMPLATES).toHaveLength(
      ENTRADA_TEMPLATES.length + WORKOUT_PLAN.length + CYCLE_TEMPLATES.length,
    );
  });

  it("nenhum template repete o mesmo exerciseId duas vezes", () => {
    // SessionDetail usa `key={tplEx.exerciseId}`. Com a reordenação por bloco,
    // uma key duplicada faria o React reaproveitar o SessionRecorder errado —
    // vazando reps e peso digitados de um exercício pro outro.
    const duplicados = ALL_TEMPLATES.flatMap((t) => {
      const vistos = new Set<string>();
      return t.exercises
        .filter((e) => (vistos.has(e.exerciseId) ? true : (vistos.add(e.exerciseId), false)))
        .map((e) => `${t.id}: ${e.exerciseId}`);
    });
    expect(duplicados).toEqual([]);
  });

  it("nenhum id de template se repete entre os ciclos", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(ids).toHaveLength(new Set(ids).size);
  });
});

describe("nenhuma fase de treino existe para alinhar com a TRH", () => {
  // Cobre a sigla e a raiz "horm" — não "hormon", que não bate com
  // "hormônio" (o "ô" acentuado é um code point diferente de "o" e /i não
  // normaliza acento). Em português quase toda palavra que começa com
  // "horm" é da família hormônio, então a raiz curta é segura sem precisar
  // antecipar cada flexão/acento. Um template de treino não tem assunto
  // legítimo com hormônio, então qualquer ocorrência aqui é a mesma
  // moldura de espera voltando por outra palavra.
  const MENCAO_HORMONIO = /TRH|horm/i;

  it("o padrão de varredura pega as formas acentuadas — foi assim que 'hormônio' escapou antes", () => {
    const escapou = ["hormônio", "hormônios", "hormonal", "hormonização", "TRH"]
      .filter((p) => !MENCAO_HORMONIO.test(p));
    expect(escapou).toEqual([]);
  });

  it("as descrições dos ciclos não citam TRH nem variações de hormônio", () => {
    const comMencao = CYCLES.filter((c) => MENCAO_HORMONIO.test(c.description)).map((c) => c.id);
    expect(comMencao).toEqual([]);
  });

  it("nem o propósito nem as notas dos exercícios citam TRH ou variações de hormônio", () => {
    // Reporta template + campo (e o exercício, quando é `notes`) pra não
    // obrigar quem for corrigir a caçar a linha de novo.
    const achados = ALL_TEMPLATES.flatMap((t) => {
      const hits: string[] = [];
      if (MENCAO_HORMONIO.test(t.purpose ?? "")) hits.push(`${t.id}: purpose`);
      for (const ex of t.exercises) {
        if (MENCAO_HORMONIO.test(ex.notes ?? "")) hits.push(`${t.id}: notes (${ex.exerciseId})`);
      }
      return hits;
    });
    expect(achados).toEqual([]);
  });
});

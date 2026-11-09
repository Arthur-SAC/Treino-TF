import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";
import { GRUPO_DO_EXERCICIO, volumeSemanal } from "../../src/lib/volume-muscular";
import { estimarDuracaoMin } from "../../src/lib/session-duration";
import { aplicarAusentes } from "../../src/lib/troca-aparelho";
import { foraDaFaixa } from "./faixas";

// "Ocupado" e "Não tem aqui" (spec 2026-11-09 §6): o treino nunca pode
// depender de uma máquina específica. Varre os templates CRUS — o cardio
// pós-treino que all-templates.ts soma depois não tem aparelho compartilhado.
const CRUS = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN, ...CYCLE_TEMPLATES];
const porId = new Map(EXERCISES.map((e) => [e.id, e]));
const equip = (id: string) => porId.get(id)?.equipment ?? [];

// Aparelho que alguém pode estar usando: máquina, leg press, polia, banco
// (inclui o inclinado e o de 45°) e barra. Halter solto, elástico e peso do
// corpo não têm fila.
const COMPARTILHADO = /maquina-|leg-press|polia|banco|barra/;
const usaCompartilhado = (id: string) => equip(id).some((q) => COMPARTILHADO.test(q));
const MIOLO = (b?: string) => b === "maquina" || b === "solo";

const PROIBIDO = /desenvolvimento|eleva[çc][ãa]o lateral|encolhimento|supino reto|declinado|obl[íi]quo com carga/;

describe("substitutos declarados", () => {
  it("todo item do miolo que usa aparelho compartilhado tem substituto", () => {
    const sem = CRUS.flatMap((t) =>
      t.exercises
        .filter((e) => MIOLO(e.block) && usaCompartilhado(e.exerciseId) && !e.substitutoId)
        .map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(sem).toEqual([]);
  });

  it("todo substituto existe no catálogo e é diferente do original", () => {
    const ruins = CRUS.flatMap((t) =>
      t.exercises
        .filter((e) => e.substitutoId && (!porId.has(e.substitutoId) || e.substitutoId === e.exerciseId))
        .map((e) => `${t.id}: ${e.exerciseId} → ${e.substitutoId}`),
    );
    expect(ruins).toEqual([]);
  });

  it("o substituto trabalha o mesmo grupo que o original", () => {
    const ruins = CRUS.flatMap((t) =>
      t.exercises
        .filter((e) => e.substitutoId && GRUPO_DO_EXERCICIO[e.exerciseId])
        .filter((e) => GRUPO_DO_EXERCICIO[e.substitutoId!] !== GRUPO_DO_EXERCICIO[e.exerciseId])
        .map((e) => `${t.id}: ${e.exerciseId} (${GRUPO_DO_EXERCICIO[e.exerciseId]}) → ${e.substitutoId} (${GRUPO_DO_EXERCICIO[e.substitutoId!]})`),
    );
    expect(ruins).toEqual([]);
  });

  it("nenhum substituto é exercício que masculiniza o tronco", () => {
    const ruins = CRUS.flatMap((t) =>
      t.exercises
        .filter((e) => e.substitutoId)
        .filter((e) => e.substitutoId === "puxada-frente-maquina" || PROIBIDO.test(porId.get(e.substitutoId!)?.name.toLowerCase() ?? ""))
        .map((e) => `${t.id}: ${e.substitutoId}`),
    );
    expect(ruins).toEqual([]);
  });

  it("nenhum substituto repete outro exercício ou outro substituto do mesmo template", () => {
    const ruins = CRUS.flatMap((t) => {
      const ids = new Set(t.exercises.map((e) => e.exerciseId));
      const subs = t.exercises.map((e) => e.substitutoId).filter((s): s is string => !!s);
      return subs
        .filter((s, i) => ids.has(s) || subs.indexOf(s) !== i)
        .map((s) => `${t.id}: ${s}`);
    });
    expect(ruins).toEqual([]);
  });

  it("sem nenhuma máquina, toda sessão cabe no teto e a variação continua nas faixas", () => {
    const MAQUINAS = EXERCISES
      .filter((e) => (e.equipment ?? []).some((q) => q.startsWith("maquina-") || q === "leg-press"))
      .map((e) => e.id);
    const trocados = CRUS.map((t) => aplicarAusentes(t, MAQUINAS));
    const estouram = trocados
      .map((t) => ({ id: t.id, min: estimarDuracaoMin(t), teto: (t.cycle ?? "").startsWith("entrada") ? 40 : 60 }))
      .filter((r) => r.min > r.teto);
    expect(estouram).toEqual([]);
    expect(foraDaFaixa(volumeSemanal(trocados.filter((t) => t.cycle === "variacao")))).toEqual([]);
  });
});

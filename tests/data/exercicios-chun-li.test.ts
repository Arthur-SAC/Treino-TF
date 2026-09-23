import { describe, it, expect } from "vitest";
import { EXERCISES, EXERCISE_VIDEOS } from "../../src/data/exercises-seed";
import { CATEGORIES } from "../../src/pages/workout/ExerciseLibrary";
import { GRUPO_DO_EXERCICIO } from "../../src/lib/volume-muscular";

const NOVOS = [
  "leg-press-pes-medios", "cadeira-extensora", "flexora-em-pe", "rosca-martelo", "rosca-barra-w",
  "triceps-testa-barra-w", "remada-unilateral-halter", "farmer-walk", "extensao-lombar",
];
const DISPONIVEL = ["halteres", "barra", "anilhas", "banco", "leg-press", "multiestacao", "bola-suica", "espaldar", "caneleira", "colchonete"];

describe("exercícios da Chun-Li macia", () => {
  it("os nove existem, com descrição, erros comuns, cue de acerto e dicas", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id);
      expect({ id, ok: !!e && !!e.description && e.commonMistakes.length > 0 && !!e.successCue && (e.proTips ?? []).length >= 2 })
        .toEqual({ id, ok: true });
    }
  });

  it("só usam equipamento da academia do prédio", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect({ id, fora: e.equipment.filter((q) => !DISPONIVEL.includes(q)) }).toEqual({ id, fora: [] });
    }
  });

  it("todo exercício com grupo muscular mapeado existe no catálogo", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    expect(Object.keys(GRUPO_DO_EXERCICIO).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("Pernas e Braços viraram filtros da Biblioteca", () => {
    expect(CATEGORIES).toContain("pernas");
    expect(CATEGORIES).toContain("bracos");
  });

  it("cada novo tem vídeo do YouTube", () => {
    for (const id of NOVOS) expect({ id, url: EXERCISE_VIDEOS[id] ?? null }).not.toEqual({ id, url: null });
  });
});

import { describe, it, expect } from "vitest";
import { EXERCISES, EXERCISE_VIDEOS } from "../../src/data/exercises-seed";
import { toEmbed } from "../../src/lib/video";

describe("vídeos dos exercícios", () => {
  it("aplica o videoUrl do mapa aos exercícios", () => {
    const hip = EXERCISES.find((e) => e.id === "hip-thrust-barra");
    expect(hip?.videoUrl).toBe(EXERCISE_VIDEOS["hip-thrust-barra"]);
  });

  it("todos os links do mapa são do YouTube (embutíveis)", () => {
    for (const url of Object.values(EXERCISE_VIDEOS)) {
      expect(toEmbed(url)?.kind).toBe("youtube");
    }
  });

  it("todo id do mapa existe na biblioteca de exercícios", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const id of Object.keys(EXERCISE_VIDEOS)) {
      expect(ids.has(id)).toBe(true);
    }
  });

  // A direção que faltava. O teste acima cobre mapa → catálogo, e por isso
  // nunca acusou o inverso: os dois exercícios do padrão de levantar entraram
  // no catálogo SEM vídeo e ficaram os únicos de força sem demonstração —
  // justamente os dois mais sensíveis à técnica (carga à frente do corpo e
  // quadril que não pode girar). Exercício de força que ela nunca fez, sem
  // vídeo, é conteúdo que não chega.
  const SEM_VIDEO_POR_NATUREZA = new Set([
    "cardio-leve-esteira", "cardio-zona2", "bike-reclinada", "aquecimento-articular",
  ]);

  it("todo exercício de força/mobilidade do catálogo tem vídeo no mapa", () => {
    const sem = EXERCISES
      .filter((e) => !SEM_VIDEO_POR_NATUREZA.has(e.id))
      .filter((e) => !EXERCISE_VIDEOS[e.id])
      .map((e) => `${e.id} (${e.category})`);
    expect(sem).toEqual([]);
  });

  it("os dois exercícios do padrão de levantar têm demonstração", () => {
    for (const id of ["carregamento-frontal", "prancha-antirrotacao"]) {
      const e = EXERCISES.find((x) => x.id === id);
      expect({ id, url: e?.videoUrl }).toEqual({ id, url: EXERCISE_VIDEOS[id] });
      expect(toEmbed(EXERCISE_VIDEOS[id])?.kind).toBe("youtube");
    }
  });
});

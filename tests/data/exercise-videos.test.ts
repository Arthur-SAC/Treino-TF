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
});

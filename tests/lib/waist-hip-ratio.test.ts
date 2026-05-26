import { describe, it, expect } from "vitest";
import { calculateWhr, classifyWhr } from "../../src/lib/waist-hip-ratio";
import type { WhrCategory } from "../../src/lib/waist-hip-ratio";

describe("calculateWhr", () => {
  it("retorna razão correta", () => {
    expect(calculateWhr(80, 120)).toBeCloseTo(0.6667, 3);
  });

  it("arredonda para 4 casas", () => {
    expect(calculateWhr(99, 114)).toBeCloseTo(0.8684, 3);
  });

  it("retorna 0 se quadril for 0", () => {
    expect(calculateWhr(80, 0)).toBe(0);
  });
});

describe("classifyWhr", () => {
  it.each<[number, WhrCategory]>([
    [0.65, "ampulheta-forte"],
    [0.71, "ampulheta-forte"],
    [0.72, "ampulheta-moderada"],
    [0.79, "ampulheta-moderada"],
    [0.80, "transicao"],
    [0.89, "transicao"],
    [0.90, "perfil-masculino"],
    [1.0, "perfil-masculino"],
  ])("classifica %f como %s", (ratio, expected) => {
    expect(classifyWhr(ratio)).toBe(expected);
  });
});

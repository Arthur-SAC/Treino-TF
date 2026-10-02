import { describe, it, expect } from "vitest";
import { posturaDoDia, SEQUENCIAS_POSTURA, ATE_GINGADO } from "../../src/lib/postura-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

const ids = (praticas: number) => new Set(Array.from({ length: 30 }, (_, d) => posturaDoDia(d + 1, praticas).sequenceId));

describe("postura do dia", () => {
  it("antes de 14 práticas alterna só andar e 8 — gingado não aparece", () => {
    expect(ids(0)).toEqual(new Set(["corporal-caminhada", "corporal-oito-quadril"]));
    expect(ids(ATE_GINGADO - 1).has("sensual-andar-gingado")).toBe(false);
  });

  it("a partir de 14 entram as três", () => {
    expect(ids(ATE_GINGADO)).toEqual(new Set(SEQUENCIAS_POSTURA));
  });

  it("dias seguidos não repetem a mesma sequência", () => {
    for (const p of [0, ATE_GINGADO]) {
      for (let d = 1; d < 40; d++) expect(posturaDoDia(d, p).sequenceId).not.toBe(posturaDoDia(d + 1, p).sequenceId);
    }
  });

  // Review Focus: entrada inválida
  it("dia do ano 0, negativo ou NaN e práticas inválidas não quebram", () => {
    for (const d of [0, -5, Number.NaN]) {
      expect(SEQUENCIAS_POSTURA).toContain(posturaDoDia(d, Number.NaN).sequenceId);
    }
  });

  it("toda sequência da trilha existe no catálogo e tem movimentos", () => {
    for (const id of SEQUENCIAS_POSTURA) {
      const s = SEQUENCES.find((x) => x.id === id);
      expect({ id, existe: !!s, movs: (s?.moves.length ?? 0) >= 4 }).toEqual({ id, existe: true, movs: true });
    }
  });

  it("a etapa diz o que é sem expor nada", () => {
    expect(posturaDoDia(1, 0).etapa).toMatch(/\S/);
    expect(posturaDoDia(1, ATE_GINGADO).etapa).toMatch(/\S/);
  });
});

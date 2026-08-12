import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const NOVAS = ["flex-manha-amplitude", "flex-manha-sustentacao", "flex-noite-amplitude", "flex-noite-sustentacao"];

describe("sequências de flexibilidade", () => {
  it("toda sequência que a progressão serve existe no catálogo", () => {
    const todas = [...SEQUENCIAS_FLEX.manha, ...SEQUENCIAS_FLEX.noite];
    const faltando = todas.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
  });

  it("as quatro novas são de mobilidade e têm foco e movimentos", () => {
    for (const id of NOVAS) {
      const s = SEQUENCES.find((x) => x.id === id)!;
      expect({ id, cat: s.category, foco: !!s.focus, movs: s.moves.length >= 4 })
        .toEqual({ id, cat: "mobilidade", foco: true, movs: true });
    }
  });

  it("nenhuma põe espacate como meta — não é necessário pra nada do que ela quer", () => {
    const PROMESSA = /(at[ée]|chegar|rumo|objetivo|meta|alcan[çc]ar)[^.]{0,40}espacate/i;
    for (const id of NOVAS) {
      const texto = JSON.stringify(SEQUENCES.find((x) => x.id === id)!);
      expect({ id, promete: PROMESSA.test(texto) }).toEqual({ id, promete: false });
    }
  });

  it("onde o espacate é citado, é para dizer que NÃO é necessário", () => {
    for (const id of NOVAS) {
      const texto = JSON.stringify(SEQUENCES.find((x) => x.id === id)!);
      if (!/espacate/i.test(texto)) continue;
      expect({ id, nega: /espacate[^.]{0,60}n[ãa]o|n[ãa]o[^.]{0,60}espacate/i.test(texto) })
        .toEqual({ id, nega: true });
    }
  });

  it("todas mandam parar antes da dor — alongamento não é dor", () => {
    for (const id of NOVAS) {
      expect(JSON.stringify(SEQUENCES.find((x) => x.id === id)!).toLowerCase()).toMatch(/dor|desconforto/);
    }
  });

  it("a duração cresce da fase 2 pra 3 na trilha da noite, que é a de sustentação", () => {
    const f2 = SEQUENCES.find((s) => s.id === "flex-noite-amplitude")!;
    const f3 = SEQUENCES.find((s) => s.id === "flex-noite-sustentacao")!;
    expect(f3.durationMin).toBeGreaterThanOrEqual(f2.durationMin);
  });
});

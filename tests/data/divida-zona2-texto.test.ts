import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { TREINOS_POR_SEMANA } from "../../src/lib/objetivo";
import ritmo from "../../src/lib/ritmo.ts?raw";
import revisao from "../../src/lib/revisao-semanal.ts?raw";
import semanaCard from "../../src/components/SemanaCard.tsx?raw";

describe("cardio-zona2 vale pros dois modos", () => {
  const z2 = EXERCISES.find((e) => e.id === "cardio-zona2")!;
  it("não afirma que a caminhada do trabalho sempre acontece, e cita a esteira", () => {
    expect(z2.description).not.toContain("É a caminhada de 5 km do trabalho para casa");
    expect(z2.description).toContain("esteira");
  });
  it("nenhum texto do exercício fixa a caminhada das 16h nem proíbe outro cardio", () => {
    // A rede cobre tudo o que a tela mostra, não só a descrição.
    expect(JSON.stringify(z2)).not.toMatch(/caminhada das 16h|não precisa de mais cardio contínuo depois/);
    expect(JSON.stringify(EXERCISES.find((e) => e.id === "bike-reclinada")!)).not.toMatch(/caminhada das 16h/);
  });
});

describe("treinos por semana tem fonte única", () => {
  it("objetivo.ts exporta 5", () => expect(TREINOS_POR_SEMANA).toBe(5));
  it.each([["ritmo", ritmo], ["revisao-semanal", revisao], ["SemanaCard", semanaCard]])(
    "%s não repete o 5 literal",
    (_n, src) => {
      expect(src).not.toMatch(/\b5 \*/);
      expect(src).not.toMatch(/de 5`/);
      expect(src).not.toMatch(/, 5\)/);
      expect(src).not.toMatch(/\/5 treinos/);
    },
  );
});

import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

// A polia BAIXA da academia do prédio é CURTA: exercícios que dependem dela
// (puxar de baixo pra cima, ou tornozeleira no cabo) travam de amplitude. Nenhum
// template deve programá-los — usar halteres/abdutora/caneleira no lugar.
const LOW_PULLEY_IDS = [
  "crucifixo-polia",
  "abdutor-cabo-em-pe",
  "coice-gluteo-polia",
  "pull-through-polia",
  "abducao-quadril-polia",
];

describe("templates não dependem da polia baixa (curta)", () => {
  it("nenhum exercício de template usa a polia baixa", () => {
    const all = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];
    const offenders = all.flatMap((t) =>
      t.exercises
        .filter((e) => LOW_PULLEY_IDS.includes(e.exerciseId))
        .map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(offenders).toEqual([]);
  });
});

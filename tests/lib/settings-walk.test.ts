import { describe, it, expect } from "vitest";
import { getSetting } from "../../src/lib/settings-helpers";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("walkGoalMin setting", () => {
  it("tem default de 120 min — 60 da caminhada do trabalho + 60 dos cães, a rotina real de dia útil", async () => {
    expect(await getSetting("walkGoalMin")).toBe(120);
  });

  // Trava a regressão do fix 1 (Task 7, rodada 1): existem hoje DOIS itens
  // control:"walk" em dia útil (`caminhada-trabalho` e `caes`), e
  // `creditarPasseio` (daily-log-helpers.ts) credita 60 min fixos por item.
  // Se alguém baixasse `walkGoalMin` de volta sem perceber essa soma, a meta
  // nasceria batida antes da caminhada acabar — um medidor "X / Y min" que
  // não mede mais nada. Este teste amarra o padrão à soma real, pra quem for
  // mexer num dos dois lados enxergar o outro.
  it("a meta padrão é compatível com a soma dos itens de caminhada de um dia útil", async () => {
    const CREDITO_POR_ITEM_MIN = 60; // mesmo valor fixo de creditarPasseio()
    const itensDeCaminhadaNoDiaUtil = buildDayRoutine(1, 2).blocks
      .flatMap((b) => b.items)
      .filter((i) => i.control === "walk").length;
    expect(await getSetting("walkGoalMin")).toBe(itensDeCaminhadaNoDiaUtil * CREDITO_POR_ITEM_MIN);
  });
});

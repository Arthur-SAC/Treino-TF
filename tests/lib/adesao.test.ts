import { describe, it, expect } from "vitest";
import { contarAdesao } from "../../src/lib/adesao";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const JANELA = ["2026-10-05", "2026-10-06", "2026-10-07"];

describe("contar a adesão da janela", () => {
  it("conta dias distintos dentro da janela e ignora o que está fora", () => {
    const a = contarAdesao(JANELA, {
      sessoes: [{ date: "2026-10-05" }, { date: "2026-10-05" }, { date: "2026-10-07" }, { date: "2026-10-01" }],
      checks: [
        { date: "2026-10-05", itemId: "caminhada-trabalho", done: true },
        { date: "2026-10-06", itemId: "caminhada-trabalho", done: false },
        { date: "2026-10-06", itemId: "caes", done: true },
        { date: "2026-10-07", itemId: "caminhada-fds", done: true },
      ],
      logs: [
        { date: "2026-10-05", waterMl: 0, activeBreakCount: 0, sleepAt: "22:10" },
        { date: "2026-10-06", waterMl: 0, activeBreakCount: 0, sleepAt: "23:40" },
      ],
      praticas: [
        { date: "2026-10-06", sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true },
        { date: "2026-10-07", sequenceId: SEQUENCIAS_FLEX.manha[0], completed: true },
      ],
    }, "22:30");
    expect(a).toEqual({ dias: 3, treinos: 2, diasCardio: 2, noitesNoAlvo: 1, alongamentosNoite: 1 });
  });
});

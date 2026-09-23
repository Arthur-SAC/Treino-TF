import { describe, it, expect } from "vitest";
import { escolherPartida, projetar, mesAno } from "../../src/lib/partida";
import type { Measurement } from "../../src/lib/db";

const m = (x: Partial<Measurement> & { date: string }): Measurement => ({ ...x } as Measurement);

describe("escolher a partida", () => {
  it("ignora a medição de maio que o seed gravou", () => {
    expect(escolherPartida([m({ date: "2026-05-13", weightKg: 96, waistCm: 99, neckCm: 40 })])).toBeNull();
  });
  it("precisa de peso, cintura e pescoço — sem um deles não há partida", () => {
    expect(escolherPartida([m({ date: "2026-09-25", weightKg: 96, waistCm: 99 })])).toBeNull();
  });
  it("pega a primeira válida a partir do recomeço; no mesmo dia, o menor id", () => {
    const p = escolherPartida([
      m({ id: 9, date: "2026-10-10", weightKg: 94, waistCm: 97, neckCm: 40 }),
      m({ id: 5, date: "2026-09-25", weightKg: 96.4, waistCm: 99.5, neckCm: 40 }),
      m({ id: 3, date: "2026-09-25", weightKg: 96.2, waistCm: 99, neckCm: 40, hipCm: 114 }),
    ]);
    expect(p).toEqual({ data: "2026-09-25", pesoKg: 96.2, cinturaCm: 99, pescocoCm: 40, quadrilCm: 114 });
  });
});

describe("projeção da fase 1", () => {
  const partida = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };
  const pr = projetar(partida, 173)!;

  it("a massa magra sai da régua androide e o peso-alvo reproduz 80-82", () => {
    expect(pr.gorduraPct).toBeCloseTo(25.7, 1);
    expect(pr.pesoAlvoFase1).toEqual([80, 82]);
  });
  it("o ritmo vem do déficit de CONSUMO (2.700-2.900 contra 2.200)", () => {
    expect(pr.ritmoKgSemana).toEqual([0.45, 0.64]);
  });
  it("as datas saem em mês de calendário a partir da partida, mais cedo antes de mais tarde", () => {
    expect(pr.fimFase1[0] <= pr.fimFase1[1]).toBe(true);
    expect(pr.fimFase1[0] >= "2027-02").toBe(true);
    expect(pr.fimFase1[1] <= "2027-06").toBe(true);
    expect(pr.fimFase2).toEqual(["2028-06", "2028-12"]);
  });
  it("o marco 88 vem antes do fim da fase 1", () => {
    expect(pr.cintura88).not.toBe("ja");
    const [c88] = pr.cintura88 as [string, string];
    expect(c88 < pr.fimFase1[0]).toBe(true);
  });
  it("com a cintura já em 88 ou menos, o marco é 'já'", () => {
    expect(projetar({ ...partida, cinturaCm: 87 }, 173)!.cintura88).toBe("ja");
  });
  it("sem altura não há projeção", () => {
    expect(projetar(partida, 0)).toBeNull();
  });
  it("mês por extenso curto", () => {
    expect(mesAno("2027-03")).toBe("mar/2027");
  });
});

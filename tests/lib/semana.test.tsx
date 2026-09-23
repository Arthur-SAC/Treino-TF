import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { treinosNaSemana, variacaoDesdePartida } from "../../src/lib/semana";
import { SemanaCard } from "../../src/components/SemanaCard";

describe("treinos na semana", () => {
  it("conta dias distintos de segunda até hoje", () => {
    // 2026-09-24 é quinta; a semana começa na segunda 21/09.
    const datas = ["2026-09-20", "2026-09-21", "2026-09-21", "2026-09-23", "2026-09-24"];
    expect(treinosNaSemana(datas, "2026-09-24")).toBe(3);
  });
  it("no domingo ainda conta a semana que começou na segunda", () => {
    expect(treinosNaSemana(["2026-09-21", "2026-09-27"], "2026-09-27")).toBe(2);
  });
});

describe("variação desde a partida", () => {
  it("peso e cintura da última medida contra a partida", () => {
    expect(variacaoDesdePartida({ pesoKg: 96, cinturaCm: 99 }, { weightKg: 94.2, waistCm: 97 }))
      .toEqual({ pesoKg: -1.8, cinturaCm: -2 });
  });
  it("sem o campo na última medida, não inventa", () => {
    expect(variacaoDesdePartida({ pesoKg: 96, cinturaCm: 99 }, { waistCm: 98 }))
      .toEqual({ pesoKg: null, cinturaCm: -1 });
  });
});

describe("card da semana", () => {
  it("mostra treinos contra os 5 do plano e a variação desde a partida", () => {
    render(<SemanaCard treinos={3} variacao={{ pesoKg: -1.8, cinturaCm: -2 }} />);
    expect(screen.getByText(/3\/5 treinos/)).toBeInTheDocument();
    expect(screen.getByText(/−1,8 kg/)).toBeInTheDocument();
    expect(screen.getByText(/−2 cm/)).toBeInTheDocument();
  });
  it("sem partida, mostra só os treinos", () => {
    render(<SemanaCard treinos={0} variacao={null} />);
    expect(screen.getByText(/0\/5 treinos/)).toBeInTheDocument();
    expect(screen.queryByText(/desde a partida/)).toBeNull();
  });
});

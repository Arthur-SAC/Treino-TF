import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PartidaCard } from "../../src/components/PartidaCard";
import { projetar } from "../../src/lib/partida";

describe("card de partida no Hoje", () => {
  it("sem partida, pede a medição com os três campos que a conta precisa e leva pro Corpo", () => {
    render(<MemoryRouter><PartidaCard projecao={null} /></MemoryRouter>);
    expect(screen.getByText(/medição de partida/i)).toBeInTheDocument();
    expect(screen.getByText(/umbigo/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/corpo/medidas");
  });

  it("com partida, mostra peso-alvo e o mês do fim da fase 1", () => {
    const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;
    render(<MemoryRouter><PartidaCard projecao={pr} /></MemoryRouter>);
    expect(screen.getByText(/80–82 kg/)).toBeInTheDocument();
    expect(screen.getByText(/fim da fase 1/i)).toBeInTheDocument();
  });
});

describe("card de partida com medição que não fecha a conta", () => {
  it("pede pra conferir cintura e pescoço em vez de só 'medir agora'", () => {
    render(<MemoryRouter><PartidaCard projecao={null} invalida /></MemoryRouter>);
    expect(screen.getByText(/não fechou a conta/i)).toBeInTheDocument();
    expect(screen.getByText(/pescoço/i)).toBeInTheDocument();
  });
});

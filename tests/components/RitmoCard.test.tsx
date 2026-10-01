import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RitmoCard } from "../../src/components/RitmoCard";

describe("card Seu ritmo", () => {
  it("cedo: mostra a data da primeira comparação", () => {
    render(<RitmoCard veredito={{ estado: "cedo", primeiraComparacao: "2026-10-05" }} />);
    expect(screen.getByText(/05\/10/)).toBeInTheDocument();
  });

  it("veredito: título, números e textos", () => {
    render(<RitmoCard veredito={{ estado: "abaixo", kgSemana: 0.1, cmSemana: 0.1, titulo: "Abaixo do ritmo", texto: ["Frase um.", "Frase dois."] }} />);
    expect(screen.getByText("Abaixo do ritmo")).toBeInTheDocument();
    expect(screen.getByText(/0,1 kg/)).toBeInTheDocument();
    expect(screen.getByText("Frase dois.")).toBeInTheDocument();
  });

  it("sem partida não renderiza nada", () => {
    const { container } = render(<RitmoCard veredito={{ estado: "sem-partida" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

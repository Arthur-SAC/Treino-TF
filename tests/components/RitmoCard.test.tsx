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

  it("cedo com a data já passada convida a medir agora, sem falar do futuro", () => {
    render(<RitmoCard veredito={{ estado: "cedo", primeiraComparacao: "2026-10-05", jaPode: true }} />);
    expect(screen.getByText("Já dá pra comparar: meça peso e cintura em jejum.")).toBeInTheDocument();
    expect(screen.queryByText(/sai em/)).not.toBeInTheDocument();
  });

  it("ganhou peso: os números têm verbo e nenhum sinal de menos", () => {
    const { container } = render(<RitmoCard veredito={{ estado: "abaixo", kgSemana: -0.25, cmSemana: -0.13, titulo: "Abaixo do ritmo", texto: ["Frase."] }} />);
    expect(screen.getByText(/Peso: sobe 0,25 kg\/sem · Cintura: sobe 0,13 cm\/sem/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/-\d/);
  });

  it("perdeu e parado: desce e parado, sem -0", () => {
    render(<RitmoCard veredito={{ estado: "no-ritmo", kgSemana: 0.5, cmSemana: 0, titulo: "No ritmo", texto: ["Frase."] }} />);
    expect(screen.getByText(/Peso: desce 0,5 kg\/sem · Cintura: parada/)).toBeInTheDocument();
  });

  it("sem partida não renderiza nada", () => {
    const { container } = render(<RitmoCard veredito={{ estado: "sem-partida" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

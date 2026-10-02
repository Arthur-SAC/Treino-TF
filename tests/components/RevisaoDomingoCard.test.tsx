import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevisaoDomingoCard } from "../../src/components/RevisaoDomingoCard";

describe("card da revisão de domingo", () => {
  it("mostra as linhas e o ajuste", () => {
    render(<RevisaoDomingoCard revisao={{ linhas: ["Treinos: 3 de 5"], ajuste: "Pra semana que vem: dormir mais cedo." }} />);
    expect(screen.getByText("Revisão da semana")).toBeInTheDocument();
    expect(screen.getByText("Treinos: 3 de 5")).toBeInTheDocument();
    expect(screen.getByText(/semana que vem/)).toBeInTheDocument();
  });
});

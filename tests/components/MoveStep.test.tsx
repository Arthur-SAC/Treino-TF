import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoveStep } from "../../src/components/MoveStep";
import type { DanceMove } from "../../src/lib/db";

const move: DanceMove = {
  name: "Ondulação",
  description: "texto antigo",
  durationSec: 30,
  repeat: 3,
  execucao: {
    posicao: "Em pé, pés na largura do quadril.",
    movimento: ["Leve o quadril pra frente.", "Volte."],
    ondeSentir: "Na lateral do quadril.",
    erradoSe: ["Joelho travado → dobre um pouco"],
    renderMais: ["Mais devagar."],
  },
};

describe("MoveStep com execucao", () => {
  it("mostra Posição e Movimento; o resto fica atrás do toggle", () => {
    render(<MoveStep move={move} active />);
    expect(screen.getByText("Posição")).toBeInTheDocument();
    expect(screen.getByText("Movimento")).toBeInTheDocument();
    expect(screen.queryByText("Onde sentir")).toBeNull();
    expect(screen.queryByText("texto antigo")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Como saber se está certo" }));
    expect(screen.getByText("Onde sentir")).toBeInTheDocument();
    expect(screen.getByText("Tá errado se…")).toBeInTheDocument();
  });
  it("mantém timer e repetição", () => {
    render(<MoveStep move={move} active />);
    expect(screen.getByText("30s")).toBeInTheDocument();
    expect(screen.getByText("Repetir 3x")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar" })).toBeInTheDocument();
  });
  it("sem execucao mostra a description como antes", () => {
    render(<MoveStep move={{ ...move, execucao: undefined }} active />);
    expect(screen.getByText("texto antigo")).toBeInTheDocument();
    expect(screen.queryByText("Posição")).toBeNull();
  });
});

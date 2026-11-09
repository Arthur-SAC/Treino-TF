import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecucaoBlocos } from "../../src/components/ExecucaoBlocos";
import type { Execucao } from "../../src/lib/execucao";

const e: Execucao = {
  posicao: "Deitada de barriga pra cima.",
  movimento: ["Suba o quadril.", "Desça devagar."],
  ondeSentir: "No glúteo.",
  erradoSe: ["Sentiu a lombar → suba menos"],
  renderMais: ["Segure 2 segundos."],
};

describe("ExecucaoBlocos", () => {
  it("mostra os 5 títulos sem regulagem e os passos numerados", () => {
    render(<ExecucaoBlocos execucao={e} />);
    for (const t of ["Posição", "Movimento", "Onde sentir", "Tá errado se…", "Pra render mais"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
    expect(screen.queryByText("Regulagem")).toBeNull();
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("Suba o quadril.");
    expect(screen.getByText("Suba o quadril.").closest("ol")).not.toBeNull();
  });
  it("mostra Regulagem quando existe", () => {
    render(<ExecucaoBlocos execucao={{ ...e, regulagem: "Banco na marca 3." }} />);
    expect(screen.getByText("Regulagem")).toBeInTheDocument();
    expect(screen.getByText("Banco na marca 3.")).toBeInTheDocument();
  });
});

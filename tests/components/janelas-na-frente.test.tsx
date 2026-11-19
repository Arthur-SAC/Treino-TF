import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ExerciseInfoModal } from "../../src/components/ExerciseInfoModal";
import { MicroPausaModal } from "../../src/components/MicroPausaModal";
import type { Exercise } from "../../src/lib/db";

// Bug relatado em 2026-11-19: o "info" abria lá embaixo da página. O
// `.tela-entra` (App.tsx) anima transform, e transform prende o `fixed` dos
// filhos dentro da tela em vez da janela. Toda janela sobreposta precisa
// morar no <body>, fora da tela animada.
const ex: Exercise = {
  id: "x",
  name: "Teste",
  category: "gluteo",
  equipment: [],
  difficulty: "iniciante",
  description: "desc",
  commonMistakes: [],
  exposureLevel: 1,
};

function dentroDaTela(ui: React.ReactElement) {
  return render(<div className="tela-entra">{ui}</div>);
}

describe("janelas sobrepostas abrem na frente, não no fim da página", () => {
  it("o info do exercício sai da tela animada", () => {
    const { container } = dentroDaTela(<ExerciseInfoModal exercise={ex} onClose={() => {}} />);
    expect(container.querySelector(".fixed")).toBeNull();
    expect(document.body.querySelector(":scope > .fixed")).not.toBeNull();
  });

  it("a micro-pausa sai da tela animada", () => {
    const { container } = dentroDaTela(
      <MemoryRouter><MicroPausaModal n={1} diaDoAno={10} mostrarSentar={false} onClose={() => {}} onFeito={() => {}} /></MemoryRouter>,
    );
    expect(container.querySelector(".fixed")).toBeNull();
    expect(document.body.querySelector(":scope > .fixed")).not.toBeNull();
  });
});

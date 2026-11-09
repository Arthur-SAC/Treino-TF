import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ExerciseInfoModal } from "../../src/components/ExerciseInfoModal";
import { ExerciseDetail } from "../../src/pages/workout/ExerciseDetail";
import { db, type Exercise } from "../../src/lib/db";

const base: Exercise = {
  id: "ex-exec-teste",
  name: "Ponte",
  category: "gluteo",
  equipment: [],
  difficulty: "iniciante",
  description: "descrição antiga",
  commonMistakes: ["erro antigo"],
  exposureLevel: 1,
};
const comExec: Exercise = {
  ...base,
  execucao: {
    posicao: "Deitada de barriga pra cima.",
    movimento: ["Suba.", "Desça."],
    ondeSentir: "No glúteo.",
    erradoSe: ["Lombar → suba menos"],
    renderMais: ["Segure 2 s."],
  },
};

function detalhe() {
  return render(
    <MemoryRouter initialEntries={[`/treino/exercicio/${base.id}`]}>
      <Routes><Route path="/treino/exercicio/:id" element={<ExerciseDetail />} /></Routes>
    </MemoryRouter>,
  );
}

beforeEach(async () => { await db.exercises.delete(base.id); });

describe("ExerciseInfoModal", () => {
  it("com execucao mostra os blocos e não as seções antigas", () => {
    render(<ExerciseInfoModal exercise={comExec} onClose={() => {}} />);
    expect(screen.getByText("Onde sentir")).toBeInTheDocument();
    expect(screen.queryByText("Erros comuns")).toBeNull();
  });
  it("sem execucao mantém as seções antigas", () => {
    render(<ExerciseInfoModal exercise={base} onClose={() => {}} />);
    expect(screen.getByText("Erros comuns")).toBeInTheDocument();
    expect(screen.queryByText("Onde sentir")).toBeNull();
  });
});

describe("ExerciseDetail", () => {
  it("com execucao mostra os blocos", async () => {
    await db.exercises.put(comExec);
    detalhe();
    expect(await screen.findByText("Onde sentir")).toBeInTheDocument();
    expect(screen.queryByText("Erros comuns")).toBeNull();
  });
  it("sem execucao mantém as seções antigas", async () => {
    await db.exercises.put(base);
    detalhe();
    expect(await screen.findByText("Erros comuns")).toBeInTheDocument();
    expect(screen.queryByText("Onde sentir")).toBeNull();
  });
});

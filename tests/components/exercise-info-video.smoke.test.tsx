import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExerciseInfoModal } from "../../src/components/ExerciseInfoModal";
import type { Exercise } from "../../src/lib/db";

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

describe("ExerciseInfoModal vídeo", () => {
  it("mostra a seção de vídeo (adicionar) quando não há link", () => {
    render(<ExerciseInfoModal exercise={ex} onClose={() => {}} />);
    expect(screen.getByText("Vídeo")).toBeInTheDocument();
    expect(screen.getByText("adicionar")).toBeInTheDocument();
  });

  it("embute o player quando há link do YouTube", () => {
    const { container } = render(
      <ExerciseInfoModal exercise={{ ...ex, videoUrl: "https://youtu.be/dQw4w9WgXcQ" }} onClose={() => {}} />,
    );
    expect(container.querySelector("iframe")).not.toBeNull();
  });
});

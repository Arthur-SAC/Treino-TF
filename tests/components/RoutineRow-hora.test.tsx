import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

const jantar: RoutineItem = {
  id: "jantar",
  block: "noite",
  label: "Jantar (pós-treino)",
  control: "recipe",
  mealType: "jantar",
  defaultTime: "19:00",
};

const agua: RoutineItem = { id: "agua", block: "trabalho", label: "Água", control: "water" };

function montar(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("RoutineRow — horário na linha", () => {
  it("mostra o horário ao lado do rótulo", () => {
    montar(<RoutineRow item={jantar} done={false} onToggle={() => {}} onOpen={() => {}} hora="19h" />);
    expect(screen.getByText("19h")).toBeInTheDocument();
    expect(screen.getByText("Jantar (pós-treino)")).toBeInTheDocument();
  });

  it("sem horário, a linha continua funcionando", () => {
    montar(<RoutineRow item={agua} done={false} onToggle={() => {}} />);
    expect(screen.getByText("Água")).toBeInTheDocument();
    expect(screen.queryByText(/\dh/)).not.toBeInTheDocument();
  });

  it("o horário aparece também nas linhas de link e de skincare", () => {
    const treino: RoutineItem = { id: "treino", block: "tarde", label: "Treino do dia", control: "link", to: "/treino" };
    montar(<RoutineRow item={treino} done={false} onToggle={() => {}} hora="17h45" />);
    expect(screen.getByText("17h45")).toBeInTheDocument();
  });
});

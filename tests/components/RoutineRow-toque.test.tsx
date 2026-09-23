import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

// Auditoria de 2026-09-23.
const caminhada: RoutineItem = {
  id: "caminhada-trabalho", block: "tarde", label: "Caminhada · 5 km", control: "walk",
  to: "/treino/exercicio/cardio-zona2",
};

describe("RoutineRow — toque", () => {
  it("item com destino E botão no canto: o nome abre o destino, e o botão continua", () => {
    render(
      <MemoryRouter>
        <RoutineRow item={caminhada} done={false} onToggle={() => {}} rightSlot={<button type="button">+10 min</button>} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Caminhada · 5 km" })).toHaveAttribute("href", "/treino/exercicio/cardio-zona2");
    expect(screen.getByRole("button", { name: "+10 min" })).toBeInTheDocument();
  });

  it("a caixinha tem área de toque de 44 px (20 px desenhados + 12 px de cada lado)", () => {
    render(
      <MemoryRouter>
        <RoutineRow item={caminhada} done={false} onToggle={() => {}} rightSlot={<span />} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("checkbox").className).toMatch(/\bp-3\b/);
  });
});

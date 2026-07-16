import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

const item: RoutineItem = { id: "alongamento-manha", block: "manha", label: "Alongamento manhã · 15 min" };

function renderRow(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("RoutineRow", () => {
  it("chama onToggle ao clicar num item de check", async () => {
    const onToggle = vi.fn();
    renderRow(<RoutineRow item={item} done={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /alongamento/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("reflete estado marcado via aria-checked", () => {
    renderRow(<RoutineRow item={item} done={true} onToggle={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("item control:link NÃO alterna check local — vira link de navegação", () => {
    const onToggle = vi.fn();
    const linkItem: RoutineItem = { ...item, id: "treino", control: "link", to: "/treino" };
    renderRow(<RoutineRow item={linkItem} done={false} onToggle={onToggle} />);
    const link = screen.getByRole("link", { name: /alongamento/i });
    expect(link).toHaveAttribute("href", "/treino");
  });
});

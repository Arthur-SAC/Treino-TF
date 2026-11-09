import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

const item: RoutineItem = { id: "agua", block: "manha", label: "Beber água", control: "check" } as RoutineItem;
const comDestino: RoutineItem = { id: "alongar", block: "noite", label: "Alongar", control: "check", to: "/x" } as RoutineItem;

const mostra = (done: boolean, it: RoutineItem = item) =>
  render(<MemoryRouter><RoutineRow item={it} done={done} onToggle={() => {}} /></MemoryRouter>);

afterEach(() => vi.restoreAllMocks());

describe("RoutineRow — movimento", () => {
  it("marcar pula a caixinha e solta +1, que sai no animationend", () => {
    mostra(false);
    fireEvent.click(screen.getByRole("checkbox"));
    const caixa = document.querySelector("[data-caixa]")!;
    expect(caixa.className).toMatch(/caixa-pula/);
    const mais = screen.getByText("+1");
    expect(mais.className).toMatch(/mais-um/);
    fireEvent.animationEnd(mais);
    expect(screen.queryByText("+1")).toBeNull();
  });

  it("tocar no corpo balança o card e a classe sai no animationend", () => {
    mostra(false, comDestino);
    const card = screen.getByRole("checkbox").parentElement!;
    fireEvent.click(screen.getByRole("link", { name: "Alongar" }));
    expect(card.className).toMatch(/carta-balanca/);
    fireEvent.animationEnd(card);
    expect(card.className).not.toMatch(/carta-balanca/);
  });

  it("não vibra", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    mostra(false);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("feito usa bg-feito, não bg-nude", () => {
    mostra(true);
    const caixa = document.querySelector("[data-caixa]")!;
    expect(caixa.className).toMatch(/bg-feito/);
    expect(caixa.className).not.toMatch(/bg-nude/);
  });
});

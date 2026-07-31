import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RoutineRow } from "../../src/components/RoutineRow";
import type { RoutineItem } from "../../src/lib/today-routine";

// A usuária foi abrir o alongamento da noite e ele "não aparecia": tocar no
// nome do item MARCAVA como feito em vez de abrir a sequência guiada. Só a
// setinha "ver →", num alvo minúsculo na borda direita, navegava.
//
// Era inconsistente com o resto da tela — no jantar e no skincare o corpo
// abre, no treino do dia a linha inteira abre. Agora todo item com destino
// abre ao toque, e a caixinha continua sendo o jeito de marcar na mão.

const alongamento: RoutineItem = {
  id: "alongamento-noite",
  block: "noite",
  label: "Alongamento noite · 10 min",
  subtitle: "Flexibilidade profunda de quadril",
  to: "/treino/movimento/flexibilidade-intima",
  defaultTime: "21:30",
};

const semDestino: RoutineItem = {
  id: "seu-tempo",
  block: "noite",
  label: "Seu tempo: desenho + leitura",
};

const montar = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("RoutineRow — item com destino abre ao toque", () => {
  it("tocar no nome do alongamento NÃO marca como feito", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    montar(<RoutineRow item={alongamento} done={false} onToggle={onToggle} hora="21h30" />);
    await user.click(screen.getByText("Alongamento noite · 10 min"));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("o nome do alongamento é um link pra sequência", () => {
    montar(<RoutineRow item={alongamento} done={false} onToggle={() => {}} hora="21h30" />);
    const link = screen.getByRole("link", { name: /alongamento noite/i });
    expect(link).toHaveAttribute("href", "/treino/movimento/flexibilidade-intima");
  });

  it("a caixinha continua marcando na mão", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    montar(<RoutineRow item={alongamento} done={false} onToggle={onToggle} hora="21h30" />);
    await user.click(screen.getByRole("checkbox", { name: /marcar/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("item SEM destino continua marcando ao tocar no corpo", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    montar(<RoutineRow item={semDestino} done={false} onToggle={onToggle} />);
    await user.click(screen.getByText("Seu tempo: desenho + leitura"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("item com botão no canto (água) não vira link — o botão continua sendo a ação", async () => {
    const agua: RoutineItem = { id: "agua", block: "trabalho", label: "Água", control: "water" };
    const onToggle = vi.fn();
    const user = userEvent.setup();
    montar(<RoutineRow item={agua} done={false} onToggle={onToggle} rightSlot={<button type="button">+200 ml</button>} />);
    await user.click(screen.getByText("Água"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

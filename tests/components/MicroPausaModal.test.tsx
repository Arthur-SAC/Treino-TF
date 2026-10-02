// tests/components/MicroPausaModal.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MicroPausaModal } from "../../src/components/MicroPausaModal";

describe("micro-pausa com a dica de sentar", () => {
  it("mostra 'Ao voltar pra cadeira' com a dica da vez", () => {
    render(<MemoryRouter><MicroPausaModal n={1} diaDoAno={10} onClose={() => {}} onFeito={() => {}} /></MemoryRouter>);
    expect(screen.getByText("Ao voltar pra cadeira")).toBeInTheDocument();
    expect(screen.getByText("Joelhos juntos · bloco do dia")).toBeInTheDocument();
  });

  it("oferece o caminho pra 'Como sentar'", () => {
    render(<MemoryRouter><MicroPausaModal n={1} diaDoAno={10} onClose={() => {}} onFeito={() => {}} /></MemoryRouter>);
    const link = screen.getByRole("link", { name: "Como sentar · 6 min" });
    expect(link).toHaveAttribute("href", "/treino/movimento/corporal-postura-sentar");
  });
});

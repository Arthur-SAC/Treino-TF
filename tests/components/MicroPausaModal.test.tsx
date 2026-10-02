// tests/components/MicroPausaModal.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MicroPausaModal } from "../../src/components/MicroPausaModal";

describe("micro-pausa com a dica de sentar", () => {
  it("mostra 'Ao voltar pra cadeira' com a dica da vez", () => {
    render(<MicroPausaModal n={1} diaDoAno={10} onClose={() => {}} onFeito={() => {}} />);
    expect(screen.getByText("Ao voltar pra cadeira")).toBeInTheDocument();
    expect(screen.getByText("Joelhos juntos · bloco do dia")).toBeInTheDocument();
  });
});

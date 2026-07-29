import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";

describe("ShortcutsGrid", () => {
  it("mostra atalhos pras áreas não-diárias com rotas válidas", () => {
    render(<MemoryRouter><ShortcutsGrid /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /estilo/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cabelo/i })).toBeInTheDocument();
  });

  it("não repete voz e depilação — viraram itens diários da rotina", () => {
    render(<MemoryRouter><ShortcutsGrid /></MemoryRouter>);
    expect(screen.queryByRole("link", { name: /^voz/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /depila/i })).not.toBeInTheDocument();
  });
});

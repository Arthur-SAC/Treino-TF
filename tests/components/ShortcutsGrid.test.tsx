import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";

describe("ShortcutsGrid", () => {
  it("mostra atalhos pras áreas não-diárias com rotas válidas", () => {
    render(<MemoryRouter><ShortcutsGrid /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /voz/i })).toHaveAttribute("href", "/beleza/voz");
    expect(screen.getByRole("link", { name: /depila/i })).toHaveAttribute("href", "/beleza/depilacao");
    expect(screen.getByRole("link", { name: /estilo/i })).toBeInTheDocument();
  });
});

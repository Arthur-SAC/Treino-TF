import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BottomNav } from "../../src/components/BottomNav";

function renderEm(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe("barra de baixo com 4 abas", () => {
  it("tem exatamente 4 links e acende Progresso em /corpo/medidas", () => {
    renderEm("/corpo/medidas");
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Progresso" })).toHaveAttribute("href", "/progresso");
    expect(screen.getByRole("link", { name: "Guia" })).toHaveAttribute("href", "/guia");
    expect(screen.getByRole("link", { name: "Vitalidade" })).toHaveAttribute("href", "/vitalidade");
    expect(screen.getByRole("link", { name: "Progresso" })).toHaveAttribute("aria-current", "page");
  });

  it("acende Guia, e não Progresso, em /treino/biblioteca", () => {
    renderEm("/treino/biblioteca");
    expect(screen.getByRole("link", { name: "Guia" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Progresso" })).not.toHaveAttribute("aria-current");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GuiaHome } from "../../src/pages/GuiaHome";
import { BottomNav } from "../../src/components/BottomNav";

describe("aba Consulta", () => {
  it("a barra mostra Consulta e a rota continua /guia", () => {
    render(<MemoryRouter><BottomNav /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Consulta" })).toHaveAttribute("href", "/guia");
    expect(screen.queryByRole("link", { name: "Guia" })).toBeNull();
  });

  it("a tela se chama Consulta e não lista Refeições de hoje", () => {
    render(<MemoryRouter><GuiaHome /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: "Consulta" })).toBeInTheDocument();
    expect(screen.queryByText("Refeições de hoje")).toBeNull();
    expect(screen.getByRole("link", { name: /Cardápio/ })).toBeInTheDocument();
  });
});

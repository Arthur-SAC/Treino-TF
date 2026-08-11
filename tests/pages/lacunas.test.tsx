import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FertilityTRH } from "../../src/pages/path/FertilityTRH";
import { Support } from "../../src/pages/path/Support";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";

const ROTAS = Object.values(
  import.meta.glob("../../src/main.tsx", { query: "?raw", import: "default", eager: true }) as Record<
    string,
    string
  >,
)[0];

describe("Fertilidade & TRH", () => {
  it("mostra o plano dela e a menção à fase de Manutenção do treino", () => {
    render(<MemoryRouter><FertilityTRH /></MemoryRouter>);
    expect(screen.getByText("Meu plano")).toBeInTheDocument();
    expect(screen.getAllByText(/Manuten/i).length).toBeGreaterThan(0);
  });

  // Os marcos de fertilidade saíram da linha do tempo (as datas eram inventadas).
  // O conteúdo inteiro vive nesta página — e conteúdo sem porta é conteúdo
  // perdido, ainda mais este. A porta é o atalho do Hoje.
  it("tem porta: o atalho do Hoje aponta pra ela e a rota existe", () => {
    render(<MemoryRouter><ShortcutsGrid /></MemoryRouter>);
    const atalho = screen.getByLabelText("Fertilidade & TRH");
    expect(atalho).toHaveAttribute("href", "/trilha/fertilidade");
    expect(ROTAS).toContain('path: "trilha/fertilidade"');
  });
});

describe("Apoio", () => {
  it("traz o CVV 188 no disclaimer de risco", () => {
    render(<MemoryRouter><Support /></MemoryRouter>);
    expect(screen.getAllByText(/188/).length).toBeGreaterThan(0);
  });
});

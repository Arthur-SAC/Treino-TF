import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProgressoHome, ITENS_PROGRESSO } from "../../src/pages/ProgressoHome";
import { GuiaHome, BLOCOS_GUIA } from "../../src/pages/GuiaHome";

// Lê o router como texto (o tsconfig não tem tipos do Node).
const MAIN = Object.values(import.meta.glob("../../src/main.tsx", { query: "?raw", import: "default", eager: true }))[0] as string;

describe("telas-índice", () => {
  it("toda rota listada existe no router", () => {
    const tos = [...ITENS_PROGRESSO.map((i) => i.to), ...BLOCOS_GUIA.flatMap((b) => b.itens.map((i) => i.to))];
    const faltando = tos.filter((to) => !MAIN.includes(`path: "${to.replace(/^\//, "")}"`));
    expect(faltando).toEqual([]);
  });

  it("Progresso lista Medidas", () => {
    render(<MemoryRouter><ProgressoHome /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Progresso" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Medidas/ })).toHaveAttribute("href", "/corpo/medidas");
  });

  it("Guia lista os blocos e a Biblioteca", () => {
    render(<MemoryRouter><GuiaHome /></MemoryRouter>);
    for (const t of ["Treino", "Alimentação", "Beleza", "Apoio"]) {
      expect(screen.getByRole("heading", { name: t })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /Biblioteca/ })).toHaveAttribute("href", "/treino/biblioteca");
  });
});

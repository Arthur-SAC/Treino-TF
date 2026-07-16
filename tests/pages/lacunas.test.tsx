import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FertilityTRH } from "../../src/pages/path/FertilityTRH";
import { Support } from "../../src/pages/path/Support";

describe("Fertilidade & TRH", () => {
  it("mostra o plano dela e o gatilho da fase de Manutenção", () => {
    render(<MemoryRouter><FertilityTRH /></MemoryRouter>);
    expect(screen.getByText(/Meu plano/i)).toBeInTheDocument();
    expect(screen.getByText(/Manuten/i)).toBeInTheDocument();
  });
});

describe("Apoio", () => {
  it("traz o CVV 188 no disclaimer de risco", () => {
    render(<MemoryRouter><Support /></MemoryRouter>);
    expect(screen.getByText(/188/)).toBeInTheDocument();
  });
});

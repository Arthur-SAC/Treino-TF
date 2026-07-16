import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FertilityTRH } from "../../src/pages/path/FertilityTRH";
import { Support } from "../../src/pages/path/Support";

describe("Fertilidade & TRH", () => {
  it("mostra o plano dela e o gatilho da fase de Manutenção", () => {
    render(<MemoryRouter><FertilityTRH /></MemoryRouter>);
    expect(screen.getByText("Meu plano")).toBeInTheDocument();
    expect(screen.getAllByText(/Manuten/i).length).toBeGreaterThan(0);
  });
});

describe("Apoio", () => {
  it("traz o CVV 188 no disclaimer de risco", () => {
    render(<MemoryRouter><Support /></MemoryRouter>);
    expect(screen.getAllByText(/188/).length).toBeGreaterThan(0);
  });
});

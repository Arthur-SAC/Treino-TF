import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Today } from "../../src/pages/Today";

beforeEach(async () => {
  await db.routineChecks.clear();
});

describe("Today (backbone)", () => {
  it("renderiza os blocos da rotina do dia", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  it("mostra o item Seu tempo (desenho + leitura)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Seu tempo/i)).toBeInTheDocument();
  });
});

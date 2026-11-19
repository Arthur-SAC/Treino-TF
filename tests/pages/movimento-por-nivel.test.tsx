import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MovementHome } from "../../src/pages/workout/MovementHome";
import { db } from "../../src/lib/db";
import { seedMovement } from "../../src/lib/movement-seed";

describe("Movimento por nível", () => {
  beforeEach(async () => {
    await db.danceSequences.clear();
    await seedMovement();
  });

  it("três seções na ordem, a primeira só com iniciante, nenhuma sequência some", async () => {
    const todas = await db.danceSequences.toArray();
    render(<MemoryRouter><MovementHome /></MemoryRouter>);
    await screen.findByRole("heading", { level: 2, name: "Básico" });
    const titulos = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titulos[0]).toBe("Básico");
    expect(titulos).toEqual(["Básico", "Intermediário", "Avançado"].filter((t) => titulos.includes(t)));

    const basico = screen.getByRole("region", { name: "Básico" });
    const nomesBasico = todas.filter((s) => s.level === "iniciante").map((s) => s.name);
    for (const n of nomesBasico) expect(within(basico).getAllByText(n).length).toBeGreaterThan(0);
    for (const s of todas.filter((x) => x.level !== "iniciante")) {
      expect(within(basico).queryByText(s.name)).toBeNull();
    }
    // contagem total: cada sequência vira exatamente um card (link)
    const links = screen.getAllByRole("link").filter((a) => (a.getAttribute("href") ?? "").startsWith("/treino/movimento/") && !a.getAttribute("href")!.endsWith("historico"));
    expect(links.length).toBe(todas.length);
  });

  it("o guia da intimidade aparece uma vez só", async () => {
    render(<MemoryRouter><MovementHome /></MemoryRouter>);
    await screen.findByRole("heading", { level: 2, name: "Básico" });
    expect(screen.getAllByText("Como usar (e o que já te serve)")).toHaveLength(1);
  });
});

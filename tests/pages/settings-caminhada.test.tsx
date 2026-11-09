import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Settings } from "../../src/pages/Settings";

beforeEach(async () => {
  await db.settings.clear();
});

describe("Configurações · caminhadas agora", () => {
  it("começa em caminhada e grava esteira ao escolher", async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    const caminhada = await screen.findByLabelText(/^Caminhada/);
    await waitFor(() => expect(caminhada).toBeChecked());
    fireEvent.click(screen.getByLabelText(/Esteira ou bike/));
    await waitFor(async () => expect((await db.settings.get("modoCaminhada"))?.value).toBe("esteira"));
  });

  it("explica o que muda na pausada", async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(await screen.findByText(/somem do Hoje/)).toBeInTheDocument();
  });
});

describe("Configurações · aparelhos que não tem na academia", () => {
  it("lista vazia não renderiza a seção", async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await screen.findByText(/Caminhadas agora/);
    expect(screen.queryByText(/Aparelhos que não tem/)).toBeNull();
  });

  it("Tem sim remove o id de aparelhosAusentes", async () => {
    await db.exercises.put({
      id: "abdutor-maquina", name: "Abdutora", category: "gluteo", equipment: ["maquina"],
      difficulty: "iniciante", description: "x", commonMistakes: [], exposureLevel: 2,
    });
    await db.settings.put({ key: "aparelhosAusentes", value: ["abdutor-maquina", "outro-id"] });
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(await screen.findByText("Abdutora")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tem sim: Abdutora" }));
    await waitFor(async () => expect((await db.settings.get("aparelhosAusentes"))?.value).toEqual(["outro-id"]));
    await waitFor(() => expect(screen.queryByText("Abdutora")).toBeNull());
  });
});

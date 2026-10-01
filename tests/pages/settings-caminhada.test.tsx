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

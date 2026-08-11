// tests/pages/vitalidade.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Vitalidade } from "../../src/pages/path/Vitalidade";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";
import { db } from "../../src/lib/db";
import { hojeISO } from "../../src/lib/today-date";

beforeEach(async () => {
  await db.dailyLog.clear();
  await db.practiceLogs.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/trilha/vitalidade"]}>
      <Routes>
        <Route path="/trilha/vitalidade" element={<Vitalidade />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** `n` dias antes de agora, no fuso LOCAL — mesma régua que `hojeISO` usa
 *  dentro da página, pra não descolar da data real de quando o teste roda. */
function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return hojeISO(d);
}

describe("Vitalidade smoke", () => {
  it("mostra o streak atual e o recorde", async () => {
    const hoje = hojeISO(new Date());
    const inicio = diasAtras(15);
    const gasto = diasAtras(3);
    await db.dailyLog.put({ date: inicio, waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: gasto, waterMl: 0, activeBreakCount: 0, gastoAutomatico: true });

    renderPage();

    // corrida inicial de `inicio` até o dia anterior ao gasto = 12 (recorde);
    // do gasto até hoje = 3 (atual). Números diferentes de propósito, pra
    // não bater os dois no mesmo getByText.
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });
    void hoje;
  });

  it("marcar o dia zera o atual sem apagar o recorde", async () => {
    const inicio = diasAtras(15);
    const gasto = diasAtras(3);
    await db.dailyLog.put({ date: inicio, waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: gasto, waterMl: 0, activeBreakCount: 0, gastoAutomatico: true });

    renderPage();
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: /marcar hoje/i }));

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
      // recorde continua 12 — o esforço anterior não some junto com a sequência.
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("mostra a fase atual do assoalho pélvico", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/fase 1/i)).toBeInTheDocument();
    });
  });

  it("não usa a palavra pornografia no rótulo do atalho nem no título da página", async () => {
    render(
      <MemoryRouter>
        <ShortcutsGrid />
      </MemoryRouter>,
    );
    const atalho = screen.getByRole("link", { name: /vitalidade/i });
    expect(atalho.textContent?.toLowerCase()).not.toContain("pornografia");

    renderPage();
    await waitFor(() => {
      const titulo = screen.getByRole("heading", { level: 1 });
      expect(titulo.textContent?.toLowerCase()).not.toContain("pornografia");
      expect(titulo.textContent).toBe("Vitalidade");
    });
  });
});

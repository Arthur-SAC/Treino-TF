import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => false }));
vi.mock("../../src/lib/lembretes/agendar", () => ({ reagendar: vi.fn(async () => {}) }));

import App from "../../src/App";
import { db } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { hojeISO, somarDiasISO } from "../../src/lib/today-date";

/** O dia útil (seg–sex) imediatamente antes de `iso`. */
function diaUtilAntes(iso: string): string {
  let d = somarDiasISO(iso, -1);
  for (;;) {
    const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (dow !== 0 && dow !== 6) return d;
    d = somarDiasISO(d, -1);
  }
}

// Relativo ao relógio de verdade, sem fake timers (quebram o Dexie): X = hoje,
// e os dias "X-1, X-2, X-3" contam em dias úteis. Se hoje é segunda, X-1 é a
// sexta; se hoje é fim de semana, a sexta também — em todos os casos o último
// dia útil antes de hoje ficou sem treino.
const hoje = hojeISO();
const x1 = diaUtilAntes(hoje);
const x2 = diaUtilAntes(x1);
const x3 = diaUtilAntes(x2);

function abrir() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<p>Tela do Hoje</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await setSetting("onboarded", true);
  await setSetting("sequenciaDesde", x3);
  await db.workoutSessions.bulkAdd([
    { date: x3, templateId: "t", exercises: [], durationMin: 40 },
    { date: x2, templateId: "t", exercises: [], durationMin: 40 },
  ]);
});

describe("App — placa de queda ao abrir", () => {
  it("mostra Sequência perdida uma vez e grava quedaVistaEm", async () => {
    const { unmount } = abrir();
    expect(await screen.findByText("Sequência perdida")).toBeInTheDocument();
    expect(screen.getByText("Ontem não teve treino")).toBeInTheDocument();
    expect(await getSetting("quedaVistaEm")).toBe(x1);
    unmount();

    abrir();
    expect(await screen.findByText("Tela do Hoje")).toBeInTheDocument();
    // dá tempo da verificação rodar e confirma que não reapareceu
    await waitFor(async () => expect(await getSetting("quedaVistaEm")).toBe(x1));
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText("Sequência perdida")).toBeNull();
  });

  it("primeira abertura (marco = hoje) não mostra nada", async () => {
    await db.workoutSessions.clear();
    await setSetting("sequenciaDesde", hoje);
    abrir();
    expect(await screen.findByText("Tela do Hoje")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText("Sequência perdida")).toBeNull();
    expect(await getSetting("quedaVistaEm")).toBe("");
  });
});

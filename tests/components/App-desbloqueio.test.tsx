// Ao abrir o app: treino salvo sem "Finalizar" destrava mesmo assim, e o marco
// de cintura aparece uma vez só. Ordem: queda, desbloqueios, conquistas.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const HOJE = "2026-11-09"; // segunda
vi.mock("../../src/lib/today-date", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../src/lib/today-date")>();
  return { ...real, hojeISO: (d?: Date) => (d ? real.hojeISO(d) : HOJE) };
});
vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => false }));
vi.mock("../../src/lib/lembretes/agendar", () => ({ reagendar: vi.fn(async () => {}) }));

import App from "../../src/App";
import { db } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

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

const sessoes = (datas: string[]) =>
  db.workoutSessions.bulkAdd(datas.map((date) => ({ date, templateId: "t", exercises: [], durationMin: 40 })));

beforeEach(async () => {
  await setSetting("onboarded", true);
});

describe("App — desbloqueios e conquistas ao abrir", () => {
  it("5 treinos salvos sem finalizar: abre as duas placas de desbloqueio e grava", async () => {
    await setSetting("sequenciaDesde", "2026-11-03");
    await sessoes(["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", HOJE]);
    abrir();
    expect(await screen.findByText("Parabéns, Alongamento da manhã completo desbloqueado")).toBeInTheDocument();
    expect(await getSetting("desbloqueios")).toEqual({ "manha-completa": HOJE, "assoalho-1": HOJE });
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    expect(await screen.findByText("Parabéns, Assoalho pélvico nível 1 desbloqueado")).toBeInTheDocument();
  });

  it("cintura abaixo de 88: placa de conquista uma vez, gravada em conquistasVistas", async () => {
    await setSetting("sequenciaDesde", HOJE);
    await db.measurements.add({ date: "2026-11-08", waistCm: 87.5 });
    const { unmount } = abrir();
    expect(await screen.findByText("Cintura 88 — destrava o superávit")).toBeInTheDocument();
    expect(await getSetting("conquistasVistas")).toEqual(["cintura-88"]);
    unmount();

    abrir();
    expect(await screen.findByText("Tela do Hoje")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText("Cintura 88 — destrava o superávit")).toBeNull();
  });

  it("ordem: queda, depois conquista", async () => {
    // treinou 03 e 04, perdeu 05 e 06 (quebra em 05/11)
    await setSetting("sequenciaDesde", "2026-11-03");
    await sessoes(["2026-11-03", "2026-11-04"]);
    await db.measurements.add({ date: "2026-11-08", waistCm: 87 });
    abrir();
    expect(await screen.findByText("Sequência perdida")).toBeInTheDocument();
    expect(screen.queryByText("Cintura 88 — destrava o superávit")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Bora hoje" }));
    expect(await screen.findByText("Cintura 88 — destrava o superávit")).toBeInTheDocument();
    await waitFor(async () => expect(await getSetting("quedaVistaEm")).toBe("2026-11-05"));
  });
});

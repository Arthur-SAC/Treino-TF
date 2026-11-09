// tests/pages/hoje-niveis.test.tsx
// O Hoje obedece aos níveis de desbloqueio (spec 2026-11-09, seção 8): o que
// está trancado some, o que está no nível mínimo aparece na versão mínima, e
// uma linha discreta diz qual é o próximo desbloqueio e quantos treinos faltam.
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";
import { MicroPausaModal } from "../../src/components/MicroPausaModal";
import { hojeISO } from "../../src/lib/today-date";
import { desbloquearTudo } from "../helpers/desbloquear";

const hoje = hojeISO();

beforeEach(async () => {
  await db.routineChecks.clear();
  await db.settings.clear();
  await db.mealPlans.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.settings.put({ key: "sequenciaDesde", value: hoje });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

describe("Hoje com os níveis — banco novo, sequência começando hoje", () => {
  it("mostra o protetor solar e esconde o alongamento da noite e a postura", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Protetor solar · 1 min")).toBeInTheDocument();
    expect(screen.queryByText(/Alongamento noite/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Postura/)).not.toBeInTheDocument();
  });

  it("diz qual é o próximo desbloqueio e quantos treinos faltam", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(
      await screen.findByText("Próximo desbloqueio: Alongamento da manhã completo — faltam 5 treinos"),
    ).toBeInTheDocument();
  });

  it("com tudo desbloqueado a linha some e o alongamento da noite aparece", async () => {
    await desbloquearTudo();
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Alongamento noite/)).toBeInTheDocument();
    expect(screen.queryByText(/Próximo desbloqueio/)).not.toBeInTheDocument();
  });
});

describe("Skincare noite no nível 2", () => {
  it("é caixinha comum, e marcar grava o check skincare-noite", async () => {
    await db.settings.put({ key: "desbloqueios", value: { "skincare-2": "2026-11-01" } });
    render(<MemoryRouter><Today /></MemoryRouter>);
    const box = await screen.findByRole("checkbox", { name: /^Skincare noite/ });
    fireEvent.click(box);
    await waitFor(async () => {
      const checks = await db.routineChecks.where("date").equals(hoje).toArray();
      expect(checks.some((c) => c.itemId === "skincare-noite" && c.done)).toBe(true);
    });
  });
});

describe("MicroPausaModal e a dica de sentar", () => {
  const abrir = (mostrarSentar: boolean) =>
    render(
      <MemoryRouter>
        <MicroPausaModal n={0} diaDoAno={1} mostrarSentar={mostrarSentar} onClose={() => {}} onFeito={() => {}} />
      </MemoryRouter>,
    );

  it("trancada, não mostra o link Como sentar", () => {
    abrir(false);
    expect(screen.queryByText(/Como sentar/)).not.toBeInTheDocument();
  });

  it("desbloqueada, mostra", () => {
    abrir(true);
    expect(screen.getByText(/Como sentar/)).toBeInTheDocument();
  });
});

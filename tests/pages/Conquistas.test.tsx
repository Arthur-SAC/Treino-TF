import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const HOJE = "2026-11-16"; // segunda
vi.mock("../../src/lib/today-date", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../src/lib/today-date")>();
  return { ...real, hojeISO: (d?: Date) => (d ? real.hojeISO(d) : HOJE) };
});

import { Conquistas } from "../../src/pages/Conquistas";
import { db } from "../../src/lib/db";
import { setSetting } from "../../src/lib/settings-helpers";
import { abaDaRota } from "../../src/lib/abas";
import { ITENS_PROGRESSO } from "../../src/pages/ProgressoHome";

// 6 dias úteis seguidos com treino: 09/11 a 13/11 e hoje.
const DIAS = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", HOJE];

beforeEach(async () => {
  await setSetting("sequenciaDesde", "2026-11-09");
  await setSetting("desbloqueios", { "manha-completa": "2026-11-14" });
  await db.workoutSessions.bulkAdd(DIAS.map((date) => ({ date, templateId: "t", exercises: [], durationMin: 40 })));
});

describe("Conquistas", () => {
  it("desbloqueados com data, próximos com faltam e o que entra", async () => {
    render(<MemoryRouter><Conquistas /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: "Conquistas" })).toBeInTheDocument();

    const feitos = await screen.findByRole("region", { name: "Desbloqueados" });
    expect(await within(feitos).findByText("Alongamento da manhã completo")).toBeInTheDocument();
    expect(within(feitos).getByText("14/11")).toBeInTheDocument();

    const proximos = screen.getByRole("region", { name: "Próximos" });
    const assoalho = (await within(proximos).findByText("Assoalho pélvico nível 1")).closest("li")!;
    expect(assoalho.textContent).toMatch(/faltam/);
    expect(assoalho.textContent).toContain("identificação");
    // patamar 10, sequência 6
    const skincare = within(proximos).getByText("Skincare nível 2").closest("li")!;
    expect(skincare.textContent).toContain("faltam 4 treinos");
  });

  it("marcos: cintura atingida e marco concluído, com data", async () => {
    await db.measurements.bulkAdd([
      { date: "2026-11-01", waistCm: 90 },
      { date: "2026-11-12", waistCm: 87.5 },
    ]);
    await db.milestones.bulkAdd([
      { title: "Primeiro corte novo", category: "social", datePlanned: "2026-11-01", dateCompleted: "2026-11-05" },
      { title: "Ainda não", category: "social", datePlanned: "2026-12-01" },
    ]);
    render(<MemoryRouter><Conquistas /></MemoryRouter>);
    const marcos = await screen.findByRole("region", { name: "Marcos" });
    expect(await within(marcos).findByText("Cintura 88 — destrava o superávit")).toBeInTheDocument();
    expect(within(marcos).getByText("12/11")).toBeInTheDocument();
    expect(await within(marcos).findByText("Primeiro corte novo")).toBeInTheDocument();
    expect(within(marcos).getByText("05/11")).toBeInTheDocument();
    expect(within(marcos).queryByText("Ainda não")).toBeNull();
  });

  it("marco concluído cujo título expõe não aparece (fica só na Trilha)", async () => {
    await db.milestones.bulkAdd([
      { title: "♡ Busto sem hormônio — avaliar começar a usar bralette", category: "fisico", datePlanned: "2026-11-01", dateCompleted: "2026-11-03" },
      { title: "Primeiro corte novo", category: "social", datePlanned: "2026-11-01", dateCompleted: "2026-11-05" },
    ]);
    render(<MemoryRouter><Conquistas /></MemoryRouter>);
    const marcos = await screen.findByRole("region", { name: "Marcos" });
    expect(await within(marcos).findByText("Primeiro corte novo")).toBeInTheDocument();
    expect(marcos.textContent).not.toMatch(/Busto|horm/);
    expect(within(marcos).queryByText("03/11")).toBeNull();
  });

  it("a rota ativa a aba Progresso e o índice tem o item", () => {
    expect(abaDaRota("/progresso/conquistas")).toBe("progresso");
    expect(ITENS_PROGRESSO).toContainEqual({ label: "Conquistas", sub: "o que já abriu e o que vem", to: "/progresso/conquistas" });
  });
});

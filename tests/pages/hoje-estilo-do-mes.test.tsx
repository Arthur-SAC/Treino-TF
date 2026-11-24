// Linha "Estilo do mês" no Hoje (Estilo em degraus, decisões 2 e 12): sem
// caixinha, sem o nome do item, só o caminho pra aba Estilo.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { db } from "../../src/lib/db";
import { setSetting } from "../../src/lib/settings-helpers";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { itensDoDegrau } from "../../src/lib/estilo-degraus";
import { Today } from "../../src/pages/Today";

vi.mock("../../src/hooks/useCycleAdvice", () => ({ useCycleAdvice: () => null }));

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 10, 24, 9, 0) });
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

afterEach(() => {
  vi.useRealTimers();
});

function abrir() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Today />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("linha Estilo do mês", () => {
  it("com sugestão: link pra /estilo, sem caixinha e sem o nome do item", async () => {
    abrir();
    const link = await screen.findByRole("link", { name: "Estilo do mês" });
    expect(link).toHaveAttribute("href", "/estilo");
    expect(link.querySelector("input,[role=checkbox],button")).toBeNull();
    const nome = itensDoDegrau(1)[0].nome;
    expect(link.textContent).not.toContain(nome);
  });

  it("mês já fechado (comprei): não aparece", async () => {
    await setSetting("estiloMes", { mes: "2026-11", acao: "comprei" });
    abrir();
    await screen.findByText("Esta semana").catch(() => null);
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByRole("link", { name: "Estilo do mês" })).not.toBeInTheDocument();
  });

  it("mês já fechado (pulei): não aparece", async () => {
    await setSetting("estiloMes", { mes: "2026-11", acao: "pulei" });
    abrir();
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByRole("link", { name: "Estilo do mês" })).not.toBeInTheDocument();
  });

  it("degrau completo: não aparece", async () => {
    const compras = Object.fromEntries(itensDoDegrau(1).map((i) => [i.id, { data: "2026-10-01" }]));
    await setSetting("estiloCompras", compras);
    abrir();
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByRole("link", { name: "Estilo do mês" })).not.toBeInTheDocument();
  });

  it("o agendador de notificações não lê chaves estilo*", () => {
    const fontes = import.meta.glob(["../../src/lib/lembretes/*.ts", "../../src/lib/notification-scheduler.ts"], {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    expect(Object.keys(fontes).length).toBeGreaterThan(1);
    for (const texto of Object.values(fontes)) expect(texto.toLowerCase()).not.toContain("estilo");
  });
});

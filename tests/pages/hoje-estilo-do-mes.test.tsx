// Linha "Estilo do mês" no Hoje (Estilo em degraus, decisões 2 e 12): sem
// caixinha, sem o nome do item, só o caminho pra aba Estilo.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

  // Prova de que as configurações carregaram: a linha aparece primeiro (sem
  // espera fixa) e some quando a configuração é gravada. Só o gate de verdade
  // faz a linha sumir; "ainda carregando" não passa por aqui.
  async function apareceEDepoisSome(gravar: () => Promise<void>) {
    abrir();
    await screen.findByRole("link", { name: "Estilo do mês" });
    await gravar();
    await waitFor(() => expect(screen.queryByRole("link", { name: "Estilo do mês" })).not.toBeInTheDocument());
  }

  it("mês já fechado (comprei): a linha some", async () => {
    await apareceEDepoisSome(() => setSetting("estiloMes", { mes: "2026-11", acao: "comprei" }));
  });

  it("mês já fechado (pulei): a linha some", async () => {
    await apareceEDepoisSome(() => setSetting("estiloMes", { mes: "2026-11", acao: "pulei" }));
  });

  it("mês fechado em outro mês: a linha continua", async () => {
    await setSetting("estiloMes", { mes: "2026-10", acao: "comprei" });
    abrir();
    expect(await screen.findByRole("link", { name: "Estilo do mês" })).toBeInTheDocument();
  });

  it("degrau completo: a linha some", async () => {
    const compras = Object.fromEntries(itensDoDegrau(1).map((i) => [i.id, { data: "2026-10-01" }]));
    await apareceEDepoisSome(() => setSetting("estiloCompras", compras));
  });

  it("o agendador de notificações não lê chaves estilo*", () => {
    const fontes = import.meta.glob(["../../src/lib/lembretes/*.ts", "../../src/lib/notification-scheduler.ts"], {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    expect(Object.keys(fontes).length).toBeGreaterThan(1);
    for (const texto of Object.values(fontes)) expect(texto).not.toMatch(/estilo(Compras|Mes|Degrau|DegrauDesde|Recusas)/);
  });
});

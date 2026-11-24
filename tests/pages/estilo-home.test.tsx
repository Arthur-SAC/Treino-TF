import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { db } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";
import { EstiloHome } from "../../src/pages/EstiloHome";
import { BottomNav } from "../../src/components/BottomNav";
import { EXPOE } from "../../src/lib/discricao";
import { itensDoDegrau } from "../../src/lib/estilo-degraus";

const HOJE = "2026-11-24";
const AVISO = "Confira a tabela de medidas da marca — cada uma numera de um jeito.";
const [item1, item2, item3, item4] = itensDoDegrau(1);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 10, 24, 10, 0) });
});
afterEach(() => {
  vi.useRealTimers();
});

function abrir() {
  return render(
    <MemoryRouter initialEntries={["/estilo"]}>
      <Routes>
        <Route path="/estilo" element={<EstiloHome />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("compra do mês", () => {
  it("mostra item 1, tamanho XG, data da medida, faixa, lavagem e aviso", async () => {
    await db.measurements.add({ date: "2026-11-14", hipCm: 114 });
    abrir();
    expect(await screen.findByRole("heading", { name: item1.nome })).toBeInTheDocument();
    expect(screen.getByText("XG")).toBeInTheDocument();
    expect(screen.getByText(/14\/11/)).toBeInTheDocument();
    expect(screen.getAllByText(`R$ ${item1.precoMin}–${item1.precoMax}`).length).toBeGreaterThan(0);
    expect(screen.getByText(/máquina e varal/)).toBeInTheDocument();
    expect(screen.getByText(AVISO)).toBeInTheDocument();
  });

  it("medida velha pede pra remedir, com link", async () => {
    await db.measurements.add({ date: "2026-05-10", hipCm: 114 });
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    const link = screen.getByRole("link", { name: /medir de novo/i });
    expect(link).toHaveAttribute("href", "/corpo/medidas");
  });

  it("sem medida pede pra medir e não mostra tamanho", async () => {
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    expect(screen.getByRole("link", { name: /medir o quadril/i })).toHaveAttribute("href", "/corpo/medidas");
    expect(screen.queryByText("XG")).toBeNull();
    expect(screen.queryByText(AVISO)).toBeNull();
  });

  it("Comprei grava compra, mês e degrauDesde", async () => {
    await db.measurements.add({ date: "2026-11-14", hipCm: 114 });
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    fireEvent.change(screen.getByLabelText(/valor pago/i), { target: { value: "55" } });
    fireEvent.click(screen.getByRole("button", { name: "Comprei" }));
    await waitFor(async () => {
      expect((await getSetting("estiloCompras"))[item1.id]).toEqual({ data: HOJE, medidaCm: 114, valorPago: 55 });
    });
    expect(await getSetting("estiloMes")).toEqual({ mes: "2026-11", acao: "comprei", itemId: item1.id });
    expect(await getSetting("estiloDegrauDesde")).toBe(HOJE);
    expect(await screen.findByText("Comprado este mês")).toBeInTheDocument();
  });

  it("Comprei sem valor pago funciona", async () => {
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    fireEvent.click(screen.getByRole("button", { name: "Comprei" }));
    await waitFor(async () => {
      expect((await getSetting("estiloCompras"))[item1.id]).toEqual({ data: HOJE });
    });
  });

  it("Pular este mês grava pulei, mostra o texto e nenhum contador", async () => {
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    fireEvent.click(screen.getByRole("button", { name: "Pular este mês" }));
    expect(await screen.findByText("Esse mês fica de fora. A mesma peça volta no mês que vem.")).toBeInTheDocument();
    expect(await getSetting("estiloMes")).toEqual({ mes: "2026-11", acao: "pulei" });
    expect(await getSetting("estiloDegrauDesde")).toBe(HOJE);
    expect(screen.queryByText(/pulad|pulou|pulei \d|\d+ m[eê]s/i)).toBeNull();
  });
});

describe("lista do degrau", () => {
  it("mostra todos os itens e Já tenho marca sem fechar o mês", async () => {
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    for (const i of itensDoDegrau(1)) expect(screen.getAllByText(i.nome).length).toBeGreaterThan(0);
    const botoes = screen.getAllByRole("button", { name: "Já tenho" });
    expect(botoes.length).toBe(itensDoDegrau(1).length);
    fireEvent.click(botoes[2]);
    await waitFor(async () => {
      expect((await getSetting("estiloCompras"))[item3.id]).toEqual({ data: HOJE });
    });
    expect(await getSetting("estiloMes")).toBeNull();
    expect(await getSetting("estiloDegrauDesde")).toBe(HOJE);
    expect(screen.getByRole("button", { name: "Comprei" })).toBeInTheDocument();
  });
});

describe("oferta de degrau", () => {
  async function quatroCompras() {
    await setSetting("estiloCompras", Object.fromEntries([item1, item2, item3, item4].map((i) => [i.id, { data: "2026-10-01" }])));
  }

  it("Aceitar grava degrau 2 e degrauDesde", async () => {
    await quatroCompras();
    abrir();
    fireEvent.click(await screen.findByRole("button", { name: "Aceitar" }));
    await waitFor(async () => expect(await getSetting("estiloDegrau")).toBe(2));
    expect(await getSetting("estiloDegrauDesde")).toBe(HOJE);
  });

  it("Agora não grava a recusa e mantém a compra do mês", async () => {
    await quatroCompras();
    abrir();
    expect(await screen.findByRole("button", { name: "Agora não" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    await waitFor(async () => expect((await getSetting("estiloRecusas"))["estilo-degrau-2"]).toBe(HOJE));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Aceitar" })).toBeNull());
    expect(screen.getByRole("button", { name: "Pular este mês" })).toBeInTheDocument();
  });
});

describe("guarda-roupa e links", () => {
  it("lista o comprado com a lavagem e avisa pra conferir", async () => {
    await setSetting("estiloCompras", { [item1.id]: { data: "2026-10-01", medidaCm: 114 } });
    await db.measurements.add({ date: "2026-11-20", hipCm: 109 });
    abrir();
    expect(await screen.findByText("Confira se ainda serve")).toBeInTheDocument();
    expect(screen.getByText(/Guarda-roupa/)).toBeInTheDocument();
  });

  it("não avisa quando a diferença é pequena", async () => {
    await setSetting("estiloCompras", { [item1.id]: { data: "2026-10-01", medidaCm: 114 } });
    await db.measurements.add({ date: "2026-11-20", hipCm: 113 });
    abrir();
    await screen.findByText(/Guarda-roupa/);
    expect(screen.queryByText("Confira se ainda serve")).toBeNull();
  });

  it("tem links pra Paleta e pra vitrine", async () => {
    abrir();
    await screen.findByRole("heading", { name: item1.nome });
    expect(screen.getByRole("link", { name: /Paleta/ })).toHaveAttribute("href", "/beleza/estilo");
    expect(screen.getByRole("link", { name: /vitrine/i })).toHaveAttribute("href", "/beleza/estilo/pecas");
    expect(screen.getByText(/pano branco/i)).toBeInTheDocument();
  });
});

describe("barra de baixo", () => {
  it("tem os 5 rótulos e nenhum expõe", () => {
    render(<MemoryRouter><BottomNav /></MemoryRouter>);
    const rotulos = ["Hoje", "Progresso", "Consulta", "Vitalidade", "Estilo"];
    for (const r of rotulos) {
      expect(screen.getByRole("link", { name: r })).toBeInTheDocument();
      expect(EXPOE.test(r)).toBe(false);
    }
    expect(screen.getByRole("link", { name: "Estilo" })).toHaveAttribute("href", "/estilo");
  });
});

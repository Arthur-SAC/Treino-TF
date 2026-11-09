import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useEffect } from "react";
import { PlacasProvider, usePlacas, type PlacaDados } from "../../src/hooks/usePlacas";
import type { ProximaParte } from "../../src/lib/proxima-parte";

const parte: ProximaParte = {
  proximoId: "entrada-2", proximoNome: "Entrada · Semana 2",
  feitos: 2, threshold: 5, faltam: 3, progresso: 0.4,
};

function Disparo({ placas }: { placas: PlacaDados[] }) {
  const { mostrar } = usePlacas();
  useEffect(() => {
    placas.forEach((p) => mostrar(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function abrir(placas: PlacaDados[]) {
  render(
    <PlacasProvider>
      <Disparo placas={placas} />
    </PlacasProvider>,
  );
}

describe("placas", () => {
  it("mostra uma por vez: a segunda só depois de fechar a primeira", async () => {
    abrir([
      { tipo: "vitoria", treino: "Inferior A", de: 0, para: 1, parte },
      { tipo: "queda", de: 3, diasPerdidos: 1, parte },
    ]);
    expect(await screen.findByText("Treino concluído")).toBeInTheDocument();
    expect(screen.queryByText("Sequência perdida")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Voltar pro Hoje" }));
    expect(await screen.findByText("Sequência perdida")).toBeInTheDocument();
    expect(screen.queryByText("Treino concluído")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Bora hoje" }));
    expect(screen.queryByText("Sequência perdida")).toBeNull();
  });

  it("vitória de 7 pra 8 mostra o título, o 8 e quantos treinos faltam", async () => {
    abrir([{ tipo: "vitoria", treino: "Inferior A", de: 7, para: 8, parte }]);
    expect(await screen.findByText("Treino concluído")).toBeInTheDocument();
    expect(await screen.findByText("8")).toBeInTheDocument();
    expect(screen.getByText("faltam 3 treinos pra Entrada · Semana 2")).toBeInTheDocument();
    expect(screen.getByText("Sequência")).toBeInTheDocument();
    expect(screen.getByText("Próxima parte")).toBeInTheDocument();
  });

  it("vitória com 1 treino faltando usa o singular; na última parte não fala em faltam", async () => {
    abrir([
      { tipo: "vitoria", treino: "x", de: 0, para: 1, parte: { ...parte, faltam: 1 } },
      { tipo: "vitoria", treino: "x", de: 0, para: 1, parte: { ...parte, proximoId: null, proximoNome: null } },
    ]);
    expect(await screen.findByText("falta 1 treino pra Entrada · Semana 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar pro Hoje" }));
    expect(await screen.findByText("Você está na última parte")).toBeInTheDocument();
  });

  it("queda de 1 dia: Ontem não teve treino, e a parte não volta atrás", async () => {
    abrir([{ tipo: "queda", de: 3, diasPerdidos: 1, parte }]);
    expect(await screen.findByText("Sequência perdida")).toBeInTheDocument();
    expect(screen.getByText("Ontem não teve treino")).toBeInTheDocument();
    expect(screen.getByText("isso não volta atrás")).toBeInTheDocument();
    // o número desce até 0
    expect(await screen.findByText("0")).toBeInTheDocument();
  });

  it("queda de 2 dias: 2 dias úteis sem treino", async () => {
    abrir([{ tipo: "queda", de: 3, diasPerdidos: 2, parte }]);
    expect(await screen.findByText("2 dias úteis sem treino")).toBeInTheDocument();
  });

  it("trava o scroll do body enquanto aberta e destrava ao fechar", async () => {
    abrir([{ tipo: "queda", de: 0, diasPerdidos: 1, parte }]);
    await screen.findByText("Sequência perdida");
    expect(document.body.style.overflow).toBe("hidden");
    act(() => { fireEvent.click(screen.getByRole("button", { name: "Bora hoje" })); });
    expect(document.body.style.overflow).toBe("");
  });

  it("sem provider, mostrar não quebra", () => {
    function Solto() {
      const { mostrar } = usePlacas();
      mostrar({ tipo: "queda", de: 1, diasPerdidos: 1, parte });
      return <p>ok</p>;
    }
    render(<Solto />);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});

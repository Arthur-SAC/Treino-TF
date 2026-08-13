import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { seedMovement } from "../../src/lib/movement-seed";
import { Vitalidade } from "../../src/pages/path/Vitalidade";
import { BottomNav } from "../../src/components/BottomNav";
import { SEQUENCES } from "../../src/data/sequences-seed";

const INTIMAS = SEQUENCES.filter((s) => s.category === "intimidade");

// Ela relatou (2026-08-13) que foi procurar o conteúdo de intimidade e não
// achou. O motivo era estrutural: o que serve pra uma noite com a noiva estava
// espalhado em TRÊS abas de baixo — as sequências na 8ª seção de Treino →
// Movimento, o streak e o controle só pelo atalho do Hoje, e a lingerie em
// Beleza → Estilo → Íntimo. Conteúdo existir e não ser alcançável é a mesma
// falha que este projeto persegue desde o começo; ela só aconteceu na
// navegação em vez de no seed.
describe("a Vitalidade é o lugar único do que é a dois", () => {
  beforeEach(async () => {
    await db.danceSequences.clear();
    await db.practiceLogs.clear();
    await db.dailyLog.clear();
    await db.settings.clear();
    await seedMovement();
  });

  it("tem a aba própria na barra de baixo", () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>,
    );
    const aba = screen.getByRole("link", { name: /Vitalidade/i });
    expect(aba).toHaveAttribute("href", "/vitalidade");
  });

  it("lista TODAS as sequências de intimidade, não uma seleção", async () => {
    render(
      <MemoryRouter>
        <Vitalidade />
      </MemoryRouter>,
    );
    // Espera o dado liquidar por um nome de sequência — ler antes disso
    // observa a lista vazia e passa verde com a tela quebrada.
    await waitFor(() =>
      expect(screen.getByText(/Grinding pélvico · por cima/)).toBeInTheDocument(),
    );
    // Regex, não string exata: o link renderiza `{nome} →`.
    for (const s of INTIMAS) {
      expect(screen.getByText(new RegExp(s.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
    }
  });

  it("cada sequência leva direto pra ela, sem passar por Treino", async () => {
    render(
      <MemoryRouter>
        <Vitalidade />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText(/Grinding pélvico · por cima/)).toBeInTheDocument(),
    );
    for (const s of INTIMAS) {
      expect(screen.getByRole("link", { name: new RegExp(s.name.slice(0, 18), "i") }))
        .toHaveAttribute("href", `/treino/movimento/${s.id}`);
    }
  });

  it("aponta pra lingerie, que mora no Estilo", async () => {
    render(
      <MemoryRouter>
        <Vitalidade />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText(/Grinding pélvico · por cima/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: /lingerie|de ver.*de usar/i }))
      .toHaveAttribute("href", "/beleza/estilo/intimo");
  });

  // O streak e o controle já moravam aqui e não podem ter sido empurrados pra
  // fora pela seção nova.
  it("o streak e o assoalho continuam na tela", async () => {
    render(
      <MemoryRouter>
        <Vitalidade />
      </MemoryRouter>,
    );
    // Por papel: "Assoalho pélvico" aparece duas vezes na tela — o título da
    // seção e a linha de contagem em "Firmeza, controle e volume".
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Assoalho pélvico" })).toBeInTheDocument(),
    );
    expect(screen.getByText("Atual")).toBeInTheDocument();
  });
});

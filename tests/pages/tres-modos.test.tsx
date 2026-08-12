import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { seedStyle } from "../../src/lib/style-seed";
import { IntimateView } from "../../src/pages/beauty/style/IntimateView";
import { HomeModeView } from "../../src/pages/beauty/style/HomeModeView";

describe("as telas dos três modos", () => {
  beforeEach(async () => {
    await db.garments.clear();
    await db.outfits.clear();
    await db.stylePalette.clear();
    await db.settings.clear();
    await seedStyle();
  });

  // ATENÇÃO ao que este waitFor espera. A primeira versão esperava o TEXTO
  // "De usar", que também aparece no parágrafo explicativo do topo — texto
  // estático, presente desde o primeiro render. O waitFor resolvia na hora, o
  // useLiveQuery ainda não tinha liquidado, e as listas estavam vazias: o teste
  // teria passado com a tela sem nenhuma peça. É a armadilha 5.3 do projeto.
  // Esperar pelo NOME DE UMA PEÇA é o que de fato prova que o dado chegou.
  it("o Íntimo separa o que é de ver do que é de usar", async () => {
    render(
      <MemoryRouter>
        <IntimateView />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText("Boxer de microfibra liso (sem costura frontal)")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "De usar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "De ver" })).toBeInTheDocument();
    expect(screen.getByText("Body de renda")).toBeInTheDocument();
  });

  it("a tela de Casa separa as peças pelas duas técnicas de marcar", async () => {
    render(
      <MemoryRouter>
        <HomeModeView />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText("Vestido justo (bodycon) cintura marcada")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Marca por contato (justa)" })).toBeInTheDocument();
    expect(screen.getByText("Marca por contraste (folgada)")).toBeInTheDocument();
    // Uma de cada, pra provar que a separação é real e não dois títulos vazios.
    expect(screen.getByText("Vestido justo (bodycon) cintura marcada")).toBeInTheDocument();
    expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument();
  });

  it("nenhuma peça íntima vaza pra tela de Casa", async () => {
    render(
      <MemoryRouter>
        <HomeModeView />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText("Vestido justo (bodycon) cintura marcada")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Marca por contato (justa)" })).toBeInTheDocument();
    expect(screen.queryByText("Body de renda")).not.toBeInTheDocument();
    expect(screen.queryByText("Boxer de microfibra liso (sem costura frontal)")).not.toBeInTheDocument();
  });
});

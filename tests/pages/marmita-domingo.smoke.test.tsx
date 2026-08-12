import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MarmitaDomingo } from "../../src/pages/path/MarmitaDomingo";
import { ROTEIRO_DOMINGO } from "../../src/data/marmita-domingo-seed";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("tela do roteiro de domingo", () => {
  it("serve todas as etapas, na ordem do seed", () => {
    render(
      <MemoryRouter>
        <MarmitaDomingo />
      </MemoryRouter>,
    );
    for (const etapa of ROTEIRO_DOMINGO) {
      expect(screen.getByText(etapa.titulo)).toBeInTheDocument();
    }
  });

  it("mostra quanto tempo o domingo custa de verdade", () => {
    render(
      <MemoryRouter>
        <MarmitaDomingo />
      </MemoryRouter>,
    );
    // 62 min de mão na massa — o número que decide se ela começa ou não.
    expect(screen.getByText(/62 min/)).toBeInTheDocument();
  });
});

describe("o domingo do Hoje leva ao roteiro", () => {
  it("o item de domingo aponta pra tela do roteiro, não pro plano genérico", () => {
    const domingo = buildDayRoutine(0, 100);
    const item = domingo.blocks
      .flatMap((b) => b.items)
      .find((i) => i.id === "marmita-domingo")!;
    expect(item.to).toBe("/trilha/alimentacao/domingo");
  });

  it("o lembrete de dia útil aponta pro mesmo lugar", () => {
    const quarta = buildDayRoutine(3, 100);
    const item = quarta.blocks
      .flatMap((b) => b.items)
      .find((i) => i.id === "lembrete-domingo-marmita")!;
    expect(item.to).toBe("/trilha/alimentacao/domingo");
  });
});

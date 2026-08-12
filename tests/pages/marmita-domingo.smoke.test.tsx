import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { MarmitaDomingo } from "../../src/pages/path/MarmitaDomingo";
import { ROTEIRO_DOMINGO } from "../../src/data/marmita-domingo-seed";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
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

  // O roteiro fala do lote inteiro ("1 kg de frango"), que é o número de pôr no
  // fogo. Fechar os potes precisa do outro número: a porção de UMA marmita.
  it("mostra quanto vai em cada pote, com o peso total do pote cheio", async () => {
    await db.mealPlans.clear();
    await db.settings.clear();
    await db.measurements.clear();
    await db.mealPlans.add({ ...INITIAL_PLAN } as never);

    render(
      <MemoryRouter>
        <MarmitaDomingo />
      </MemoryRouter>,
    );

    // Aguarda o useLiveQuery liquidar — a seção só existe depois do plano
    // chegar, e ler o DOM antes disso passaria verde com a tela quebrada.
    await waitFor(() => expect(screen.getByText("Quanto vai em cada pote")).toBeInTheDocument());

    const almoco1 = INITIAL_PLAN.slots.find((s) => s.mealType === "almoco")!.variants[0];
    const total = almoco1.foods.reduce((s, f) => s + f.qtyG, 0);
    expect(screen.getAllByText(`${total} g`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pote cheio/).length).toBeGreaterThan(0);
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

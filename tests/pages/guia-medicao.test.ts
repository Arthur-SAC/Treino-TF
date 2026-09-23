import { describe, it, expect } from "vitest";
import { GUIDE_MEDICAO } from "../../src/pages/body/Measurements";

// Auditoria de 2026-09-23: o guia mandava medir a cintura na "parte mais
// estreita" e o ombro "de ponta a ponta" (largura). A partida (13/05/2026) e a
// conta de gordura Navy usam cintura NO UMBIGO e ombro em CIRCUNFERÊNCIA — seguir
// o guia daria números de outra régua, e a partida automática nasceria errada.
const tips = GUIDE_MEDICAO.flatMap((s) => s.tips);
const dica = (parte: string) => tips.find((t) => t.startsWith(parte)) ?? "";

describe("guia de medição fala a mesma régua do app", () => {
  it("cintura na altura do umbigo, não na parte mais estreita", () => {
    expect(dica("Cintura")).toMatch(/umbigo/i);
    expect(dica("Cintura")).not.toMatch(/mais estreita/i);
  });

  it("ombro é circunferência — a fita dá a volta", () => {
    expect(dica("Ombros")).toMatch(/volta/i);
    expect(dica("Ombros")).not.toMatch(/ponta de um ombro à ponta do outro/i);
  });

  it("o busto tem instrução — é medida do formulário e da partida", () => {
    expect(dica("Busto")).not.toBe("");
  });
});

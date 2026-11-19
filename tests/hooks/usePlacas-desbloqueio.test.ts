// Spec 2026-11-19, seção 4: nada avança sozinho. Bater o patamar de sequência
// não grava mais em `desbloqueios` nem mostra "Parabéns, X desbloqueado" — vira
// o card "Pronta pra próxima" no Hoje, e só o "Aceitar" grava. Antes daqui
// existiam aplicarDesbloqueios/placasDeDesbloqueio (revisão de 2026-11-09);
// saíram junto com a placa.
import { describe, it, expect } from "vitest";
import * as placas from "../../src/hooks/usePlacas";

describe("usePlacas sem desbloqueio automático", () => {
  it("não exporta mais quem gravava desbloqueios sozinho", () => {
    expect(Object.keys(placas)).not.toContain("aplicarDesbloqueios");
    expect(Object.keys(placas)).not.toContain("desbloquearComPlacas");
    expect(Object.keys(placas)).not.toContain("placasDeDesbloqueio");
  });
});

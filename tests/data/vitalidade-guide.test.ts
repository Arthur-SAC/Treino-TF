import { describe, it, expect } from "vitest";
import { VITALIDADE_GUIA } from "../../src/data/vitalidade-guide-seed";

const texto = JSON.stringify(VITALIDADE_GUIA);

describe("guia de firmeza, controle e volume", () => {
  it("declara o teto de volume em vez de prometer multiplicação", () => {
    expect(texto).toMatch(/1,5|5 mL|alto-normal/);
  });

  it("não recomenda suplemento de volume", () => {
    expect(texto.toLowerCase()).not.toMatch(/suplemento de volume|pílula de volume/);
    expect(texto.toLowerCase()).toMatch(/sem evid[êe]ncia/);
  });

  it("nomeia as alavancas reais", () => {
    for (const alavanca of [/intervalo/i, /hidrata/i, /assoalho/i, /sono/i, /cintura|abdominal/i, /zinco/i]) {
      expect(texto).toMatch(alavanca);
    }
  });

  it("aponta a castanha de caju como a fonte local de zinco", () => {
    expect(texto.toLowerCase()).toMatch(/castanha de caju/);
  });

  it("registra que hormonizar derrubaria o volume — reforça as duas trilhas", () => {
    expect(texto.toLowerCase()).toMatch(/estrog[êe]nio|hormoniz/);
  });

  it("não trata a terapia hormonal como etapa agendada", () => {
    expect(texto).not.toMatch(/quando a TRH/i);
    expect(texto).not.toMatch(/in[íi]cio da TRH/i);
  });
});

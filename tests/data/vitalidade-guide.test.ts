import { describe, it, expect } from "vitest";
import { VITALIDADE_GUIA } from "../../src/data/vitalidade-guide-seed";
import { MEDIDAS_PARTIDA, FASES } from "../../src/lib/objetivo";

const texto = JSON.stringify(VITALIDADE_GUIA);

// A regressão provável em conteúdo de saúde não é apagar a frase certa — é
// ACRESCENTAR uma alegação errada do lado dela ("sem evidência" continua
// escrito em algum lugar, mas agora do lado de uma posologia real). A busca
// por string exata (`suplemento de volume`) não pega isso; posologia (número
// + unidade) e nome de substância pegam a família inteira do problema, não
// só a frase específica que este arquivo já evita hoje.
const PADRAO_POSOLOGIA = /\d+([.,]\d+)?\s*(mg|mcg|UI|g)\b/i;
const SUBSTANCIAS_DE_VOLUME = [
  /[óo]xido n[íi]trico/i,
  /l-?arginina/i,
  /citrulina/i,
  /maca peruana/i,
  /tribulus/i,
  /fenogrego|fenugreek|feno-grego/i,
  /volume\s*pills?/i,
  /semenax/i,
  /ginseng/i,
];

describe("guia de firmeza, controle e volume", () => {
  it("declara o teto de volume em vez de prometer multiplicação", () => {
    expect(texto).toMatch(/1,5|5 mL|alto-normal/);
  });

  it("não recomenda suplemento de volume", () => {
    expect(texto.toLowerCase()).not.toMatch(/suplemento de volume|pílula de volume/);
    expect(texto.toLowerCase()).toMatch(/sem evid[êe]ncia/);
  });

  it("não prescreve posologia (número + mg/mcg/UI/g) — a família toda de 'tome X', não só a frase específica", () => {
    // Confirmado sem falso positivo contra o texto atual: os únicos números
    // com unidade no guia são volume (mL) e medida corporal (cm) — nenhum
    // dos dois bate em mg/mcg/UI/g.
    expect(texto).not.toMatch(PADRAO_POSOLOGIA);
  });

  it("não cita nome de substância vendida como 'aumenta o volume' sem evidência boa", () => {
    for (const re of SUBSTANCIAS_DE_VOLUME) {
      expect(texto).not.toMatch(re);
    }
  });

  it("nomeia as alavancas reais", () => {
    for (const alavanca of [/intervalo/i, /hidrata/i, /assoalho/i, /sono/i, /cintura|abdominal/i, /zinco/i]) {
      expect(texto).toMatch(alavanca);
    }
  });

  it("aponta a castanha de caju como a fonte local de zinco", () => {
    expect(texto.toLowerCase()).toMatch(/castanha de caju/);
  });

  it("ancora a cintura/gordura abdominal no número real de objetivo.ts, não em prosa solta", () => {
    expect(texto).toContain(String(MEDIDAS_PARTIDA.cinturaCm));
    expect(texto).toContain(String(FASES.find((f) => f.id === "fase-1")!.cinturaCm));
  });

  it("registra que hormonizar derrubaria o volume — reforça as duas trilhas", () => {
    expect(texto.toLowerCase()).toMatch(/estrog[êe]nio|hormoniz/);
  });

  it("não trata a terapia hormonal como etapa agendada", () => {
    expect(texto).not.toMatch(/quando a TRH/i);
    expect(texto).not.toMatch(/in[íi]cio da TRH/i);
  });
});

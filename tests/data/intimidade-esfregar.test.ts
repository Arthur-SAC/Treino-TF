import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const seq = () => SEQUENCES.find((s) => s.id === "intimidade-esfregar-roupa");
const texto = () => {
  const s = seq()!;
  return `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;
};

// É sequência separada do grinding porque o fator decisivo aqui não é o corpo,
// é o TECIDO — e nenhuma técnica compensa a costura errada.
describe("esfregar com roupa", () => {
  it("a sequência existe e é de intimidade", () => {
    expect(seq()).toBeDefined();
    expect(seq()!.category).toBe("intimidade");
  });

  it("nomeia a costura frontal do jeans como a vilã", () => {
    expect(texto()).toMatch(/costura frontal/i);
    expect(texto()).toMatch(/jeans/i);
  });

  it("diz o que vestir no lugar", () => {
    expect(texto()).toMatch(/malha|moletom|legging/i);
  });

  // Desconforto dela aos 15 min é abrasão, não falta de tesão. Sem isso escrito,
  // ela lê o próprio corpo errado.
  it("avisa que atrito seco assa, e nomeia isso como abrasão", () => {
    expect(texto()).toMatch(/abras/i);
    expect(texto()).toMatch(/15/);
  });

  it("descreve a escada de camadas, e que tirar roupa cedo destrói o mecanismo", () => {
    expect(texto()).toMatch(/camada/i);
    expect(texto()).toMatch(/barreira/i);
  });

  // Serve à usuária também: é a melhor situação para treinar o próprio
  // controle — excitação alta, estímulo indireto, sem o gatilho da penetração.
  it("aponta o uso como treino de controle dela — start-stop a dois", () => {
    expect(texto()).toMatch(/start-?stop/i);
    expect(texto()).toMatch(/controle/i);
  });
});

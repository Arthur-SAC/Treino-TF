import { describe, it, expect } from "vitest";
import { GARMENTS } from "../../src/data/garments-seed";

const intimas = GARMENTS.filter((g) => g.mode === "intimo");

// A divisão que o app não tinha: peça pra ELA OLHAR e peça pra USAR no atrito.
// Renda é abrasiva em 15-25 min de contato contínuo e machuca a noiva; costura
// frontal central é uma crista que rala. A peça mais funcional é a menos
// glamourosa, e escrever isso é o que evita ela descobrir doendo.
describe("peça de ver × peça de usar", () => {
  it("toda peça íntima declara para que serve", () => {
    const mudas = intimas.filter((g) => g.intimateUse !== "ver" && g.intimateUse !== "usar");
    expect(mudas.map((g) => g.id)).toEqual([]);
  });

  it("existe guarda-roupa de USAR de verdade, não uma peça simbólica", () => {
    expect(intimas.filter((g) => g.intimateUse === "usar").length).toBeGreaterThanOrEqual(3);
  });

  // ATENÇÃO ao formato: a primeira versão desta rede proibia a PALAVRA "renda"
  // em peça de usar, e acusou "Tecido liso, SEM RENDA no corpo da peça" — uma
  // negação, e justamente o texto que existe para proteger. É a quinta vez que
  // esta armadilha aparece no projeto. O padrão correto tem duas metades:
  // proibir a AFIRMAÇÃO e, separadamente, exigir que a citação esteja negando.
  const ABRASIVOS = /renda|transparen|cetim|tule/i;

  it("nenhuma peça de usar é FEITA de material abrasivo — o nome é onde o material se afirma", () => {
    const erradas = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => ABRASIVOS.test(g.name));
    expect(erradas.map((g) => g.id)).toEqual([]);
  });

  it("onde uma peça de usar cita material abrasivo, ela está negando", () => {
    const semNegacao = intimas
      .filter((g) => g.intimateUse === "usar")
      .flatMap((g) =>
        `${g.whyItWorks} ${g.cautions ?? ""}`
          .split(/[.;]/)
          .filter((frase) => ABRASIVOS.test(frase))
          .filter((frase) => !/\bsem\b|\bnão\b|\bnada de\b|\bem vez de\b/i.test(frase))
          .map((frase) => ({ id: g.id, frase: frase.trim() })),
      );
    expect(semNegacao).toEqual([]);
  });

  it("toda peça de usar diz que não tem costura frontal — é a crista que rala", () => {
    const semAviso = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => !/sem costura|costura frontal|liso/i.test(`${g.name} ${g.whyItWorks} ${g.cautions ?? ""}`));
    expect(semAviso.map((g) => g.id)).toEqual([]);
  });

  // Cós alto serve às três funções de uma vez — alonga a bunda, comprime a
  // barriga e segura o pinto pra cima, que é o que o grinding pede.
  it("existe peça de cós alto no guarda-roupa de usar", () => {
    const comCos = intimas
      .filter((g) => g.intimateUse === "usar")
      .filter((g) => /cós alto|cintura alta/i.test(`${g.name} ${g.whyItWorks} ${g.fitTip ?? ""}`));
    expect(comCos.length).toBeGreaterThanOrEqual(1);
  });

  // Restrição mais antiga do repertório: a noiva recusou strap-on, e repropor
  // é não escutar.
  it("nenhuma peça íntima propõe strap-on", () => {
    const texto = intimas.map((g) => `${g.name} ${g.whyItWorks} ${g.cautions ?? ""}`).join(" ");
    expect(texto).not.toMatch(/strap-?on|cinta.?penis|prótese peniana/i);
  });
});

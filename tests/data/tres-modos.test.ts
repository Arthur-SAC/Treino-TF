import { describe, it, expect } from "vitest";
import { GARMENTS } from "../../src/data/garments-seed";

describe("toda peça tem um contexto, e o contexto é um dos três", () => {
  it("nenhuma peça ficou sem modo nem com valor antigo", () => {
    const MODOS = ["publico", "casa", "intimo"];
    const erradas = GARMENTS.filter((g) => !MODOS.includes(g.mode)).map((g) => g.id);
    expect(erradas).toEqual([]);
  });

  it("toda peça íntima está no modo íntimo, e vice-versa", () => {
    const desalinhadas = GARMENTS.filter(
      (g) => (g.category === "intimate") !== (g.mode === "intimo"),
    ).map((g) => ({ id: g.id, category: g.category, mode: g.mode }));
    expect(desalinhadas).toEqual([]);
  });

  // Justa marca por contato, folgada marca por contraste. Sem a etiqueta, a
  // tela de Casa não consegue separar, e ela volta a escolher pelo caimento em
  // vez de pelo efeito.
  //
  // A exigência é só para peça que VESTE o corpo (top, bottom, dress). Cinto e
  // salto são de casa e não marcam por nenhuma das duas: um cria ponto focal,
  // o outro muda a postura. Forçar uma etiqueta neles seria inventar uma
  // classificação pra satisfazer o teste, que é o contrário do que ele serve.
  const VESTEM_O_CORPO = ["top", "bottom", "dress"];

  it("toda peça de casa que veste o corpo declara por qual técnica ela marca", () => {
    const mudas = GARMENTS.filter((g) => g.mode === "casa")
      .filter((g) => VESTEM_O_CORPO.includes(g.category))
      .filter((g) => g.homeEffect !== "contato" && g.homeEffect !== "contraste")
      .map((g) => g.id);
    expect(mudas).toEqual([]);
  });

  it("as duas técnicas estão representadas — não é uma etiqueta só com dois nomes", () => {
    const casa = GARMENTS.filter((g) => g.mode === "casa");
    expect(casa.filter((g) => g.homeEffect === "contato").length).toBeGreaterThanOrEqual(3);
    expect(casa.filter((g) => g.homeEffect === "contraste").length).toBeGreaterThanOrEqual(3);
  });

  // A etiqueta é do modo Casa. Peça de público ou de íntimo com homeEffect
  // significa que alguém etiquetou por caimento, não por contexto.
  it("só peça de casa tem a etiqueta de efeito", () => {
    const forasteiras = GARMENTS.filter((g) => g.mode !== "casa" && g.homeEffect).map((g) => g.id);
    expect(forasteiras).toEqual([]);
  });
});

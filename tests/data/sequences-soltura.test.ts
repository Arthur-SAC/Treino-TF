import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const NOVAS = [
  "pelvic-soltura-identificacao",
  "pelvic-soltura-sustentada",
  "pelvic-alternancia",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
];

describe("as sequências de soltura", () => {
  it("todas existem e são da categoria pelvic", () => {
    const faltando = NOVAS.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
    for (const id of NOVAS) {
      expect(SEQUENCES.find((s) => s.id === id)!.category).toBe("pelvic");
    }
  });

  it("todas têm foco e pelo menos 3 movimentos", () => {
    for (const id of NOVAS) {
      const s = SEQUENCES.find((x) => x.id === id)!;
      expect({ id, temFoco: !!s.focus, movimentos: s.moves.length >= 3 })
        .toEqual({ id, temFoco: true, movimentos: true });
    }
  });

  it("a identificação da soltura entra pela respiração diafragmática — é o único caminho que funciona", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-soltura-identificacao")!;
    const texto = JSON.stringify(s).toLowerCase();
    expect(texto).toMatch(/respira/);
    expect(texto).toMatch(/diafragm|abd[oô]men|barriga/);
  });

  it("o start-stop se declara treino, não deslize — é o que sustenta a regra do streak", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-start-stop")!;
    expect(JSON.stringify(s).toLowerCase()).toMatch(/treino|exerc[íi]cio/);
  });

  it("o start-stop diz explicitamente que é sem tela", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-start-stop")!;
    expect(JSON.stringify(s).toLowerCase()).toMatch(/sem tela|sem pornografia/);
  });

  it("o preparo pra receber aponta pro relaxamento, não pra força", () => {
    const s = SEQUENCES.find((x) => x.id === "pelvic-receber-preparo")!;
    const texto = JSON.stringify(s).toLowerCase();
    expect(texto).toMatch(/relax|solt/);
    expect(texto).toMatch(/lubrific/);
  });

  it("nenhuma sequência nova propõe strap-on — a noiva recusou, e propor de novo é não escutar", () => {
    for (const id of NOVAS) {
      expect(JSON.stringify(SEQUENCES.find((x) => x.id === id)!).toLowerCase()).not.toMatch(/strap|pr[óo]tese pen/);
    }
  });
});

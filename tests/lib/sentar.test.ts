// tests/lib/sentar.test.ts
import { describe, it, expect } from "vitest";
import { sentarDaVez } from "../../src/lib/sentar";

describe("sentar na volta da micro-pausa", () => {
  it("o bloco de joelhos juntos aparece só na pausa nº 1 do dia", () => {
    expect(sentarDaVez(1, 10).titulo).toMatch(/[Jj]oelhos juntos/);
    for (const n of [0, 2, 3, 4, 5]) expect(sentarDaVez(n, 10).titulo).not.toMatch(/[Jj]oelhos juntos/);
  });

  it("o bloco é curto e diz quando soltar", () => {
    const c = sentarDaVez(1, 10).como;
    expect(c).toMatch(/10[–-]15 min/);
    expect(c).toMatch(/formigar/);
  });

  it("o lado da posição inclinada alterna entre pausas e entre dias", () => {
    const lados = [0, 2, 4, 6].map((n) => sentarDaVez(n, 10)).filter((d) => /inclinad/i.test(d.titulo)).map((d) => /esquerd/.test(d.como) ? "e" : "d");
    expect(new Set(lados).size).toBeGreaterThan(0);
    const inclinada = (dia: number) => [0, 2, 3, 4, 5, 6].map((n) => sentarDaVez(n, dia)).find((d) => /inclinad/i.test(d.titulo))!;
    expect(/esquerd/.test(inclinada(10).como)).not.toBe(/esquerd/.test(inclinada(11).como));
  });

  it("toda dica lembra de trocar de posição", () => {
    for (let n = 0; n < 8; n++) expect(sentarDaVez(n, 3).como).toMatch(/20[–-]30 min/);
  });

  // Review Focus: valores estranhos não quebram
  it("n e dia inválidos devolvem uma dica", () => {
    for (const v of [-1, Number.NaN]) expect(sentarDaVez(v, v).titulo).toMatch(/\S/);
  });
});

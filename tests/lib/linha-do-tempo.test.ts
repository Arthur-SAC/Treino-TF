import { describe, it, expect } from "vitest";
import { linhaDoTempo } from "../../src/lib/linha-do-tempo";
import { projetar } from "../../src/lib/partida";

const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;

describe("linha do tempo", () => {
  it("sem partida, diz que os prazos aparecem depois da primeira medição — sem datas de maio", () => {
    const s = JSON.stringify(linhaDoTempo(null));
    expect(s).toMatch(/depois da sua primeira medição/i);
    expect(s).not.toMatch(/2026-05|13\/05|maio/i);
    expect(s).not.toMatch(/NaN|undefined/);
  });

  it("com partida, dá mês de calendário pra cintura 88, fim da fase 1 e fim da fase 2", () => {
    const s = JSON.stringify(linhaDoTempo(pr));
    expect(s).toMatch(/Cintura 88/);
    expect(s).toMatch(/\/2027/);
    expect(s).toMatch(/\/2028/);
    expect(s).toMatch(/balança SOBE/);
    expect(s).toMatch(/Fase 2 termina entre/);
  });

  it("partida já abaixo de 88 não inventa data pra trava", () => {
    const abaixo = projetar({ data: "2026-09-25", pesoKg: 90, cinturaCm: 87, pescocoCm: 40 }, 173)!;
    expect(JSON.stringify(linhaDoTempo(abaixo))).toMatch(/já começou abaixo/);
  });

  it("não ancora prazo em idade", () => {
    expect(JSON.stringify(linhaDoTempo(pr))).not.toMatch(/\b\d{2}\s*anos\b/i);
  });
});

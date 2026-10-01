// tests/lib/ritmo.test.ts
import { describe, it, expect } from "vitest";
import { avaliarRitmo, alavancaMaisFraca, type Adesao, type Veredito } from "../../src/lib/ritmo";
import { projetar } from "../../src/lib/partida";
import { somarDiasISO } from "../../src/lib/today-date";
import type { Measurement } from "../../src/lib/db";

const P = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };
const PR = projetar(P, 173, "caminhada")!;
const BOA: Adesao = { dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 14 };
const partida: Measurement = { id: 1, date: P.data, weightKg: 96, waistCm: 99, neckCm: 40 };
// 28 dias depois = 4 semanas exatas
const em = (pesoKg: number, cinturaCm: number, id = 2, date = "2026-10-23"): Measurement =>
  ({ id, date, weightKg: pesoKg, waistCm: cinturaCm, neckCm: 40 });

const textos = (v: Veredito) => ("texto" in v ? v.texto.join(" ") : "");

describe("somarDiasISO", () => {
  it("soma em UTC puro, atravessando o mês", () => {
    expect(somarDiasISO("2026-09-25", 10)).toBe("2026-10-05");
    expect(somarDiasISO("2026-10-05", -10)).toBe("2026-09-25");
  });
});

describe("veredito do ritmo", () => {
  it("sem projeção não avalia", () => {
    expect(avaliarRitmo(null, [], BOA, "caminhada")).toEqual({ estado: "sem-partida" });
  });

  it("antes de 10 dias diz quando sai a primeira comparação", () => {
    expect(avaliarRitmo(PR, [partida, em(95.5, 98.5, 2, "2026-10-01")], BOA, "caminhada"))
      .toEqual({ estado: "cedo", primeiraComparacao: "2026-10-05" });
  });

  it("peso e cintura descendo no plano = no ritmo", () => {
    const v = avaliarRitmo(PR, [partida, em(94, 97)], BOA, "caminhada");
    expect(v.estado).toBe("no-ritmo");
    expect(v).toMatchObject({ kgSemana: 0.5, cmSemana: 0.5 });
  });

  it("balança quase parada com a cintura no ritmo = no ritmo, e diz que é músculo", () => {
    const v = avaliarRitmo(PR, [partida, em(95.8, 97.5)], BOA, "caminhada");
    expect(v.estado).toBe("no-ritmo");
    expect(textos(v)).toMatch(/músculo/);
  });

  it("abaixo aponta a alavanca mais fraca e o prazo real", () => {
    const fraca: Adesao = { dias: 14, treinos: 4, diasCardio: 13, noitesNoAlvo: 12 };
    const v = avaliarRitmo(PR, [partida, em(95.6, 98.6)], fraca, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/Treino/);
    expect(textos(v)).toMatch(/termina em/);
  });

  it("rápido demais pelo teto do plano manda comer mais, em gramas", () => {
    const v = avaliarRitmo(PR, [partida, em(91.6, 95)], BOA, "caminhada");
    expect(v.estado).toBe("rapido");
    expect(textos(v)).toMatch(/Coma mais/);
    expect(textos(v)).toMatch(/\d+ g/);
  });

  it("rápido demais por 1% do peso por semana, mesmo dentro de 1,3× o teto", () => {
    const largo = { ...PR, ritmoKgSemana: [0.9, 1.2] as [number, number] };
    expect(avaliarRitmo(largo, [partida, em(91.6, 95)], BOA, "caminhada").estado).toBe("rapido");
  });

  // Review Focus
  it("ignora medida sem cintura e usa a última com os dois", () => {
    const soPeso: Measurement = { id: 3, date: "2026-10-25", weightKg: 90 };
    expect(avaliarRitmo(PR, [partida, em(94, 97), soPeso], BOA, "caminhada")).toMatchObject({ kgSemana: 0.5 });
  });

  it("duas medidas no mesmo dia: vale a de maior id", () => {
    const v = avaliarRitmo(PR, [partida, em(90, 90, 5), em(94, 97, 6)], BOA, "caminhada");
    expect(v).toMatchObject({ kgSemana: 0.5 });
  });

  it("ganhou peso: abaixo, sem data e sem número quebrado", () => {
    const v = avaliarRitmo(PR, [partida, em(97, 99.5)], BOA, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/não tem data/);
    expect(textos(v)).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("trocar o modo recalcula o esperado sem medir de novo", () => {
    const medidas = [partida, em(95.6, 98.6)];
    const andando = avaliarRitmo(PR, medidas, BOA, "caminhada");
    const parada = avaliarRitmo(projetar(P, 173, "pausada")!, medidas, BOA, "pausada");
    expect(andando.estado).toBe("abaixo");
    expect(parada.estado).not.toBe("abaixo");
  });
});

describe("alavanca mais fraca", () => {
  it("aponta a menor fração; empate fica com treino", () => {
    expect(alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 5, noitesNoAlvo: 12 }, "caminhada").alavanca).toBe("cardio");
    expect(alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 3 }, "caminhada").alavanca).toBe("sono");
    expect(alavancaMaisFraca({ dias: 14, treinos: 0, diasCardio: 0, noitesNoAlvo: 0 }, "caminhada").alavanca).toBe("treino");
  });

  it("com a caminhada pausada, cardio vira religar", () => {
    const r = alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 0, noitesNoAlvo: 14 }, "pausada");
    expect(r.alavanca).toBe("cardio");
    expect(r.frase).toMatch(/[Rr]eligar/);
  });
});

describe("nunca sugere cortar comida (decisão dela, 2026-10-01)", () => {
  // Proíbe a AFIRMAÇÃO. Se a palavra aparecer, tem que estar negando (lição 5.2).
  const CORTE = /\b(cort|reduz|diminu|tir)\w*[^.]{0,40}(kcal|calori|comida)|comer menos|comendo menos/i;
  const NEGA = /\b(não|nunca|nem)\b/i;
  const cenarios: Veredito[] = [];
  const fracas: Adesao[] = [
    { dias: 14, treinos: 0, diasCardio: 14, noitesNoAlvo: 14 },
    { dias: 14, treinos: 10, diasCardio: 0, noitesNoAlvo: 14 },
    { dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 0 },
  ];
  for (const modo of ["caminhada", "esteira", "pausada"] as const) {
    const pr = projetar(P, 173, modo)!;
    for (const a of fracas) {
      for (const m of [em(95.6, 98.6), em(97, 99.5), em(94, 97), em(91.6, 95), em(95.8, 97.5)]) {
        cenarios.push(avaliarRitmo(pr, [partida, m], a, modo));
      }
    }
  }

  it("nenhuma frase afirma corte de comida", () => {
    for (const v of cenarios) {
      for (const frase of textos(v).split(/(?<=\.)\s/)) {
        if (CORTE.test(frase)) expect({ frase, nega: NEGA.test(frase) }).toEqual({ frase, nega: true });
      }
    }
  });

  it("a rede morde: uma frase de corte sem negação seria pega", () => {
    expect(CORTE.test("Corte 200 kcal do jantar.")).toBe(true);
    expect(NEGA.test("Corte 200 kcal do jantar.")).toBe(false);
  });
});

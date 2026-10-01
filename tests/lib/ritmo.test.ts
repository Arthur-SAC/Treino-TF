// tests/lib/ritmo.test.ts
import { describe, it, expect } from "vitest";
import { avaliarRitmo, alavancaMaisFraca, ultimaMedidaValida, type Adesao, type Veredito } from "../../src/lib/ritmo";
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

  it("cedo com a data já passada diz que já dá pra comparar (jaPode)", () => {
    expect(avaliarRitmo(PR, [partida], BOA, "caminhada", "2026-10-20"))
      .toEqual({ estado: "cedo", primeiraComparacao: "2026-10-05", jaPode: true });
    const antes = avaliarRitmo(PR, [partida], BOA, "caminhada", "2026-10-01");
    expect(antes).toEqual({ estado: "cedo", primeiraComparacao: "2026-10-05" });
    expect("jaPode" in antes).toBe(false);
  });

  it("ritmo minúsculo não vira data de décadas: passa de 3 anos, não é data", () => {
    const v = avaliarRitmo(PR, [partida, em(95.9, 98.5)], BOA, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/mais de 3 anos — não dá pra chamar de data/);
    expect(textos(v)).not.toMatch(/termina em/);
  });

  it("concordância: Últimos 14 dias", () => {
    const fraca: Adesao = { dias: 14, treinos: 4, diasCardio: 13, noitesNoAlvo: 12 };
    const v = avaliarRitmo(PR, [partida, em(95.6, 98.6)], fraca, "caminhada");
    expect(textos(v)).toMatch(/Últimos 14 dias/);
    expect(textos(v)).not.toMatch(/Últimas 14/);
  });

  it("ultimaMedidaValida ignora medida sem peso ou sem cintura e usa o maior id no mesmo dia", () => {
    const soPeso: Measurement = { id: 5, date: "2026-10-30", weightKg: 94, neckCm: 40 };
    const a = em(95, 98, 3, "2026-10-23");
    const b = em(94.5, 97.5, 4, "2026-10-23");
    expect(ultimaMedidaValida([partida, a, b, soPeso])?.id).toBe(4);
    expect(ultimaMedidaValida([soPeso])).toBeNull();
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

describe("correções da revisão", () => {
  it("abaixo com rotina cheia não culpa o treino e lista as três alavancas", () => {
    const v = avaliarRitmo(PR, [partida, em(95.6, 98.6)], BOA, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).not.toMatch(/Treino: 10 em 14/);
    expect(textos(v)).toMatch(/cumpriu/);
    expect(textos(v)).toMatch(/treino 10 de 10 · cardio 14 de 14 · sono 14 de 14 noites no horário/);
  });

  it("pausada mostra cardio pausado na linha das alavancas", () => {
    const v = avaliarRitmo(projetar(P, 173, "pausada")!, [partida, em(97, 99.5)], BOA, "pausada");
    expect(textos(v)).toMatch(/cardio pausado/);
  });

  it("cintura que subiu diz subiu, sem sinal negativo", () => {
    const v = avaliarRitmo(PR, [partida, em(97, 99.5)], BOA, "caminhada");
    expect(textos(v)).toMatch(/subiu/);
    expect(textos(v)).not.toMatch(/-\d/);
  });

  it("cintura parada diz que não desceu", () => {
    const v = avaliarRitmo(PR, [partida, em(95.6, 99)], BOA, "caminhada");
    expect(textos(v)).toMatch(/não desceu/);
  });

  it("na pausada, perder mais que a projeção lenta não é rápido demais", () => {
    const v = avaliarRitmo(projetar(P, 173, "pausada")!, [partida, em(93.5, 96)], BOA, "pausada");
    expect(v.estado).not.toBe("rapido");
  });

  it("rápido só pelo 1% do peso diz isso, sem citar teto do plano", () => {
    const largo = { ...PR, ritmoKgSemana: [0.9, 1.2] as [number, number] };
    const v = avaliarRitmo(largo, [partida, em(91.6, 95)], BOA, "caminhada");
    expect(textos(v)).toMatch(/mais de 1% do seu peso/);
    expect(textos(v)).not.toMatch(/teto de/);
  });

  it("balança que subiu com a cintura no ritmo não diz que quase parou", () => {
    const v = avaliarRitmo(PR, [partida, em(96.4, 97)], BOA, "caminhada");
    expect(v.estado).toBe("no-ritmo");
    expect(textos(v)).toMatch(/subiu um pouco/);
    expect(textos(v)).not.toMatch(/quase parou/);
  });

  it("já no peso da fase 1 com a cintura atrasada: sem mês, diz que falta a cintura", () => {
    const pesoFim = PR.pesoAlvoFase1[0];
    const v = avaliarRitmo(PR, [partida, em(pesoFim, 99, 2, "2027-09-25")], BOA, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/Você já está no peso da fase 1; falta a cintura chegar lá/);
    expect(textos(v)).not.toMatch(/termina em/);
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
  const CORTE = /\b(cort|reduz|diminu|tir)\w*(?:[^.]|(?<=\d)\.(?=\d)){0,40}(kcal|calori|comida)|comer menos|comendo menos/i;
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
    expect(CORTE.test("Reduza para 2.000 kcal por dia.")).toBe(true);
  });
});

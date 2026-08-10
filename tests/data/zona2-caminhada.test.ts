import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("zona 2 saiu dos treinos — a caminhada de 5 km já entrega", () => {
  it("nenhum template prescreve cardio-zona2", () => {
    const comZona2 = ALL_TEMPLATES
      .filter((t) => t.exercises.some((e) => e.exerciseId === "cardio-zona2"))
      .map((t) => t.id);
    expect(comZona2).toEqual([]);
  });

  it("o exercício continua no catálogo — a prescrição migrou, não sumiu", () => {
    expect(EXERCISES.find((e) => e.id === "cardio-zona2")).toBeDefined();
  });

  it("o aquecimento na esteira continua nos dias de força", () => {
    const comAquecimento = ALL_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "cardio-leve-esteira"),
    );
    expect(comAquecimento.length).toBeGreaterThan(0);
  });

  // Fix round 1: tirar a linha de cardio-zona2 sem tocar em durationMin fazia
  // a tela anunciar ~18 min a mais do que a sessão de fato leva (ponto médio
  // da faixa "15-20min" que saiu). Cada um dos 27 templates que perdeu a
  // linha teve exatamente 18 min descontados do durationMin original. Não dá
  // pra travar isso com um cálculo genérico de "duração = soma dos
  // exercícios": o catálogo mistura repsTarget por tempo ("5min", "30s") com
  // por repetição ("10", "12 cada"), sem duração por série modelada — um
  // estimador confiável exigiria modelagem nova, fora do escopo deste fix.
  // Em vez disso, o valor novo de cada template afetado fica travado aqui.
  it("os templates que perderam a zona 2 tiveram exatamente 18 min descontados do durationMin", () => {
    const NOVA_DURACAO: Record<string, number> = {
      // src/data/cycles-seed.ts
      "v-seg-gluteo-unilateral": 42,
      "v-qui-gluteo-stiff": 37,
      "v-sex-peitoral-postura": 32,
      "h-seg-gluteo-volume": 47,
      "h-qui-gluteo-posterior": 37,
      "h-sex-peitoral-postura": 37,
      "r-seg-gluteo-densidade": 32,
      "r-qui-gluteo-simetria": 32,
      "r-sex-peitoral-refinamento": 32,
      "m-seg-gluteo": 32,
      "m-qui-gluteo": 27,
      "m-sex-gluteo": 27,
      // src/data/entrada-seed.ts
      "e1-seg": 12,
      "e1-qua": 17,
      "e1-qui": 7,
      "e1-sex": 12,
      "e2-seg": 14,
      "e2-qua": 17,
      "e2-qui": 10,
      "e2-sex": 17,
      "e3-seg": 17,
      "e3-qua": 17,
      "e3-qui": 10,
      "e3-sex": 17,
      // src/data/workout-plan-seed.ts
      "seg-gluteo-mobilidade": 27,
      "qui-gluteo-coxa": 27,
      "sex-peitoral-postura": 22,
    };
    expect(Object.keys(NOVA_DURACAO)).toHaveLength(27);
    for (const [id, esperado] of Object.entries(NOVA_DURACAO)) {
      const t = ALL_TEMPLATES.find((tpl) => tpl.id === id);
      expect({ id, durationMin: t?.durationMin }).toEqual({ id, durationMin: esperado });
    }
  });

  // Guarda contra o bug original: nenhum template que ficou de fora da lista
  // acima (ou seja, nunca teve zona 2) deveria ter sido tocado no fix.
  it("templates que nunca tiveram zona 2 mantiveram durationMin intocado", () => {
    const NAO_AFETADOS: Record<string, number> = {
      "v-ter-cintura-costas": 52,
      "v-qua-mobilidade-danca": 54,
      "h-ter-cintura-costas": 35,
      "h-qua-mobilidade-danca": 54,
      "r-ter-cintura-postura": 48,
      "r-qua-mobilidade-danca": 56,
      "m-ter-superior": 45,
      "m-qua-mobilidade": 48,
      "e1-ter": 25,
      "e2-ter": 27,
      "e3-ter": 27,
      "ter-cintura-costas": 36,
      "qua-mobilidade-danca": 40,
    };
    for (const [id, esperado] of Object.entries(NAO_AFETADOS)) {
      const t = ALL_TEMPLATES.find((tpl) => tpl.id === id);
      expect({ id, durationMin: t?.durationMin }).toEqual({ id, durationMin: esperado });
    }
  });
});

import { describe, it, expect } from "vitest";
import { flexDoDia, SEQUENCIAS_FLEX, HORIZONTE_FLEX, ATE_FLEX_FASE_2, ATE_FLEX_FASE_3 } from "../../src/lib/flex-progression";

describe("progressão de flexibilidade", () => {
  it("a fase 1 é a sequência que ela já faz hoje — histórico preservado", () => {
    expect(flexDoDia("manha", 0).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("noite", 0).sequenceId).toBe("flexibilidade-intima");
  });

  it("a fase 1 dura até a prática ATE_FLEX_FASE_2", () => {
    expect(flexDoDia("manha", ATE_FLEX_FASE_2 - 1).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("manha", ATE_FLEX_FASE_2).sequenceId).not.toBe("mobilidade-pelvica-matinal");
  });

  it("manhã e noite têm trilhas próprias e nunca se cruzam", () => {
    for (let n = 0; n < 200; n += 7) {
      const doDiaManha = flexDoDia("manha", n);
      const doDiaNoite = flexDoDia("noite", n);

      // Prova que o momento decide de verdade: mesma contagem, trilhas distintas
      const indiceManha = SEQUENCIAS_FLEX.manha.indexOf(doDiaManha.sequenceId);
      const indiceNoite = SEQUENCIAS_FLEX.noite.indexOf(doDiaNoite.sequenceId);

      expect(indiceManha).toBe(indiceNoite);
      expect(doDiaManha.sequenceId).toBe(SEQUENCIAS_FLEX.manha[indiceManha]);
      expect(doDiaNoite.sequenceId).toBe(SEQUENCIAS_FLEX.noite[indiceNoite]);
      expect(doDiaManha.sequenceId).not.toBe(doDiaNoite.sequenceId);
    }
  });

  it("toda sequência de cada trilha é alcançável — nenhuma fica órfã", () => {
    for (const momento of ["manha", "noite"] as const) {
      const trilha = SEQUENCIAS_FLEX[momento];

      // Nenhuma trilha tem id duplicado
      expect(new Set(trilha).size).toBe(trilha.length);

      const vistas = new Set<string>();
      for (let n = 0; n < 400; n++) vistas.add(flexDoDia(momento, n).sequenceId);
      expect(vistas).toEqual(new Set(trilha));
    }
  });

  it("a progressão não retrocede: fase 3 nunca devolve sequência de fase 1", () => {
    for (let n = ATE_FLEX_FASE_3; n < ATE_FLEX_FASE_3 + 50; n++) {
      expect(flexDoDia("manha", n).sequenceId).not.toBe("mobilidade-pelvica-matinal");
      expect(flexDoDia("noite", n).sequenceId).not.toBe("flexibilidade-intima");
    }
  });

  it("cada fase se anuncia — exercício cego não constrói nada", () => {
    for (const momento of ["manha", "noite"] as const) {
      const etapas = [
        flexDoDia(momento, 0).etapa,
        flexDoDia(momento, ATE_FLEX_FASE_2).etapa,
        flexDoDia(momento, ATE_FLEX_FASE_3).etapa,
      ];

      // Cada etapa tem conteúdo
      for (const etapa of etapas) {
        expect(etapa.length).toBeGreaterThan(10);
      }

      // As três etapas são distintas — não repetem a mesma frase
      expect(new Set(etapas).size).toBe(3);
    }
  });

  it("entrada inválida cai na fase 1 em vez de quebrar", () => {
    for (const n of [-5, NaN, Infinity]) {
      expect(flexDoDia("manha", n as number).sequenceId).toBe("mobilidade-pelvica-matinal");
    }
  });

  it("o horizonte declara que espacate NÃO é necessário", () => {
    expect(HORIZONTE_FLEX.espacateNecessario).toBe(false);
  });

  it("o horizonte nomeia que o espacate lateral depende de anatomia, não de esforço", () => {
    expect(HORIZONTE_FLEX.espacateLateral.toLowerCase()).toMatch(/anatomia|acet[áa]bulo/);
  });
});

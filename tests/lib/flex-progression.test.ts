import { describe, it, expect } from "vitest";
import { flexDoDia, SEQUENCIAS_FLEX, HORIZONTE_FLEX, ATE_FASE_2, ATE_FASE_3 } from "../../src/lib/flex-progression";

describe("progressão de flexibilidade", () => {
  it("a fase 1 é a sequência que ela já faz hoje — histórico preservado", () => {
    expect(flexDoDia("manha", 0).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("noite", 0).sequenceId).toBe("flexibilidade-intima");
  });

  it("a fase 1 dura até a prática ATE_FASE_2", () => {
    expect(flexDoDia("manha", ATE_FASE_2 - 1).sequenceId).toBe("mobilidade-pelvica-matinal");
    expect(flexDoDia("manha", ATE_FASE_2).sequenceId).not.toBe("mobilidade-pelvica-matinal");
  });

  it("manhã e noite têm trilhas próprias e nunca se cruzam", () => {
    for (let n = 0; n < 200; n += 7) {
      const manha = flexDoDia("manha", n).sequenceId;
      const noite = flexDoDia("noite", n).sequenceId;
      expect(SEQUENCIAS_FLEX.manha).toContain(manha);
      expect(SEQUENCIAS_FLEX.noite).toContain(noite);
      expect(manha).not.toBe(noite);
    }
  });

  it("toda sequência de cada trilha é alcançável — nenhuma fica órfã", () => {
    for (const momento of ["manha", "noite"] as const) {
      const vistas = new Set<string>();
      for (let n = 0; n < 400; n++) vistas.add(flexDoDia(momento, n).sequenceId);
      expect(vistas).toEqual(new Set(SEQUENCIAS_FLEX[momento]));
    }
  });

  it("a progressão não retrocede: fase 3 nunca devolve sequência de fase 1", () => {
    for (let n = ATE_FASE_3; n < ATE_FASE_3 + 50; n++) {
      expect(flexDoDia("manha", n).sequenceId).not.toBe("mobilidade-pelvica-matinal");
      expect(flexDoDia("noite", n).sequenceId).not.toBe("flexibilidade-intima");
    }
  });

  it("cada fase se anuncia — exercício cego não constrói nada", () => {
    for (const n of [0, ATE_FASE_2, ATE_FASE_3]) {
      expect(flexDoDia("manha", n).etapa.length).toBeGreaterThan(10);
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

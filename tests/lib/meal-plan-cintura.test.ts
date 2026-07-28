import { describe, it, expect } from "vitest";
import { resolveGoal, CINTURA_LIBERA_SUPERAVIT_CM } from "../../src/lib/meal-plan";

describe("superávit condicionado à cintura", () => {
  it("o limiar é 88 cm", () => {
    expect(CINTURA_LIBERA_SUPERAVIT_CM).toBe(88);
  });

  it("na hipertrofia com cintura acima do limiar, fica em manutenção", () => {
    expect(resolveGoal("hipertrofia", 99)).toBe("manutencao");
  });

  it("na hipertrofia com cintura no limiar ou abaixo, libera superávit", () => {
    expect(resolveGoal("hipertrofia", 88)).toBe("superavit");
    expect(resolveGoal("hipertrofia", 84)).toBe("superavit");
  });

  it("sem medição registrada, fica em manutenção — o conservador é o correto", () => {
    expect(resolveGoal("hipertrofia", null)).toBe("manutencao");
  });

  it("a condição só vale pra hipertrofia; os outros ciclos não mudam", () => {
    expect(resolveGoal("entrada-1", null)).toBe("deficit");
    expect(resolveGoal("adaptacao", 99)).toBe("deficit");
    expect(resolveGoal("refinamento", 84)).toBe("manutencao");
    expect(resolveGoal("manutencao", 84)).toBe("manutencao");
  });
});

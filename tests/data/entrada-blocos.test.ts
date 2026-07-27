import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";

describe("Fase de Entrada — blocos independentes", () => {
  it("todo exercício da Entrada declara a que bloco pertence", () => {
    const semBloco = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises.filter((e) => !e.block).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(semBloco).toEqual([]);
  });

  it("toda sessão tem pelo menos um exercício de cada bloco, senão não há o que reordenar", () => {
    const incompletas = ENTRADA_TEMPLATES.filter((t) => {
      const blocos = new Set(t.exercises.map((e) => e.block));
      return !(blocos.has("maquina") && blocos.has("solo"));
    }).map((t) => t.id);
    // e1-qui e e2-qui/e3-qui são dias leves e podem ter só um bloco
    expect(incompletas.every((id) => id.endsWith("-qui"))).toBe(true);
  });
});

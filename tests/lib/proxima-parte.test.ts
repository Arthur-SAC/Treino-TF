import { describe, it, expect } from "vitest";
import { proximaParte } from "../../src/lib/proxima-parte";

describe("proximaParte", () => {
  it("entrada-1 com 3 sessões", () => {
    expect(proximaParte("entrada-1", 3, 0)).toMatchObject({ proximoId: "entrada-2", feitos: 3, threshold: 5, faltam: 2, progresso: 0.6 });
  });
  it("passou do limite", () => {
    const p = proximaParte("entrada-1", 9, 0);
    expect(p.faltam).toBe(0);
    expect(p.progresso).toBe(1);
  });
  it("manutenção não tem próxima", () => {
    const p = proximaParte("manutencao", 10, 0);
    expect(p.proximoId).toBeNull();
    expect(p.proximoNome).toBeNull();
  });
  it("desconta o início do ciclo", () => {
    expect(proximaParte("adaptacao", 12, 10).feitos).toBe(2);
  });
});

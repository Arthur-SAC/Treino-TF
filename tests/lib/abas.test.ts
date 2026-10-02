import { describe, it, expect } from "vitest";
import { abaDaRota } from "../../src/lib/abas";

describe("aba acesa pela rota", () => {
  it.each([
    ["/", "hoje"], ["/hoje/horarios", "hoje"], ["/configuracoes", "hoje"], ["/qualquer", "hoje"],
    ["/vitalidade", "vitalidade"], ["/trilha/vitalidade", "vitalidade"],
    ["/progresso", "progresso"], ["/corpo", "progresso"], ["/corpo/medidas", "progresso"],
    ["/trilha", "progresso"], ["/trilha/marcos/novo", "progresso"], ["/trilha/evolucao", "progresso"],
    ["/trilha/diario", "progresso"], ["/treino/horizontes", "progresso"], ["/treino/progressao", "progresso"],
    ["/guia", "guia"], ["/treino", "guia"], ["/treino/biblioteca", "guia"], ["/treino/movimento/x", "guia"],
    ["/beleza/estilo/pecas", "guia"], ["/trilha/alimentacao", "guia"], ["/trilha/alimentacao/domingo", "guia"],
    ["/trilha/apoio", "guia"], ["/trilha/fertilidade", "guia"], ["/trilha/direitos", "guia"], ["/refeicoes-hoje", "guia"],
  ])("%s → %s", (rota, aba) => {
    expect(abaDaRota(rota)).toBe(aba);
  });
});

import { describe, it, expect } from "vitest";
import { COMER_FORA } from "../../src/data/comer-fora-seed";
import {
  DEFICIT_SEMANAL_KCAL,
  VERBA_SEMANAL_KCAL,
  NOITES_QUE_A_VERBA_COBRE,
  CUSTO_MARGINAL_REFEICAO_FORA_KCAL,
  ritmoDaSemana,
  ritmoComNoitesFora,
} from "../../src/lib/comer-fora";
import { CONSUMO } from "../../src/lib/objetivo";

describe("a conta de comer fora", () => {
  it("a verba semanal é a diária de objetivo.ts vezes sete", () => {
    expect(VERBA_SEMANAL_KCAL).toBe(CONSUMO.discricionariaKcal * 7);
  });

  it("o déficit semanal sai do gasto real e da meta, não de número escrito à mão", () => {
    const gastoMedio = (CONSUMO.gastoEstimadoKcalMin + CONSUMO.gastoEstimadoKcalMax) / 2;
    expect(DEFICIT_SEMANAL_KCAL).toBe((gastoMedio - CONSUMO.metaKcal) * 7);
  });

  it("gastar nada mantém o ritmo cheio, e gastar mais o reduz — monotonamente", () => {
    const ritmos = [0, 1, 2, 3, 4].map((n) => ritmoComNoitesFora(n).kgPorSemana);
    expect(ritmos[0]).toBeGreaterThan(0);
    for (let i = 1; i < ritmos.length; i++) expect(ritmos[i]).toBeLessThanOrEqual(ritmos[i - 1]);
    expect(ritmoDaSemana(0).perdaDeRitmoPct).toBe(0);
  });

  // Estourar o gasto não é "engordar N kg por semana" nesta conta — é sair da
  // pergunta que ela responde. Sem o piso, uma noite muito cara devolveria
  // déficit negativo e a tela mostraria perda de peso NEGATIVA como se fosse
  // previsão de ganho, que é precisão que este modelo não tem.
  it("gasto acima do déficit satura em zero, em vez de virar número negativo", () => {
    const absurdo = ritmoDaSemana(DEFICIT_SEMANAL_KCAL * 10);
    expect(absurdo.deficitSemanalKcal).toBe(0);
    expect(absurdo.kgPorSemana).toBe(0);
    expect(absurdo.perdaDeRitmoPct).toBe(100);
  });

  it("a verba cobre pelo menos uma noite fora — senão a resposta à pergunta dela seria 'não'", () => {
    expect(NOITES_QUE_A_VERBA_COBRE).toBeGreaterThanOrEqual(1);
    expect(NOITES_QUE_A_VERBA_COBRE).toBe(
      Math.floor(VERBA_SEMANAL_KCAL / CUSTO_MARGINAL_REFEICAO_FORA_KCAL),
    );
  });
});

describe("o guia narra os números do módulo, não números inventados", () => {
  const texto = JSON.stringify(COMER_FORA);

  it("cita a verba semanal e o déficit semanal calculados", () => {
    expect(texto).toContain(String(VERBA_SEMANAL_KCAL));
    expect(texto).toContain(String(DEFICIT_SEMANAL_KCAL));
  });

  it("cita o ritmo de cada cenário vindo do módulo", () => {
    for (const n of [0, 1, 2, 3]) {
      expect(texto).toContain(String(ritmoComNoitesFora(n).kgPorSemana));
    }
  });

  // A frente 1 arrancou do app a meia-verdade confortável. "Você tem 250 kcal
  // livres" seria uma nova: o cardápio já usa a meta inteira, então a verba sai
  // do déficit. O guia tem que dizer o preço na mesma seção em que oferece a
  // verba — não numa seção adiante que ela pode não abrir.
  it("a seção que oferece a verba é a mesma que diz o preço dela", () => {
    const secao = JSON.stringify(COMER_FORA.find((s) => s.id === "a-verba"));
    expect(secao.toLowerCase()).toMatch(/não é de graça|sai direto do déficit/);
    expect(secao.toLowerCase()).toMatch(/mais devagar/);
  });

  it("não trata comer fora como recaída — o plano atrasa, não quebra", () => {
    expect(texto.toLowerCase()).toMatch(/anda mais devagar|não quebra/);
    expect(texto.toLowerCase()).not.toMatch(/culpa|pecado|proibid|deslize|furar a dieta/);
  });

  // Ela não bebe (dito por ela em 2026-09-08). Ressalva sobre coisa que não
  // acontece é ruído, e ruído é o que faz a tela deixar de ser lida.
  it("não gasta linha com álcool, que não é o caso dela", () => {
    expect(texto.toLowerCase()).not.toMatch(/álcool|alcool|cerveja|bebida alcoólica|drink/);
  });
});

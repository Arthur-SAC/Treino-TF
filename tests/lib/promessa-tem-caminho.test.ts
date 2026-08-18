import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";
import { buildDayRoutine } from "../../src/lib/today-routine";

// Dois defeitos que ela relatou em 2026-08-17, ambos da mesma família: o app
// PROMETE uma coisa e não oferece o caminho para cumpri-la. É a mesma falha que
// esta reforma persegue desde o começo, agora na agenda em vez de no dado.
describe("o que o app promete, ele oferece", () => {
  // 1. O vacuum dizia "faça quase todo dia" e aparecia num dia por ciclo de
  //    treino. A sessão de academia não cresce (restrição antiga do programa),
  //    então o caminho diário tem que existir FORA dela — e mora no alongamento
  //    da manhã, que ela já faz todo dia.
  it("o vacuum está em TODA fase do alongamento da manhã, não só na primeira", () => {
    const semVacuum = SEQUENCIAS_FLEX.manha.filter((id) => {
      const seq = SEQUENCES.find((s) => s.id === id);
      return !seq?.moves.some((m) => /vacuum/i.test(m.name));
    });
    expect(semVacuum).toEqual([]);
  });

  // Sem esta, a de cima passaria com o vacuum só na fase 1 se a trilha
  // encolhesse — e o vacuum sumiria da vida dela na quarta semana, calado.
  it("a trilha da manhã tem mais de uma fase, e todas contam", () => {
    expect(SEQUENCIAS_FLEX.manha.length).toBeGreaterThanOrEqual(3);
  });

  it("o texto do vacuum promete frequência diária — e agora é verdade", () => {
    const vacuum = EXERCISES.find((e) => e.id === "vacuum-abdominal")!;
    expect(`${vacuum.description} ${(vacuum.proTips ?? []).join(" ")}`).toMatch(/todo dia/i);
  });

  // 2. O item do assoalho caía às 10h, no expediente — inclusive nos dias em
  //    que a sequência do dia é deitada no chão, e as deitadas são justamente
  //    as PRIMEIRAS da progressão. O app já sabia ("Deitada, precisa de chão")
  //    e agendava assim mesmo.
  // Compara o bloco em que o item de fato ESTÁ (bloco.id), não o campo
  // `item.block` que ele carrega. Provado por mutação: devolver o assoalho ao
  // array do expediente não mexe no campo do objeto, então a versão que lia
  // `item.block` passava verde com o defeito de volta.
  it("o assoalho não fica no bloco do expediente, em nenhum dia da semana", () => {
    const errados: string[] = [];
    for (let d = 0; d < 7; d++) {
      for (const bloco of buildDayRoutine(d, 100).blocks) {
        if (bloco.id !== "trabalho") continue;
        if (bloco.items.some((i) => i.id === "assoalho-pelvico")) errados.push(`dia ${d}`);
      }
    }
    expect(errados).toEqual([]);
  });

  it("mas ele continua existindo nos sete dias — o que constrói é frequência", () => {
    const faltando: number[] = [];
    for (let d = 0; d < 7; d++) {
      const tem = buildDayRoutine(d, 100).blocks.some((b) =>
        b.items.some((i) => i.id === "assoalho-pelvico"),
      );
      if (!tem) faltando.push(d);
    }
    expect(faltando).toEqual([]);
  });

  // Uma ida ao chão em vez de duas: as duas coisas pedem o mesmo chão e o
  // mesmo momento de privacidade, e separá-las por horas dobraria o custo de
  // começar — que é a parte cara.
  it("o assoalho cai logo antes do alongamento da noite", () => {
    const itens = buildDayRoutine(3, 100).blocks.flatMap((b) => b.items);
    const iAssoalho = itens.findIndex((i) => i.id === "assoalho-pelvico");
    const iAlongamento = itens.findIndex((i) => i.id === "alongamento-noite");
    expect(iAssoalho).toBeGreaterThanOrEqual(0);
    expect(iAlongamento).toBe(iAssoalho + 1);
  });
});

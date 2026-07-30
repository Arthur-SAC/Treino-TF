import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";

// A usuária reportou: "o cardio de início não está escrito tipo inclinação,
// velocidade nem tempo, só tem lá cardio leve. Poderia deixar como o cardio
// do final que tem tudo isso."
//
// Os três itens de cardio (aquecimento na esteira, bike reclinada e zona 2)
// precisam trazer os MESMOS parâmetros acionáveis: quanto tempo, em que
// intensidade, e como saber que está no ritmo certo. Sem isso o item é um
// nome solto e ela tem que adivinhar.

const CARDIO_IDS = ["cardio-leve-esteira", "bike-reclinada", "cardio-zona2"];
const cardio = CARDIO_IDS.map((id) => {
  const ex = EXERCISES.find((e) => e.id === id);
  if (!ex) throw new Error(`exercício de cardio ausente do catálogo: ${id}`);
  return ex;
});

/** Todo o texto acionável do exercício, junto. */
const textoDe = (ex: (typeof cardio)[number]) =>
  [ex.name, ex.description, ex.successCue ?? "", ...(ex.proTips ?? []), ex.easierVariation ?? "", ex.harderVariation ?? ""].join(" | ");

describe("cardio: os três itens dizem tempo e intensidade", () => {
  it("todos dizem quantos minutos", () => {
    const sem = cardio.filter((ex) => !/\d+\s*(a\s*\d+\s*)?min/i.test(textoDe(ex))).map((e) => e.id);
    expect(sem).toEqual([]);
  });

  it("todos dizem em que intensidade — inclinação, velocidade ou resistência com número", () => {
    // esteira: inclinação em % e km/h · bike: nível/resistência com número
    const temIntensidade = (t: string) =>
      /\d+\s*-\s*\d+\s*%/.test(t) || /\d+[,.]?\d*\s*-\s*\d+[,.]?\d*\s*km\/h/i.test(t) || /(n[íi]vel|resist[êe]ncia)[^.]*\d/i.test(t);
    const sem = cardio.filter((ex) => !temIntensidade(textoDe(ex))).map((e) => e.id);
    expect(sem).toEqual([]);
  });

  it("todos trazem o teste da conversa, que é como ela sabe o ritmo sem medidor", () => {
    const sem = cardio.filter((ex) => !/conversa|convers(ar|ando)|falar|frase/i.test(textoDe(ex))).map((e) => e.id);
    expect(sem).toEqual([]);
  });

  it("todos têm successCue — a sensação-alvo ao terminar", () => {
    const sem = cardio.filter((ex) => !ex.successCue).map((e) => e.id);
    expect(sem).toEqual([]);
  });
});

describe("cardio: aquecimento e zona 2 não se confundem", () => {
  it("o aquecimento diz que é leve e curto, não 15-20 min", () => {
    for (const id of ["cardio-leve-esteira", "bike-reclinada"]) {
      const ex = cardio.find((e) => e.id === id)!;
      expect({ id, temCincoMin: /5\s*min/i.test(textoDe(ex)) }).toEqual({ id, temCincoMin: true });
    }
  });

  it("a zona 2 diz que vai no FIM do treino", () => {
    const z2 = cardio.find((e) => e.id === "cardio-zona2")!;
    expect(textoDe(z2).toLowerCase()).toMatch(/fim do treino/);
  });

  it("o aquecimento não carrega mais o explicador inteiro da zona 2 — ela virou item próprio", () => {
    // O bloco antigo em cardio-leve-esteira repetia toda a prescrição da zona 2
    // nas proTips. Agora que cardio-zona2 existe como item da sessão, isso é
    // ruído: a usuária lê a receita do fim do treino no lugar do aquecimento.
    const aquecimento = cardio.find((e) => e.id === "cardio-leve-esteira")!;
    const tips = (aquecimento.proTips ?? []).join(" ");
    expect(tips).not.toMatch(/15-20 min cont[íi]nuos/i);
  });
});

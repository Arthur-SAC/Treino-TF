import { describe, it, expect } from "vitest";
import { itensDeAquecimento, textoDeAquecimento } from "../../src/lib/session-warmup";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

// A usuária abriu o treino de quinta (dia leve, que começa com mobilidade
// articular) e o card "Antes de começar" dizia "bike ou esteira leve e
// mobilidade, conforme o dia". Ela procurou a esteira e não achou — porque
// aquele dia não tem. O texto era fixo e prometia o que a sessão não tinha.
//
// Agora ele é derivado da sessão real.

const nomeDe = (id: string) => EXERCISES.find((e) => e.id === id)?.name;
const porId = (id: string) =>
  [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN].find((t) => t.id === id)!;

describe("itensDeAquecimento", () => {
  // Decisão da usuária (2026-07-30): ela quer a ESTEIRA como aquecimento.
  // O item aceita as duas máquinas — a esteira é a prescrição, a bike é a
  // alternativa se estiver ocupada.
  it("na segunda da Entrada, o aquecimento é na esteira", () => {
    const nomes = itensDeAquecimento(porId("e1-seg").exercises, nomeDe);
    expect(nomes).toEqual(["Aquecimento · esteira ou bike (5 min)"]);
  });

  it("nenhum template da Entrada prescreve a bike como aquecimento", () => {
    const comBike = ENTRADA_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.block === "aquecimento" && e.exerciseId === "bike-reclinada"),
    ).map((t) => t.id);
    expect(comBike).toEqual([]);
  });

  it("na quinta (dia leve), o aquecimento é mobilidade — sem bike nem esteira", () => {
    const nomes = itensDeAquecimento(porId("e1-qui").exercises, nomeDe);
    expect(nomes.join(" ")).not.toMatch(/bike|esteira/i);
    expect(nomes.length).toBeGreaterThan(0);
  });

  it("pega só o trecho INICIAL de aquecimento, não o cardio do fim", () => {
    // e1-qui termina com cardio-zona2; ele não pode entrar como aquecimento
    const nomes = itensDeAquecimento(porId("e1-qui").exercises, nomeDe);
    expect(nomes.join(" ")).not.toMatch(/zona 2/i);
  });

  it("nos templates antigos (sem campo block) também funciona", () => {
    const nomes = itensDeAquecimento(porId("seg-gluteo-mobilidade").exercises, nomeDe);
    expect(nomes.length).toBeGreaterThan(0);
    expect(nomes.join(" ")).toMatch(/aquecimento|esteira|bike/i);
  });

  it("todo template do app tem pelo menos um item de aquecimento identificável", () => {
    const sem = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN]
      .filter((t) => itensDeAquecimento(t.exercises, nomeDe).length === 0)
      .map((t) => t.id);
    expect(sem).toEqual([]);
  });
});

describe("textoDeAquecimento", () => {
  it("nomeia os itens reais em vez de prometer bike ou esteira", () => {
    const texto = textoDeAquecimento(porId("e1-qui").exercises, nomeDe);
    expect(texto).toMatch(/Aquecimento articular geral/);
    expect(texto).not.toMatch(/bike|esteira/i);
  });

  // Decisão da usuária (2026-07-30): "por que não tem o aquecimento de cardio
  // todos os dias?". Passou a ter nas quartas também. Nas quintas continua sem,
  // porque lá o cardio É a sessão (20 min) e os primeiros minutos dele são o
  // aquecimento — esteira antes da esteira é redundante. A nota do exercício
  // explica isso na tela, em vez de deixar o buraco sem razão aparente.
  it("de segunda a sexta, todo dia com trabalho de força começa na esteira", () => {
    const DIAS_DE_FORCA = ["seg", "ter", "qua", "sex"];
    for (const semana of ["1", "2", "3"]) {
      for (const dia of DIAS_DE_FORCA) {
        const id = `e${semana}-${dia}`;
        const nomes = itensDeAquecimento(porId(id).exercises, nomeDe);
        expect({ id, comecaNaEsteira: /esteira/i.test(nomes[0] ?? "") }).toEqual({ id, comecaNaEsteira: true });
      }
    }
  });

  it("na quinta o cardio final explica que ele mesmo é o aquecimento", () => {
    for (const semana of ["1", "2", "3"]) {
      const t = porId(`e${semana}-qui`);
      const z2 = t.exercises.find((e) => e.exerciseId === "cardio-zona2")!;
      expect({ semana, explica: /aquecimento/i.test(z2.notes ?? "") }).toEqual({ semana, explica: true });
    }
  });

  // Este é o teste que trava o defeito original: se o texto fala de bike ou
  // esteira, o AQUECIMENTO da sessão tem que ser de fato um item de máquina
  // de cardio. Não basta a sessão ter cardio em algum lugar — o do fim não
  // conta, foi justamente por isso que ela procurou a esteira e não achou.
  const IDS_DE_CARDIO_INICIAL = ["bike-reclinada", "cardio-leve-esteira"];

  it("só fala de bike ou esteira quando o aquecimento é de fato numa delas", () => {
    for (const t of [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN]) {
      const texto = textoDeAquecimento(t.exercises, nomeDe);
      if (!/bike|esteira/i.test(texto)) continue;
      const aquecimentoTemCardio = t.exercises
        .slice(0, itensDeAquecimento(t.exercises, nomeDe).length)
        .some((e) => IDS_DE_CARDIO_INICIAL.includes(e.exerciseId));
      expect({ id: t.id, aquecimentoTemCardio }).toEqual({ id: t.id, aquecimentoTemCardio: true });
    }
  });

  // Só as quintas ficam sem máquina no aquecimento (o cardio do fim é o
  // próprio aquecimento). As quartas passaram a ter esteira em 2026-07-30.
  it("nas quintas da Entrada, o texto não promete máquina de cardio", () => {
    for (const id of ["e1-qui", "e2-qui", "e3-qui"]) {
      const texto = textoDeAquecimento(porId(id).exercises, nomeDe);
      expect({ id, prometeMaquina: /bike|esteira/i.test(texto) }).toEqual({ id, prometeMaquina: false });
    }
  });

  it("é uma frase, não uma lista vazia ou um texto truncado", () => {
    const texto = textoDeAquecimento(porId("e1-qua").exercises, nomeDe);
    expect(texto.length).toBeGreaterThan(20);
    expect(texto.trim()).toMatch(/\.$/);
  });
});

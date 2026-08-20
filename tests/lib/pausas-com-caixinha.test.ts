import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const HORARIOS = ["07:00", "08:30", "10:00", "11:30", "13:00", "14:30"];

// Pedido dela (2026-08-19): caixinha em cada horário, não um item só com a
// lista de horários dentro. A versão anterior mostrava seis horários numa
// linha e uma caixinha só — que marcava "as pausas" em bloco. Marcar uma de
// cada vez é o que deixa ela ver, no meio do dia, quais já foram.
describe("uma caixinha por micro-pausa", () => {
  const itensDe = (dow: number, horarios = HORARIOS) =>
    buildDayRoutine(dow, 100, horarios)
      .blocks.flatMap((b) => b.items)
      .filter((i) => i.id.startsWith("micro-pausa"));

  it("gera um item por horário do expediente", () => {
    const itens = itensDe(3);
    expect(itens).toHaveLength(HORARIOS.length);
  });

  it("cada item carrega o próprio horário", () => {
    expect(itensDe(3).map((i) => i.defaultTime)).toEqual(HORARIOS);
  });

  it("cada item tem id próprio — é o que dá caixinha separada a cada um", () => {
    const ids = itensDe(3).map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // O modal mostra os movimentos da pausa nº n (rodízio do catálogo). Sem o
  // índice, toda pausa do dia abriria os mesmos três movimentos.
  it("cada item sabe qual pausa do dia ele é", () => {
    expect(itensDe(3).map((i) => i.breakIndex)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("acompanha o intervalo que ela escolher", () => {
    expect(itensDe(3, ["07:00", "10:00", "13:00"])).toHaveLength(3);
  });

  // Fim de semana não tem expediente — e não pode ficar com seis caixinhas
  // pedindo pausa de trabalho.
  it("não aparece no sábado nem no domingo", () => {
    expect(itensDe(6)).toEqual([]);
    expect(itensDe(0)).toEqual([]);
  });

  // Sem horários (configuração ainda não carregada), a rotina não pode quebrar
  // nem mostrar caixinha sem hora.
  it("sem horários, nenhuma caixinha de pausa aparece", () => {
    expect(itensDe(3, [])).toEqual([]);
  });
});

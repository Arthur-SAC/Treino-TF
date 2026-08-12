import { describe, it, expect } from "vitest";
import {
  SEQUENCIAS_REBOLADO,
  reboladoDoDia,
  ATE_REBOLADO_FASE_2,
  ATE_REBOLADO_FASE_3,
  ATE_REBOLADO_FASE_4,
  ALVO_REAL_MIN,
} from "../../src/lib/rebolado-progression";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A queixa dela não é de técnica, é de fôlego: ela desiste antes da noiva, e
// isso é condicionamento de lombar, flexor de quadril e glúteo. O que existia
// era um bloco de 3×1 min dentro da dança, que ensina o movimento e não
// constrói resistência pra 20 min contínuos.
describe("progressão de resistência do rebolado", () => {
  it("tem quatro fases, todas existindo no seed", () => {
    expect(SEQUENCIAS_REBOLADO).toHaveLength(4);
    const faltando = SEQUENCIAS_REBOLADO.filter((id) => !SEQUENCES.some((s) => s.id === id));
    expect(faltando).toEqual([]);
  });

  it("os cortes de fase são crescentes", () => {
    expect(ATE_REBOLADO_FASE_2).toBeLessThan(ATE_REBOLADO_FASE_3);
    expect(ATE_REBOLADO_FASE_3).toBeLessThan(ATE_REBOLADO_FASE_4);
  });

  it("a fase avança conforme as práticas concluídas", () => {
    expect(reboladoDoDia(0).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_2 - 1).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_2).sequenceId).toBe(SEQUENCIAS_REBOLADO[1]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_3).sequenceId).toBe(SEQUENCIAS_REBOLADO[2]);
    expect(reboladoDoDia(ATE_REBOLADO_FASE_4).sequenceId).toBe(SEQUENCIAS_REBOLADO[3]);
    expect(reboladoDoDia(9999).sequenceId).toBe(SEQUENCIAS_REBOLADO[3]);
  });

  it("o alvo de minutos contínuos cresce a cada fase", () => {
    const alvos = [0, ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4].map(
      (n) => reboladoDoDia(n).alvoMin,
    );
    expect(alvos).toEqual([...alvos].sort((a, b) => a - b));
    expect(new Set(alvos).size).toBe(4);
  });

  it("entrada inválida cai na fase 1 em vez de quebrar", () => {
    for (const n of [-5, Number.NaN, 0]) {
      expect(reboladoDoDia(n).sequenceId).toBe(SEQUENCIAS_REBOLADO[0]);
    }
  });

  it("toda fase diz em que etapa ela está", () => {
    for (const n of [0, ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4]) {
      expect(reboladoDoDia(n).etapa.trim().length).toBeGreaterThan(0);
    }
  });

  // O alvo real não é a fase 4: é aguentar o tempo que a coisa dura de verdade.
  //
  // O dado é um PONTO e o texto cita uma FAIXA — mesmo padrão de `objetivo.ts`
  // (whrProvavel é ponto, a tela cita faixa, e um teste amarra os dois).
  // Incerteza é honesta na prosa; a invariante precisa de número exato pra
  // comparar. O que este teste garante é que o ponto caia dentro da faixa
  // citada: se um dos dois mudar sem o outro, a trilha passa a construir para
  // um número que o conteúdo não pede mais.
  it("o alvo real cai dentro da faixa de tempo que o grinding declara", () => {
    const grinding = SEQUENCES.find((s) => s.id === "intimidade-grinding")!;
    const faixa = grinding.focus.match(/(\d+)\s*(?:a|-|–)\s*(\d+)\s*minutos/i);
    expect(faixa).not.toBeNull();
    const [min, max] = [Number(faixa![1]), Number(faixa![2])];
    expect({ min, max, alvo: ALVO_REAL_MIN, dentro: ALVO_REAL_MIN >= min && ALVO_REAL_MIN <= max })
      .toEqual({ min, max, alvo: ALVO_REAL_MIN, dentro: true });
  });
});

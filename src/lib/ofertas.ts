// src/lib/ofertas.ts
// "Pronta pra próxima": quando um critério bate, o app OFERECE e ela aceita ou
// adia ("Agora não", 7 dias). Módulo puro — sem db, sem Date interno (só o parse
// das datas ISO recebidas). Quem grava as aceitações e recusas é a tela.
import type { CycleId } from "../data/cycles-seed";
import type { CycleAdvice } from "./cycle-advisor";
import { DESBLOQUEIOS, type DesbloqueioId, type Desbloqueados } from "./desbloqueios";
import { SEQUENCES } from "../data/sequences-seed";
import { ATE_FLEX_FASE_2, ATE_FLEX_FASE_3, SEQUENCIAS_FLEX } from "./flex-progression";
import { ATE_FASE_3, ATE_ROTACAO, SESSOES_DE_SOLTURA, SEQUENCIA_DE_SOLTURA, ROTACAO } from "./pelvic-progression";
import { ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4, SEQUENCIAS_REBOLADO } from "./rebolado-progression";
import { ATE_GINGADO, SEQUENCIAS_POSTURA } from "./postura-progression";

export const ESPERA_RECUSA_DIAS = 7;

export type Trilha = "flexManha" | "flexNoite" | "pelvica" | "rebolado" | "postura";
/** Trilha -> a MAIOR fase que ela aceitou (1-based). */
export type FasesAceitas = Record<Trilha, number>;

export const FASES_ACEITAS_PADRAO: FasesAceitas = { flexManha: 1, flexNoite: 1, pelvica: 1, rebolado: 1, postura: 1 };

export type Oferta =
  | { tipo: "ciclo"; id: string; para: CycleId; titulo: string; praQue: string }
  | { tipo: "desbloqueio"; id: DesbloqueioId; titulo: string; entra: string; praQue: string; minutos: number; horario: string | null; rodizio?: string }
  | { tipo: "fase"; id: string; trilha: Trilha; fase: number; titulo: string; praQue: string; minutos: number };

export interface EntradaOfertas {
  hoje: string;
  ciclo: CycleAdvice | null;
  sequencia: number;
  ja: Desbloqueados;
  recusadas: Record<string, string>;
  contagens: Record<Trilha, number>;
  fasesAceitas: FasesAceitas;
}

// Cada ATE_* é a contagem de práticas EM QUE a fase seguinte começa (nos
// módulos de trilha: `n < ATE_X` => fase anterior). Então o início da fase N+1
// é INICIOS[trilha][N-1], e enquanto a fase N+1 não é aceita a contagem vale no
// máximo INICIO - 1. Assoalho: a fase 2 começa em ATE_SOLTURA (não exportado),
// que é ATE_FASE_3 - SESSOES_DE_SOLTURA.
const INICIOS: Record<Trilha, readonly number[]> = {
  flexManha: [ATE_FLEX_FASE_2, ATE_FLEX_FASE_3],
  flexNoite: [ATE_FLEX_FASE_2, ATE_FLEX_FASE_3],
  pelvica: [ATE_FASE_3 - SESSOES_DE_SOLTURA, ATE_FASE_3, ATE_ROTACAO],
  rebolado: [ATE_REBOLADO_FASE_2, ATE_REBOLADO_FASE_3, ATE_REBOLADO_FASE_4],
  postura: [ATE_GINGADO],
};

const SEQ_DA_FASE: Record<Trilha, readonly string[]> = {
  flexManha: SEQUENCIAS_FLEX.manha,
  flexNoite: SEQUENCIAS_FLEX.noite,
  pelvica: ["pelvic-identificacao", SEQUENCIA_DE_SOLTURA, "pelvic-kegel-classico", ROTACAO[0]],
  rebolado: SEQUENCIAS_REBOLADO,
  postura: [SEQUENCIAS_POSTURA[0], SEQUENCIAS_POSTURA[2]],
};

const NOME_DA_TRILHA: Record<Trilha, string> = {
  flexManha: "Alongamento da manhã",
  flexNoite: "Alongamento da noite",
  pelvica: "Assoalho pélvico",
  rebolado: "Dança e rebolado",
  postura: "Postura",
};

const PRA_QUE_FASE: Record<Trilha, string> = {
  flexManha: "Você já fez prática suficiente: é a hora de o alcance crescer.",
  flexNoite: "Você já fez prática suficiente: é a hora de o alcance crescer.",
  pelvica: "A fase atual já está assentada; a próxima aumenta o controle.",
  rebolado: "O fôlego da fase atual já está construído; a próxima pede mais tempo contínuo.",
  postura: "O andar e o 8 já assentaram; agora entra o gingado.",
};

const ORDEM_TRILHAS: readonly Trilha[] = ["flexManha", "flexNoite", "pelvica", "rebolado", "postura"];

/** Corta a contagem em `inícioDaPróximaFase - 1` enquanto a próxima fase não
 *  foi aceita. Fase aceita libera a contagem até o corte seguinte. */
export function contagemLiberada(trilha: Trilha, praticas: number, aceitas: FasesAceitas): number {
  const proximo = INICIOS[trilha][aceitas[trilha] - 1];
  if (proximo === undefined) return praticas;
  return Math.min(praticas, proximo - 1);
}

function dia(iso: string): number {
  return Date.parse(iso.slice(0, 10));
}

function esperando(id: string, e: EntradaOfertas): boolean {
  const r = e.recusadas[id];
  if (!r) return false;
  return dia(e.hoje) < dia(r) + ESPERA_RECUSA_DIAS * 86_400_000;
}

/** Partes de um mesmo assunto: dentro delas a ordem nunca pula. */
function parteDe(id: DesbloqueioId): string {
  return id.replace(/-\d+$/, "");
}

function duracao(seqId: string): number {
  return SEQUENCES.find((s) => s.id === seqId)?.durationMin ?? 5;
}

/** A próxima oferta, ou null. Ordem: ciclo, desbloqueio por patamar, fase. */
export function ofertaDaVez(e: EntradaOfertas): Oferta | null {
  if (e.ciclo?.recommend === true) {
    const id = `ciclo:${e.ciclo.toCycle}`;
    if (!esperando(id, e)) {
      return {
        tipo: "ciclo", id, para: e.ciclo.toCycle,
        titulo: "Próximo ciclo do treino", praQue: e.ciclo.reason,
      };
    }
  }

  const abertos = (id: string) => Object.prototype.hasOwnProperty.call(e.ja, id);
  const bloqueadas = new Set<string>(); // partes com um anterior ainda fechado
  for (const d of DESBLOQUEIOS) {
    if (d.id === "alongamento-noite" || abertos(d.id)) continue;
    const parte = parteDe(d.id);
    if (bloqueadas.has(parte)) continue; // o anterior da parte está fechado: ele vem antes
    bloqueadas.add(parte);
    if (d.patamar > e.sequencia || esperando(d.id, e)) continue;
    return {
      tipo: "desbloqueio", id: d.id, titulo: d.titulo, entra: d.entra,
      praQue: d.praQue, minutos: d.minutos, horario: d.horario,
    };
  }

  for (const trilha of ORDEM_TRILHAS) {
    const aceita = e.fasesAceitas[trilha];
    const inicio = INICIOS[trilha][aceita - 1];
    if (inicio === undefined || e.contagens[trilha] < inicio) continue;
    const fase = aceita + 1;
    const id = `fase:${trilha}-${fase}`;
    if (esperando(id, e)) continue;
    return {
      tipo: "fase", id, trilha, fase,
      titulo: `${NOME_DA_TRILHA[trilha]}: fase ${fase}`,
      praQue: PRA_QUE_FASE[trilha],
      minutos: duracao(SEQ_DA_FASE[trilha][fase - 1]),
    };
  }
  return null;
}

/** Backup: por id, vale a recusa mais recente. */
export function unirRecusadas(a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): Record<string, string> {
  const r: Record<string, string> = { ...a };
  for (const [id, data] of Object.entries(b)) {
    if (!(id in r) || data > r[id]) r[id] = data;
  }
  return r;
}

/** Backup: por trilha, vale a maior fase aceita. */
export function unirFasesAceitas(a: Readonly<FasesAceitas>, b: Readonly<FasesAceitas>): FasesAceitas {
  const r = { ...FASES_ACEITAS_PADRAO };
  for (const t of ORDEM_TRILHAS) r[t] = Math.max(a[t] ?? 1, b[t] ?? 1);
  return r;
}

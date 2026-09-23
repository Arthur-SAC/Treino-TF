import type { Measurement } from "./db";
import { estimateBodyFatNavy } from "./body-composition";
import {
  RECOMECO_DATA, PCT_GORDURA_FIM_FASE1, CONSUMO, FIM_FASE2_MESES,
  DISTRIBUICAO_GORDURA_ATUAL, FASES, MARCOS_CINTURA,
} from "./objetivo";
import { KCAL_POR_KG_GORDURA } from "./comer-fora";

// A partida é a primeira medição dela a partir do recomeço (23/09/2026) — não
// um número escrito no código. Ela começou do zero sem ter como medir no dia;
// o app espera a medição e calcula tudo dela. Módulo puro: quem lê o banco é
// usePartida.

export interface Partida {
  data: string;
  pesoKg: number;
  cinturaCm: number;
  pescocoCm: number;
  quadrilCm?: number;
}

export interface Projecao {
  partida: Partida;
  gorduraPct: number;
  massaMagraKg: number;
  /** kg, arredondado: [mais leve, mais pesado]. */
  pesoAlvoFase1: [number, number];
  /** kg por semana no déficit declarado: [gasto baixo, gasto alto]. */
  ritmoKgSemana: [number, number];
  /** "YYYY-MM": [mais cedo, mais tarde]. */
  fimFase1: [string, string];
  /** "ja" quando a partida já está na trava de 88 ou abaixo dela. */
  cintura88: [string, string] | "ja";
  fimFase2: [string, string];
}

const CINTURA_FIM_FASE1 = FASES.find((f) => f.id === "fase-1")!.cinturaCm;
const CINTURA_TRAVA = MARCOS_CINTURA[0].cinturaCm; // 88 — a trava do superávit
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Medições desde o recomeço com os três campos da conta, em ordem: data, e
 *  no mesmo dia o menor id. */
function candidatas(ms: readonly Measurement[], recomeco: string): Partida[] {
  return ms
    .filter((x) => x.date >= recomeco && !!x.weightKg && !!x.waistCm && !!x.neckCm)
    .sort((a, b) => (a.date === b.date ? (a.id ?? 0) - (b.id ?? 0) : a.date < b.date ? -1 : 1))
    .map((p) => ({
      data: p.date,
      pesoKg: p.weightKg!,
      cinturaCm: p.waistCm!,
      pescocoCm: p.neckCm!,
      ...(p.hipCm ? { quadrilCm: p.hipCm } : {}),
    }));
}

export function escolherPartida(ms: readonly Measurement[], recomeco: string = RECOMECO_DATA): Partida | null {
  return candidatas(ms, recomeco)[0] ?? null;
}

/** A partida que o app usa: a primeira medição que FECHA A CONTA — cintura
 *  maior que o pescoço, %G positiva e peso-alvo abaixo do próprio peso. Um
 *  erro de digitação no celular (cintura e pescoço trocados, uma vírgula fora
 *  do lugar) não pode virar a partida pra sempre: o app pula a medição e usa a
 *  próxima. `invalida` = existe medição desde o recomeço, mas nenhuma fecha a
 *  conta — o card pede pra conferir, em vez de pedir pra medir de novo. */
export function partidaPlausivel(
  ms: readonly Measurement[],
  alturaCm: number,
  recomeco: string = RECOMECO_DATA,
): { resultado: Projecao | null; invalida: boolean } {
  const cs = candidatas(ms, recomeco);
  for (const c of cs) {
    if (c.cinturaCm <= c.pescocoCm) continue;
    const pr = projetar(c, alturaCm);
    if (pr && pr.gorduraPct > 0 && pr.pesoAlvoFase1[1] < c.pesoKg) return { resultado: pr, invalida: false };
  }
  return { resultado: null, invalida: cs.length > 0 };
}

/** "YYYY-MM-DD" + semanas → "YYYY-MM". Conta em UTC puro, sem fuso local. */
function somaSemanas(data: string, semanas: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.round(semanas * 7));
  return d.toISOString().slice(0, 7);
}

function somaMeses(data: string, meses: number): string {
  const [a, m] = data.split("-").map(Number);
  const total = a * 12 + (m - 1) + meses;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export function mesAno(yyyyMm: string): string {
  const [a, m] = yyyyMm.split("-").map(Number);
  return `${MESES[m - 1]}/${a}`;
}

export function projetar(p: Partida, alturaCm: number): Projecao | null {
  const pct = estimateBodyFatNavy({
    heightCm: alturaCm,
    neckCm: p.pescocoCm,
    waistCm: p.cinturaCm,
    hipCm: p.quadrilCm,
    distribuicao: DISTRIBUICAO_GORDURA_ATUAL,
  });
  if (pct === null) return null;
  const magra = p.pesoKg * (1 - pct / 100);
  const alvo: [number, number] = [
    Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[0])),
    Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[1])),
  ];
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const ritmo: [number, number] = [
    r2(((CONSUMO.gastoEstimadoKcalMin - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
    r2(((CONSUMO.gastoEstimadoKcalMax - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
  ];
  // Mais cedo: menos quilos a perder no ritmo mais rápido. Mais tarde: o contrário.
  const semCedo = Math.max(0, p.pesoKg - alvo[1]) / ritmo[1];
  const semTarde = Math.max(0, p.pesoKg - alvo[0]) / ritmo[0];
  // Heurística declarada: a cintura cai em proporção ao caminho da fase 1.
  // Não é fisiologia exata — é a régua que o app usa pra dar um mês, e a
  // medição mensal corrige.
  const fracao88 = (p.cinturaCm - CINTURA_TRAVA) / (p.cinturaCm - CINTURA_FIM_FASE1);
  const cintura88: Projecao["cintura88"] =
    p.cinturaCm <= CINTURA_TRAVA || !(fracao88 > 0)
      ? "ja"
      : [somaSemanas(p.data, semCedo * fracao88), somaSemanas(p.data, semTarde * fracao88)];
  return {
    partida: p,
    gorduraPct: pct,
    massaMagraKg: Math.round(magra * 10) / 10,
    pesoAlvoFase1: alvo,
    ritmoKgSemana: ritmo,
    fimFase1: [somaSemanas(p.data, semCedo), somaSemanas(p.data, semTarde)],
    cintura88,
    fimFase2: [somaMeses(p.data, FIM_FASE2_MESES[0]), somaMeses(p.data, FIM_FASE2_MESES[1])],
  };
}

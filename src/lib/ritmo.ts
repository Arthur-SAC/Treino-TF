// src/lib/ritmo.ts
// Ela está no ritmo da fase 1? Módulo puro — sem db, sem Date do relógio.
//
// Existe porque o app mandava fazer e guardava o que ela registrava, mas não
// fechava a conta: a projeção já sabia o ritmo esperado e as medidas estavam no
// banco, e nada comparava um com o outro (conversa de 2026-10-01).
//
// Duas regras dela moram aqui. A CINTURA decide, não a balança: quando o treino
// começa a construir músculo, o peso empaca e a cintura continua descendo — e
// isso é a fase 1 dando certo. E abaixo do ritmo o app NUNCA sugere cortar
// comida: as kcal da meta são moderadas de propósito, pra não derrubar a
// testosterona de que firmeza, libido e força dependem. Sobram adesão e prazo.

import type { Measurement } from "./db";
import { mesAno, somaSemanas, type Projecao } from "./partida";
import { CONSUMO, FASES, KCAL_CAMINHADA_DIA, type ModoCaminhada } from "./objetivo";
import { somarDiasISO } from "./today-date";

/** Antes disso a fita e a balança oscilam mais do que ela perde. */
export const DIAS_PARA_COMPARAR = 10;
/** Cintura a 75% do esperado ainda conta como no ritmo — fita tem erro de
 *  meio centímetro, e duas semanas de dado não aguentam régua mais fina. */
const TOLERANCIA_CINTURA = 0.75;
/** Acima de 1,3× o teto do plano, ou de 1% do peso por semana, sai músculo
 *  junto — e o músculo é o que faz o glúteo da fase 2. */
const FATOR_RAPIDO = 1.3;
const TETO_FRACAO_PESO_SEMANA = 0.01;

const CINTURA_FIM_FASE1 = FASES.find((f) => f.id === "fase-1")!.cinturaCm;

export interface Adesao {
  /** Tamanho da janela, em dias. */
  dias: number;
  treinos: number;
  diasCardio: number;
  noitesNoAlvo: number;
}

export type Alavanca = "treino" | "cardio" | "sono";

export type Veredito =
  | { estado: "sem-partida" }
  | { estado: "cedo"; primeiraComparacao: string }
  | {
      estado: "rapido" | "no-ritmo" | "abaixo";
      kgSemana: number;
      cmSemana: number;
      titulo: string;
      texto: string[];
    };

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function frase(a: Adesao, modo: ModoCaminhada, alavanca: Alavanca): string {
  const planoTreinos = Math.round((5 * a.dias) / 7);
  if (alavanca === "treino") {
    return `Treino: ${a.treinos} em ${a.dias} dias, de ${planoTreinos} do plano. É o músculo que segura o gasto enquanto o peso cai.`;
  }
  if (alavanca === "cardio") {
    return modo === "pausada"
      ? `Cardio: a caminhada está pausada. Religar a caminhada ou a esteira devolve uns ${KCAL_CAMINHADA_DIA} kcal por dia — a maior alavanca que existe sem mexer na comida.`
      : `Cardio: ${a.diasCardio} de ${a.dias} dias com caminhada ou esteira. Cada dia que falta são uns ${KCAL_CAMINHADA_DIA} kcal a menos no déficit.`;
  }
  return `Sono: ${a.noitesNoAlvo} de ${a.dias} noites no horário. Sono curto sobe o cortisol e guarda gordura justamente na barriga.`;
}

/** A alavanca com a menor fração do esperado. Empate fica com a ordem treino →
 *  cardio → sono, que é a ordem de peso delas na fase 1. Exportada porque a
 *  revisão de domingo usa a MESMA regra — regra de negócio num lugar só. */
export function alavancaMaisFraca(a: Adesao, modo: ModoCaminhada): { alavanca: Alavanca; fracao: number; frase: string } {
  const dias = Math.max(1, a.dias);
  const fracoes: [Alavanca, number][] = [
    ["treino", a.treinos / ((5 * dias) / 7)],
    ["cardio", modo === "pausada" ? 0 : a.diasCardio / dias],
    ["sono", a.noitesNoAlvo / dias],
  ];
  const [alavanca, fracao] = fracoes.reduce((min, x) => (x[1] < min[1] ? x : min));
  return { alavanca, fracao, frase: frase(a, modo, alavanca) };
}

/** A última medida com peso E cintura; no mesmo dia, a de maior id (a correção
 *  que ela digitou por último). */
function ultimaValida(medidas: readonly Measurement[], desde: string): Measurement | null {
  const ok = medidas
    .filter((m) => m.date >= desde && !!m.weightKg && !!m.waistCm)
    .sort((a, b) => (a.date === b.date ? (a.id ?? 0) - (b.id ?? 0) : a.date < b.date ? -1 : 1));
  return ok.at(-1) ?? null;
}

function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

export function avaliarRitmo(
  projecao: Projecao | null,
  medidas: readonly Measurement[],
  adesao: Adesao,
  modo: ModoCaminhada,
): Veredito {
  if (!projecao) return { estado: "sem-partida" };
  const p = projecao.partida;
  const primeiraComparacao = somarDiasISO(p.data, DIAS_PARA_COMPARAR);
  const u = ultimaValida(medidas, primeiraComparacao);
  if (!u) return { estado: "cedo", primeiraComparacao };

  const semanas = diasEntre(p.data, u.date) / 7;
  const kgSemana = r2((p.pesoKg - u.weightKg!) / semanas);
  const cmSemana = r2((p.cinturaCm - u.waistCm!) / semanas);
  const [rMin, rMax] = projecao.ritmoKgSemana;
  const base = { kgSemana, cmSemana };

  if (kgSemana > rMax * FATOR_RAPIDO || kgSemana > u.weightKg! * TETO_FRACAO_PESO_SEMANA) {
    return {
      estado: "rapido",
      ...base,
      titulo: "Rápido demais",
      texto: [
        `Você está perdendo ${num(kgSemana)} kg por semana, acima do teto de ${num(rMax)} do plano. Nessa velocidade sai músculo junto com a gordura, e é o músculo que faz o glúteo.`,
        "Coma mais: +40 g de arroz (cru) e +1 ovo no lanche das 15h30, uns 200 kcal. Mede de novo em 14 dias.",
      ],
    };
  }

  // A cintura esperada cai em proporção ao caminho do peso — a mesma
  // heurística declarada em `projetar`. Na ponta lenta do ritmo, pra cobrar o
  // mínimo e não o ideal.
  const semanasAteFim = Math.max(0, p.pesoKg - projecao.pesoAlvoFase1[0]) / rMin;
  const cmEsperado = semanasAteFim > 0 ? Math.max(0, p.cinturaCm - CINTURA_FIM_FASE1) / semanasAteFim : 0;

  if (cmSemana >= cmEsperado * TOLERANCIA_CINTURA) {
    const balancaParada = kgSemana < rMin * TOLERANCIA_CINTURA;
    return {
      estado: "no-ritmo",
      ...base,
      titulo: "No ritmo",
      texto: balancaParada
        ? ["A cintura está descendo no ritmo e a balança quase parou. É músculo entrando enquanto a gordura sai — exatamente o que a fase 1 quer.", "Continua igual."]
        : ["Peso e cintura descendo no ritmo do plano.", "Continua igual."],
    };
  }

  const fraca = alavancaMaisFraca(adesao, modo);
  const restante = Math.max(0, u.weightKg! - projecao.pesoAlvoFase1[0]);
  const prazo =
    kgSemana > 0
      ? `Nesse ritmo, a fase 1 termina em ${mesAno(somaSemanas(u.date, restante / kgSemana))}. A projeção dizia até ${mesAno(projecao.fimFase1[1])}.`
      : "Nesse ritmo a balança não desce, e a fase 1 não tem data.";
  return {
    estado: "abaixo",
    ...base,
    titulo: "Abaixo do ritmo",
    texto: [
      `A cintura desce ${num(cmSemana)} cm por semana; o plano espera pelo menos ${num(r2(cmEsperado))}.`,
      fraca.frase,
      prazo,
      `A comida fica como está: as ${CONSUMO.metaKcal.toLocaleString("pt-BR")} kcal protegem testosterona e músculo, e o ajuste vem da rotina.`,
    ],
  };
}

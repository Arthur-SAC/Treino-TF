// src/lib/objetivo.ts
// Fonte única dos números do objetivo. Módulo puro — sem I/O, sem Date.
//
// Antes deste módulo, cada número de objetivo era prosa dentro de um seed. Foi
// exatamente essa dispersão que permitiu o app se contradizer: a Silhueta
// prometia um superávit que o plano alimentar negava. Toda tela que AFIRMA algo
// sobre o objetivo lê daqui.

/** A medição real de 13/05/2026 — o ponto de partida de tudo. */
export const MEDIDAS_PARTIDA = {
  data: "2026-05-13",
  alturaM: 1.73,
  pesoKg: 96,
  pescocoCm: 40,
  ombrosCm: 120.5,
  bustoCm: 106.5,
  cinturaCm: 99,
  quadrilCm: 114,
  coxaCm: 82.5,
  bracoCm: 34,
} as const;

/** Como a gordura dela se distribui hoje — e, por consequência, qual régua de
 *  %BF diz a verdade sobre este corpo (ver `estimateBodyFatNavy`).
 *
 *  Mora aqui, e não na tela, porque é afirmação sobre o corpo dela, do mesmo
 *  tipo que as medidas acima: a Silhueta, os marcos e os horizontes já dizem em
 *  prosa que a gordura é androide, e a conta precisa dizer o mesmo.
 *
 *  A condição que troca este valor é única: se um dia entrar estrogênio e a
 *  gordura migrar para quadril e coxa, "ginoide" passa a ser a régua correta —
 *  e mudar esta linha basta para o app inteiro acompanhar. */
export const DISTRIBUICAO_GORDURA_ATUAL = "androide" as const;

const arredonda2 = (n: number) => Math.round(n * 100) / 100;

/** Cintura ÷ quadril. Abaixo de ~0,85 é faixa feminina. */
export function razaoCinturaQuadril(cinturaCm: number, quadrilCm: number): number {
  return arredonda2(cinturaCm / quadrilCm);
}

/** Ombro ÷ quadril. Homem cis típico fica entre 1,15 e 1,25 — ela está em 1,06,
 *  que já é faixa feminina. É por isso que o ombro nunca foi o gargalo. */
export function razaoOmbroQuadril(ombrosCm: number, quadrilCm: number): number {
  return arredonda2(ombrosCm / quadrilCm);
}

export interface FaseObjetivo {
  id: "fase-1" | "fase-2";
  nome: string;
  resumo: string;
  mesInicio: number;
  mesFim: number;
  pesoKgMin: number;
  pesoKgMax: number;
  /** Alvo de medida de execução excelente. Quando dividido pelo quadril, produz whrExcelente
   *  (ou whrProvavel se whrExcelente não existe). A razão provável será pior porque erra
   *  um pouco nas duas pontas. */
  cinturaCm: number;
  /** Alvo de medida de execução excelente. Ver comentário de cinturaCm. */
  quadrilCm: number;
  /** Resultado provável com execução normal.
   *  Ponto, não faixa: a invariante testada (razaoCinturaQuadril bater com whrExcelente)
   *  precisa de um número exato para comparar. Telas de texto que citam este valor devem
   *  citar uma FAIXA ao redor dele (incerteza é honesta), com um teste garantindo que o
   *  ponto caia dentro da faixa citada — senão texto e dado derivam em silêncio. */
  whrProvavel: number;
  /** Resultado de execução muito boa. Mesma regra de whrProvavel: ponto aqui, faixa no texto,
   *  teste amarrando os dois. */
  whrExcelente?: number;
}

export const FASES: readonly FaseObjetivo[] = [
  {
    id: "fase-1",
    nome: "Tirar a barriga",
    resumo:
      "A cintura é o problema inteiro: hoje ela é o ponto mais largo do tronco. Enquanto for, não existe silhueta possível.",
    mesInicio: 0,
    mesFim: 8,
    pesoKgMin: 80,
    pesoKgMax: 82,
    cinturaCm: 84,
    // O quadril também cai — tem gordura nele. Isso é esperado, não perda.
    quadrilCm: 106,
    whrProvavel: 0.79,
  },
  {
    id: "fase-2",
    nome: "Construir glúteo",
    resumo:
      "A balança sobe de propósito. O quadril volta ao mesmo 114 de hoje, feito de músculo — mesmo número, corpo irreconhecível. Compare por foto, não por fita.",
    mesInicio: 8,
    mesFim: 30,
    pesoKgMin: 85,
    pesoKgMax: 88,
    cinturaCm: 83,
    quadrilCm: 114,
    whrProvavel: 0.77,
    whrExcelente: 0.73,
  },
] as const;

/** Piso de cintura. Busto 106,5 significa caixa torácica larga, e costela não
 *  encolhe: abaixo disso não existe, por mais déficit que se faça. */
export const CINTURA_PISO_CM = 80;

const FASE_2 = FASES.find((f) => f.id === "fase-2")!;

/** Ombro projetado ao fim da fase 1: cai para perto de 114 cm junto com a
 *  gordura que sai da cintura e do quadril, porque a circunferência do ombro
 *  também carrega gordura (ver o comentário de `shoulderHipGap` em
 *  silhouette.ts). Não é medida que o treino persegue — ninguém treina ombro
 *  pra chegar nela, ela é consequência do mesmo déficit que tira a barriga. */
const PROJECAO_OMBRO_FASE1_CM = 114;

/** Ombro÷quadril projetado para o fim da fase 2: ombro já reduzido da fase 1
 *  (114) sobre o quadril reconstruído da fase 2 (114) ⇒ ~1,00. É PROJEÇÃO, não
 *  meta cobrável — ela já está em faixa feminina hoje (1,06); este número só
 *  descreve pra onde a razão tende sozinha, sem nenhum treino de ombro. Antes
 *  este 1,00 vivia solto em settings-helpers.ts, sem fonte nem teste; a tela
 *  o rotulava "alvo", o que reintroduzia em texto a dívida de quadril que esta
 *  branch removeu em número (ver `shoulderHipGap`). */
export const PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2 = razaoOmbroQuadril(
  PROJECAO_OMBRO_FASE1_CM,
  FASE_2.quadrilCm,
);

export const CONSUMO = {
  /** Mifflin-St Jeor + 5 km a pé por dia + 1h de cães + força 4-5x/semana. */
  gastoEstimadoKcalMin: 2900,
  gastoEstimadoKcalMax: 3100,
  metaKcal: 2300,
  /** Piso, não faixa fechada: em déficit, exceder proteína protege músculo —
   *  não é erro nutricional entregar mais que proteinaGMax. proteinaGMax
   *  existe só como referência de "alvo confortável", nunca como teto a não
   *  ultrapassar. Por isso o plano de déficit (meal-plan-seed.ts) testa
   *  proteína contra este mínimo, não contra um intervalo — ver
   *  tests/data/meal-plan-coerencia.test.ts. */
  proteinaGMin: 150,
  proteinaGMax: 160,
  /** Verba de besteira, declarada e sem culpa. Não é indulgência: os dois pontos
   *  de falha dela (16h e o jantar) são déficit agudo depois de esforço, que é
   *  fisiologia funcionando certo. Plano que finge que besteira não acontece
   *  quebra na primeira semana e leva o resto junto. */
  discricionariaKcal: 250,
} as const;

export interface MarcoCintura {
  cinturaCm: number;
  mesMin: number;
  mesMax: number;
  titulo: string;
  porQue: string;
}

export const MARCOS_CINTURA: readonly MarcoCintura[] = [
  {
    cinturaCm: 88,
    mesMin: 3,
    mesMax: 4,
    titulo: "Cintura 88 — destrava o superávit",
    porQue:
      "É a trava de CINTURA_LIBERA_SUPERAVIT_CM em meal-plan.ts. Abaixo dela, superávit vira glúteo; acima, vira barriga.",
  },
  {
    cinturaCm: 84,
    mesMin: 6,
    mesMax: 8,
    titulo: "Cintura 84 — a silhueta vira",
    porQue:
      "Fim da fase 1. Não é o fim do caminho: é o ponto em que roupa justa passa a fazer o que você quer.",
  },
] as const;

import { db } from "./db";
import { FASES, PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2 } from "./objetivo";

// Ambas as metas abaixo derivam de objetivo.ts — a fonte única dos números do
// objetivo. Redigitá-las aqui foi o que deixou os dois valores fora da malha
// de teste que amarra o resto do app: mudar a fase 2 em objetivo.ts não movia
// nada aqui, e as telas continuavam citando um número que já tinha ficado
// pra trás.
const FASE_2 = FASES.find((f) => f.id === "fase-2")!;

export interface Settings {
  onboarded: boolean;
  seeded: boolean;
  beautySeeded: boolean;
  styleSeeded: boolean;
  pathSeeded: boolean;
  movementSeeded: boolean;
  movementVersion: number;
  makeupSeeded: boolean;
  voiceSeeded: boolean;
  morningReminderTime: string; // "HH:MM"
  eveningReminderTime: string;
  workoutReminderTime: string;
  activeBreakIntervalMin: number;
  activeBreakStartHour: number; // 0-23
  activeBreakEndHour: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
  quietHours: { from: string; to: string };
  /** Ajustes de horário da rotina: id do item -> "HH:MM". Vazio = usa os padrões. */
  routineTimes: Record<string, string>;
  focusModeUntil: number | null; // timestamp ms
  notificationsEnabled: boolean;
  lastActiveBreakAt: number;
  lastHydrationAt: number;
  lastSkincareMorningAt: string; // "yyyy-mm-dd" or ""
  lastSkincareEveningAt: string;
  mealPlanVersion: number;
  activeCycle: "entrada-1" | "entrada-2" | "entrada-3" | "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
  cycleStartSessionCount: number;
  cyclesSeeded: boolean;
  entradaMigration: number;
  walkGoalMin: number;
  presencaReminderTime: string;
  lastPresencaReminderAt: string;
  heightCm: number; // altura em cm; 0 = não informada
  targetWhr: number; // meta cintura/quadril
  targetShoulderHipRatio: number; // meta ombro/quadril
  voicePitchTargetLowHz: number;
  voicePitchTargetHighHz: number;
  /** Dia em que ela ADERIU ao protocolo de Vitalidade, "yyyy-mm-dd". Vazio =
   *  ainda não aderiu. É o marco zero do streak de dias sem gasto automático
   *  — ver `vitalidade-adesao.ts` para o porquê de não ser derivado do
   *  `dailyLog`. */
  vitalidadeDesde: string;
}

// Exportado: é a ÚNICA cópia de padrões que deve existir no app. Um segundo
// objeto de defaults (que existiu em useSetting.ts até o fix round 3 da
// Task 7) diverge em silêncio — walkGoalMin ficou em 75 lá enquanto subiu
// pra 120 aqui, e ninguém percebeu porque nada comparava as duas cópias.
export const DEFAULTS: Settings = {
  onboarded: false,
  seeded: false,
  beautySeeded: false,
  styleSeeded: false,
  pathSeeded: false,
  movementSeeded: false,
  movementVersion: 1,
  makeupSeeded: false,
  voiceSeeded: false,
  morningReminderTime: "08:00",
  eveningReminderTime: "22:00",
  workoutReminderTime: "18:00",
  activeBreakIntervalMin: 90,
  activeBreakStartHour: 9,
  activeBreakEndHour: 18,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 2000,
  quietHours: { from: "22:00", to: "08:00" },
  routineTimes: {},
  focusModeUntil: null,
  notificationsEnabled: true,
  lastActiveBreakAt: 0,
  lastHydrationAt: 0,
  lastSkincareMorningAt: "",
  lastSkincareEveningAt: "",
  mealPlanVersion: 1,
  activeCycle: "entrada-1",
  cycleStartSessionCount: 0,
  cyclesSeeded: false,
  entradaMigration: 0,
  // 60 min da caminhada do trabalho para casa + 60 do passeio com os cães é
  // a rotina real de dia útil (ver `caminhada-trabalho` e `caes` em
  // today-routine.ts) — os dois têm `control: "walk"` e cada um credita 60
  // min fixos via `creditarPasseio`. A meta existe pra avisar quando um dos
  // dois NÃO aconteceu; se ficasse em 75, batia sozinha antes de ela chegar
  // em casa e o medidor "X / Y min" parava de informar qualquer coisa. No
  // fim de semana só há o passeio, então o medidor mostra 60/120 — verdade,
  // não falha: o fim de semana é mesmo mais parado.
  walkGoalMin: 120,
  presencaReminderTime: "21:00",
  lastPresencaReminderAt: "",
  heightCm: 0,
  // whrExcelente da fase 2 (execução muito boa) — ver o comentário acima do
  // import.
  targetWhr: FASE_2.whrExcelente!,
  // Projeção de ombro÷quadril ao fim da fase 2, não meta cobrável — ver
  // PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2 em objetivo.ts.
  targetShoulderHipRatio: PROJECAO_RAZAO_OMBRO_QUADRIL_FASE2,
  voicePitchTargetLowHz: 165,
  voicePitchTargetHighHz: 220,
  // Vazio de propósito: enquanto ela não abrir a Vitalidade, não existe
  // acompanhamento nenhum — e um padrão com data faria o app contar dias que
  // ninguém acompanhou.
  vitalidadeDesde: "",
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.settings.get(key);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

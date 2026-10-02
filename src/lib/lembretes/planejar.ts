// Os lembretes do APK (spec 2026-09-24-apk-android). Puro: recebe o relógio,
// a configuração e um retrato do estado, e devolve tudo o que deve tocar de
// agora até JANELA_DIAS dias. Quem lê o Dexie é estado.ts; quem fala com o
// Android é agendar.ts. Toda a regra mora aqui, e só aqui.
import { isWithinQuietHours } from "../notifications";
import { hojeISO } from "../today-date";
import { backupVencido } from "../backup-lembrete";

export interface Lembrete { id: number; quando: Date; titulo: string; corpo: string; rota: string }

export interface ConfigLembretes {
  notificationsEnabled: boolean;
  quietHours: { from: string; to: string };
  focusModeUntil: number | null;
  alongamentoManhaTime: string;
  alongamentoNoiteTime: string;
  workoutReminderTime: string;
  dormirReminderTime: string;
  vitaminaDTime: string;
  activeBreakStartHour: number;
  activeBreakEndHour: number;
  activeBreakIntervalMin: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
}

export interface EstadoLembretes {
  feitosHoje: ReadonlySet<string>;
  aguaHojeMl: number;
  treinouHoje: boolean;
  treinoPorDia: ReadonlyMap<number, string>;
  ultimaMedida: string | null;
  vitaminaDFeitaEm: readonly string[];
  /** Data (ISO) do último backup exportado; "" = nunca. */
  ultimoBackupEm: string;
}

export const JANELA_DIAS = 14;

// Um dígito por tipo, no começo do id: tipo · yyMMdd · sequência (2 dígitos).
// 9 26 09 24 99 = 926092499 < 2^31. Mesmo tipo, dia e sequência dão o mesmo
// id, então reagendar não duplica.
const TIPO = { alongManha: 1, alongNoite: 2, agua: 3, pausa: 4, treino: 5, dormir: 6, medir: 7, vitD: 8, backup: 9 } as const;

function idDe(tipo: number, dia: Date, seq: number): number {
  const yy = dia.getFullYear() % 100;
  return Number(`${tipo}${String(yy).padStart(2, "0")}${String(dia.getMonth() + 1).padStart(2, "0")}${String(dia.getDate()).padStart(2, "0")}${String(seq).padStart(2, "0")}`);
}

function naHora(dia: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m);
}

function minutosNaHora(dia: Date, minutos: number): Date {
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Math.floor(minutos / 60), minutos % 60);
}

function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return hojeISO(new Date(a, m - 1, d + n));
}

export function planejar(agora: Date, cfg: ConfigLembretes, estado: EstadoLembretes): Lembrete[] {
  if (!cfg.notificationsEnabled) return [];
  const hoje = hojeISO(agora);
  const limite = agora.getTime() + JANELA_DIAS * 86400000;
  const saida: Lembrete[] = [];
  const add = (tipo: number, dia: Date, seq: number, quando: Date, titulo: string, corpo: string, rota = "/") =>
    saida.push({ id: idDe(tipo, dia, seq), quando, titulo, corpo, rota });

  const medirDesde = estado.ultimaMedida ? somarDias(estado.ultimaMedida, 14) : somarDias(hoje, 0);

  for (let i = 0; i <= JANELA_DIAS; i++) {
    const dia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    const iso = hojeISO(dia);
    const ehHoje = iso === hoje;
    const dow = dia.getDay();
    const util = dow >= 1 && dow <= 5;

    if (!(ehHoje && estado.feitosHoje.has("alongamento-manha")))
      add(TIPO.alongManha, dia, 0, naHora(dia, cfg.alongamentoManhaTime), "Alongamento", "5 min de manhã");

    if (util) {
      // Campo apagado em Configurações grava 0: `m += 0` travava o app. Menos
      // de 30 min também não: vira barulho e estoura a sequência do id.
      const passoAgua = Math.max(30, cfg.hydrationIntervalMin || 60);
      const passoPausa = Math.max(30, cfg.activeBreakIntervalMin || 90);
      const ini = cfg.activeBreakStartHour * 60;
      const fim = cfg.activeBreakEndHour * 60;
      const bateuAgua = ehHoje && estado.aguaHojeMl >= cfg.hydrationGoalMl;
      if (!bateuAgua) {
        let seq = 0;
        for (let m = ini + passoAgua; m < fim; m += passoAgua) {
          const corpo = ehHoje ? `${estado.aguaHojeMl} de ${cfg.hydrationGoalMl} ml` : "Um copo agora";
          add(TIPO.agua, dia, seq++, minutosNaHora(dia, m), "Água", corpo);
        }
      }
      let seq = 0;
      for (let m = ini + passoPausa; m < fim; m += passoPausa) {
        add(TIPO.pausa, dia, seq++, minutosNaHora(dia, m), "Levanta um pouco", "2 min de quadril");
      }
    }

    const treino = estado.treinoPorDia.get(dow);
    if (treino && !(ehHoje && estado.treinouHoje))
      add(TIPO.treino, dia, 0, naHora(dia, cfg.workoutReminderTime), "Treino", treino);

    if (!(ehHoje && estado.feitosHoje.has("alongamento-noite")))
      add(TIPO.alongNoite, dia, 0, naHora(dia, cfg.alongamentoNoiteTime), "Alongamento", "Antes de deitar");

    add(TIPO.dormir, dia, 0, naHora(dia, cfg.dormirReminderTime), "Hora de desligar", "Tela longe, deitar às 22h30");

    if (iso >= medirDesde && estado.ultimaMedida !== iso)
      add(TIPO.medir, dia, 0, naHora(dia, "06:05"), "Medidas", "Em jejum, antes do café", "/corpo/medidas");

    if (dow === 0) {
      const segunda = somarDias(iso, -6);
      const tomou = estado.vitaminaDFeitaEm.some((d) => d >= segunda && d <= iso);
      if (!tomou) add(TIPO.vitD, dia, 0, naHora(dia, cfg.vitaminaDTime), "Vitamina D", "Com uma refeição com gordura");
    }

    // Backup: no dia em que vence e nos seguintes, até ela exportar.
    if (backupVencido(estado.ultimoBackupEm, iso))
      add(TIPO.backup, dia, 0, naHora(dia, "12:05"), "Backup", "Seus dados só existem no celular", "/configuracoes");
  }

  return saida
    .filter((l) => l.quando.getTime() > agora.getTime() && l.quando.getTime() <= limite)
    .filter((l) => !isWithinQuietHours(l.quando, cfg.quietHours.from, cfg.quietHours.to))
    .filter((l) => !(cfg.focusModeUntil && l.quando.getTime() < cfg.focusModeUntil))
    .sort((a, b) => a.quando.getTime() - b.quando.getTime() || a.id - b.id);
}

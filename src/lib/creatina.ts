import type { RoutineCheck } from "./db";

// Creatina 3 g/dia entrou em 2026-09-23 (spec Chun-Li macia): mais força e
// mais músculo pra quem está começando. O custo é 1-2 kg de ÁGUA dentro do
// músculo nas primeiras semanas — e ela mede a balança. Sem o aviso, o
// primeiro número depois de começar parece fracasso da dieta.
export const CREATINA_ITEM_ID = "creatina";
export const DIAS_AVISO_AGUA = 14;
export const SUBTITULO_AVISO_AGUA =
  "Primeiras 2 semanas: a balança sobe 1–2 kg de água dentro do músculo. Não é gordura.";

export function primeiraMarcacao(checks: readonly RoutineCheck[]): string | null {
  const datas = checks.filter((c) => c.itemId === CREATINA_ITEM_ID && c.done).map((c) => c.date).sort();
  return datas[0] ?? null;
}

export function mostrarAvisoAgua(primeira: string | null, hoje: string): boolean {
  if (primeira === null) return true;
  const dias = Math.round((Date.parse(hoje) - Date.parse(primeira)) / 86_400_000);
  return dias < DIAS_AVISO_AGUA;
}

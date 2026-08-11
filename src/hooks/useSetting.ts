import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { DEFAULTS, type Settings } from "../lib/settings-helpers";

// Os padrões vêm de settings-helpers.ts — este hook não tem (e não deve
// voltar a ter) a própria cópia. Até o fix round 3 da Task 7 ele tinha: as
// duas cópias divergiram em silêncio (walkGoalMin ficou em 75 aqui enquanto
// settings-helpers.ts já tinha subido pra 120), e como a tela Hoje lê pelo
// caminho SÍNCRONO deste hook — não pelo `getSetting` assíncrono —, o valor
// velho continuou na tela mesmo depois do fix "corrigido". Uma única fonte
// de verdade fecha essa classe de bug.
export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const row = useLiveQuery(() => db.settings.get(key), [key]);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

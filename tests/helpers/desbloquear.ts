// Testes que olham mecânicas trancáveis do Hoje (postura, voz, alongamento da
// noite...) gravam tudo desbloqueado: o que eles testam é a mecânica, não o
// nível. O nível tem os próprios testes (tests/pages/hoje-niveis.test.tsx).
// Desde a spec 2026-11-19 a fase de cada trilha também só sobe quando ela
// aceita: "tudo desbloqueado" inclui todas as fases aceitas, pra a contagem de
// práticas mover a fase como antes (as ofertas têm os próprios testes).
import { DESBLOQUEIOS } from "../../src/lib/desbloqueios";
import { setSetting } from "../../src/lib/settings-helpers";

export async function desbloquearTudo(): Promise<void> {
  await setSetting("desbloqueios", Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, "2026-01-01"])));
  await setSetting("fasesAceitas", { flexManha: 3, flexNoite: 3, pelvica: 4, rebolado: 4, postura: 2 });
}

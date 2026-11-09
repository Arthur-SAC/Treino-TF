// Testes que olham mecânicas trancáveis do Hoje (postura, voz, alongamento da
// noite...) gravam tudo desbloqueado: o que eles testam é a mecânica, não o
// nível. O nível tem os próprios testes (tests/pages/hoje-niveis.test.tsx).
import { DESBLOQUEIOS } from "../../src/lib/desbloqueios";
import { setSetting } from "../../src/lib/settings-helpers";

export async function desbloquearTudo(): Promise<void> {
  await setSetting("desbloqueios", Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, "2026-01-01"])));
}

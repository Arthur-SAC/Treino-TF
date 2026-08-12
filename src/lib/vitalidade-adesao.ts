// O marco zero do streak de Vitalidade: o dia em que ela ADERIU ao protocolo.
//
// A primeira versão derivava esse marco do dia mais antigo do `dailyLog`, e
// isso mentia por construção: o `dailyLog` existe desde maio e ganha uma linha
// TODO DIA por água, caminhada, cães e sono. No primeiro uso da tela o app
// mostraria "Vitalidade · 79" e "Recorde 79" — justamente o período em que,
// pelo relato dela, havia consumo. Inventar um recorde que ela não fez é o
// oposto do que o módulo do streak existe pra fazer, e o dano dobrava: a
// primeira marcação honesta derrubava 79 → 0 contra um recorde fantasma
// inatingível, transformando a mitigação de vergonha no amplificador dela.
//
// Regra: o acompanhamento começa quando ela abre a página, nunca antes. Sem
// data gravada, quem calcula usa HOJE — nenhum caminho produz streak
// retroativo.
import { db } from "./db";
import { DEFAULTS } from "./settings-helpers";

const CHAVE = "vitalidadeDesde" as const;

/** Dia de adesão ao protocolo, ou `null` se ela ainda não aderiu. */
export async function inicioDoAcompanhamento(): Promise<string | null> {
  const row = await db.settings.get(CHAVE);
  const valor = (row?.value as string | undefined) ?? DEFAULTS[CHAVE];
  return valor === "" ? null : valor;
}

/** Grava o dia de adesão na primeira abertura da página Vitalidade e devolve
 *  o marco em vigor. Idempotente e nunca sobrescreve: se já existe data, uma
 *  segunda visita não pode reiniciar o streak dela. Lê e escreve na mesma
 *  transação porque a página monta e roda o efeito mais de uma vez em
 *  desenvolvimento (StrictMode) — duas escritas em paralelo aqui gravariam
 *  duas datas diferentes na virada da meia-noite. */
export async function garantirInicioDoAcompanhamento(hoje: string): Promise<string> {
  return db.transaction("rw", db.settings, async () => {
    const row = await db.settings.get(CHAVE);
    const atual = (row?.value as string | undefined) ?? "";
    if (atual !== "") return atual;
    await db.settings.put({ key: CHAVE, value: hoje });
    return hoje;
  });
}

/** Formato fixo de explicação de exercício/movimento. Existe porque texto livre
 *  ficava vago e ela tinha que pesquisar cada termo fora do app. */
export interface Execucao {
  posicao: string; // uma linha
  movimento: string[]; // 2 a 4 passos
  ondeSentir: string;
  erradoSe: string[]; // ≥ 1, cada um "sinal → correção"
  renderMais: string[]; // 1 a 2
  regulagem?: string; // obrigatório quando o equipment tem maquina-*, leg-press ou polia
}

/** Termos técnicos que só podem aparecer com a tradução na mesma oração
 *  ("— ...", "(...)" ou ":"). Exigimos a tradução em vez de proibir a palavra
 *  (lição 5.2). Os padrões aceitam plural, "do/de/dos" e ç/c, ão/ões, porque
 *  a mesma ideia escrita de outro jeito não pode escapar da checagem. */
export const TERMOS_QUE_PEDEM_TRADUCAO: readonly RegExp[] = [
  /rota[çc](?:ão|ao|ões|oes) intern[ao]s?/gi,
  /rota[çc](?:ão|ao|ões|oes) extern[ao]s?/gi,
  /transvers[ao]s?/gi,
  /flex(?:ão|ao|ões|oes) d[eo]s? quadr(?:il|is)/gi,
  /exten(?:são|sao|sões|soes) d[eo]s? quadr(?:il|is)/gi,
  /isometrias?/gi,
  /esc[aá]pulas?/gi,
  /retrovers(?:ão|ao|ões|oes)/gi,
  /antevers(?:ão|ao|ões|oes)/gi,
  /90\/90/gi,
  /dorsiflex(?:ão|ao|ões|oes)/gi,
  /assoalho p[eé]lvico/gi,
  /cadeias? posterior(?:es)?/gi,
];

function pedeRegulagem(equipment: readonly string[]): boolean {
  return equipment.some(
    (e) => e.startsWith("maquina-") || e.startsWith("leg-press") || e.startsWith("polia"),
  );
}

/** A tradução vale em qualquer ponto da mesma oração depois do termo: até o
 *  próximo ponto final, ";", "!", "?" ou quebra de linha. */
function termosSemTraducao(textoBruto: string): string[] {
  // NFC: um "ç" ou "ã" decomposto (NFD) não casaria com os padrões.
  const texto = textoBruto.normalize("NFC");
  const achados: string[] = [];
  for (const base of TERMOS_QUE_PEDEM_TRADUCAO) {
    // Recria o regex: os globais guardam lastIndex entre chamadas.
    const re = new RegExp(base.source, base.flags.includes("g") ? base.flags : base.flags + "g");
    for (const m of texto.matchAll(re)) {
      const resto = texto.slice(m.index + m[0].length);
      const oracao = resto.split(/[.;!?\n]/)[0];
      if (!/[—(:]/.test(oracao)) achados.push(m[0]);
    }
  }
  return achados;
}

/** Devolve a lista de problemas; [] = ok. Pura. */
export function problemasDaExecucao(e: Execucao, equipment: readonly string[] = []): string[] {
  const p: string[] = [];
  if (!e.posicao.trim()) p.push("posição vazia");
  const vazio = (l: string[]) => l.some((x) => !x.trim());
  if (vazio(e.movimento)) p.push("movimento tem passo vazio");
  if (vazio(e.erradoSe)) p.push("erradoSe tem item vazio");
  if (vazio(e.renderMais)) p.push("renderMais tem item vazio");
  if (e.movimento.length < 2 || e.movimento.length > 4) {
    p.push(`movimento precisa de 2 a 4 passos (tem ${e.movimento.length})`);
  }
  if (!e.ondeSentir.trim()) p.push("onde sentir vazio");
  if (e.erradoSe.length < 1) p.push("erradoSe precisa de pelo menos 1 item");
  for (const s of e.erradoSe) {
    if (!s.includes("→")) p.push(`erradoSe sem "→" (sinal → correção): "${s}"`);
  }
  if (e.renderMais.length < 1 || e.renderMais.length > 2) {
    p.push(`renderMais precisa de 1 a 2 itens (tem ${e.renderMais.length})`);
  }
  if (pedeRegulagem(equipment) && !e.regulagem?.trim()) {
    p.push("equipamento pede regulagem e ela está faltando");
  }
  const textos = [e.posicao, ...e.movimento, e.ondeSentir, ...e.erradoSe, ...e.renderMais];
  if (e.regulagem) textos.push(e.regulagem);
  for (const t of textos) {
    for (const termo of termosSemTraducao(t)) {
      p.push(`"${termo}" sem tradução (— ou parênteses) em: "${t}"`);
    }
  }
  return p;
}

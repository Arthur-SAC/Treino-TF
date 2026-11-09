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

/** Termos técnicos que só podem aparecer com a tradução colada ("— ..." ou "(...)").
 *  Exigimos a tradução em vez de proibir a palavra (lição 5.2). */
export const TERMOS_QUE_PEDEM_TRADUCAO: readonly RegExp[] = [
  /rotação interna/gi,
  /rotação externa/gi,
  /transverso/gi,
  /flexão de quadril/gi,
  /extensão de quadril/gi,
  /isometria/gi,
  /escápula/gi,
  /retroversão/gi,
  /anteversão/gi,
  /90\/90/gi,
  /dorsiflexão/gi,
  /assoalho pélvico/gi,
  /cadeia posterior/gi,
];

function pedeRegulagem(equipment: readonly string[]): boolean {
  return equipment.some(
    (e) => e.startsWith("maquina-") || e.startsWith("leg-press") || e.startsWith("polia"),
  );
}

/** Pequena folga depois do termo pra caber o espaço antes do "—" ou "(". */
const FOLGA = 3;

function termosSemTraducao(texto: string): string[] {
  const achados: string[] = [];
  for (const base of TERMOS_QUE_PEDEM_TRADUCAO) {
    // Recria o regex: os globais guardam lastIndex entre chamadas.
    const re = new RegExp(base.source, base.flags.includes("g") ? base.flags : base.flags + "g");
    for (const m of texto.matchAll(re)) {
      const depois = texto.slice(m.index + m[0].length, m.index + m[0].length + FOLGA);
      if (!depois.includes("—") && !depois.includes("(")) achados.push(m[0]);
    }
  }
  return achados;
}

/** Devolve a lista de problemas; [] = ok. Pura. */
export function problemasDaExecucao(e: Execucao, equipment: readonly string[] = []): string[] {
  const p: string[] = [];
  if (!e.posicao.trim()) p.push("posição vazia");
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

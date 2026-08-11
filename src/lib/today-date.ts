// A data do dia do ponto de vista de quem usa o app — sempre no fuso LOCAL.
//
// Existia uma cópia de `todayISO()` em ~15 arquivos, com DUAS semânticas
// diferentes: umas montavam a data local com `getFullYear/getMonth/getDate`,
// outras usavam `toISOString().slice(0, 10)`, que é UTC. Em Aracaju (UTC−3),
// das 21h em diante o UTC já virou o dia seguinte — então tudo o que é de
// noite (voz, alongamento, diário, dormir) era gravado sob a data de amanhã,
// e água/micro-pausas/passeio zeravam na tela com 1h30 de dia pela frente.
//
// Regra: para "que dia é hoje", NUNCA `toISOString()`. Use `hojeISO()`.
// `toISOString()` continua certo para gravar um INSTANTE (timestamp), não um
// dia do calendário.

/** Data "yyyy-mm-dd" no fuso LOCAL. Sem argumento, é hoje; com um `Date`, é o
 *  dia local daquele instante — o parâmetro existe pra deslocar dias
 *  (`d.setDate(d.getDate() - 1)`) e pra fixar o relógio nos testes. */
export function hojeISO(d: Date = new Date()): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** Os `n` últimos dias do calendário terminando em `hoje`, do mais recente pro
 *  mais antigo. Puro: recebe o dia de hoje em vez de perguntar ao relógio.
 *
 *  A conta é feita em UTC de propósito — "yyyy-mm-dd" vira meia-noite UTC, e
 *  somar múltiplos de 24h a partir daí devolve sempre o dia anterior do
 *  calendário. A mesma subtração feita com `setDate` sobre a hora LOCAL pula
 *  ou repete um dia na virada de horário de verão. Note que o resultado é
 *  montado com os getters UTC, nunca com `toISOString()` sobre um instante
 *  local — a regra do topo deste arquivo continua valendo. */
export function ultimosDiasISO(hoje: string, n: number): string[] {
  const base = Date.parse(`${hoje}T00:00:00Z`);
  const dias: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base - i * 86400000);
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(d.getUTCDate()).padStart(2, "0");
    dias.push(`${d.getUTCFullYear()}-${mes}-${dia}`);
  }
  return dias;
}

/** Dia do ano (1–366) no fuso LOCAL. `buildDayRoutine` usa isso pra decidir
 *  itens em dias alternados (ex.: barba) e continua puro — o `new Date()`
 *  fica sempre em quem chama. Morava só em Today.tsx; a Vitalidade também
 *  passou a precisar montar a rotina do dia (pra resolver o alvo de sono), e
 *  uma segunda cópia deste cálculo era o mesmo risco de divergência que já
 *  levou este arquivo a existir para `hojeISO`. */
export function diaDoAno(date: Date): number {
  const inicioDoAno = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - inicioDoAno.getTime()) / 86400000);
}

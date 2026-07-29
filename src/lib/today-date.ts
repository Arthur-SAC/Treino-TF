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

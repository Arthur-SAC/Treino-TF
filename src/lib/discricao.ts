// src/lib/discricao.ts
// O que não pode aparecer num rótulo visível (auditoria de 2026-09-23): o Hoje
// fica aberto na tela, a notificação aparece na tela de bloqueio e o nome do
// app aparece no instalador, num ambiente que não é receptivo. O rótulo nunca
// descreve o que tem dentro. Módulo puro: os testes de discrição e as telas que
// listam texto vindo do banco (Conquistas) usam a mesma regra.
export const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

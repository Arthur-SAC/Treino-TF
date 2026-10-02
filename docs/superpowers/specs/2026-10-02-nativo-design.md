# Entrega D — Nativo (ações na notificação + lembrete de backup)

**Data:** 2026-10-02 · Quarta de cinco (A ✅ → B ✅ → C ✅ → **D** → E Navegação + dívidas).

## Decisões dela (2026-10-02)

| Pergunta | Decisão |
|---|---|
| Widget na tela inicial | **Fora.** Fica exposto na tela inicial (casa não receptiva) e precisa de código nativo próprio que não dá pra testar sem o celular. O "Feito" na notificação entrega o principal. |
| Instalação | Ela instala o APK só quando as cinco entregas estiverem prontas; tudo vai junto. |

## 1. Ações na notificação

O `@capacitor/local-notifications` (já instalado) tem botões de ação (`registerActionTypes` +
`actionTypeId`). **Nenhum plugin novo, nenhuma permissão nova → `NATIVE_VERSION` não sobe.**
Limitação do Android, dita com franqueza: tocar no botão **abre o app** por um instante; o
registro é feito ao abrir, sem ela navegar até o item.

| Lembrete | Botão | Efeito |
|---|---|---|
| Alongamento manhã / noite | **Feito** | marca `alongamento-manha` / `alongamento-noite` no dia do lembrete |
| Vitamina D | **Feito** | marca `vitamina-d` no dia do lembrete |
| Água | **Bebi 200 ml** | `addWater(dia, 200)` |
| Hora de desligar | **Deitei** | `registrarSono(dia, HH:MM do toque)` |

Pausa, treino, medidas e backup ficam sem botão (precisam de tela).

- `planejar.ts`: `Lembrete` ganha `acao?: "feito" | "bebi" | "deitei"` e `itemId?: string`. Puro, testado.
- Puro novo `src/lib/lembretes/acao.ts`: `efeitoDaAcao(actionId, extra) → { tipo: "marcar"; dia; itemId } | { tipo: "agua"; dia; ml: 200 } | { tipo: "sono"; dia } | { tipo: "abrir"; rota } | null`.
- `agendar.ts`: registra os três tipos de ação uma vez (`registrarAcoes`), e cada lembrete com ação leva `actionTypeId` e `extra: { rota, dia, itemId }`.
- `useLembretes.ts`: no `localNotificationActionPerformed`, aplica o efeito — `marcar` usa um helper novo **idempotente** `marcarFeito(date, itemId)` (o `toggleRoutineCheck` existente desmarcaria um item já feito); `tap` continua navegando pra rota.
- Rótulos dos botões são neutros (rede de discrição).

## 2. Lembrete de backup a cada 15 dias

- Setting `ultimoBackupEm: string` (ISO, padrão `""`), gravado quando o export termina em Configurações.
- Puro novo `src/lib/backup-lembrete.ts`: `backupVencido(ultimo, hoje): boolean` (nunca fez ou ≥ 15 dias) e `proximoBackup(ultimo, hoje): string` (dia em que vence).
- Planejador: tipo novo `backup` (dígito 9), às 12:05 do dia em que vence e dos seguintes até ela exportar; corpo "Seus dados só existem no celular"; rota `/configuracoes`. `EstadoLembretes` ganha `ultimoBackupEm`.
- Hoje: card `AvisoBackup` no topo (junto do `AvisoLembretes`) quando vencido: "Faz N dias sem backup — seus dados só existem neste celular." + link "Fazer backup" → `/configuracoes`. Vale também no PWA.

## Testes

Planejador: ações certas nos tipos certos e nenhuma nos outros; backup vencido gera lembrete às 12:05 e não gera quando em dia. `efeitoDaAcao` para cada ação e `tap`. `agendar`: registra os tipos e passa `actionTypeId`/`extra` (plugin falso, como o teste existente). `marcarFeito` idempotente. `backupVencido`/`proximoBackup` (nunca, 14, 15 dias). Settings grava `ultimoBackupEm` (teste de tela com `exportarArquivo`/crypto mockados, ou helper extraído). `AvisoBackup` aparece/some. Rede de discrição cobre os rótulos dos botões.

## Fora do escopo

Widget; ação sem abrir o app (exigiria código nativo); backup automático pro Drive (ela recusou cópias fora do celular no APK — `allowBackup=false`).

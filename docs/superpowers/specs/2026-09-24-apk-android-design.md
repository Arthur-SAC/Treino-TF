# APK Android com lembretes nativos e atualização automática

**Data:** 2026-09-24 · **Aparelho dela:** Poco X7 Pro (HyperOS, Android 15)

## Por que

Os lembretes do PWA não funcionam no celular dela, por dois motivos:

1. `notify()` usa `new Notification(...)`, que o Chrome do Android recusa com "Illegal
   constructor". Nada aparece, nem com o app aberto.
2. O agendador (`src/lib/notification-scheduler.ts`) é um `setInterval` da página: com o app
   fechado ou congelado pela HyperOS, nada roda.

Sem servidor (os dados ficam só no celular), a saída é um APK que entrega o agendamento ao
próprio Android.

## O que ela decidiu

- **Caminho 1:** o APK leva o app dentro dele (Capacitor), e os lembretes são agendados no
  Android por `@capacitor/local-notifications`. Tocam com o app fechado.
- **Atualização sem baixar de novo:** o conteúdo web do APK se atualiza sozinho, pelo
  `@capgo/capacitor-updater` em modo manual (sem serviço pago). Só mudança na parte nativa exige
  APK novo, e o app avisa quando for o caso.
- **Backup só uma vez:** para trazer os dados do app do Chrome. Atualizar o APK por cima mantém
  os dados, porque a assinatura é sempre a mesma.
- **Lembretes escolhidos por ela:** alongamento de manhã e de noite, água, pausas no trabalho,
  treino, hora de dormir, medir a cada 2 semanas e vitamina D aos domingos. O skincare e o
  "Antes de dormir" (movimento) saem dos lembretes no APK e continuam no Hoje.
- O PWA continua no ar em paralelo até ela migrar.

## Lembretes

Todos respeitam `notificationsEnabled`, `quietHours` (22h30–06h) e `focusModeUntil`. Os textos
aparecem na tela de bloqueio, então são neutros, na mesma regra de
`tests/lib/discricao-rotulos.test.ts`.

| Lembrete | Quando | Pula quando | Título / corpo | Toque abre |
|---|---|---|---|---|
| Alongamento manhã | 06:00 todo dia | o item `alongamento-manha` está feito no dia (check ou prática de `SEQUENCIAS_FLEX.manha`, a mesma regra do Hoje) | "Alongamento" / "5 min de manhã" | `/` |
| Alongamento noite | 21:30 todo dia | idem, com `alongamento-noite` / `SEQUENCIAS_FLEX.noite` | "Alongamento" / "Antes de deitar" | `/` |
| Água | de hora em hora, dentro de `activeBreakStartHour`–`activeBreakEndHour` (7–16h), em dias úteis: 08:00 … 15:00 (passo `hydrationIntervalMin`) | hoje: `dailyLog.waterMl` ≥ `hydrationGoalMl` | "Água" / "{bebido} de {meta} ml" (só nos de hoje; dias futuros: "Um copo agora") | `/` |
| Pausa | a cada `activeBreakIntervalMin` (90) min dentro da mesma janela, em dias úteis: 08:30, 10:00, 11:30, 13:00, 14:30 | nunca | "Levanta um pouco" / "2 min de quadril" | `/` |
| Treino | `workoutReminderTime` (18:15), só em dia com template do `activeCycle` | já existe `workoutSession` na data | "Treino" / nome do treino do dia | `/` |
| Hora de desligar | `dormirReminderTime` (novo, padrão 22:00) | nunca | "Hora de desligar" / "Tela longe, deitar às 22h30" | `/` |
| Medir | 06:05 do dia em que a última medida faz 14 dias; se já passou, todo dia às 06:05 até medir; sem nenhuma medida, amanhã às 06:05 | já mediu no dia | "Medidas" / "Em jejum, antes do café" | `/corpo/medidas` |
| Vitamina D | domingo 12:00 | `vitamina-d` marcado de segunda a domingo naquela semana | "Vitamina D" / "Com uma refeição com gordura" | `/` |

As horas de alongamento, dormir e vitamina D viram settings editáveis em Configurações, junto
das que já existem.

## Arquitetura

```
src/lib/lembretes/
  planejar.ts      função pura: (agora, settings, estado) → Lembrete[] dos próximos 14 dias
  estado.ts        lê do Dexie o que o planejador precisa (checks, práticas, água, sessões, medidas, templates)
  agendar.ts       adaptador: cancela os pendentes do app e agenda a lista nova no Android
  useLembretes.ts  reagenda ao abrir, ao voltar pro app e quando as tabelas relevantes mudam (liveQuery, debounce 2 s)
src/lib/plataforma.ts   isNativo() — Capacitor.isNativePlatform()
src/lib/atualizacao.ts  notifyAppReady + busca de pacote novo + aviso de APK novo
```

- **`planejar.ts`** é onde está toda a regra, e só ele é testado a fundo. Cada `Lembrete` tem
  `{ id: number, quando: Date, titulo, corpo, rota }`. O id é determinístico por tipo e data,
  para dois agendamentos do mesmo dia não duplicarem.
- **Janela de 14 dias.** A cada reagendamento, ela sai de novo de agora até 14 dias. São cerca
  de 17 alarmes por dia, uns 240 no total, abaixo do limite de 500 do Android.
- **"Feito" usa a regra do Hoje.** A regra que decide se um item está feito no Hoje
  (`praticadaNaTrilha` e checks) é extraída para uma função compartilhada, sem duplicar.
- **No PWA,** o agendador antigo continua como está. O planejador só roda quando `isNativo()`.
  No APK, `startScheduler()` não é chamado.
- **Permissões no primeiro uso:** `requestPermissions()` (POST_NOTIFICATIONS) e
  `checkExactNotificationSetting()`. Se o alarme exato não for concedido, aparece um card no
  Hoje com o botão que abre o ajuste. Em Configurações → Lembretes, um bloco "No Poco/Xiaomi"
  explica bateria "Sem restrições" e início automático, que não dá para abrir por código de
  forma confiável.

## Build e atualização

- **Capacitor 7+,** `appId: io.github.arthursac.treino`, `appName: "Treino"` (neutro), ícone
  atual. Pasta `android/` versionada.
- **Dois builds do mesmo código:** o do Pages, como hoje (`base: "/Treino-TF/"`, com service
  worker), e o do app (`vite build --mode app`: `base: "/"`, sem `vite-plugin-pwa`). O service
  worker não entra no APK, para não brigar com o updater.
- **Pacote de atualização:** o `deploy.yml` passa a gerar também `android/bundle-<sha>.zip` e
  `android/latest.json` (`{ version, url, checksum, nativeVersion }`), publicados junto no Pages.
- **No app:** `notifyAppReady()` ao abrir. Depois, busca o `latest.json`:
  - se a versão mudou, baixa com checksum e usa `next()`, que aplica na próxima abertura;
  - se `nativeVersion` do servidor for maior que a do APK instalado, aparece um card "Tem versão
    nova do app para instalar", com link para a Release.
  - Se o pacote novo não chamar `notifyAppReady()`, o plugin volta sozinho para o anterior.
- **APK:** job `android.yml` (JDK 21, Android SDK) roda por `workflow_dispatch` ou quando mudam
  `android/**`, `capacitor.config.ts` ou `NATIVE_VERSION`. Publica o APK assinado numa Release
  `apk-v<NATIVE_VERSION>`.
- **Assinatura:** keystore gerado uma vez com `keytool`, guardado como secrets do GitHub (base64
  + senhas), nunca no repositório. **Ela guarda uma cópia do keystore fora do GitHub.** Sem ele,
  não dá para atualizar o APK por cima, e seria preciso reinstalar e restaurar backup.

## Migração (uma vez)

1. No app do Chrome: Configurações → Exportar backup.
2. Instala o APK (HyperOS: permitir "fontes desconhecidas" ao navegador).
3. No primeiro uso do APK, com o banco vazio, um card "Veio do app do Chrome? Restaurar backup"
   leva ao restaurar que já existe.

**Garantia antes de ela migrar:** um teste confere que `coletarBackup` cobre todas as tabelas do
`db`, com uma lista explícita de exceções justificadas. Hoje a cobertura é conferida à mão.

## Testes

- `planejar.ts`, por lembrete: horário, dias da semana, pular quando feito, silêncio, foco,
  interruptor geral, medir (sem medida, no dia, atrasada), vitamina D na semana, treino só em
  dia de treino, ids estáveis, janela de 14 dias.
- Discrição: todos os títulos e corpos passam pelo filtro de palavras sensíveis.
- `agendar.ts` e `atualizacao.ts` com os plugins simulados: cancela antes de agendar, não
  agenda fora do nativo, versão igual não baixa, `nativeVersion` maior mostra o card.
- Build: `vite build --mode app` sai sem `sw.js` e com `base` "/".
- **Não dá para testar daqui:** tocar de verdade no Poco. O critério de aceite é ela instalar,
  deixar o app fechado e o lembrete seguinte tocar.

## Fora do escopo

- Consertar o `new Notification` do PWA (ela vai migrar para o APK).
- Notificação por servidor (push).
- iOS.
- Publicar na Play Store.

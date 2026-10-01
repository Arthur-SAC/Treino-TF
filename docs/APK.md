# App no celular (APK)

O app agora pode ser instalado como um aplicativo Android de verdade. A diferença que
importa: os lembretes tocam com o app fechado, porque quem agenda é o próprio Android.
Seus dados continuam só no celular.

## Migrar do app do Chrome (uma vez só)

1. **Backup no app antigo.** No app do Chrome: Configurações → Exportar backup. Escolha
   uma senha e anote. O arquivo vai para Downloads.
2. **Baixar o APK.** Em https://github.com/Arthur-SAC/Treino-TF/releases/latest, o
   arquivo `Treino.apk`.
3. **Instalar.** Ao abrir o APK, a HyperOS pede para permitir "instalar apps
   desconhecidos" para o navegador ou o gerenciador de arquivos. Permita só para esse app.
4. **Restaurar.** Na primeira abertura aparece "Veio do app do Chrome? Restaurar backup".
   Escolha o arquivo do passo 1 e digite a senha.
5. **Ativar os lembretes.** No Hoje, toque em "Ativar lembretes". Se aparecer
   "Permitir horário exato", toque também.
6. **Liberar no Poco.** Configurações → Apps → Treino:
   - Economia de bateria: **Sem restrições**
   - **Início automático**: ligado

   Sem isso a HyperOS pode segurar ou atrasar os lembretes.
7. **Testar.** Feche o app. O próximo lembrete da lista abaixo tem que tocar.
8. **Conferir e só depois apagar o antigo.** Olhe medidas, treinos, fotos e rotinas no app
   novo. Estando tudo lá, pode desinstalar o app do Chrome.

## Lembretes

| Lembrete | Quando | Não toca se |
|---|---|---|
| Alongamento | 6h e 21h30 | você já marcou ou fez a sequência |
| Água | 8h às 15h, de hora em hora, dias úteis | já bateu a meta do dia |
| Levanta um pouco | 8h30, 10h, 11h30, 13h, 14h30, dias úteis | — |
| Treino | 18h15, em dia de treino | o treino do dia já está registrado |
| Hora de desligar | 22h | — |
| Medidas | 6h05, 14 dias depois da última medida (todo dia se atrasou) | você já mediu |
| Vitamina D | domingo, 12h | já marcou na semana |

Nada toca entre 22h30 e 6h. Todos os horários mudam em Configurações.

## Atualizações

Chegam sozinhas: ao abrir o app, ele baixa a versão nova em segundo plano, e ela vale na
próxima abertura. Nada de baixar de novo nem de backup.

Raramente, quando muda a parte nativa do app, aparece no Hoje "Tem versão nova do app para
instalar". Aí é baixar o `Treino.apk` de novo e instalar por cima. Os dados ficam.

## A chave

A pasta `Documentos\treino-chave-apk` (no PC) guarda a assinatura do app e a senha dela.
**Copie para um pen drive ou para o Drive.** Sem ela, uma versão nova do APK não instala
por cima da antiga, e seria preciso desinstalar e restaurar o backup.

## Backup daqui pra frente

Configurações → Exportar backup abre o "compartilhar" do Android. Mande para o Drive ou
salve em Arquivos. Vale fazer de vez em quando: se o celular sumir, é o que traz tudo de volta.

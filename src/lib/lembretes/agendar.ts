// Adaptador fino: entrega ao Android a lista do planejador. Todos os
// pendentes do app são lembretes dele, então cancela tudo e agenda de novo;
// o id estável (planejar.ts) evita duplicata mesmo se duas chamadas cruzarem.
import { LocalNotifications } from "@capacitor/local-notifications";
import { TIPOS_DE_ACAO } from "./acao";
import { planejar, type Lembrete } from "./planejar";
import { carregarConfig, carregarEstado } from "./estado";

export interface PluginNotificacoes {
  checkExactNotificationSetting(): Promise<{ exact_alarm: string }>;
  getPending(): Promise<{ notifications: Array<{ id: number }> }>;
  cancel(o: { notifications: Array<{ id: number }> }): Promise<void>;
  registerActionTypes(o: { types: Array<{ id: string; actions: Array<{ id: string; title: string }> }> }): Promise<void>;
  schedule(o: { notifications: Array<{ id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean }; smallIcon?: string; isExactNotification?: boolean; actionTypeId?: string; extra: { rota: string; dia: string; itemId?: string } }> }): Promise<unknown>;
}

const nativo = LocalNotifications as unknown as PluginNotificacoes;

export async function agendar(lista: Lembrete[], plugin: PluginNotificacoes = nativo): Promise<void> {
  const { notifications } = await plugin.getPending();
  if (notifications.length > 0) await plugin.cancel({ notifications: notifications.map((n) => ({ id: n.id })) });
  if (lista.length === 0) return;
  // Sem a permissão de alarme exato, schedule() com exato (o padrão do plugin)
  // abre sozinho a tela do sistema — e cada volta pro app reagendava e abria de
  // novo. Aqui agenda inexato; quem pede a permissão é o card do Hoje.
  const exato = (await plugin.checkExactNotificationSetting()).exact_alarm === "granted";
  // Registrar os botões toda vez é barato e idempotente; precisa vir antes do
  // schedule, senão a notificação nasce sem botão.
  await plugin.registerActionTypes({ types: TIPOS_DE_ACAO.map((t) => ({ id: t.id, actions: t.acoes.map((a) => ({ ...a })) })) });
  await plugin.schedule({
    notifications: lista.map((l) => ({
      id: l.id, title: l.titulo, body: l.corpo,
      schedule: { at: l.quando, allowWhileIdle: true },
      smallIcon: "ic_stat_treino",
      isExactNotification: exato,
      ...(l.acao ? { actionTypeId: l.acao } : {}),
      extra: { rota: l.rota, dia: l.dia, ...(l.itemId ? { itemId: l.itemId } : {}) },
    })),
  });
}

export async function reagendar(agora: Date = new Date(), plugin: PluginNotificacoes = nativo): Promise<void> {
  const [cfg, estado] = await Promise.all([carregarConfig(), carregarEstado(agora)]);
  await agendar(planejar(agora, cfg, estado), plugin);
}

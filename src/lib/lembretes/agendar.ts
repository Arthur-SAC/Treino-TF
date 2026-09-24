// Adaptador fino: entrega ao Android a lista do planejador. Todos os
// pendentes do app são lembretes dele, então cancela tudo e agenda de novo;
// o id estável (planejar.ts) evita duplicata mesmo se duas chamadas cruzarem.
import { LocalNotifications } from "@capacitor/local-notifications";
import { planejar, type Lembrete } from "./planejar";
import { carregarConfig, carregarEstado } from "./estado";

export interface PluginNotificacoes {
  getPending(): Promise<{ notifications: Array<{ id: number }> }>;
  cancel(o: { notifications: Array<{ id: number }> }): Promise<void>;
  schedule(o: { notifications: Array<{ id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean }; smallIcon?: string; extra: { rota: string } }> }): Promise<unknown>;
}

const nativo = LocalNotifications as unknown as PluginNotificacoes;

export async function agendar(lista: Lembrete[], plugin: PluginNotificacoes = nativo): Promise<void> {
  const { notifications } = await plugin.getPending();
  if (notifications.length > 0) await plugin.cancel({ notifications: notifications.map((n) => ({ id: n.id })) });
  if (lista.length === 0) return;
  await plugin.schedule({
    notifications: lista.map((l) => ({
      id: l.id, title: l.titulo, body: l.corpo,
      schedule: { at: l.quando, allowWhileIdle: true },
      smallIcon: "ic_stat_treino",
      extra: { rota: l.rota },
    })),
  });
}

export async function reagendar(agora: Date = new Date(), plugin: PluginNotificacoes = nativo): Promise<void> {
  const [cfg, estado] = await Promise.all([carregarConfig(), carregarEstado(agora)]);
  await agendar(planejar(agora, cfg, estado), plugin);
}

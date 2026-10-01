import { LocalNotifications } from "@capacitor/local-notifications";
import { setSetting } from "../settings-helpers";

export type EstadoPermissao = "ok" | "sem-notificacao" | "sem-alarme-exato";
export interface PluginPermissao {
  checkPermissions(): Promise<{ display: string }>;
  requestPermissions(): Promise<{ display: string }>;
  checkExactNotificationSetting(): Promise<{ exact_alarm: string }>;
  changeExactNotificationSetting(): Promise<unknown>;
}
const nativo = () => LocalNotifications as unknown as PluginPermissao;

export async function estadoPermissao(p: PluginPermissao = nativo()): Promise<EstadoPermissao> {
  if ((await p.checkPermissions()).display !== "granted") return "sem-notificacao";
  if ((await p.checkExactNotificationSetting()).exact_alarm !== "granted") return "sem-alarme-exato";
  return "ok";
}

export async function ativarLembretes(p: PluginPermissao = nativo()): Promise<EstadoPermissao> {
  const r = await p.requestPermissions();
  if (r.display !== "granted") return "sem-notificacao";
  await setSetting("notificationsEnabled", true);
  return estadoPermissao(p);
}

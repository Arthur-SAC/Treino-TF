// Só no APK, só enquanto falta alguma coisa: sem isso os lembretes não tocam
// e nada na tela diria por quê.
import { useEffect, useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativo } from "../lib/plataforma";
import { useSetting } from "../hooks/useSetting";
import { estadoPermissao, ativarLembretes, type EstadoPermissao, type PluginPermissao } from "../lib/lembretes/permissao";

export function AvisoLembretes() {
  const ligadas = useSetting("notificationsEnabled");
  const [estado, setEstado] = useState<EstadoPermissao | null>(null);
  useEffect(() => {
    if (!isNativo()) return;
    void estadoPermissao().then(setEstado).catch(() => setEstado(null));
  }, [ligadas]);

  if (!isNativo() || estado === null) return null;
  if (estado === "ok" && ligadas) return null;

  if (estado === "sem-alarme-exato") {
    return (
      <div className="card border-wine-light mb-3">
        <p className="text-nude-warm text-sm">Os lembretes precisam de horário exato, senão o Android atrasa ou junta.</p>
        <button type="button" className="mt-2 w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
          onClick={() => void (LocalNotifications as unknown as PluginPermissao).changeExactNotificationSetting()}>
          Permitir horário exato
        </button>
      </div>
    );
  }
  return (
    <div className="card border-wine-light mb-3">
      <p className="text-nude-warm text-sm">Os lembretes estão desligados.</p>
      <button type="button" className="mt-2 w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
        onClick={() => void ativarLembretes().then(setEstado)}>
        Ativar lembretes
      </button>
    </div>
  );
}

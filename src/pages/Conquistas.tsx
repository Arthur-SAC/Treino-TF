import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSetting } from "../hooks/useSetting";
import { Voltar } from "../components/Voltar";
import { DESBLOQUEIOS } from "../lib/desbloqueios";
import { estadoSequencia } from "../lib/sequencia";
import { marcosDeCinturaAtingidos } from "../lib/conquistas";
import { diaMes, faltamTreinos } from "../lib/placas-texto";
import { hojeISO } from "../lib/today-date";

// Conquistas, dentro do Progresso (spec 2026-11-09, seção 9): o que já abriu,
// o que vem (com quantos treinos faltam e o que entra) e os marcos batidos.
// Desbloqueio é mostrado aqui, nunca gravado: quem grava é a placa (usePlacas).
export function Conquistas() {
  const hoje = hojeISO();
  const ja = useSetting("desbloqueios");
  const desde = useSetting("sequenciaDesde");
  const datas = useLiveQuery(async () => (await db.workoutSessions.toArray()).map((s) => s.date), []);
  const medidas = useLiveQuery(() => db.measurements.toArray(), []);
  const concluidos = useLiveQuery(
    async () => (await db.milestones.toArray())
      .filter((m) => !!m.dateCompleted)
      .sort((a, b) => (a.dateCompleted! < b.dateCompleted! ? -1 : 1)),
    [],
  );

  const sequencia = datas ? estadoSequencia(datas, desde, hoje).atual : null;
  const abertos = DESBLOQUEIOS.filter((d) => Object.prototype.hasOwnProperty.call(ja, d.id));
  const proximos = DESBLOQUEIOS.filter((d) => !Object.prototype.hasOwnProperty.call(ja, d.id));
  const cintura = marcosDeCinturaAtingidos(medidas ?? []);
  const marcos = [
    ...cintura.map((m) => ({ chave: `c-${m.cinturaCm}`, titulo: m.titulo, data: m.data })),
    // O seed de marcos tem "Cintura 88"/"Cintura 84" também: a medida já conta,
    // não repete.
    ...(concluidos ?? []).filter((m) => !cintura.some((c) => m.title.includes(c.titulo))).map((m) => ({ chave: `m-${m.id}`, titulo: m.title, data: m.dateCompleted! })),
  ];

  return (
    <div className="p-4 pb-24 space-y-5">
      <div className="flex items-center gap-3">
        <Voltar para="/progresso" rotulo="Progresso" />
      </div>
      <h1 className="font-serif text-2xl text-nude">Conquistas</h1>

      <section aria-labelledby="c-desbloqueados" className="space-y-2">
        <h2 id="c-desbloqueados" className="text-muted text-xs uppercase tracking-wider">Desbloqueados</h2>
        {abertos.length === 0 ? (
          <p className="text-muted text-sm">Nada ainda. O primeiro abre com 5 treinos seguidos.</p>
        ) : (
          <ul className="space-y-2">
            {abertos.map((d) => (
              <li key={d.id} className="card !p-3 flex items-baseline justify-between gap-3 border-feito/40">
                <span className="text-nude-warm font-medium">{d.titulo}</span>
                <span className="text-feito text-sm tabular-nums">{diaMes(ja[d.id])}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {proximos.length > 0 && (
        <section aria-labelledby="c-proximos" className="space-y-2">
          <h2 id="c-proximos" className="text-muted text-xs uppercase tracking-wider">Próximos</h2>
          <ul className="space-y-2">
            {proximos.map((d) => (
              <li key={d.id} className="card !p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-nude-warm font-medium">{d.titulo}</span>
                  {sequencia !== null && (
                    <span className="text-muted text-xs text-right">{faltamTreinos(d.patamar - sequencia)}</span>
                  )}
                </div>
                <p className="text-muted text-sm mt-1">{d.entra}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="c-marcos" className="space-y-2">
        <h2 id="c-marcos" className="text-muted text-xs uppercase tracking-wider">Marcos</h2>
        {marcos.length === 0 ? (
          <p className="text-muted text-sm">Nenhum marco batido ainda.</p>
        ) : (
          <ul className="space-y-2">
            {marcos.map((m) => (
              <li key={m.chave} className="card !p-3 flex items-baseline justify-between gap-3 border-feito/40">
                <span className="text-nude-warm font-medium">{m.titulo}</span>
                <span className="text-feito text-sm tabular-nums">{diaMes(m.data)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

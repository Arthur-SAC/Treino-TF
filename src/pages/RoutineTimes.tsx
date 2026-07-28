import { Link } from "react-router-dom";
import { buildDayRoutine } from "../lib/today-routine";
import { itensAjustaveis, formatHora } from "../lib/routine-times";
import { useSetting } from "../hooks/useSetting";
import { setSetting } from "../lib/settings-helpers";

// Segunda-feira monta o dia completo de semana — é dele que sai a lista de
// itens ajustáveis. Fim de semana reaproveita os mesmos horários.
const BLOCOS = buildDayRoutine(1).blocks;

const NOME_BLOCO: Record<string, string> = {
  manha: "Manhã",
  trabalho: "No trabalho",
  tarde: "Saída",
  noite: "Noite",
  semana: "Esta semana",
};

export function RoutineTimes() {
  const routineTimes = useSetting("routineTimes");
  const itens = itensAjustaveis(BLOCOS);

  async function ajustar(id: string, hhmm: string) {
    await setSetting("routineTimes", { ...routineTimes, [id]: hhmm });
  }

  async function voltarAoPadrao() {
    await setSetting("routineTimes", {});
  }

  const ajustados = Object.keys(routineTimes).length;

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-nude text-sm">← Hoje</Link>
      </div>

      <h1 className="text-nude-warm text-lg font-medium">Horários do seu dia</h1>
      <p className="text-muted text-sm">
        Estes são os horários que aparecem no roteiro do Hoje. Os valores já vêm
        preenchidos com a sua rotina — muda o que não bater com a vida real.
      </p>

      {itens.map((item, i) => {
        const anterior = itens[i - 1];
        const cabecalho = !anterior || anterior.block !== item.block;
        const valor = routineTimes[item.id] ?? item.defaultTime ?? "";
        const alterado = Boolean(routineTimes[item.id]) && routineTimes[item.id] !== item.defaultTime;
        return (
          <div key={item.id} className="space-y-2">
            {cabecalho && (
              <h2 className="text-muted text-xs uppercase tracking-wider pt-3">{NOME_BLOCO[item.block] ?? item.block}</h2>
            )}
            <label className="card flex items-center gap-3">
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-nude-warm">{item.label}</span>
                {alterado && item.defaultTime && (
                  <span className="block text-xs text-muted mt-0.5">padrão: {formatHora(item.defaultTime)}</span>
                )}
              </span>
              <input
                type="time"
                value={valor}
                onChange={(e) => void ajustar(item.id, e.target.value)}
                aria-label={`horário de ${item.label}`}
                className="flex-none bg-bg-deep border border-bg-border rounded-md px-2 py-1 text-sm text-nude-warm tabular-nums"
              />
            </label>
          </div>
        );
      })}

      {ajustados > 0 && (
        <button
          type="button"
          onClick={() => void voltarAoPadrao()}
          className="w-full mt-4 py-2 rounded-md text-sm bg-bg-deep text-muted border border-bg-border"
        >
          Voltar todos ao padrão
        </button>
      )}
    </div>
  );
}

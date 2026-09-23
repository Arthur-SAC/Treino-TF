import { Link } from "react-router-dom";
import { mesAno, type Projecao } from "../lib/partida";

const entre = ([a, b]: [string, string]) => (a === b ? mesAno(a) : `${mesAno(a)} e ${mesAno(b)}`);

// O norte do dia numa linha. Sem partida, pede a medição — é dela que saem o
// peso-alvo e os prazos (ela recomeçou do zero em 23/09/2026 e não tinha como
// medir no dia). Com partida, fica sempre à vista, sem ocupar a tela.
export function PartidaCard({ projecao, invalida = false }: { projecao: Projecao | null; invalida?: boolean }) {
  if (!projecao && invalida) {
    return (
      <div className="card">
        <h3 className="text-nude-warm font-medium">Medição de partida</h3>
        <p className="text-muted text-sm mt-1">
          A medição que você registrou não fechou a conta — confere se a cintura (no umbigo) e o pescoço não ficaram trocados ou com uma vírgula fora do lugar. Dá pra apagar a medida errada na lista.
        </p>
        <Link to="/corpo/medidas" className="text-sm text-nude-warm underline mt-2 inline-block">Conferir medidas</Link>
      </div>
    );
  }
  if (!projecao) {
    return (
      <div className="card">
        <h3 className="text-nude-warm font-medium">Medição de partida</h3>
        <p className="text-muted text-sm mt-1">
          Peso, cintura na altura do umbigo e pescoço — os prazos e o peso-alvo saem dela. Leva 3 minutos com a fita.
        </p>
        <Link to="/corpo/medidas" className="text-sm text-nude-warm underline mt-2 inline-block">Medir agora</Link>
      </div>
    );
  }
  const [a, b] = projecao.pesoAlvoFase1;
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Fase 1</p>
      <p className="text-nude-warm text-sm mt-1">
        Peso-alvo {a}–{b} kg · fim da fase 1 entre {entre(projecao.fimFase1)}
      </p>
      {projecao.cintura88 !== "ja" && (
        <p className="text-muted text-xs mt-1">Cintura 88 entre {entre(projecao.cintura88)}</p>
      )}
    </div>
  );
}

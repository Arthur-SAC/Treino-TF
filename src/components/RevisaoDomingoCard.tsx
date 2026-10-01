import type { Revisao } from "../lib/revisao-semanal";

export function RevisaoDomingoCard({ revisao }: { revisao: Revisao }) {
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Revisão da semana</p>
      {revisao.linhas.map((l) => (
        <p key={l} className="text-sm mt-1">{l}</p>
      ))}
      <p className="text-nude-warm text-sm mt-2">{revisao.ajuste}</p>
    </div>
  );
}

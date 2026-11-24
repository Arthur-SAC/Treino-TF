import type { OfertaDegrau } from "../../lib/estilo-degraus";

const TEXTO: Record<2 | 3, { titulo: string; corpo: string }> = {
  2: { titulo: "Pronta pro degrau 2", corpo: "Peças com um pouco mais de forma, no mesmo ritmo de uma por mês." },
  3: { titulo: "Pronta pro degrau 3", corpo: "Peças que já chamam mais atenção, no mesmo ritmo de uma por mês." },
};

export function OfertaDegrauCard({ oferta, onAceitar, onAgoraNao }: {
  oferta: OfertaDegrau;
  onAceitar: () => void;
  onAgoraNao: () => void;
}) {
  const t = TEXTO[oferta.para];
  return (
    <section className="card border-feito/50 space-y-2" aria-labelledby="oferta-degrau">
      <p className="text-feito text-xs uppercase tracking-wider">Pronta pra próxima</p>
      <h2 id="oferta-degrau" className="font-serif text-xl text-nude-warm">{t.titulo}</h2>
      <p className="text-muted text-sm">{t.corpo}</p>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onAceitar} className="flex-1 rounded-md py-2 text-sm font-medium bg-wine text-nude-warm">Aceitar</button>
        <button type="button" onClick={onAgoraNao} className="flex-1 rounded-md py-2 text-sm border border-bg-border text-muted">Agora não</button>
      </div>
    </section>
  );
}

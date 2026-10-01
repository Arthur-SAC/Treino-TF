import type { Veredito } from "../lib/ritmo";

const dataBR = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

/** Seu ritmo da fase 1 contra o plano. O título é o veredito; os textos vêm
 *  prontos de `ritmo.ts` — a tela não decide nada, só mostra. */
export function RitmoCard({ veredito }: { veredito: Veredito }) {
  if (veredito.estado === "sem-partida") return null;
  if (veredito.estado === "cedo") {
    return (
      <div className="card">
        <p className="text-muted text-xs uppercase tracking-wider">Seu ritmo</p>
        <p className="text-nude-warm text-sm mt-1">A primeira comparação sai em {dataBR(veredito.primeiraComparacao)}, com uma medida a partir desse dia.</p>
        <p className="text-muted text-xs mt-1">Antes de 10 dias a fita e a balança oscilam mais do que você perde.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Seu ritmo</p>
      <p className="text-nude-warm text-sm mt-1">{veredito.titulo}</p>
      <p className="text-muted text-xs mt-1">{num(veredito.kgSemana)} kg e {num(veredito.cmSemana)} cm de cintura por semana</p>
      {veredito.texto.map((t) => (
        <p key={t} className="text-xs mt-1">{t}</p>
      ))}
    </div>
  );
}

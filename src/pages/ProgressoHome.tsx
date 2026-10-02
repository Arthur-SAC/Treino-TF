import { Link } from "react-router-dom";

// Índice da aba Progresso. As telas moram nas rotas de sempre (/corpo, /trilha,
// /treino); aqui só se junta o que mostra "como estou indo". Rótulos neutros:
// ficam visíveis na tela dela (ver tests/lib/discricao-rotulos.test.ts).
export const ITENS_PROGRESSO: { label: string; sub: string; to: string }[] = [
  { label: "Evolução", sub: "Seu ritmo e os últimos 30 dias", to: "/trilha/evolucao" },
  { label: "Medidas", sub: "Peso, cintura, quadril", to: "/corpo/medidas" },
  { label: "Fotos", sub: "Antes e agora", to: "/corpo/fotos" },
  { label: "Silhueta", sub: "As proporções", to: "/corpo/silhueta" },
  { label: "Comparação", sub: "Lado a lado", to: "/corpo/comparacao" },
  { label: "Marcos", sub: "O que já foi e o que vem", to: "/trilha" },
  { label: "Até onde dá pra chegar", sub: "Os tetos, com números", to: "/treino/horizontes" },
  { label: "Progressão de carga", sub: "Quanto cada exercício subiu", to: "/treino/progressao" },
  { label: "Diário", sub: "Como foram os dias", to: "/trilha/diario" },
];

export function ProgressoHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Progresso</h1>
      {ITENS_PROGRESSO.map((i) => (
        <Link key={i.to} to={i.to} className="card block hover:border-nude/40 transition">
          <h3 className="text-nude-warm font-medium">{i.label}</h3>
          <p className="text-muted text-sm mt-1">{i.sub}</p>
        </Link>
      ))}
    </div>
  );
}

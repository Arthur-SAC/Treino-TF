import { Link } from "react-router-dom";

// Índice da aba Guia: o que se consulta e se segue (treino, comida, beleza,
// apoio). Só aponta pras rotas de sempre. Rótulos neutros — ficam visíveis na
// tela dela (ver tests/lib/discricao-rotulos.test.ts).
export const BLOCOS_GUIA: { titulo: string; itens: { label: string; to: string }[] }[] = [
  {
    titulo: "Treino",
    itens: [
      { label: "Treino e plano", to: "/treino" },
      { label: "Biblioteca", to: "/treino/biblioteca" },
      { label: "Movimento", to: "/treino/movimento" },
      { label: "Ciclos", to: "/treino/ciclos" },
    ],
  },
  {
    titulo: "Alimentação",
    itens: [
      { label: "Cardápio", to: "/trilha/alimentacao" },
      { label: "Refeições de hoje", to: "/refeicoes-hoje" },
      { label: "Lista de compras", to: "/trilha/alimentacao/lista-compras" },
      { label: "Marmita de domingo", to: "/trilha/alimentacao/domingo" },
    ],
  },
  {
    titulo: "Beleza",
    itens: [
      { label: "Pele e cabelo", to: "/beleza" },
      { label: "Depilação", to: "/beleza/depilacao" },
      { label: "Maquiagem", to: "/beleza/maquiagem" },
      { label: "Voz", to: "/beleza/voz" },
      { label: "Estilo", to: "/beleza/estilo" },
    ],
  },
  {
    titulo: "Apoio",
    itens: [
      { label: "Apoio", to: "/trilha/apoio" },
      { label: "Saúde · planos", to: "/trilha/fertilidade" },
      { label: "Direitos", to: "/trilha/direitos" },
    ],
  },
];

export function GuiaHome() {
  return (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="font-serif text-2xl text-nude">Guia</h1>
      {BLOCOS_GUIA.map((b) => (
        <section key={b.titulo} className="space-y-2">
          <h2 className="text-nude-warm font-medium">{b.titulo}</h2>
          <div className="grid grid-cols-2 gap-2">
            {b.itens.map((i) => (
              <Link key={i.to} to={i.to} className="card block text-sm hover:border-nude/40 transition">
                {i.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

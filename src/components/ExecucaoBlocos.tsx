import type { Execucao } from "../lib/execucao";

interface Props {
  execucao: Execucao;
  /** No MoveStep só Posição e Movimento aparecem direto; o resto fica atrás de um toggle. */
  parte?: "tudo" | "essencial" | "resto";
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-nude-warm font-medium mb-1">{titulo}</h3>
      {children}
    </section>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="space-y-1 text-sm list-disc pl-5">
      {itens.map((i) => <li key={i}>{i}</li>)}
    </ul>
  );
}

export function ExecucaoBlocos({ execucao: e, parte = "tudo" }: Props) {
  const essencial = parte !== "resto";
  const resto = parte !== "essencial";
  return (
    <div className="space-y-3">
      {essencial && (
        <>
          <Bloco titulo="Posição"><p className="text-sm">{e.posicao}</p></Bloco>
          <Bloco titulo="Movimento">
            <ol className="space-y-1 text-sm list-decimal pl-5">
              {e.movimento.map((m) => <li key={m}>{m}</li>)}
            </ol>
          </Bloco>
        </>
      )}
      {resto && (
        <>
          <Bloco titulo="Onde sentir"><p className="text-sm">{e.ondeSentir}</p></Bloco>
          <Bloco titulo="Tá errado se…"><Lista itens={e.erradoSe} /></Bloco>
          <Bloco titulo="Pra render mais"><Lista itens={e.renderMais} /></Bloco>
          {e.regulagem && <Bloco titulo="Regulagem"><p className="text-sm">{e.regulagem}</p></Bloco>}
        </>
      )}
    </div>
  );
}

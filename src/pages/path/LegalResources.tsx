import { PathTabs } from "../../components/PathTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";

interface Resource {
  title: string;
  body: string;
  steps?: string[];
}

const RESOURCES: Resource[] = [
  {
    title: "Mudança de nome e gênero no cartório (sem cirurgia, sem juiz)",
    body: "Desde 2018 (Provimento 73 do CNJ), pessoa trans maior de 18 anos pode alterar nome e gênero DIRETO no cartório de registro civil, sem necessidade de cirurgia, laudo médico, ou decisão judicial. É um direito garantido.",
    steps: [
      "Vá ao cartório de registro civil (onde quiser, não precisa ser o do nascimento)",
      "Leve: RG, CPF, título de eleitor, comprovante de residência, certidão de nascimento atualizada, certidões negativas (civil, criminal, protesto) — o cartório orienta a lista exata",
      "Preencha o requerimento de alteração",
      "Paga as taxas (varia por estado; pode pedir gratuidade se comprovar hipossuficiência)",
      "O cartório averba a alteração na certidão de nascimento — sai a nova certidão com nome e gênero retificados",
    ],
  },
  {
    title: "Atualizar RG, CPF e demais documentos",
    body: "Depois que a certidão de nascimento é retificada, você atualiza todos os outros documentos com base nela.",
    steps: [
      "RG: vai ao órgão emissor (Detran/IIRGD do seu estado) com a nova certidão",
      "CPF: atualiza na Receita Federal (online ou presencial) ou bancos credenciados",
      "Título de eleitor: cartório eleitoral ou site do TSE",
      "Carteira de trabalho digital: atualiza pelo gov.br",
      "CNH: Detran, na renovação ou alteração de dados",
      "Passaporte, plano de saúde, banco, faculdade: cada um com a nova certidão/RG",
    ],
  },
  {
    title: "Nome social ANTES da retificação oficial",
    body: "Você pode usar nome social (sem mudar documento) em vários serviços enquanto não retifica oficialmente. Vários decretos garantem isso.",
    steps: [
      "SUS: tem campo de nome social no cartão (Portaria 1.820/2009 + Decreto 8.727/2016)",
      "Universidades/escolas: maioria aceita nome social em matrícula, carteirinha, e-mail (Resolução CNE)",
      "INSS, gov.br: permite nome social no cadastro",
      "Bancos: muitos já aceitam nome social em cartões",
      "Trabalho: você tem direito a ser tratada pelo nome social no ambiente de trabalho",
    ],
  },
  {
    title: "Saúde — processo transexualizador no SUS",
    body: "O SUS oferece acompanhamento pra transição (hormonioterapia, acompanhamento psicológico e, em alguns centros, cirurgias) gratuitamente, pelo processo transexualizador.",
    steps: [
      "Procura uma UBS e pede encaminhamento pro ambulatório trans mais próximo (grandes capitais têm)",
      "Acompanhamento com equipe multidisciplinar (endócrino, psicólogo, assistente social)",
      "Hormonioterapia é oferecida após avaliação — converse sobre seu plano (fertilidade primeiro)",
      "Planos de saúde privados também são obrigados a cobrir acompanhamento e procedimentos previstos (decisões da ANS)",
    ],
  },
  {
    title: "Onde buscar ajuda gratuita",
    body: "Se tiver dificuldade ou for discriminada, há apoio gratuito.",
    steps: [
      "Defensoria Pública do seu estado: orientação jurídica gratuita pra retificação e direitos",
      "Núcleos de cidadania LGBTQIA+ / Centros de Referência (muitas cidades têm)",
      "ANTRA (Associação Nacional de Travestis e Transexuais): orientação e rede de apoio",
      "Disque 100 (Direitos Humanos): denúncia de discriminação — transfobia é crime equiparado a racismo (decisão STF 2019)",
    ],
  },
];

export function LegalResources() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
      </div>
      <PathTabs />

      <h2 className="text-nude-warm font-medium mb-2 mt-2">Direitos & documentos no Brasil</h2>
      <DisclaimerCard text="Informação geral pra te orientar — leis e procedimentos podem mudar ou variar por estado. Sempre confirme com a Defensoria Pública (gratuita) ou no cartório local antes de agir. Não é aconselhamento jurídico formal." />

      <div className="space-y-3 mt-3">
        {RESOURCES.map((r) => (
          <details key={r.title} className="card group">
            <summary className="cursor-pointer list-none flex justify-between items-start gap-2">
              <h3 className="text-nude-warm font-medium">{r.title}</h3>
              <span className="text-nude text-xs flex-shrink-0 mt-1">▸</span>
            </summary>
            <p className="text-sm text-muted mt-2">{r.body}</p>
            {r.steps && (
              <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
                {r.steps.map((s) => <li key={s} className="text-nude-warm">{s}</li>)}
              </ol>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

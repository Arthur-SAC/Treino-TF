import { Link } from "react-router-dom";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const GUIDE: GuideSection[] = [
  {
    id: "aterramento",
    title: "Aterramento pra crise (5-4-3-2-1)",
    intro: "Quando a disforia ou a ansiedade apertam, isso traz você pro agora.",
    tips: [
      "5 coisas que você VÊ ao redor — nomeia baixinho.",
      "4 coisas que você OUVE.",
      "3 coisas que você SENTE no corpo (pés no chão, roupa na pele).",
      "2 coisas que você CHEIRA.",
      "1 coisa que você pode PROVAR — ou uma respiração lenta: inspira 4s, segura 4s, expira 6s.",
      "Repete até o pico passar. A crise SEMPRE passa — ela mente quando diz que não.",
    ],
  },
  {
    id: "afirmacoes",
    title: "Lembretes pra quando bater a disforia",
    intro: "Lê devagar. Não precisa acreditar 100% agora — só ler já ajuda.",
    tips: [
      "Você não é 'menos mulher' por estar no começo. A trajetória já começou, e cada passo conta.",
      "O espelho de hoje não é o destino. Corpo, voz e pele estão mudando com o seu trabalho.",
      // Decisão da usuária, não simplificação nossa: chamar isso só de "escolha"
      // apaga a pressão real do ambiente hostil; chamar só de "sobrevivência"
      // apaga a agência dela. As duas são verdade ao mesmo tempo — por isso a
      // frase nomeia as duas, em vez de escolher o lado mais confortável.
      "É escolha sua — feita num ambiente que não te dá muitas. Isso é estratégia, não fracasso.",
      "Sua amada te vê. Você é amada exatamente por quem você é.",
      "Disforia é um sentimento, não um fato sobre o seu valor.",
    ],
  },
  {
    id: "dia-ruim",
    title: "O que fazer num dia ruim",
    intro: "Pequenas coisas que ajudam de verdade.",
    tips: [
      "Faz UMA coisa da rotina (só uma) — skincare, um copo d'água, 5 min de alongamento. Movimento tira do buraco.",
      "Manda mensagem pra alguém de confiança (sua amada, um amigo). Não precisa resolver nada — só não ficar sozinha na cabeça.",
      "Registra no Diário como foi — botar em palavras diminui o peso.",
      "Evita decisões grandes ou impulsivas (cabelo, corpo, transição) num dia ruim. Espera o dia virar.",
      "O básico do corpo muda o básico da cabeça: sol, banho, comida, sono.",
    ],
  },
  {
    id: "rede",
    title: "Rede de apoio (guarda esses)",
    intro: "Você não precisa passar por isso sozinha.",
    tips: [
      "CVV — 188 (ligação gratuita, 24h): apoio emocional sigiloso. Também por chat em cvv.org.br.",
      "ANTRA (Associação Nacional de Travestis e Transexuais): orientação e rede de acolhimento.",
      "Defensoria Pública do seu estado: apoio jurídico gratuito (nome, direitos, discriminação).",
      "Disque 100 (Direitos Humanos): denúncia de transfobia — que é crime (equiparado a racismo, STF 2019).",
      "Risco imediato: 192 (SAMU) ou 190 (polícia). Você merece ajuda agora.",
    ],
  },
];

export function Support() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Apoio</h1>
      </div>

      <DisclaimerCard text="Se você está em risco imediato ou pensando em se machucar, procura ajuda AGORA: CVV 188 (24h, gratuito) ou emergência 192/190. Você não está sozinha." />

      <div className="card my-3 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">
          Dia pesado? Respira. Aqui tem um aterramento rápido, lembretes pra quando a disforia
          bate, o que fazer num dia ruim, e quem procurar. Pega o que você precisar agora.
        </p>
      </div>

      <GuideAccordion sections={GUIDE} />
    </div>
  );
}

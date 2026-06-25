import type { Outfit } from "../lib/db";

export const OUTFITS: Omit<Outfit, "id">[] = [
  // === DISCRETAS (dia a dia) ===
  {
    name: "Trabalho neutro",
    context: "discreto",
    occasion: "trabalho",
    pieces: [
      "Calça de alfaiataria cintura alta (preta)",
      "Camiseta encorpada slim (areia)",
      "Blazer estruturado com leve cintura",
      "Tênis branco minimalista ou mocassim",
      "Esmalte nude",
    ],
    whyItWorks: "Tudo lê como roupa unissex de trabalho, mas o blazer entalhado + cintura alta desenham a silhueta por baixo do radar.",
    silhouetteNote: "Blazer aberto faz duas linhas verticais que afinam e disfarçam a barriga; cintura alta + leve entalhe criam ampulheta sutil.",
    status: "ideia",
  },
  {
    name: "Casual fim de semana",
    context: "discreto",
    occasion: "casual",
    pieces: [
      "Jeans cintura alta reto/wide",
      "Camiseta de caimento (malha que abraça sem marcar)",
      "Jaqueta jeans curta na cintura",
      "Tênis",
      "Anéis + pulseira fina",
    ],
    whyItWorks: "Combo básico que ninguém estranha, mas cada peça empurra pro feminino pela modelagem.",
    silhouetteNote: "Jaqueta curta mantém o foco na cintura; jeans wide alonga e a malha sugere curva sem expor o ventre.",
    status: "ideia",
  },
  {
    name: "Camadas verticais",
    context: "discreto",
    occasion: "casual",
    pieces: [
      "Calça escura cintura alta",
      "Top escuro de caimento",
      "Colete ou cardigã longo aberto",
      "Lenço/echarpe neutro",
      "Tênis",
    ],
    whyItWorks: "Monocromático escuro no centro + camada longa = ilusão de corpo mais longo e fino, totalmente discreto.",
    silhouetteNote: "A coluna escura contínua e a camada aberta criam uma linha vertical que some com a barriga e estreita a silhueta.",
    status: "ideia",
  },
  {
    name: "Monocromático esperto",
    context: "discreto",
    occasion: "sair",
    pieces: [
      "Calça cintura alta marrom/areia",
      "Blusa do mesmo tom com leve gola V",
      "Cardigã curto",
      "Bolsa pequena",
      "Esmalte nude",
    ],
    whyItWorks: "Um tom só da paleta quente alonga o corpo inteiro; a gola V sutil puxa o olhar pra cima.",
    silhouetteNote: "Tom único alonga; gola V + cardigã curto levam o olhar pra cintura e pro rosto, não pra barriga.",
    status: "ideia",
  },
  // === LIVRES (casa / com a noiva) ===
  {
    name: "Noite com a noiva",
    context: "livre",
    occasion: "casa",
    pieces: [
      "Vestido envelope (wrap)",
      "Sutiã balconet",
      "Salto médio",
      "Brincos",
      "Batom",
    ],
    whyItWorks: "Num espaço seguro, dá pra usar a peça que combina todos os truques de ampulheta de uma vez.",
    silhouetteNote: "Decote V + cintura amarrada + saia que abre = ampulheta completa, marcando cintura e disfarçando o ventre no nó.",
    status: "ideia",
  },
  {
    name: "Aconchego sensual em casa",
    context: "livre",
    occasion: "casa",
    pieces: [
      "Robe curto de cetim",
      "Conjunto sutiã + tanga (vinho)",
      "Meia 7/8",
    ],
    whyItWorks: "Ritual de autoimagem em casa, na paleta amazona, sem peso de 'passar despercebido'.",
    silhouetteNote: "O cinto do robe marca a cintura; as peças na cor vinho reforçam a feminilidade do conjunto.",
    status: "ideia",
  },
];

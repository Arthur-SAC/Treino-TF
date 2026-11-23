# Estilo em degraus — design

**Data:** 2026-11-23 · **Pedido dela:** conversas de 2026-11-19 e 2026-11-23 · **Projeto anterior:** rotina em linha do tempo (publicado em 00b9485).

## 1. Intenção, nas palavras dela

> "queria ir mudando meu guardaroupa aos pouco (perfumes seria legal tb) porem sem ir de cara sabe e por conta da academia n queria perder muita roupa então seria tipo o que comprar por fase as cores e tudo mais sabe ? desde acessorios langeries e roupas (lembre que moro em aracaju)"

> "ah eu iria comprar aos poucos mesmo então n tem tanto problema ir devagar tipo um conjunto por mês pra ir experimentando, sobre langerie é o que pega pq moro com meus pais ainda"

> "normalmente coloco na maquina e seca com todas as outras em um varal"

Hoje ela só usa roupa bem masculina e não tem nem calça de cintura alta. Ela quer **um caminho de compra, um conjunto por mês**: o que comprar, em que cor, em que tamanho, onde. A troca precisa ser gradual, segura nos ambientes e caber no corpo que ainda está mudando com a academia.

O app já tem uma seção de estilo (`/beleza/estilo`: Paleta, Peças, Combinações, Looks, Wishlist, guias Público/Casa/Íntimo). Ela fica escondida em Consulta → Beleza → Estilo e é uma vitrine de 40 peças, sem ordem nem orçamento. Isso é o mesmo problema que a rotina tinha ("tudo separado"). Este projeto adiciona **o caminho**: a compra do mês, em degraus. A vitrine continua como consulta.

## 2. O que ela decidiu (2026-11-23)

| Tema | Decisão dela |
|---|---|
| Onde usar primeiro | Em casa **andando pela casa, perto dos pais** ("pra n me preocupar") e nas saídas com a namorada: cinema, comer fora, RPG com amigos, filme em casa. Hoje ela passa mais tempo no trabalho e na rua (cães, academia, resolver coisas). |
| Nível | **Um nível só pra todos os lugares, o mesmo de casa**, inclusive com os amigos ("n me sinto tão confortável com amigos ainda"). Ninguém deve estranhar: feminino no corte, tecido e cor, nunca peça que chame atenção. |
| Orçamento | **R$ 100 por mês** ("é algo importante"). Mês apertado → pula, sem cobrança. |
| Ritmo | **Um conjunto por mês**, "pra ir experimentando". |
| Cores | Gosta de **vermelho**. **Rosa nenhum** (por causa da casa). |
| Perfume | **Doce e floral, leve**, "pra n ficar enjoativo". |
| Lingerie | **Só calcinha por agora.** Sutiã "fica muito nítido" e ela não tem seio; fica pra depois. Calcinha que **achata a frente**: depois, "quando eu tiver usando roupas mais justas". |
| Experiência ruim | Comprou uma calcinha "pra mulheres trans" tamanho **G**: ficou péssima ("eu n ter bunda e ta muito gorda"), ficou desanimada. Diagnóstico meu: o quadril dela é 114 cm (medida de 2026-05), G de calcinha serve ~102–106 cm; e calcinha de compressão enrola embaixo da barriga. **Tamanho é por medida do quadril, não pela letra.** |
| Corpo | Com a postura corrigida a barriga ficou mais visível e isso pesa pra ela. As peças são pro **corpo de agora**, disfarçando a barriga sem apertar. Nada de "comprar pra quando emagrecer". |
| Lavagem | Roupa vai pra máquina e seca num varal comum com a família. Regra (já combinada em 2026-11-19): **o que vai pro varal parece roupa comum; calcinha é lavada à mão no banho e seca no quarto.** |
| Como o app mostra | Ela deixou comigo ("pode seguir"). |

## 3. Paleta dela (das fotos em `imagens/eu`, luz interna)

Pele clara a média, pega sol; subtom provavelmente **neutro puxando pro quente** (a confirmar com o teste do pano branco × off-white e dourado × prateado perto da janela); cabelo castanho quase preto, bem cacheado; olhos castanho-escuros. **Contraste médio-alto.**

- **Base:** preto, off-white, bege areia, caramelo, marrom chocolate.
- **Cor:** vermelho-tijolo, vinho/bordô, vermelho-cereja escuro, verde-oliva, terracota, azul-petróleo, mostarda.
- **Fora:** rosa de qualquer tom (decisão dela), pastel clarinho, neon, vermelho vivo alaranjado.

A paleta inicial do app (`src/data/palette-seed.ts`) está errada pra ela: marca preto como desfavorável e tem "vinho rosado". Atualizar.

## 4. Objetivos

1. **Uma aba própria, "Estilo"**, que abre na **compra do mês**: a peça (ou conjunto) deste mês, por que ela, a cor, o tamanho **calculado pela última medida dela** (quadril pra calcinha/short/calça, cintura quando fizer sentido), faixa de preço, onde costuma ser mais barato (brechó, bazar, Enjoei, promoção de Renner/C&A/Riachuelo, Natura/Boticário pro perfume) e como lavar (máquina e varal, ou à mão e seca no quarto).
2. **Dois botões:** **Comprei** (marca a peça como dela; valor pago opcional) e **Pular este mês** (sem cobrança; a mesma sugestão volta no mês seguinte). Nenhuma contagem de "meses perdidos".
3. **Degraus.** O degrau 1 é o nível de casa, válido em todo lugar. O degrau seguinte só aparece como **aviso "Pronta pra próxima"** com **Aceitar / Agora não**, o mesmo mecanismo da rotina (`src/lib/ofertas.ts`, espera de 7 dias). Nada sobe sozinho.
4. **Meu guarda-roupa:** lista do que ela marcou como comprado, por degrau, com a lavagem de cada uma.
5. **Tamanho sempre pela medida**, com aviso pra conferir a tabela da marca. Quando a medida do quadril ou da cintura mudar ≥ 4 cm desde a compra, a peça ganha uma nota discreta "confira se ainda serve".
6. **Paleta corrigida** (seção 3), com o teste do subtom explicado.

## 5. Conteúdo dos degraus (ponto de partida; o construtor pode ajustar a ordem e os preços)

**Degrau 1 — passa por roupa comum em qualquer lugar.** Ordem sugerida, um item por mês dentro de R$ 100:

1. Short de tecido mole pra casa + camiseta de modelagem menos quadrada, em cor da paleta (terracota, vinho, oliva). Máquina e varal.
2. Hidratante corporal doce/floral leve + 2–3 calcinhas de algodão de cintura alta ou tipo boyshort, em preto/vinho/bege, tamanho pelo quadril. Calcinha à mão.
3. Calça de cintura alta reta ou pantalona de tecido fluido (saídas com a namorada). Máquina e varal.
4. Body splash ou colônia doce/floral leve (Tododia, Cuide-se Bem ou equivalente).
5. Blusa/camisa de tecido que cai, pra usar por fora ou com um nó leve, em vermelho-tijolo ou cereja escuro.
6. Acessórios pequenos e neutros: anel fino, pulseira fina, relógio de pulseira fina, de preferência dourado (confirmar pelo teste).

**Degrau 2 (oferta, depois de ela ter comprado ao menos 4 itens do degrau 1 ou passado 6 meses, o que vier primeiro):** peças com um pouco mais de forma (cintura marcada, malha mais macia), top sem bojo, mais acessórios.

**Degrau 3 (oferta):** roupa mais justa e a calcinha que achata a frente, escolhida pelas medidas da época.

Os degraus 2 e 3 podem ter conteúdo mais curto agora (3–4 itens cada). O importante neste projeto é o degrau 1 completo e o mecanismo.

## 6. Não-objetivos

- Não reescrever as 40 peças, combinações, looks, wishlist nem os guias Público/Casa/Íntimo. Eles continuam acessíveis a partir da aba Estilo, como consulta.
- Não fazer controle financeiro geral (ela disse que o financeiro "é uma bagunça"; isso é outro assunto).
- Não links de loja específicos que quebram; nomes de linha/loja bastam.
- Não mudar números-alvo (`src/lib/objetivo.ts`).

## 7. Anti-objetivos (falha mesmo funcionando)

- Qualquer sugestão de **rosa**, de sutiã agora, ou de peça que chame atenção no degrau 1.
- Sugerir peça "pra quando emagrecer", ou qualquer coisa que soe como cortar comida.
- Cobrança: contador de meses pulados, vermelho de atraso, notificação de compra.
- Rótulo visível que exponha (regra `EXPOE` em `src/lib/discricao.ts`). A aba se chama "Estilo". Calcinha, lingerie e perfume aparecem dentro da tela, nunca em rótulo de aba, notificação ou título que fique na tela inicial do Hoje. Nota: a aba "Íntimo" do `StyleTabs` já casa com `EXPOE`; renomear pra algo neutro.
- Tamanho pela letra da etiqueta em vez da medida.
- Emoji; "enquanto a TRH não vem"; strap-on.

## 8. Restrições do projeto

- Seed mudou → sobe a versão (`STYLE_SEED_VERSION` em `src/lib/style-seed.ts`, e o teste que a prende). Tabela nova no Dexie → nova `db.version()`.
- Dados novos entram no backup (`src/lib/backup-io.ts`), com merge.
- `git push origin main` publica no celular dela → perguntar antes.
- Abas: hoje são 4 (Hoje · Progresso · Consulta · Vitalidade). O Estilo vira a 5ª, como combinado em 2026-11-19. Conferir que cabe na largura do celular.
- Módulos puros pra regra (qual é a sugestão do mês, quando o degrau seguinte vira oferta, qual tamanho pela medida); a tela só apresenta.

## 9. Decisões minhas (pra ela conferir)

1. A aba **Estilo** abre na compra do mês; Paleta, Meu guarda-roupa e a vitrine antiga ficam abaixo, como consulta.
2. O **Hoje** mostra, em "Esta semana", uma linha discreta "Estilo do mês" (sem caixinha, sem cobrança) até ela tocar Comprei ou Pular. Some no resto do mês.
3. "Mês" = mês do calendário.
4. Pular não muda a ordem: o mesmo item volta no mês seguinte.
5. Tabela de tamanho genérica brasileira por quadril (P ~90–94, M ~96–100, G ~102–106, GG ~108–112, XG 114+), sempre com o aviso de conferir a tabela da marca.
6. **Medida usada:** o registro mais recente de `db.measurements` que tenha `hipCm` (ou `waistCm`), mostrando "medida de <data>". Se tiver mais de 60 dias, o card sugere remedir antes de comprar, com link pra tela de medidas; sem nenhuma medida, mostra só o aviso de medir e a tabela genérica.
7. **Oferta de degrau:** módulo puro próprio (`estilo-degraus.ts` ou similar), reaproveitando `ESPERA_RECUSA_DIAS` e o padrão "Agora não". O card de oferta aparece **na aba Estilo**, não na fila do Hoje (o Hoje segue com um aviso por vez, só da rotina).
8. **Os "6 meses"** contam do primeiro "Comprei" ou "Pular" do degrau 1 (gravar essa data quando acontecer).
9. **Ordem:** a sugestão do mês é sempre o primeiro item ainda não comprado do degrau. Ela pode marcar "Já tenho / comprei" em qualquer item da lista do degrau, fora de ordem. Item comprado no mês → o card mostra "Comprado este mês" e a próxima sugestão vem no mês seguinte. Degrau esgotado sem aceitar o seguinte → card diz que o degrau está completo e mostra a oferta (ou, após "Agora não", só o guarda-roupa).
10. **Backup:** compras por item: união, mantendo a data mais antiga; recusas de degrau: mesmo merge de `unirRecusadas`.
11. **Aba "Íntimo" do StyleTabs** vira **"Só seu"**; rotas continuam as mesmas.
12. **Linha no Hoje** diz só "Estilo do mês", nunca o nome do item.
13. **Preço acima de R$ 100:** o item é dividido em dois meses (ex.: item 2 vira calcinhas num mês e hidratante no outro, se não couber). Cada item do seed tem faixa de preço e cabe em R$ 100.

## 10. Deixado pro construtor

- Visual da aba e do card do mês, dentro da paleta clara atual.
- Ícone da aba.
- Se a vitrine antiga entra como link ou como seção recolhida.
- Faixas de preço exatas por item.

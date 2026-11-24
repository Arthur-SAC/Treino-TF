# Estilo em degraus — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma 5ª aba "Estilo" que abre na compra do mês (degrau 1 → 2 → 3), com tamanho pela medida dela, orçamento de R$ 100, Comprei/Pular, guarda-roupa, oferta de degrau Aceitar/Agora não e paleta corrigida; mais uma linha discreta no Hoje.

**Architecture:** Conteúdo estático em `src/data/estilo-degraus-seed.ts` (não vai pro Dexie, então não precisa de versão de seed). Regra num módulo puro `src/lib/estilo-degraus.ts`. Estado dela em `settings` (chaves `estilo*`), com merge no backup. A tela `src/pages/EstiloHome.tsx` só apresenta. A paleta é corrigida por migração (`STYLE_SEED_VERSION` 4 → 5).

**Tech Stack:** React 18 + TS, Dexie (`useSetting`/`useSettingCarregada`, `db.settings.put`), Vitest + Testing Library (happy-dom), react-router.

**Spec:** `docs/superpowers/specs/2026-11-23-estilo-em-degraus-design.md` (seções 2–9, decisões 1–13 da seção 9).

## Global Constraints

- pt-BR, "você", ela/dela, sem emoji, tom direto. Nunca "enquanto a TRH não vem", nunca strap-on, nunca sugerir cortar comida nem peça "pra quando emagrecer".
- Nenhuma sugestão de **rosa** (qualquer tom), de sutiã no degrau 1, ou de peça que chame atenção no degrau 1.
- Rótulo de aba, título do Hoje e qualquer notificação não podem casar com `EXPOE` (`src/lib/discricao.ts`). A aba se chama exatamente **"Estilo"**. A linha do Hoje diz exatamente **"Estilo do mês"**, nunca o nome do item.
- Orçamento: `ORCAMENTO_MES = 100` (reais). Todo item do seed tem `precoMax <= 100`.
- Tamanho sempre pela medida, com o aviso **"Confira a tabela de medidas da marca — cada uma numera de um jeito."**
- Seed do Dexie mudou → sobe `STYLE_SEED_VERSION` e o teste que a prende. Settings novas → backup com merge.
- Números-alvo só em `src/lib/objetivo.ts` (este projeto não usa nenhum).
- `git push origin main` só com o "pode" dela (não faz parte deste plano).
- Módulos de regra são puros (sem `db`, sem `new Date()` dentro; `hoje` entra como parâmetro ISO `YYYY-MM-DD`).

## Review Focus

1. **Virada de mês:** ela tocou "Comprei" em 30/11; em 01/12 o card precisa mostrar a próxima sugestão, não "comprado este mês". → teste em Task 1 (`sugestaoDoMes` com `mesFechado` de outro mês).
2. **Sem medida nenhuma, ou medida de maio (> 60 dias):** o card não pode inventar tamanho sem avisar; mostra a medida com a data e pede pra remedir. → testes em Task 1 (`medidaAtual` null / `velha: true`) e Task 3 (tela sem medidas).
3. **Restaurar backup antigo** não pode apagar compras feitas depois. → teste em Task 2 (união mantendo a data mais antiga).
4. **"Agora não" na oferta de degrau** não pode reaparecer no dia seguinte (espera 7 dias) nem bloquear a compra do mês. → testes em Task 1 e Task 3.
5. **Largura do celular com 5 abas:** rótulos não podem quebrar nem sumir a 360 px. → teste em Task 3 (os 5 rótulos renderizam, `truncate` mantido) e checagem visual no build.

---

### Task 1: Conteúdo dos degraus e regra pura

**Files:**
- Create: `src/data/estilo-degraus-seed.ts`
- Create: `src/lib/estilo-degraus.ts`
- Test: `tests/lib/estilo-degraus.test.ts`, `tests/data/estilo-degraus-seed.test.ts`

**Interfaces:**
- Produces (em `src/data/estilo-degraus-seed.ts`):
  ```ts
  export type Degrau = 1 | 2 | 3;
  export type Lavagem = "maquina" | "mao";
  export type MedidaBase = "quadril" | "cintura" | null;
  export interface ItemEstilo {
    id: string; degrau: Degrau; ordem: number;
    nome: string; praQue: string; cores: string[];
    precoMin: number; precoMax: number; onde: string;
    lavagem: Lavagem; medida: MedidaBase; dica?: string;
  }
  export const ITENS_ESTILO: ItemEstilo[];
  ```
- Produces (em `src/lib/estilo-degraus.ts`):
  ```ts
  export const ORCAMENTO_MES = 100;
  export const DIAS_MEDIDA_VELHA = 60;
  export const DIFERENCA_CONFERIR_CM = 4;
  export const MESES_PRO_PROXIMO_DEGRAU = 6;
  export const COMPRAS_PRO_PROXIMO_DEGRAU = 4;
  export type CompraEstilo = { data: string; valorPago?: number; medidaCm?: number };
  export type ComprasEstilo = Record<string, CompraEstilo>;
  export type MesEstilo = { mes: string; acao: "comprei" | "pulei"; itemId?: string } | null;
  export type EstadoDoMes =
    | { estado: "sugestao"; item: ItemEstilo }
    | { estado: "fechado"; acao: "comprei" | "pulei"; item: ItemEstilo | null }
    | { estado: "degrau-completo" };
  export function mesDe(iso: string): string; // "2026-11-24" -> "2026-11"
  export function itensDoDegrau(d: Degrau): ItemEstilo[]; // ordenados por `ordem`
  export function sugestaoDoMes(e: { hoje: string; degrau: Degrau; compras: ComprasEstilo; mesFechado: MesEstilo }): EstadoDoMes;
  export type OfertaDegrau = { id: "estilo-degrau-2" | "estilo-degrau-3"; para: 2 | 3 };
  export function ofertaDeDegrau(e: { hoje: string; degrau: Degrau; compras: ComprasEstilo; degrauDesde: string | null; recusas: Record<string, string> }): OfertaDegrau | null;
  export type Tamanho = "P" | "M" | "G" | "GG" | "XG";
  export function tamanhoPorQuadril(cm: number): Tamanho;
  export function medidaAtual(ms: Measurement[], campo: "hipCm" | "waistCm", hoje: string): { cm: number; data: string; velha: boolean } | null;
  export function precisaConferir(compra: CompraEstilo, atualCm: number | null): boolean;
  export function unirComprasEstilo(a: ComprasEstilo, b: ComprasEstilo): ComprasEstilo;
  ```
  `Measurement` vem de `src/lib/db.ts` (import de tipo só). `ESPERA_RECUSA_DIAS` vem de `src/lib/ofertas.ts`.

- [ ] **Step 1: Escrever o seed.** Degrau 1, nesta ordem (spec §5 + decisão 13, o item 2 dividido em dois):
  1. `casa-short-camiseta`: short de tecido mole + camiseta de modelagem menos quadrada; cores terracota, vinho, oliva; `maquina`; `medida: "quadril"`.
  2. `calcinhas-algodao`: 2–3 calcinhas de algodão de cintura alta ou tipo boyshort; preto, vinho, bege; `mao`; `"quadril"`; `dica` explica que o cós fica acima da barriga e que tamanho é pela medida, não pela letra.
  3. `hidratante-doce`: hidratante corporal doce/floral leve (almíscar branco, baunilha leve, flor de laranjeira, pêssego); `cores: []`; `medida: null`; `lavagem: "maquina"` (irrelevante; a tela não mostra lavagem quando `medida === null && cores.length === 0`).
  4. `calca-cintura-alta`: calça de cintura alta reta ou pantalona fluida, pras saídas; preto, caramelo, oliva, vinho; `maquina`; `"quadril"`.
  5. `body-splash`: body splash ou colônia doce/floral leve (Tododia, Cuide-se Bem ou equivalente; sentir na loja); `medida: null`.
  6. `blusa-que-cai`: blusa/camisa de tecido que cai, por fora ou com nó leve; vermelho-tijolo, cereja escuro; `maquina`; `"cintura"`.
  7. `acessorios-pequenos`: anel fino, pulseira fina, relógio de pulseira fina, de preferência dourado; `medida: null`.
  Degrau 2 (3 itens): peça com cintura marcada em malha macia; top sem bojo (`mao`); mais acessórios. Degrau 3 (3 itens): peça mais justa; calcinha que achata a frente (`mao`, `"quadril"`, `dica`: escolher pela medida da época); um item de saída. `onde` cita brechó, bazar, Enjoei, promoção de Renner/C&A/Riachuelo, ou Natura/O Boticário pros cheiros. Preços em reais, `precoMax <= 100`.

- [ ] **Step 2: Teste do seed** (`tests/data/estilo-degraus-seed.test.ts`):
  ```ts
  it("todo item cabe no orçamento", () => { for (const i of ITENS_ESTILO) expect(i.precoMax).toBeLessThanOrEqual(100); });
  it("degrau 1 tem 7 itens na ordem da spec", () => expect(ITENS_ESTILO.filter(i => i.degrau === 1).sort((a,b)=>a.ordem-b.ordem).map(i => i.id)).toEqual(["casa-short-camiseta","calcinhas-algodao","hidratante-doce","calca-cintura-alta","body-splash","blusa-que-cai","acessorios-pequenos"]));
  it("nenhum texto sugere rosa, sutiã no degrau 1, emagrecer ou TRH", () => {
    for (const i of ITENS_ESTILO) {
      const t = [i.nome, i.praQue, i.onde, i.dica ?? "", ...i.cores].join(" ");
      expect(t).not.toMatch(/rosa|pink|emagrec|\bTRH\b|enquanto a/i);
      if (i.degrau === 1) expect(t).not.toMatch(/suti[ãa]/i);
    }
  });
  it("ids únicos", () => expect(new Set(ITENS_ESTILO.map(i => i.id)).size).toBe(ITENS_ESTILO.length));
  ```
- [ ] **Step 3: Testes da regra** (`tests/lib/estilo-degraus.test.ts`), com estes casos e valores:
  - `mesDe("2026-11-24") === "2026-11"`.
  - `sugestaoDoMes({hoje:"2026-11-24", degrau:1, compras:{}, mesFechado:null})` → `{estado:"sugestao", item.id:"casa-short-camiseta"}`.
  - Comprou `casa-short-camiseta` e `calca-cintura-alta` (fora de ordem) → sugestão é `calcinhas-algodao`.
  - `mesFechado:{mes:"2026-11", acao:"pulei"}` em `hoje:"2026-11-28"` → `{estado:"fechado", acao:"pulei"}`; mesmo `mesFechado` em `hoje:"2026-12-01"` → volta a ser `sugestao` do mesmo item (Review Focus 1).
  - Todos os 7 do degrau 1 comprados → `{estado:"degrau-completo"}`.
  - `ofertaDeDegrau`: degrau 1 com 3 compras e `degrauDesde:"2026-11-01"`, `hoje:"2026-12-01"` → `null`; com 4 compras → `{id:"estilo-degrau-2", para:2}`; com 0 compras e `degrauDesde:"2026-05-01"`, `hoje:"2026-11-01"` → oferta (6 meses); `degrauDesde:null` e 0 compras → `null`; recusa `{"estilo-degrau-2":"2026-11-20"}` com `hoje:"2026-11-26"` → `null`, com `hoje:"2026-11-27"` → oferta (Review Focus 4); degrau 3 → sempre `null`. No degrau 2 o critério de compras é `min(4, itensDoDegrau(2).length)`.
  - `tamanhoPorQuadril`: 92→"P", 95→"M", 100→"M", 101→"G", 106→"G", 107→"GG", 112→"GG", 113→"XG", 114→"XG".
  - `medidaAtual`: lista vazia → `null`; registros `[{date:"2026-05-13", hipCm:114}, {date:"2026-11-01", weightKg:90}]` com `hoje:"2026-11-24"` → `{cm:114, data:"2026-05-13", velha:true}` (pula o registro sem `hipCm`); `{date:"2026-11-01", hipCm:112}` → `velha:false`.
  - `precisaConferir({data:"x", medidaCm:114}, 110) === true`; `(…,111) === false`; sem `medidaCm` → `false`; `atualCm null` → `false`.
  - `unirComprasEstilo({a:{data:"2026-12-01"}}, {a:{data:"2026-11-10", valorPago:40}, b:{data:"2026-11-12"}})` → `a` com `data:"2026-11-10"` e `valorPago:40`, e `b` presente (Review Focus 3).
- [ ] **Step 4:** `npx vitest run tests/lib/estilo-degraus.test.ts tests/data/estilo-degraus-seed.test.ts` → FAIL (módulos não existem).
- [ ] **Step 5: Implementar** `src/lib/estilo-degraus.ts`. Meses entre datas: diferença em meses do calendário (`degrauDesde` + 6 meses `<= hoje`). Dias pra medida velha e recusa: diferença em dias entre datas ISO, sem fuso (parse como UTC).
- [ ] **Step 6:** mesmos testes → PASS; `npx tsc --noEmit` limpo.
- [ ] **Step 7: Commit** `feat(estilo): degraus e regra da compra do mês`.

### Task 2: Estado nas settings, backup, paleta e "Só seu"

**Files:**
- Modify: `src/lib/settings-helpers.ts` (tipo `Settings` e `DEFAULTS`)
- Modify: `src/lib/backup-io.ts` (merge das chaves novas, no mesmo bloco de `ofertasRecusadas`)
- Modify: `src/data/palette-seed.ts`, `src/lib/style-seed.ts` (`STYLE_SEED_VERSION = 5`)
- Modify: `src/components/StyleTabs.tsx`, `src/components/GarmentCard.tsx`, `src/pages/beauty/style/IntimateView.tsx`, `src/pages/beauty/style/WishlistView.tsx` (rótulo "Íntimo" → "Só seu")
- Test: `tests/lib/estilo-backup.test.ts`, `tests/lib/style-seed-paleta.test.ts`; ajustar `tests/lib/style-seed.test.ts`, `tests/pages/tres-modos.test.tsx`, `tests/pages/vitalidade-hub.test.tsx` se prenderem o texto antigo/versão.

**Interfaces:**
- Consumes: `ComprasEstilo`, `MesEstilo`, `Degrau`, `unirComprasEstilo` (Task 1); `unirRecusadas` (`src/lib/ofertas.ts`).
- Produces (chaves de `Settings`, com estes padrões):
  `estiloCompras: ComprasEstilo = {}`, `estiloMes: MesEstilo = null`, `estiloDegrau: Degrau = 1`, `estiloDegrauDesde: string | null = null`, `estiloRecusas: Record<string,string> = {}`.

- [ ] **Step 1: Testes.**
  - Backup: com `estiloCompras` local `{a:{data:"2026-12-01"}}` e no backup `{a:{data:"2026-11-10"}, b:{data:"2026-11-12"}}`, depois de `restaurarBackup` a chave tem `a.data === "2026-11-10"` e `b`. `estiloRecusas` usa `unirRecusadas` (vale a mais recente). `estiloDegrau` fica com o maior dos dois (save point) e `estiloDegrauDesde` acompanha o degrau que venceu.
  - Paleta: banco com a paleta antiga (`reanalyzed:false`) e `styleSeedVersion` 4 → depois de `seedStyle()`: `favorableColors` contém `"#000000"` e `"#a23b2a"`, `unfavorableColors` contém `"#f4b6c2"`, `subtone === "neutral"`, `contrast === "high"`, `styleSeedVersion === 5`. Com `reanalyzed:true` e `subtone:"cool"`: as cores são trocadas, mas `subtone` continua `"cool"`.
  - `STYLE_SEED_VERSION === 5`.
  - "Só seu": `StyleTabs` renderiza o rótulo "Só seu" e nenhum rótulo de `StyleTabs` casa com `EXPOE`.
- [ ] **Step 2:** rodar os testes novos → FAIL.
- [ ] **Step 3: Implementar.** Paleta nova (`INITIAL_PALETTE`): `subtone:"neutral"`, `contrast:"high"`; favoráveis `#000000` preto, `#f4ecdf` off-white, `#d8c3a5` bege areia, `#a0703c` caramelo, `#4a2c1d` marrom chocolate, `#a23b2a` vermelho-tijolo, `#6d1f2b` vinho, `#8e1b2c` cereja escuro, `#5b6236` oliva, `#c0663f` terracota, `#1f5560` petróleo, `#c9a227` mostarda; desfavoráveis `#f4b6c2` rosa, `#ffd1dc` rosa-bebê, `#fff3b0` amarelo-claro, `#c6f7e2` pastel menta, `#39ff14` neon, `#ff4500` vermelho alaranjado. Migração v5 em `seedStyle()`: atualiza a primeira linha de `db.stylePalette` (cores sempre; `subtone`/`contrast` só se `reanalyzed !== true`); cria se não houver. Comentário de histórico "v5" no topo como os anteriores. Rotas `/beleza/estilo/intimo` não mudam.
- [ ] **Step 4:** `npx vitest run` (suíte inteira) → PASS.
- [ ] **Step 5: Commit** `feat(estilo): estado, backup, paleta dela e aba "Só seu"`.

### Task 3: Aba Estilo

**Files:**
- Create: `src/pages/EstiloHome.tsx`, `src/components/estilo/CompraDoMesCard.tsx`, `src/components/estilo/OfertaDegrauCard.tsx`, `src/components/estilo/GuardaRoupa.tsx`
- Modify: `src/main.tsx` (rota `estilo`), `src/lib/abas.ts` (`Aba` ganha `"estilo"`), `src/components/BottomNav.tsx` (5º item), `src/pages/GuiaHome.tsx` (item "Estilo" aponta pra `/estilo`), ícone novo em `src/icons/` (traço simples, padrão dos outros ícones)
- Test: `tests/pages/estilo-home.test.tsx`; ajustar `tests/components/BottomNav.test.tsx`, `tests/lib/abas.test.ts`

**Interfaces:**
- Consumes: tudo da Task 1; chaves de settings da Task 2 via `useSettingCarregada` (não decidir com o padrão no lugar do valor salvo); `db.measurements` via `useLiveQuery`; `hojeISO()` de `src/lib/today-date.ts`; `ESPERA_RECUSA_DIAS`.
- Produces: rota `/estilo`; `abaDaRota("/estilo") === "estilo"` e `abaDaRota("/beleza/estilo/pecas") === "estilo"`.

- [ ] **Step 1: Testes** (`tests/pages/estilo-home.test.tsx`, com o banco de teste como nos outros testes de página):
  - Sem compras, com medida `{date: <hoje-10 dias>, hipCm:114}`: aparece o nome do item 1, "XG", a data da medida, a faixa "R$ x–y", a lavagem ("máquina e varal"), e o aviso exato da tabela da marca.
  - Medida de maio com hoje em novembro: aparece o pedido de remedir com link pra tela de medidas. Sem medida nenhuma: aparece o pedido de medir e nenhum tamanho (Review Focus 2).
  - Toque em "Comprei": grava `estiloCompras[item.id]` com `data` de hoje e `medidaCm` 114, grava `estiloMes {mes, acao:"comprei", itemId}`, e se `estiloDegrauDesde` era `null` grava hoje; o card passa a "Comprado este mês". Campo de valor pago é opcional.
  - Toque em "Pular este mês": grava `estiloMes {acao:"pulei"}`, mostra "Esse mês fica de fora. A mesma peça volta no mês que vem." e **nenhum** contador de meses pulados aparece.
  - Lista do degrau mostra todos os itens; "Já tenho" num item fora de ordem marca a compra sem fechar o mês.
  - Com 4 compras: aparece o card de oferta do degrau 2 com "Aceitar" e "Agora não". "Aceitar" grava `estiloDegrau 2` e `estiloDegrauDesde` hoje. "Agora não" grava `estiloRecusas["estilo-degrau-2"]` e o card de compra do mês continua lá (Review Focus 4).
  - Guarda-roupa lista o comprado com a lavagem; peça com `medidaCm` 114 e medida atual 109 mostra "Confira se ainda serve".
  - Links pra Paleta (`/beleza/estilo`) e pra vitrine (`/beleza/estilo/pecas`) presentes.
  - BottomNav: os 5 rótulos "Hoje", "Progresso", "Consulta", "Vitalidade", "Estilo" renderizam; nenhum casa com `EXPOE` (Review Focus 5).
- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3: Implementar.** Ordem na tela: oferta de degrau (se houver) → compra do mês → "Seu degrau" (lista com "Já tenho") → guarda-roupa → links (Paleta com o teste do subtom em 3 linhas: pano branco × off-white, dourado × prateado, perto da janela; vitrine antiga). Item com `medida === null` não mostra tamanho. Tela de medidas: usar a rota já existente do app (procurar em `src/main.tsx` a de `Measurements`). Paleta clara atual, sem emoji.
- [ ] **Step 4:** `npx vitest run` → PASS; `npm run build` OK.
- [ ] **Step 5: Commit** `feat(estilo): aba Estilo com a compra do mês`.

### Task 4: Linha no Hoje e documentação

**Files:**
- Modify: `src/pages/Today.tsx` (seção "Esta semana", ~linha 688)
- Modify: `docs/CONTINUAR-AQUI.md` (linha nova na tabela de estado, data 2026-11-24)
- Test: `tests/pages/hoje-estilo-do-mes.test.tsx`

**Interfaces:**
- Consumes: `sugestaoDoMes`, `mesDe` (Task 1); settings `estiloCompras`, `estiloMes`, `estiloDegrau` (Task 2); rota `/estilo` (Task 3).

- [ ] **Step 1: Testes.**
  - Com `estado === "sugestao"`: "Esta semana" mostra um link com texto exato "Estilo do mês" para `/estilo`, sem checkbox, e o texto do link não contém o nome do item.
  - Com `estiloMes` do mês atual (comprei ou pulei): a linha não aparece. Com `degrau-completo`: não aparece.
  - Nenhuma notificação nova é agendada (o agendador não lê chaves `estilo*`).
- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3: Implementar.** A linha aparece mesmo se `semana` da rotina estiver vazia (a seção passa a renderizar quando houver qualquer um dos dois). Visual igual às linhas sem caixinha da linha do tempo.
- [ ] **Step 4:** `npx vitest run` → PASS; `npm run build` OK.
- [ ] **Step 5: Commit** `feat(hoje): linha "Estilo do mês"` (inclui o CONTINUAR-AQUI).

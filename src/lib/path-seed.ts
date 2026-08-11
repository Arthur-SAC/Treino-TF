import { db, type Milestone } from "./db";
import { MILESTONES, BODY_GOAL_MILESTONES, BUST_MILESTONES, VOICE_MILESTONES } from "../data/milestones-seed";
import { ALL_MEAL_PLANS, INITIAL_PLAN } from "../data/meal-plan-seed";

// v8: o plano de déficit passou de 2.200 para 2.300 kcal e as refeições foram
// reescritas. As telas leem do IndexedDB — sem este bump, o aparelho dela
// continuaria servindo o plano antigo enquanto o resto do app cita o novo.
const MEAL_PLAN_VERSION = 8;
const MILESTONE_SEED_VERSION = 7;

const TODOS_OS_MARCOS = [
  ...MILESTONES,
  ...BODY_GOAL_MILESTONES,
  ...BUST_MILESTONES,
  ...VOICE_MILESTONES,
];

/** Identidade de um marco semeado. Ele não tem id estável: o título é tudo o que
 *  existe para reencontrá-lo no banco. Normalizar tira do caminho o que já variou
 *  sem intenção — o símbolo de linha na frente (a migração v6 gravou "◆ " com
 *  espaço, o seed escreve "◆" colado) e a acentuação. Sem isso a v7 não
 *  reconheceria os próprios marcos e gravaria uma segunda cópia ao lado de cada um. */
function chaveMarco(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Renomeações da v7: título antigo → título novo. O roadmap do objetivo físico
 *  foi reescrito com os números reais e quase todo título mudou junto. Cada par
 *  aqui é o MESMO marco com outro nome — sem o mapa, a migração leria cada um
 *  como marco novo, deixaria a linha antiga na tela ao lado da nova e levaria
 *  junto a conclusão que ela porventura já tivesse registrado. */
const RENOMEADOS_V7: ReadonlyArray<readonly [string, string]> = [
  ["◆Fase 1 — Secar barriga + base de glúteo (início)", "◆Fase 1 — Tirar a barriga (início)"],
  ["▣Check-in 3 meses + medir cintura/quadril", "▣Check-in 8-10 semanas — a primeira mudança visível"],
  ["◆Fase 2/3 — Entrar em hipertrofia de glúteo", "◆Fase 2 — Construir glúteo (a balança SOBE)"],
  ["▣Check-in 6 meses — quadril/bunda crescendo", "▣Check-in 18 meses — comparar com a foto de partida"],
  ["▱WHR rumo a 0,75 (cintura fina + quadril cheio)", "▱Cintura 84 — a silhueta vira"],
  ["♡ Busto sem TH — avaliar começar a usar bralette", "♡ Busto sem hormônio — avaliar começar a usar bralette"],
];

/** Marcos que a v7 tira da linha do tempo. Os dois de fertilidade tinham data
 *  inventada numa lista que a própria prosa declara sem data; a "Fase 5" existia
 *  só para pendurar o corpo dela num evento hormonal que não está marcado.
 *  Saem apenas se ela NÃO os tiver concluído: registro de coisa feita é dela, e
 *  apagar isso seria reescrever o que aconteceu, não o plano.
 *
 *  Casam por PREFIXO do título normalizado, e não pelo título inteiro, porque
 *  copiar o título antigo para cá devolveria ao código-fonte exatamente a frase
 *  que esta branch removeu do app — e a varredura de
 *  tests/data/sem-trh-agendada.test.ts acusaria, com razão. O prefixo identifica
 *  a linha sem repetir a promessa.
 *
 *  Prefixo sozinho é largo demais: ela cria marcos livremente pela tela de
 *  Novo Marco, e um marco dela que por acaso começasse com as mesmas palavras
 *  — "Conversa com endocrinologista sobre..." é uma frase plausível de
 *  aparecer de novo, sobre outro assunto — seria apagado em silêncio. Por
 *  isso a `category` do marco de seed que está saindo entra na comparação:
 *  só casa (e só apaga) quem tem o mesmo prefixo E a mesma categoria. */
const REMOVIDOS_V7: ReadonlyArray<{ prefixo: string; category: Milestone["category"] }> = [
  { prefixo: "Conversa com endocrinologista sobre planejamento", category: "fertilidade" },
  { prefixo: "Avaliar congelamento de gametas (criopreservação)", category: "fertilidade" },
  { prefixo: "◆Fase 5 — Manutenção", category: "fisico" },
];

/** Marcos que nascem na v7. A lista existe para a migração distinguir "ela apagou
 *  este marco" de "este marco ainda não existia": tudo o que já estava no seed
 *  antigo e não está mais no banco foi ela que apagou, e ressuscitar desfaria uma
 *  escolha dela. */
const NOVOS_V7: readonly string[] = ["▱Cintura 88 — destrava o superávit"];

/** Só o roadmap do objetivo físico é reprogramado. Esta branch mudou os
 *  horizontes dele — o check-in de 6 meses virou o de 18, a fase 2 saiu do mês 4
 *  para o mês 8 —, então manter a data antiga deixaria o cartão dizendo 18 meses
 *  em cima da data do sexto. Marcos médicos, de voz, de cabelo e de busto não
 *  mudaram de prazo: reprogramá-los só apagaria o atraso que ela precisa ver. */
const REPROGRAMADOS_V7 = new Set(BODY_GOAL_MILESTONES.map((m) => chaveMarco(m.title)));

/** v7 — regrava os marcos semeados com os textos e prazos desta branch.
 *  Preserva `id` e `dateCompleted` (o único estado que a tela deixa ela criar
 *  num marco, além de apagar) e é idempotente: rodar de novo reencontra as
 *  mesmas linhas pelos títulos novos e só reescreve o mesmo conteúdo por cima. */
async function regravaMarcosV7(): Promise<void> {
  const porChave = new Map<string, Milestone>();
  for (const m of await db.milestones.toArray()) {
    const k = chaveMarco(m.title);
    if (!porChave.has(k)) porChave.set(k, m);
  }

  for (const [antigo, novo] of RENOMEADOS_V7) {
    const kAntigo = chaveMarco(antigo);
    const kNovo = chaveMarco(novo);
    const linha = porChave.get(kAntigo);
    if (linha && !porChave.has(kNovo)) {
      porChave.set(kNovo, linha);
      porChave.delete(kAntigo);
    }
  }

  for (const { prefixo, category } of REMOVIDOS_V7) {
    const p = chaveMarco(prefixo);
    for (const [k, linha] of [...porChave]) {
      if (!k.startsWith(p) || linha.category !== category) continue;
      if (linha.id === undefined || linha.dateCompleted) continue;
      await db.milestones.delete(linha.id);
      porChave.delete(k);
    }
  }

  const novos = new Set(NOVOS_V7.map(chaveMarco));
  for (const m of TODOS_OS_MARCOS) {
    const k = chaveMarco(m.title);
    const linha = porChave.get(k);
    if (linha?.id !== undefined) {
      await db.milestones.update(linha.id, {
        title: m.title,
        category: m.category,
        notes: m.notes,
        ...(REPROGRAMADOS_V7.has(k) && !linha.dateCompleted
          ? { datePlanned: m.datePlanned }
          : {}),
      });
    } else if (novos.has(k)) {
      // Cópia, não `m` direto: Dexie grava o `id` gerado de volta no objeto que
      // recebe. `m` vem de TODOS_OS_MARCOS, uma constante de módulo — sem a
      // cópia, o PRIMEIRO id atribuído fica preso ao objeto pro resto da vida
      // do processo, e uma chamada futura de `add` com esse `id` já carimbado
      // tenta gravar numa chave que pode estar ocupada por outra linha.
      await db.milestones.add({ ...m } as never);
    }
  }
}

/** Upsert dos planos por `goal` (déficit/manutenção/superávit): atualiza o que
 *  já existe e adiciona os que faltam, sem duplicar. Idempotente. O déficit é
 *  inserido primeiro, então fica em [0] (retrocompat com quem lê mealPlans[0]). */
async function upsertMealPlans(): Promise<void> {
  const existing = await db.mealPlans.toArray();
  for (const p of ALL_MEAL_PLANS) {
    const match = existing.find((x) => x.goal === p.goal);
    if (match?.id !== undefined) {
      await db.mealPlans.update(match.id, p);
    } else {
      await db.mealPlans.add(p as never);
    }
  }
}

export async function seedPath(): Promise<void> {
  // Seed inicial (marcos + planos) acontece uma vez
  const seeded = await db.settings.get("pathSeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.milestones, db.mealPlans, db.settings], async () => {
      for (const m of TODOS_OS_MARCOS) {
        await db.milestones.add(m as never);
      }
      if ((await db.mealPlans.count()) === 0) {
        await db.mealPlans.add(INITIAL_PLAN as never); // garante déficit em [0]
      }
      await upsertMealPlans();
      await db.settings.put({ key: "pathSeeded", value: true });
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
      await db.settings.put({ key: "mealPlanVersion", value: MEAL_PLAN_VERSION });
    });
  }

  // Migração de marcos por etapas (evita duplicar quem já passou por uma versão):
  // v2 adiciona os marcos do objetivo físico; v3 adiciona o marco de busto;
  // v4 atualiza o marco antigo de "pixie" pro de "transição" (crescimento do cabelo).
  const msVersionSetting = await db.settings.get("milestoneSeedVersion");
  const msVersion = (msVersionSetting?.value as number) ?? 1;
  if (msVersion < MILESTONE_SEED_VERSION) {
    await db.transaction("rw", [db.milestones, db.settings], async () => {
      if (msVersion < 2) {
        for (const m of BODY_GOAL_MILESTONES) await db.milestones.add(m as never);
      }
      if (msVersion < 3) {
        for (const m of BUST_MILESTONES) await db.milestones.add(m as never);
      }
      if (msVersion < 4) {
        // Atualiza o marco antigo de "pixie" pro de crescimento (ou adiciona se faltar).
        const novo = MILESTONES.find((m) => m.title.includes("transição"));
        if (novo) {
          const fisicos = await db.milestones.where("category").equals("fisico").toArray();
          const pixie = fisicos.find((m) => m.title.includes("pixie"));
          if (pixie?.id !== undefined) {
            await db.milestones.update(pixie.id, { title: novo.title, notes: novo.notes });
          } else {
            await db.milestones.add(novo as never);
          }
        }
      }
      if (msVersion < 5) {
        for (const m of VOICE_MILESTONES) await db.milestones.add(m as never);
      }
      if (msVersion < 6) {
        // Troca os emojis antigos dos marcos por símbolos de linha (mesmo
        // esquema dos seeds atualizados). Atualiza os marcos já gravados.
        const EMOJI_MAP: Array<[string, string]> = [
          ["🍑 ", "◆ "],
          ["📸 ", "▣ "],
          ["📏 ", "▱ "],
          ["💇‍♀️ ", "✂ "],
          ["🤍 ", "♡ "],
        ];
        const all = await db.milestones.toArray();
        for (const m of all) {
          let title = m.title;
          for (const [from, to] of EMOJI_MAP) title = title.split(from).join(to);
          if (title !== m.title && m.id !== undefined) {
            await db.milestones.update(m.id, { title });
          }
        }
      }
      if (msVersion < 7) {
        // Sem este bloco, a reescrita inteira dos marcos desta branch existiria
        // só no arquivo: o banco dela continuaria exibindo a "Fase 5" pendurada
        // no hormônio e o déficit de 2.200 kcal. Marco que não chega na tela
        // dela não aconteceu.
        await regravaMarcosV7();
      }
      await db.settings.put({ key: "milestoneSeedVersion", value: MILESTONE_SEED_VERSION });
    });
  }

  // Migração dos planos alimentares — atualiza o déficit e adiciona os planos
  // de manutenção e superávit (planos por fase). Upsert por meta, sem duplicar.
  const versionSetting = await db.settings.get("mealPlanVersion");
  const currentVersion = (versionSetting?.value as number) ?? 1;
  if (currentVersion < MEAL_PLAN_VERSION) {
    await db.transaction("rw", [db.mealPlans, db.settings], async () => {
      await upsertMealPlans();
      await db.settings.put({ key: "mealPlanVersion", value: MEAL_PLAN_VERSION });
    });
  }
}

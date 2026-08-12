import { db } from "./db";
import { EXERCISES } from "../data/exercises-seed";
import { ALL_TEMPLATES } from "../data/all-templates";
import { MEDIDAS_PARTIDA } from "./objetivo";

export async function seedDatabase(): Promise<void> {
  const seeded = await db.settings.get("seeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
      for (const ex of EXERCISES) {
        await db.exercises.put(ex);
      }
      for (const tpl of ALL_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "seeded", value: true });
    });
  }

  // Migration pra contas existentes: marca templates antigos como adaptacao
  // e adiciona os novos ciclos.
  const cyclesSeeded = await db.settings.get("cyclesSeeded");
  if (cyclesSeeded?.value !== true) {
    await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
      // Garante que os novos exercícios estejam presentes (pra contas existentes)
      for (const ex of EXERCISES) {
        const existing = await db.exercises.get(ex.id);
        if (!existing) {
          await db.exercises.put(ex);
        }
      }
      // Marca templates antigos como adaptacao (se não tiverem cycle setado)
      const existing = await db.workoutTemplates.toArray();
      for (const tpl of existing) {
        if (!tpl.cycle) {
          await db.workoutTemplates.update(tpl.id, { cycle: "adaptacao" });
        }
      }
      // Adiciona os novos ciclos (re-gravar os da Adaptação junto é inócuo:
      // mesmo id, mesmo conteúdo do seed)
      for (const tpl of ALL_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "cyclesSeeded", value: true });
    });
  }

  // Re-seed de exercícios: as telas leem do IndexedDB, não do arquivo. Logo,
  // mudanças no conteúdo dos exercícios (nome, equipamento, descrição) só chegam
  // em contas existentes via este bloco. Bumpar EXERCISE_SEED_VERSION força um
  // put() de todos os exercícios — idempotente, não duplica (mesmo id sobrescreve).
  // v8: "Cardio zona 2" deixou de ser um item do fim do treino e passou a
  // descrever a caminhada de 5 km do trabalho para casa — nome, descrição, erros
  // comuns e dicas mudaram junto, e nada disso chega ao aparelho dela sem o bump.
  // v9: dois exercícios novos (carregamento-frontal, prancha-antirrotacao)
  // completam o padrão de força pra levantar a noiva no colo — a dobradiça de
  // quadril já existia, faltava carga à frente do corpo e core antirrotação.
  const EXERCISE_SEED_VERSION = 9;
  const exVersion = await db.settings.get("exerciseSeedVersion");
  if (((exVersion?.value as number) ?? 0) < EXERCISE_SEED_VERSION) {
    await db.transaction("rw", db.exercises, db.settings, async () => {
      for (const ex of EXERCISES) {
        const existing = await db.exercises.get(ex.id);
        await db.exercises.put({
          ...ex,
          videoUrl: existing?.videoUrl ?? ex.videoUrl,
          gifPath: existing?.gifPath ?? ex.gifPath,
        });
      }
      await db.settings.put({ key: "exerciseSeedVersion", value: EXERCISE_SEED_VERSION });
    });
  }

  // Re-seed de templates: mesma lógica. Quando o plano de treino muda (split
  // glúteo-prioritário, novo ciclo de manutenção), bumpar TEMPLATE_SEED_VERSION
  // re-grava todos os templates. put() sobrescreve os de mesmo id e adiciona os
  // novos (manutenção). Idempotente.
  // v10: os ciclos e a Fase de Entrada perderam o bloco de cardio final (ele
  // virou a caminhada do trabalho) e as orientações foram reescritas.
  // v11: o padrão de levantar (agachamento-goblet, carregamento-frontal,
  // prancha-antirrotacao) entrou nos ciclos de variação/hipertrofia/
  // refinamento/manutenção — por troca, não por soma, pra sessão não crescer.
  // v12: o mesmo padrão entrou na ADAPTAÇÃO, que ela alcança em ~3 semanas —
  // sem isso o padrão de levantar só chegaria nela daqui a ~48 sessões. A Fase
  // de Entrada continua de fora de propósito (rampa de exposição).
  const TEMPLATE_SEED_VERSION = 12;
  const tplVersion = await db.settings.get("templateSeedVersion");
  if (((tplVersion?.value as number) ?? 0) < TEMPLATE_SEED_VERSION) {
    await db.transaction("rw", db.workoutTemplates, db.settings, async () => {
      for (const tpl of ALL_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
      await db.settings.put({ key: "templateSeedVersion", value: TEMPLATE_SEED_VERSION });
    });
  }

  // Migração pontual: quem ainda não começou a treinar (nenhuma sessão
  // registrada) entra pela Fase de Entrada em vez da Adaptação, que estreava
  // com hip thrust de barra no primeiro dia.
  const ENTRADA_MIGRATION = 1;
  const migrated = await db.settings.get("entradaMigration");
  if (((migrated?.value as number) ?? 0) < ENTRADA_MIGRATION) {
    const sessoes = await db.workoutSessions.count();
    if (sessoes === 0) {
      await db.settings.put({ key: "activeCycle", value: "entrada-1" });
      await db.settings.put({ key: "cycleStartSessionCount", value: 0 });
    }
    await db.settings.put({ key: "entradaMigration", value: ENTRADA_MIGRATION });
  }

  await seedMedidasPartida();
}

/** Medição real de 13/05/2026, trazida de fora do app. Sem ao menos uma
 *  medição com cintura, `resolveGoal` cai em manutenção para sempre e nenhum
 *  marco de cintura dispara — o app fica inerte por falta de dado. Só semeia
 *  se ela ainda não tiver registrado nada: medição dela sempre vence.
 *
 *  A guarda de fato é a contagem de `db.measurements` (mais forte: cobre até
 *  medição que ela insira manualmente antes deste bloco rodar). A chave
 *  `medidasPartidaSeeded` abaixo não decide nada — é só o registro de
 *  execução, no mesmo estilo dos blocos vizinhos em `seedDatabase`. Ela é
 *  gravada nos dois caminhos (semeou ou não): "este bloco já rodou" é
 *  verdadeiro tanto quando a semeadura aconteceu quanto quando saiu cedo por
 *  já haver medição real — os dois são o mesmo fato para quem só quer saber
 *  se essa migração pontual já foi executada. */
export async function seedMedidasPartida(): Promise<void> {
  // A altura é dado dela igual ao resto, mas não mora em `measurements` — mora
  // em settings. Por isso ela é gravada ANTES da guarda de medição: quem já
  // tinha registrado alguma medida sairia cedo e continuaria com altura 0, e
  // com altura 0 `estimateBodyFatNavy` devolve null enquanto marcos e
  // horizontes afirmam uma % de gordura. "Dado dela sempre vence" continua
  // valendo — o que já estiver gravado não é tocado.
  const altura = await db.settings.get("heightCm");
  if (!altura?.value) {
    await db.settings.put({ key: "heightCm", value: Math.round(MEDIDAS_PARTIDA.alturaM * 100) });
  }

  const jaTem = await db.measurements.count();
  if (jaTem > 0) {
    await db.settings.put({ key: "medidasPartidaSeeded", value: true });
    return;
  }
  await db.measurements.add({
    date: MEDIDAS_PARTIDA.data,
    neckCm: MEDIDAS_PARTIDA.pescocoCm,
    shouldersCm: MEDIDAS_PARTIDA.ombrosCm,
    chestCm: MEDIDAS_PARTIDA.bustoCm,
    waistCm: MEDIDAS_PARTIDA.cinturaCm,
    hipCm: MEDIDAS_PARTIDA.quadrilCm,
    thighLeftCm: MEDIDAS_PARTIDA.coxaCm,
    thighRightCm: MEDIDAS_PARTIDA.coxaCm,
    armCm: MEDIDAS_PARTIDA.bracoCm,
    weightKg: MEDIDAS_PARTIDA.pesoKg,
  });
  await db.settings.put({ key: "medidasPartidaSeeded", value: true });
}

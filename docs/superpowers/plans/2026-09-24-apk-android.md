# APK Android — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Empacotar o app num APK Android (Capacitor), com lembretes agendados no próprio Android que tocam com o app fechado e com o conteúdo web se atualizando sozinho, sem perder nenhum dado na migração do app do Chrome.

**Architecture:** Toda a regra dos lembretes fica em uma função pura (`planejar`), que recebe um retrato do estado (`carregarEstado`, lido do Dexie) e devolve a lista dos próximos 14 dias. Um adaptador fino (`agendar`) entrega essa lista ao `@capacitor/local-notifications`. O mesmo código gera dois builds: o do Pages, como hoje, e o do app (`--mode app`, sem service worker). O `deploy.yml` publica, junto do site, o pacote zip que o `@capgo/capacitor-updater` baixa. O `android.yml` gera o APK assinado.

**Tech Stack:** React 18, TypeScript strict (`verbatimModuleSyntax`), Dexie, Vitest com happy-dom e fake-indexeddb, Vite 5. Novas dependências: Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/app`, `@capacitor/local-notifications`, `@capacitor/filesystem`, `@capacitor/share`) e `@capgo/capacitor-updater`.

**Spec:** `docs/superpowers/specs/2026-09-24-apk-android-design.md`

## Global Constraints

- pt-BR em tudo o que ela lê; pronomes ela/dela; sem emoji; sem "enquanto a TRH não vem".
- Texto de notificação aparece na tela de bloqueio: não pode casar com o regex `EXPOE` de `tests/lib/discricao-rotulos.test.ts`.
- `appName: "Treino"`, `appId: "io.github.arthursac.treino"`.
- Lembretes respeitam `notificationsEnabled`, `quietHours` e `focusModeUntil`.
- Janela de agendamento: de agora até agora + 14 dias.
- Para "que dia é hoje", sempre `hojeISO()`, nunca `toISOString()`.
- O keystore e as senhas nunca entram no repositório (`*.jks`, `*.keystore` no `.gitignore`).
- Seed mudou, sobe a versão. Este plano não muda seed.
- `git push` só com o ok dela, inclusive o push da branch para o CI rodar.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. `git add` com caminhos explícitos; nunca commitar `.claude/settings.local.json`.
- Testes que leem código-fonte usam `import.meta.glob(..., { query: "?raw", import: "default", eager: true })`, porque o tsconfig não tem tipos do Node.

## Review Focus

1. **Microfone e câmera dentro do APK.** A gravação de voz (`getUserMedia`) e as fotos (`<input type=file capture>`) param em silêncio sem `RECORD_AUDIO` e `CAMERA` no `AndroidManifest.xml`. Ela esperaria que tudo o que funcionava no Chrome continuasse funcionando. Na Task 4, um teste lê o manifest e exige as permissões.
2. **Pacote web novo num APK velho.** Se o pacote exige um plugin nativo que o APK instalado não tem, o app quebra. Ela esperaria o aviso de "baixe o APK novo", e não uma tela branca. Na Task 8, um teste garante que com `nativeVersion` maior o pacote não é baixado.
3. **Abrir o app sem internet.** Ela esperaria o app abrir normalmente. Na Task 8, um teste garante que falha de rede não impede o `notifyAppReady` nem lança erro.
4. **Restaurar num aparelho novo em que o seed já rodou.** Ela esperaria ver exatamente as rotinas dela, sem cópias duplicadas. Na Task 1, um teste restaura sobre um banco semeado e confere que não há duplicatas nas tabelas com id automático.
5. **Planejar às 23h, ou com horário dentro do silêncio.** Ela esperaria nenhum lembrete no passado e nenhum durante o silêncio (22h30–06h), inclusive se mudar um horário para dentro dele. Na Task 2, testes cobrem os dois casos.

---

### Task 1: O backup leva tudo o que ela edita

**Files:**
- Modify: `src/lib/backup-io.ts`
- Test: `tests/lib/backup-cobre-tudo.test.ts`

**Interfaces:**
- Produces: `BackupPayload` com os campos opcionais novos `exercises`, `skincareRoutines`, `danceSequences`, `makeupRoutines`. Exporta `TABELAS_SO_SEED: readonly string[]`.

Hoje o backup não leva `exercises` (links de vídeo colados), `skincareRoutines`, `danceSequences` (links) e `makeupRoutines`, e todas essas tabelas a interface edita. `workoutTemplates` e `voiceExercises` são só do seed: nenhuma tela grava nelas.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/backup-cobre-tudo.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { coletarBackup, restaurarBackup, TABELAS_SO_SEED } from "../../src/lib/backup-io";
import { seedDatabase } from "../../src/lib/seed";

// APK (2026-09-24): a migração do app do Chrome pro APK é por backup. Tabela
// que a interface edita e o backup não leva é dado dela perdido na troca.
const NOME_NO_PAYLOAD: Record<string, string> = { workoutSessions: "sessions" };

describe("o backup cobre todas as tabelas", () => {
  it("toda tabela do banco está no backup ou é só do seed (nenhuma tela grava nela)", async () => {
    const payload = (await coletarBackup()) as unknown as Record<string, unknown>;
    const faltando = db.tables
      .map((t) => t.name)
      .filter((n) => !TABELAS_SO_SEED.includes(n))
      .filter((n) => !((NOME_NO_PAYLOAD[n] ?? n) in payload));
    expect(faltando).toEqual([]);
  });

  it("as tabelas só do seed não são gravadas por nenhuma tela", () => {
    const fontes = Object.values(
      import.meta.glob("../../src/{pages,components,hooks}/**/*.tsx", { query: "?raw", import: "default", eager: true }),
    ) as string[];
    for (const t of TABELAS_SO_SEED) {
      const grava = new RegExp(`db\\.${t}\\.(put|add|update|delete|bulk)`);
      expect({ t, grava: fontes.some((f) => grava.test(f)) }).toEqual({ t, grava: false });
    }
  });
});

describe("restaurar num aparelho novo", () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    await seedDatabase();
  });

  it("o link de vídeo que ela colou no exercício volta", async () => {
    const ex = (await db.exercises.toArray())[0];
    await db.exercises.update(ex.id, { videoUrl: "https://youtu.be/dela" });
    const payload = await coletarBackup();
    await db.exercises.update(ex.id, { videoUrl: undefined });
    await restaurarBackup(payload);
    expect((await db.exercises.get(ex.id))?.videoUrl).toBe("https://youtu.be/dela");
  });

  it("rotina de skincare com id automático não duplica ao restaurar sobre o seed", async () => {
    await db.skincareRoutines.add({ name: "Minha rotina", steps: [] } as never);
    const payload = await coletarBackup();
    const antes = await db.skincareRoutines.count();
    await Promise.all(db.tables.map((t) => t.clear()));
    await seedDatabase();
    const { seedBeauty } = await import("../../src/lib/beauty-seed");
    await seedBeauty();
    await restaurarBackup(payload);
    expect(await db.skincareRoutines.count()).toBe(antes);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/backup-cobre-tudo.test.ts`
Expected: FAIL. `TABELAS_SO_SEED` não existe (import undefined), e a lista `faltando` traz `exercises`, `skincareRoutines`, `danceSequences`, `makeupRoutines`, `workoutTemplates` e `voiceExercises`.

- [ ] **Step 3: Implementar**

Em `src/lib/backup-io.ts`:

```ts
/** Tabelas que só o seed escreve: nenhuma tela grava nelas, então o seed do
 *  aparelho novo as recria iguais. O teste backup-cobre-tudo confere isso. */
export const TABELAS_SO_SEED: readonly string[] = ["workoutTemplates", "voiceExercises"];
```

- Em `BackupPayload`, acrescentar `exercises?: unknown[]; skincareRoutines?: unknown[]; danceSequences?: unknown[]; makeupRoutines?: unknown[];`.
- Em `coletarBackup`, acrescentar `exercises: await db.exercises.toArray()`, `skincareRoutines: await db.skincareRoutines.toArray()`, `danceSequences: await db.danceSequences.toArray()` e `makeupRoutines: await db.makeupRoutines.toArray()`.
- Em `restaurarBackup`, acrescentar à lista `semeadas`: `[p.skincareRoutines, db.skincareRoutines]`, `[p.makeupRoutines, db.makeupRoutines]` e `[p.danceSequences, db.danceSequences]`. Depois dos `bulkPut` existentes, acrescentar:

```ts
    await db.exercises.bulkPut((p.exercises ?? []) as never);
    await db.skincareRoutines.bulkPut((p.skincareRoutines ?? []) as never);
    await db.danceSequences.bulkPut((p.danceSequences ?? []) as never);
    await db.makeupRoutines.bulkPut((p.makeupRoutines ?? []) as never);
```

`exercises` não entra em `semeadas`: o id é texto e igual ao do seed, então `bulkPut` sobrescreve sem duplicar, e exercício novo de uma versão mais nova do seed não some.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/backup-cobre-tudo.test.ts tests/lib/backup-io.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup-io.ts tests/lib/backup-cobre-tudo.test.ts
git commit -m "fix(backup): leva links de vídeo e as rotinas editadas — a migração pro APK não perde nada"
```

---

### Task 2: O planejador dos lembretes (função pura)

**Files:**
- Create: `src/lib/lembretes/planejar.ts`
- Modify: `src/lib/settings-helpers.ts` (4 settings novos)
- Test: `tests/lib/lembretes-planejar.test.ts`

**Interfaces:**
- Produces:

```ts
export interface Lembrete { id: number; quando: Date; titulo: string; corpo: string; rota: string }
export interface ConfigLembretes {
  notificationsEnabled: boolean;
  quietHours: { from: string; to: string };
  focusModeUntil: number | null;
  alongamentoManhaTime: string;
  alongamentoNoiteTime: string;
  workoutReminderTime: string;
  dormirReminderTime: string;
  vitaminaDTime: string;
  activeBreakStartHour: number;
  activeBreakEndHour: number;
  activeBreakIntervalMin: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
}
export interface EstadoLembretes {
  feitosHoje: ReadonlySet<string>;      // "alongamento-manha" | "alongamento-noite"
  aguaHojeMl: number;
  treinouHoje: boolean;
  treinoPorDia: ReadonlyMap<number, string>; // dayOfWeek → nome do treino do ciclo ativo
  ultimaMedida: string | null;          // yyyy-mm-dd
  vitaminaDFeitaEm: readonly string[];  // datas com o item vitamina-d marcado
}
export const JANELA_DIAS = 14;
export function planejar(agora: Date, cfg: ConfigLembretes, estado: EstadoLembretes): Lembrete[];
```

- Settings novos (`Settings` e `DEFAULTS`): `alongamentoManhaTime: "06:00"`, `alongamentoNoiteTime: "21:30"`, `dormirReminderTime: "22:00"`, `vitaminaDTime: "12:00"`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/lembretes-planejar.test.ts
import { describe, it, expect } from "vitest";
import { planejar, JANELA_DIAS, type ConfigLembretes, type EstadoLembretes } from "../../src/lib/lembretes/planejar";
import { DEFAULTS } from "../../src/lib/settings-helpers";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { hojeISO } from "../../src/lib/today-date";

const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

const cfg: ConfigLembretes = {
  notificationsEnabled: true,
  quietHours: { from: "22:30", to: "06:00" },
  focusModeUntil: null,
  alongamentoManhaTime: "06:00",
  alongamentoNoiteTime: "21:30",
  workoutReminderTime: "18:15",
  dormirReminderTime: "22:00",
  vitaminaDTime: "12:00",
  activeBreakStartHour: 7,
  activeBreakEndHour: 16,
  activeBreakIntervalMin: 90,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 3000,
};
const vazio: EstadoLembretes = {
  feitosHoje: new Set(), aguaHojeMl: 0, treinouHoje: false,
  treinoPorDia: new Map([[1, "Inferior A"], [3, "Superior A"]]),
  ultimaMedida: "2026-09-24", vitaminaDFeitaEm: [],
};
// Quinta, 24/09/2026, 05:00 (hora local).
const QUINTA_5H = new Date(2026, 8, 24, 5, 0);
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const doDia = (l: ReturnType<typeof planejar>, dia: string) => l.filter((x) => hojeISO(x.quando) === dia);
const titulosDoDia = (l: ReturnType<typeof planejar>, dia: string) => doDia(l, dia).map((x) => `${hhmm(x.quando)} ${x.titulo}`);

describe("planejar — o dia útil", () => {
  it("quinta: alongamentos, água de hora em hora, pausas a cada 90 min, dormir; sem treino (quinta não tem)", () => {
    expect(titulosDoDia(planejar(QUINTA_5H, cfg, vazio), "2026-09-24")).toEqual([
      "06:00 Alongamento",
      "08:00 Água", "08:30 Levanta um pouco", "09:00 Água", "10:00 Água", "10:00 Levanta um pouco",
      "11:00 Água", "11:30 Levanta um pouco", "12:00 Água", "13:00 Água", "13:00 Levanta um pouco",
      "14:00 Água", "14:30 Levanta um pouco", "15:00 Água",
      "21:30 Alongamento", "22:00 Hora de desligar",
    ]);
  });

  it("segunda tem treino às 18h15 com o nome do treino", () => {
    const seg = planejar(QUINTA_5H, cfg, vazio).filter((x) => hojeISO(x.quando) === "2026-09-28" && x.titulo === "Treino");
    expect(seg.map((x) => [hhmm(x.quando), x.corpo])).toEqual([["18:15", "Inferior A"]]);
  });

  it("fim de semana não tem água nem pausa", () => {
    const sab = titulosDoDia(planejar(QUINTA_5H, cfg, vazio), "2026-09-26");
    expect(sab.filter((t) => /Água|Levanta/.test(t))).toEqual([]);
  });
});

describe("planejar — pula o que já foi feito hoje", () => {
  it("alongamento da manhã feito não toca hoje, mas toca amanhã", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, feitosHoje: new Set(["alongamento-manha"]) });
    expect(titulosDoDia(l, "2026-09-24")).not.toContain("06:00 Alongamento");
    expect(titulosDoDia(l, "2026-09-25")).toContain("06:00 Alongamento");
  });
  it("meta de água batida: some a água de hoje, a dos outros dias fica", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, aguaHojeMl: 3000 });
    expect(titulosDoDia(l, "2026-09-24").filter((t) => t.includes("Água"))).toEqual([]);
    expect(titulosDoDia(l, "2026-09-25").filter((t) => t.includes("Água"))).toHaveLength(8);
  });
  it("água de hoje diz quanto já foi; a dos outros dias não inventa número", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, aguaHojeMl: 1200 });
    expect(doDia(l, "2026-09-24").find((x) => x.titulo === "Água")!.corpo).toBe("1200 de 3000 ml");
    expect(doDia(l, "2026-09-25").find((x) => x.titulo === "Água")!.corpo).toBe("Um copo agora");
  });
  it("treinou hoje: o treino de hoje não toca", () => {
    const seg8h = new Date(2026, 8, 28, 8, 0);
    const l = planejar(seg8h, cfg, { ...vazio, treinouHoje: true });
    expect(titulosDoDia(l, "2026-09-28")).not.toContain("18:15 Treino");
  });
});

describe("planejar — medir a cada 2 semanas", () => {
  it("14 dias depois da última medida, às 06:05, e todo dia depois até medir", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: "2026-09-24" });
    const medir = l.filter((x) => x.titulo === "Medidas").map((x) => hojeISO(x.quando));
    expect(medir).toEqual(["2026-10-08"]);
  });
  it("atrasada: todo dia às 06:05 na janela, e abre a tela de medidas", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: "2026-09-01" });
    const medir = l.filter((x) => x.titulo === "Medidas");
    expect(medir).toHaveLength(JANELA_DIAS);
    expect(medir.every((x) => hhmm(x.quando) === "06:05" && x.rota === "/corpo/medidas")).toBe(true);
  });
  it("sem nenhuma medida: começa amanhã se 06:05 de hoje já passou", () => {
    const meioDia = new Date(2026, 8, 24, 12, 0);
    const l = planejar(meioDia, cfg, { ...vazio, ultimaMedida: null });
    expect(hojeISO(l.filter((x) => x.titulo === "Medidas")[0].quando)).toBe("2026-09-25");
  });
});

describe("planejar — vitamina D de domingo", () => {
  it("domingo 12:00", () => {
    const l = planejar(QUINTA_5H, cfg, vazio);
    expect(l.filter((x) => x.titulo === "Vitamina D").map((x) => `${hojeISO(x.quando)} ${hhmm(x.quando)}`))
      .toEqual(["2026-09-27 12:00", "2026-10-04 12:00"]);
  });
  it("tomada na semana (segunda a domingo): o domingo dessa semana não toca", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, vitaminaDFeitaEm: ["2026-09-22"] });
    expect(l.filter((x) => x.titulo === "Vitamina D").map((x) => hojeISO(x.quando))).toEqual(["2026-10-04"]);
  });
});

describe("planejar — respeita as regras do app", () => {
  it("notificações desligadas: nada", () => {
    expect(planejar(QUINTA_5H, { ...cfg, notificationsEnabled: false }, vazio)).toEqual([]);
  });
  it("nada no passado, mesmo planejando às 23h", () => {
    const tarde = new Date(2026, 8, 24, 23, 0);
    expect(planejar(tarde, cfg, vazio).every((x) => x.quando.getTime() > tarde.getTime())).toBe(true);
  });
  it("horário mudado pra dentro do silêncio não toca", () => {
    const l = planejar(QUINTA_5H, { ...cfg, alongamentoManhaTime: "05:30" }, vazio);
    expect(l.filter((x) => x.titulo === "Alongamento" && hhmm(x.quando) === "05:30")).toEqual([]);
  });
  it("modo foco: nada antes do fim do foco", () => {
    const fim = new Date(2026, 8, 24, 12, 0).getTime();
    const l = planejar(QUINTA_5H, { ...cfg, focusModeUntil: fim }, vazio);
    expect(l.every((x) => x.quando.getTime() >= fim)).toBe(true);
  });
  it("janela de 14 dias", () => {
    const l = planejar(QUINTA_5H, cfg, vazio);
    const limite = QUINTA_5H.getTime() + JANELA_DIAS * 86400000;
    expect(l.every((x) => x.quando.getTime() <= limite)).toBe(true);
    expect(l.length).toBeLessThan(400);
  });
  it("ids únicos e estáveis entre dois planejamentos", () => {
    const a = planejar(QUINTA_5H, cfg, vazio);
    const b = planejar(new Date(2026, 8, 24, 5, 30), cfg, vazio);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    const idDe = (l: typeof a, t: string, d: string) => l.find((x) => x.titulo === t && hojeISO(x.quando) === d)!.id;
    expect(idDe(a, "Água", "2026-09-25")).toBe(idDe(b, "Água", "2026-09-25"));
    expect(a.every((x) => Number.isInteger(x.id) && x.id > 0 && x.id < 2 ** 31)).toBe(true);
  });
  it("nenhum texto expõe nada na tela de bloqueio", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: null });
    expect(l.filter((x) => EXPOE.test(`${x.titulo} ${x.corpo}`))).toEqual([]);
  });
});

describe("os padrões batem com os horários do Hoje", () => {
  const itens = buildDayRoutine(1, 1).blocks.flatMap((b) => b.items);
  const hora = (id: string) => itens.find((i) => i.id === id)!.defaultTime!;
  it("alongamentos", () => {
    expect(DEFAULTS.alongamentoManhaTime).toBe(hora("alongamento-manha"));
    expect(DEFAULTS.alongamentoNoiteTime).toBe(hora("alongamento-noite"));
  });
  it("hora de desligar fica fora do silêncio e antes de dormir", () => {
    expect(DEFAULTS.dormirReminderTime < DEFAULTS.quietHours.from).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/lembretes-planejar.test.ts`
Expected: FAIL com "Failed to resolve import ../../src/lib/lembretes/planejar".

- [ ] **Step 3: Implementar**

Em `src/lib/settings-helpers.ts`, acrescentar à interface `Settings`:

```ts
  /** Lembretes do APK (2026-09-24). */
  alongamentoManhaTime: string;
  alongamentoNoiteTime: string;
  dormirReminderTime: string;
  vitaminaDTime: string;
```

E a `DEFAULTS`:

```ts
  alongamentoManhaTime: "06:00",
  alongamentoNoiteTime: "21:30",
  // 22h e não 22h30: às 22h30 o silêncio já começou e engoliria o lembrete.
  dormirReminderTime: "22:00",
  vitaminaDTime: "12:00",
```

Criar `src/lib/lembretes/planejar.ts`:

```ts
// Os lembretes do APK (spec 2026-09-24-apk-android). Puro: recebe o relógio,
// a configuração e um retrato do estado, e devolve tudo o que deve tocar de
// agora até JANELA_DIAS dias. Quem lê o Dexie é estado.ts; quem fala com o
// Android é agendar.ts. Toda a regra mora aqui, e só aqui.
import { isWithinQuietHours } from "../notifications";
import { hojeISO } from "../today-date";

export interface Lembrete { id: number; quando: Date; titulo: string; corpo: string; rota: string }

export interface ConfigLembretes {
  notificationsEnabled: boolean;
  quietHours: { from: string; to: string };
  focusModeUntil: number | null;
  alongamentoManhaTime: string;
  alongamentoNoiteTime: string;
  workoutReminderTime: string;
  dormirReminderTime: string;
  vitaminaDTime: string;
  activeBreakStartHour: number;
  activeBreakEndHour: number;
  activeBreakIntervalMin: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
}

export interface EstadoLembretes {
  feitosHoje: ReadonlySet<string>;
  aguaHojeMl: number;
  treinouHoje: boolean;
  treinoPorDia: ReadonlyMap<number, string>;
  ultimaMedida: string | null;
  vitaminaDFeitaEm: readonly string[];
}

export const JANELA_DIAS = 14;

// Um dígito por tipo, no começo do id: tipo · yyMMdd · sequência (2 dígitos).
// 9 26 09 24 99 = 926092499 < 2^31. Mesmo tipo, dia e sequência dão o mesmo
// id, então reagendar não duplica.
const TIPO = { alongManha: 1, alongNoite: 2, agua: 3, pausa: 4, treino: 5, dormir: 6, medir: 7, vitD: 8 } as const;

function idDe(tipo: number, dia: Date, seq: number): number {
  const yy = dia.getFullYear() % 100;
  return Number(`${tipo}${String(yy).padStart(2, "0")}${String(dia.getMonth() + 1).padStart(2, "0")}${String(dia.getDate()).padStart(2, "0")}${String(seq).padStart(2, "0")}`);
}

function naHora(dia: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m);
}

function minutosNaHora(dia: Date, minutos: number): Date {
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Math.floor(minutos / 60), minutos % 60);
}

function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return hojeISO(new Date(a, m - 1, d + n));
}

export function planejar(agora: Date, cfg: ConfigLembretes, estado: EstadoLembretes): Lembrete[] {
  if (!cfg.notificationsEnabled) return [];
  const hoje = hojeISO(agora);
  const limite = agora.getTime() + JANELA_DIAS * 86400000;
  const saida: Lembrete[] = [];
  const add = (tipo: number, dia: Date, seq: number, quando: Date, titulo: string, corpo: string, rota = "/") =>
    saida.push({ id: idDe(tipo, dia, seq), quando, titulo, corpo, rota });

  const medirDesde = estado.ultimaMedida ? somarDias(estado.ultimaMedida, 14) : somarDias(hoje, 0);

  for (let i = 0; i <= JANELA_DIAS; i++) {
    const dia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    const iso = hojeISO(dia);
    const ehHoje = iso === hoje;
    const dow = dia.getDay();
    const util = dow >= 1 && dow <= 5;

    if (!(ehHoje && estado.feitosHoje.has("alongamento-manha")))
      add(TIPO.alongManha, dia, 0, naHora(dia, cfg.alongamentoManhaTime), "Alongamento", "5 min de manhã");

    if (util) {
      const ini = cfg.activeBreakStartHour * 60;
      const fim = cfg.activeBreakEndHour * 60;
      const bateuAgua = ehHoje && estado.aguaHojeMl >= cfg.hydrationGoalMl;
      if (!bateuAgua) {
        let seq = 0;
        for (let m = ini + cfg.hydrationIntervalMin; m < fim; m += cfg.hydrationIntervalMin) {
          const corpo = ehHoje ? `${estado.aguaHojeMl} de ${cfg.hydrationGoalMl} ml` : "Um copo agora";
          add(TIPO.agua, dia, seq++, minutosNaHora(dia, m), "Água", corpo);
        }
      }
      let seq = 0;
      for (let m = ini + cfg.activeBreakIntervalMin; m < fim; m += cfg.activeBreakIntervalMin) {
        add(TIPO.pausa, dia, seq++, minutosNaHora(dia, m), "Levanta um pouco", "2 min de quadril");
      }
    }

    const treino = estado.treinoPorDia.get(dow);
    if (treino && !(ehHoje && estado.treinouHoje))
      add(TIPO.treino, dia, 0, naHora(dia, cfg.workoutReminderTime), "Treino", treino);

    if (!(ehHoje && estado.feitosHoje.has("alongamento-noite")))
      add(TIPO.alongNoite, dia, 0, naHora(dia, cfg.alongamentoNoiteTime), "Alongamento", "Antes de deitar");

    add(TIPO.dormir, dia, 0, naHora(dia, cfg.dormirReminderTime), "Hora de desligar", "Tela longe, deitar às 22h30");

    if (iso >= medirDesde && estado.ultimaMedida !== iso)
      add(TIPO.medir, dia, 0, naHora(dia, "06:05"), "Medidas", "Em jejum, antes do café", "/corpo/medidas");

    if (dow === 0) {
      const segunda = somarDias(iso, -6);
      const tomou = estado.vitaminaDFeitaEm.some((d) => d >= segunda && d <= iso);
      if (!tomou) add(TIPO.vitD, dia, 0, naHora(dia, cfg.vitaminaDTime), "Vitamina D", "Com uma refeição com gordura");
    }
  }

  return saida
    .filter((l) => l.quando.getTime() > agora.getTime() && l.quando.getTime() <= limite)
    .filter((l) => !isWithinQuietHours(l.quando, cfg.quietHours.from, cfg.quietHours.to))
    .filter((l) => !(cfg.focusModeUntil && l.quando.getTime() < cfg.focusModeUntil))
    .sort((a, b) => a.quando.getTime() - b.quando.getTime() || a.id - b.id);
}
```

Observações para quem implementa:
- A primeira expectativa do teste de quinta tem os lembretes das 10h e 13h em ordem de id (Água, tipo 3, antes de Pausa, tipo 4). O `sort` por id no empate garante isso.
- Se o teste do dia útil discordar em algum horário de pausa ou água, confira a conta contra os padrões (`activeBreakStartHour` 7, `activeBreakEndHour` 16) antes de mexer no teste.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/lembretes-planejar.test.ts`
Expected: PASS em todos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lembretes/planejar.ts src/lib/settings-helpers.ts tests/lib/lembretes-planejar.test.ts
git commit -m "feat(lembretes): planejador puro dos lembretes do APK — 14 dias, pula o que já foi feito"
```

---

### Task 3: O retrato do estado (lê o Dexie)

**Files:**
- Create: `src/lib/lembretes/estado.ts`
- Test: `tests/lib/lembretes-estado.test.ts`

**Interfaces:**
- Consumes: `EstadoLembretes`, `ConfigLembretes` (Task 2); `praticadaHoje` (`src/lib/practice-log-helpers.ts`); `SEQUENCIAS_FLEX` (`src/lib/flex-progression.ts`); `getSetting`.
- Produces: `carregarEstado(agora: Date): Promise<EstadoLembretes>` e `carregarConfig(): Promise<ConfigLembretes>`.

"Feito" usa a mesma regra do Hoje: check marcado **ou** prática concluída de qualquer sequência da trilha (`praticadaHoje` com a trilha inteira). Não duplica a regra; reusa o helper que o Hoje usa.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/lembretes-estado.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { carregarEstado, carregarConfig } from "../../src/lib/lembretes/estado";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const AGORA = new Date(2026, 8, 28, 5, 0); // segunda
beforeEach(async () => {
  await Promise.all([db.routineChecks, db.practiceLogs, db.dailyLog, db.workoutSessions, db.measurements, db.workoutTemplates, db.settings].map((t) => t.clear()));
});

describe("carregarEstado", () => {
  it("alongamento feito pelo check ou pela prática da trilha — a mesma regra do Hoje", async () => {
    await db.routineChecks.put({ date: "2026-09-28", itemId: "alongamento-manha", done: true });
    await db.practiceLogs.add({ date: "2026-09-28", sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true });
    const e = await carregarEstado(AGORA);
    expect([...e.feitosHoje].sort()).toEqual(["alongamento-manha", "alongamento-noite"]);
  });

  it("água, treino de hoje, última medida e vitamina D", async () => {
    await db.dailyLog.put({ date: "2026-09-28", waterMl: 1500, activeBreakCount: 0 });
    await db.workoutSessions.add({ date: "2026-09-28", templateId: "x", exercises: [] });
    await db.measurements.bulkAdd([{ date: "2026-09-10", waistCm: 90 }, { date: "2026-09-24", weightKg: 96 }]);
    await db.routineChecks.bulkPut([
      { date: "2026-09-27", itemId: "vitamina-d", done: true },
      { date: "2026-09-20", itemId: "vitamina-d", done: false },
    ]);
    const e = await carregarEstado(AGORA);
    expect(e.aguaHojeMl).toBe(1500);
    expect(e.treinouHoje).toBe(true);
    expect(e.ultimaMedida).toBe("2026-09-24");
    expect(e.vitaminaDFeitaEm).toEqual(["2026-09-27"]);
  });

  it("treino por dia vem só do ciclo ativo", async () => {
    await db.settings.put({ key: "activeCycle", value: "entrada-1" });
    await db.workoutTemplates.bulkPut([
      { id: "a", name: "Inferior A", dayOfWeek: 1, exercises: [], cycle: "entrada-1" } as never,
      { id: "b", name: "Outro ciclo", dayOfWeek: 2, exercises: [], cycle: "hipertrofia" } as never,
    ]);
    const e = await carregarEstado(AGORA);
    expect([...e.treinoPorDia]).toEqual([[1, "Inferior A"]]);
  });
});

describe("carregarConfig", () => {
  it("usa os padrões quando ela não mudou nada", async () => {
    const c = await carregarConfig();
    expect(c.alongamentoManhaTime).toBe("06:00");
    expect(c.dormirReminderTime).toBe("22:00");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/lembretes-estado.test.ts`
Expected: FAIL com "Failed to resolve import ../../src/lib/lembretes/estado".

- [ ] **Step 3: Implementar**

```ts
// src/lib/lembretes/estado.ts
// Retrato do que o planejador precisa saber, lido do Dexie. "Feito" segue a
// regra do Hoje: check marcado ou prática concluída de qualquer sequência da
// trilha (praticadaHoje com a trilha inteira).
import { db } from "../db";
import { getSetting } from "../settings-helpers";
import { hojeISO, ultimosDiasISO } from "../today-date";
import { praticadaHoje } from "../practice-log-helpers";
import { SEQUENCIAS_FLEX } from "../flex-progression";
import type { ConfigLembretes, EstadoLembretes } from "./planejar";

export async function carregarEstado(agora: Date): Promise<EstadoLembretes> {
  const hoje = hojeISO(agora);
  const checks = await db.routineChecks.where("date").equals(hoje).toArray();
  const marcado = (id: string) => checks.some((c) => c.itemId === id && c.done);
  const praticas = await db.practiceLogs.where("date").equals(hoje).toArray();
  const concluidas = praticas.filter((p) => p.completed);

  const feitosHoje = new Set<string>();
  if (marcado("alongamento-manha") || praticadaHoje(concluidas, SEQUENCIAS_FLEX.manha, hoje)) feitosHoje.add("alongamento-manha");
  if (marcado("alongamento-noite") || praticadaHoje(concluidas, SEQUENCIAS_FLEX.noite, hoje)) feitosHoje.add("alongamento-noite");

  const log = await db.dailyLog.get(hoje);
  const treinouHoje = (await db.workoutSessions.where("date").equals(hoje).count()) > 0;

  const activeCycle = await getSetting("activeCycle");
  const templates = await db.workoutTemplates.toArray();
  const treinoPorDia = new Map<number, string>();
  for (const t of templates) {
    if ((t.cycle ?? "adaptacao") === activeCycle && !treinoPorDia.has(t.dayOfWeek)) treinoPorDia.set(t.dayOfWeek, t.name);
  }

  const datasMedida = (await db.measurements.toArray()).map((m) => m.date).sort();
  const ultimaMedida = datasMedida.length > 0 ? datasMedida[datasMedida.length - 1] : null;

  const ultimos = ultimosDiasISO(hoje, 7);
  const vitD = await db.routineChecks.where("date").anyOf(ultimos).toArray();
  const vitaminaDFeitaEm = vitD.filter((c) => c.itemId === "vitamina-d" && c.done).map((c) => c.date).sort();

  return { feitosHoje, aguaHojeMl: log?.waterMl ?? 0, treinouHoje, treinoPorDia, ultimaMedida, vitaminaDFeitaEm };
}

export async function carregarConfig(): Promise<ConfigLembretes> {
  return {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    quietHours: await getSetting("quietHours"),
    focusModeUntil: await getSetting("focusModeUntil"),
    alongamentoManhaTime: await getSetting("alongamentoManhaTime"),
    alongamentoNoiteTime: await getSetting("alongamentoNoiteTime"),
    workoutReminderTime: await getSetting("workoutReminderTime"),
    dormirReminderTime: await getSetting("dormirReminderTime"),
    vitaminaDTime: await getSetting("vitaminaDTime"),
    activeBreakStartHour: await getSetting("activeBreakStartHour"),
    activeBreakEndHour: await getSetting("activeBreakEndHour"),
    activeBreakIntervalMin: await getSetting("activeBreakIntervalMin"),
    hydrationIntervalMin: await getSetting("hydrationIntervalMin"),
    hydrationGoalMl: await getSetting("hydrationGoalMl"),
  };
}
```

Se `activeCycle` ou `focusModeUntil` tiverem tipo diferente em `Settings` (por exemplo, `focusModeUntil: number` com 0 para "sem foco"), ajuste o tipo em `ConfigLembretes` e trate 0 como "sem foco" no planejador (`cfg.focusModeUntil && ...` já trata). Registre isso como Ruling.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/lembretes-estado.test.ts tests/lib/lembretes-planejar.test.ts && npx tsc -b`
Expected: PASS; tsc sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lembretes/estado.ts tests/lib/lembretes-estado.test.ts
git commit -m "feat(lembretes): retrato do estado a partir do banco, com a regra de feito do Hoje"
```

---

### Task 4: Capacitor, build do app e projeto Android

**Files:**
- Modify: `package.json`, `vite.config.ts`, `.gitignore`
- Create: `capacitor.config.ts`, `src/lib/plataforma.ts`, `src/lib/versao-nativa.ts`, `android/` (gerado), `android/app/src/main/res/drawable/ic_stat_treino.xml`
- Modify: `android/app/src/main/AndroidManifest.xml`, `android/app/build.gradle`
- Test: `tests/lib/app-android.test.ts`

**Interfaces:**
- Produces: `isNativo(): boolean` (`src/lib/plataforma.ts`); `NATIVE_VERSION = 1` (`src/lib/versao-nativa.ts`); `BUNDLE_VERSION: string` (de `import.meta.env.VITE_BUNDLE_VERSION ?? "dev"`, também em `versao-nativa.ts`); script `build:app` que gera `dist-app/`.

- [ ] **Step 1: Instalar dependências**

```bash
npm i @capacitor/core @capacitor/android @capacitor/app @capacitor/local-notifications @capacitor/filesystem @capacitor/share @capgo/capacitor-updater
npm i -D @capacitor/cli
```

Anote no ledger a versão major do Capacitor instalada e a versão de JDK que ela exige (Capacitor 7 exige JDK 21). A Task 9 usa essa versão.

- [ ] **Step 2: Escrever o teste que falha**

```ts
// tests/lib/app-android.test.ts
import { describe, it, expect } from "vitest";

const raw = (glob: Record<string, unknown>) => Object.values(glob)[0] as string;
const MANIFEST = raw(import.meta.glob("../../android/app/src/main/AndroidManifest.xml", { query: "?raw", import: "default", eager: true }));
const CAP = raw(import.meta.glob("../../capacitor.config.ts", { query: "?raw", import: "default", eager: true }));
const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

describe("o APK", () => {
  it("existe o projeto Android", () => {
    expect(MANIFEST).toBeTruthy();
  });
  it("microfone (voz) e câmera (fotos) continuam funcionando dentro do app", () => {
    for (const p of ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS", "CAMERA"]) {
      expect(MANIFEST).toContain(`android.permission.${p}`);
    }
  });
  it("pode notificar e agendar no horário exato", () => {
    for (const p of ["POST_NOTIFICATIONS", "SCHEDULE_EXACT_ALARM", "RECEIVE_BOOT_COMPLETED"]) {
      expect(MANIFEST).toContain(`android.permission.${p}`);
    }
  });
  it("nome neutro e id fixo", () => {
    expect(CAP).toMatch(/appName:\s*"Treino"/);
    expect(CAP).toMatch(/appId:\s*"io\.github\.arthursac\.treino"/);
    expect(CAP).not.toMatch(EXPOE);
  });
  it("o updater não se atualiza sozinho — quem decide é atualizacao.ts", () => {
    expect(CAP).toMatch(/autoUpdate:\s*false/);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run tests/lib/app-android.test.ts`
Expected: FAIL (o manifest e o `capacitor.config.ts` não existem).

- [ ] **Step 4: Build do app no Vite**

Trocar `export default defineConfig({...})` em `vite.config.ts` por uma função do modo. O modo `app` sai sem PWA e com `base: "/"`:

```ts
export default defineConfig(({ mode }) => {
  const app = mode === "app";
  return {
    plugins: [
      react(),
      // Dentro do APK não tem service worker: quem atualiza é o capacitor-updater.
      ...(app ? [] : [VitePWA({ /* bloco atual, sem mudança */ })]),
    ],
    base: app ? "/" : "/Treino-TF/",
    build: app ? { outDir: "dist-app" } : undefined,
    test: { /* bloco atual, sem mudança */ },
  };
});
```

Em `package.json` → `scripts`: `"build:app": "tsc -b && vite build --mode app"`.

Confirme que nada em `src/` importa `virtual:pwa-register` (`grep -rn "virtual:pwa" src` vazio). Se importar, isole atrás de `!isNativo()`.

Run: `npm run build:app && ls dist-app && test ! -f dist-app/sw.js && grep -q 'src="/assets' dist-app/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 5: `plataforma.ts`, `versao-nativa.ts`, `capacitor.config.ts`**

```ts
// src/lib/plataforma.ts
import { Capacitor } from "@capacitor/core";
/** Rodando dentro do APK? No Chrome (PWA) e nos testes, false. */
export const isNativo = (): boolean => Capacitor.isNativePlatform();
```

```ts
// src/lib/versao-nativa.ts
/** Sobe quando muda algo NATIVO (plugin novo, permissão nova): o pacote web
 *  novo não roda num APK velho, e o app pede pra instalar o APK novo. O CI lê
 *  este número (android.yml, deploy.yml) — manter o formato da linha. */
export const NATIVE_VERSION = 1;
/** Versão do pacote web (sha curto do commit, injetado no CI). */
export const BUNDLE_VERSION: string = import.meta.env.VITE_BUNDLE_VERSION ?? "dev";
```

Se o tsc reclamar de `VITE_BUNDLE_VERSION`, declarar em `src/vite-env.d.ts`: `interface ImportMetaEnv { readonly VITE_BUNDLE_VERSION?: string }`.

```ts
// capacitor.config.ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.github.arthursac.treino",
  appName: "Treino",
  webDir: "dist-app",
  plugins: {
    CapacitorUpdater: { autoUpdate: false },
    LocalNotifications: { smallIcon: "ic_stat_treino", iconColor: "#c9a2a0" },
  },
};

export default config;
```

- [ ] **Step 6: Gerar o projeto Android**

```bash
npx cap add android
npx cap sync android
```

Em `android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>`, antes de `<application>`, acrescentar (o que já existir, não duplicar):

```xml
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
```

Criar `android/app/src/main/res/drawable/ic_stat_treino.xml` (ícone branco da barra de status; um círculo simples):

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
    <path android:fillColor="#FFFFFFFF" android:pathData="M12,2a10,10 0 1,0 0,20a10,10 0 1,0 0,-20z" />
</vector>
```

Em `android/app/build.gradle`, dentro de `android { ... }`, a assinatura vem do ambiente (CI) e a versão vem de `-PnativeVersion`:

```gradle
    signingConfigs {
        release {
            if (System.getenv("KEYSTORE_PATH")) {
                storeFile file(System.getenv("KEYSTORE_PATH"))
                storePassword System.getenv("KEYSTORE_PASSWORD")
                keyAlias System.getenv("KEY_ALIAS")
                keyPassword System.getenv("KEY_PASSWORD")
            }
        }
    }
```

No bloco `defaultConfig`, trocar `versionCode 1` por `versionCode ((project.findProperty("nativeVersion") ?: "1") as Integer)` e `versionName "1.0"` por `versionName "1." + (project.findProperty("nativeVersion") ?: "1")`. Em `buildTypes { release { ... } }`, acrescentar `signingConfig signingConfigs.release`.

No `.gitignore`, acrescentar:

```
dist-app/
*.jks
*.keystore
android/app/release/
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npx vitest run tests/lib/app-android.test.ts tests/lib/discricao-rotulos.test.ts && npx tsc -b && npm run build && npm run build:app`
Expected: PASS; os dois builds saem sem erro.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts .gitignore capacitor.config.ts src/lib/plataforma.ts src/lib/versao-nativa.ts android tests/lib/app-android.test.ts
git status --short   # conferir que nenhum .jks nem dist-app entrou
git commit -m "feat(apk): Capacitor, build do app sem service worker e projeto Android com permissões"
```

Se `src/vite-env.d.ts` foi tocado, incluí-lo no `git add`.

---

### Task 5: Agendar no Android e reagendar quando algo muda

**Files:**
- Create: `src/lib/lembretes/agendar.ts`, `src/lib/lembretes/useLembretes.ts`
- Modify: `src/App.tsx`
- Test: `tests/lib/lembretes-agendar.test.ts`, `tests/components/App-lembretes.test.tsx`

**Interfaces:**
- Consumes: `planejar`, `Lembrete` (Task 2); `carregarEstado`, `carregarConfig` (Task 3); `isNativo` (Task 4).
- Produces:

```ts
export interface PluginNotificacoes {
  getPending(): Promise<{ notifications: Array<{ id: number }> }>;
  cancel(o: { notifications: Array<{ id: number }> }): Promise<void>;
  schedule(o: { notifications: Array<{ id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean }; smallIcon?: string; extra: { rota: string } }> }): Promise<unknown>;
}
export async function agendar(lista: Lembrete[], plugin?: PluginNotificacoes): Promise<void>;
export async function reagendar(agora?: Date, plugin?: PluginNotificacoes): Promise<void>;
export function useLembretes(): void; // em App: só faz algo quando isNativo()
```

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/lembretes-agendar.test.ts
import { describe, it, expect, vi } from "vitest";
import { agendar, type PluginNotificacoes } from "../../src/lib/lembretes/agendar";

const fake = (pendentes: number[]) => {
  const p = {
    getPending: vi.fn(async () => ({ notifications: pendentes.map((id) => ({ id })) })),
    cancel: vi.fn(async () => {}),
    schedule: vi.fn(async () => ({})),
  };
  return p as typeof p & PluginNotificacoes;
};

describe("agendar", () => {
  it("cancela os pendentes antes de agendar a lista nova", async () => {
    const p = fake([1, 2]);
    const quando = new Date(2026, 8, 25, 6, 0);
    await agendar([{ id: 125092500, quando, titulo: "Alongamento", corpo: "5 min de manhã", rota: "/" }], p);
    expect(p.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1 }, { id: 2 }] });
    expect(p.cancel.mock.invocationCallOrder[0]).toBeLessThan(p.schedule.mock.invocationCallOrder[0]);
    expect(p.schedule.mock.calls[0][0].notifications[0]).toMatchObject({
      id: 125092500, title: "Alongamento", body: "5 min de manhã", schedule: { at: quando, allowWhileIdle: true }, extra: { rota: "/" },
    });
  });
  it("lista vazia (notificações desligadas) só cancela", async () => {
    const p = fake([7]);
    await agendar([], p);
    expect(p.cancel).toHaveBeenCalled();
    expect(p.schedule).not.toHaveBeenCalled();
  });
  it("sem pendentes não chama cancel", async () => {
    const p = fake([]);
    await agendar([], p);
    expect(p.cancel).not.toHaveBeenCalled();
  });
});
```

```tsx
// tests/components/App-lembretes.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => false }));
const reagendar = vi.fn(async () => {});
vi.mock("../../src/lib/lembretes/agendar", () => ({ reagendar }));

import { useLembretes } from "../../src/lib/lembretes/useLembretes";

describe("useLembretes", () => {
  it("no Chrome (PWA) não agenda nada nativo", () => {
    renderHook(() => useLembretes());
    expect(reagendar).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/lembretes-agendar.test.ts tests/components/App-lembretes.test.tsx`
Expected: FAIL (os módulos não existem).

- [ ] **Step 3: Implementar**

```ts
// src/lib/lembretes/agendar.ts
// Adaptador fino: entrega ao Android a lista do planejador. Todos os
// pendentes do app são lembretes dele, então cancela tudo e agenda de novo;
// o id estável (planejar.ts) evita duplicata mesmo se duas chamadas cruzarem.
import { LocalNotifications } from "@capacitor/local-notifications";
import { planejar, type Lembrete } from "./planejar";
import { carregarConfig, carregarEstado } from "./estado";

export interface PluginNotificacoes {
  getPending(): Promise<{ notifications: Array<{ id: number }> }>;
  cancel(o: { notifications: Array<{ id: number }> }): Promise<void>;
  schedule(o: { notifications: Array<{ id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean }; smallIcon?: string; extra: { rota: string } }> }): Promise<unknown>;
}

const nativo = LocalNotifications as unknown as PluginNotificacoes;

export async function agendar(lista: Lembrete[], plugin: PluginNotificacoes = nativo): Promise<void> {
  const { notifications } = await plugin.getPending();
  if (notifications.length > 0) await plugin.cancel({ notifications: notifications.map((n) => ({ id: n.id })) });
  if (lista.length === 0) return;
  await plugin.schedule({
    notifications: lista.map((l) => ({
      id: l.id, title: l.titulo, body: l.corpo,
      schedule: { at: l.quando, allowWhileIdle: true },
      smallIcon: "ic_stat_treino",
      extra: { rota: l.rota },
    })),
  });
}

export async function reagendar(agora: Date = new Date(), plugin: PluginNotificacoes = nativo): Promise<void> {
  const [cfg, estado] = await Promise.all([carregarConfig(), carregarEstado(agora)]);
  await agendar(planejar(agora, cfg, estado), plugin);
}
```

```ts
// src/lib/lembretes/useLembretes.ts
// Só no APK: reagenda ao abrir, ao voltar pro app e quando muda qualquer
// tabela que o planejador lê (marcar alongamento, beber água, treinar, medir,
// mudar um horário). Debounce de 2 s: marcar três coisas seguidas agenda uma vez.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { liveQuery } from "dexie";
import { App as CapApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { db } from "../db";
import { isNativo } from "../plataforma";
import { reagendar } from "./agendar";

export function useLembretes(): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNativo()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const agendarLogo = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void reagendar().catch(() => {}), 2000);
    };
    const sub = liveQuery(async () => {
      // Conta linhas das tabelas que o planejador lê: qualquer escrita muda o retrato.
      const [a, b, c, d, e, f] = await Promise.all([
        db.routineChecks.toArray(), db.practiceLogs.count(), db.dailyLog.toArray(),
        db.workoutSessions.count(), db.measurements.count(), db.settings.toArray(),
      ]);
      return JSON.stringify([a.length, a.filter((x) => x.done).length, b, c.map((x) => x.waterMl), d, e, f.map((x) => x.value)]);
    }).subscribe({ next: agendarLogo });
    const resume = CapApp.addListener("appStateChange", ({ isActive }) => { if (isActive) agendarLogo(); });
    const toque = LocalNotifications.addListener("localNotificationActionPerformed", (a) => {
      const rota = (a.notification.extra as { rota?: string } | undefined)?.rota;
      if (rota) navigate(rota);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
      void resume.then((h) => h.remove());
      void toque.then((h) => h.remove());
    };
  }, [navigate]);
}
```

Em `src/App.tsx`: chamar `useLembretes()` no componente e só iniciar o agendador antigo fora do APK:

```tsx
  useLembretes();
  useEffect(() => {
    // No APK quem agenda é o Android (useLembretes); o setInterval da página
    // não roda com o app fechado e o `new Notification` não existe no WebView.
    if (isNativo()) return;
    startScheduler();
    return () => stopScheduler();
  }, []);
```

`App` já é renderizado dentro do `RouterProvider` (é elemento de rota com `<Outlet />`), então `useNavigate` funciona.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/lembretes-agendar.test.ts tests/components/App-lembretes.test.tsx && npx tsc -b && npx vitest run`
Expected: PASS; suíte inteira verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lembretes/agendar.ts src/lib/lembretes/useLembretes.ts src/App.tsx tests/lib/lembretes-agendar.test.ts tests/components/App-lembretes.test.tsx
git commit -m "feat(lembretes): o Android agenda; reagenda ao abrir, ao voltar e quando algo muda"
```

---

### Task 6: Permissão no Hoje e os horários em Configurações

**Files:**
- Create: `src/lib/lembretes/permissao.ts`, `src/components/AvisoLembretes.tsx`
- Modify: `src/pages/Today.tsx`, `src/pages/Settings.tsx`
- Test: `tests/components/AvisoLembretes.test.tsx`

**Interfaces:**
- Consumes: `isNativo` (Task 4), `setSetting`, `useSetting`.
- Produces:

```ts
export type EstadoPermissao = "ok" | "sem-notificacao" | "sem-alarme-exato";
export interface PluginPermissao {
  checkPermissions(): Promise<{ display: string }>;
  requestPermissions(): Promise<{ display: string }>;
  checkExactNotificationSetting(): Promise<{ exact_alarm: string }>;
  changeExactNotificationSetting(): Promise<unknown>;
}
export async function estadoPermissao(p?: PluginPermissao): Promise<EstadoPermissao>;
export async function ativarLembretes(p?: PluginPermissao): Promise<EstadoPermissao>; // pede e grava notificationsEnabled
```

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// tests/components/AvisoLembretes.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { db } from "../../src/lib/db";

let nativo = true;
vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => nativo }));
const plugin = {
  checkPermissions: vi.fn(async () => ({ display: "prompt" })),
  requestPermissions: vi.fn(async () => ({ display: "granted" })),
  checkExactNotificationSetting: vi.fn(async () => ({ exact_alarm: "granted" })),
  changeExactNotificationSetting: vi.fn(async () => ({})),
};
vi.mock("@capacitor/local-notifications", () => ({ LocalNotifications: plugin }));

import { AvisoLembretes } from "../../src/components/AvisoLembretes";

beforeEach(async () => {
  nativo = true;
  await db.settings.clear();
});

describe("AvisoLembretes", () => {
  it("no Chrome não aparece", async () => {
    nativo = false;
    const { container } = render(<AvisoLembretes />);
    await new Promise((r) => setTimeout(r, 20));
    expect(container.textContent).toBe("");
  });

  it("sem permissão: botão ativa, pede ao Android e liga os lembretes", async () => {
    render(<AvisoLembretes />);
    fireEvent.click(await screen.findByRole("button", { name: /ativar lembretes/i }));
    await waitFor(async () => expect((await db.settings.get("notificationsEnabled"))?.value).toBe(true));
    expect(plugin.requestPermissions).toHaveBeenCalled();
  });

  it("sem alarme exato: explica e abre o ajuste", async () => {
    plugin.checkPermissions.mockResolvedValueOnce({ display: "granted" });
    plugin.checkExactNotificationSetting.mockResolvedValueOnce({ exact_alarm: "denied" });
    await db.settings.put({ key: "notificationsEnabled", value: true });
    render(<AvisoLembretes />);
    fireEvent.click(await screen.findByRole("button", { name: /permitir horário exato/i }));
    expect(plugin.changeExactNotificationSetting).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/components/AvisoLembretes.test.tsx`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```ts
// src/lib/lembretes/permissao.ts
import { LocalNotifications } from "@capacitor/local-notifications";
import { setSetting } from "../settings-helpers";

export type EstadoPermissao = "ok" | "sem-notificacao" | "sem-alarme-exato";
export interface PluginPermissao {
  checkPermissions(): Promise<{ display: string }>;
  requestPermissions(): Promise<{ display: string }>;
  checkExactNotificationSetting(): Promise<{ exact_alarm: string }>;
  changeExactNotificationSetting(): Promise<unknown>;
}
const nativo = () => LocalNotifications as unknown as PluginPermissao;

export async function estadoPermissao(p: PluginPermissao = nativo()): Promise<EstadoPermissao> {
  if ((await p.checkPermissions()).display !== "granted") return "sem-notificacao";
  if ((await p.checkExactNotificationSetting()).exact_alarm !== "granted") return "sem-alarme-exato";
  return "ok";
}

export async function ativarLembretes(p: PluginPermissao = nativo()): Promise<EstadoPermissao> {
  const r = await p.requestPermissions();
  if (r.display !== "granted") return "sem-notificacao";
  await setSetting("notificationsEnabled", true);
  return estadoPermissao(p);
}
```

```tsx
// src/components/AvisoLembretes.tsx
// Só no APK, só enquanto falta alguma coisa: sem isso os lembretes não tocam
// e nada na tela diria por quê.
import { useEffect, useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativo } from "../lib/plataforma";
import { useSetting } from "../hooks/useSetting";
import { estadoPermissao, ativarLembretes, type EstadoPermissao, type PluginPermissao } from "../lib/lembretes/permissao";

export function AvisoLembretes() {
  const ligadas = useSetting("notificationsEnabled");
  const [estado, setEstado] = useState<EstadoPermissao | null>(null);
  useEffect(() => {
    if (!isNativo()) return;
    void estadoPermissao().then(setEstado).catch(() => setEstado(null));
  }, [ligadas]);

  if (!isNativo() || estado === null) return null;
  if (estado === "ok" && ligadas) return null;

  if (estado === "sem-alarme-exato") {
    return (
      <div className="card border-wine-light mb-3">
        <p className="text-nude-warm text-sm">Os lembretes precisam de horário exato, senão o Android atrasa ou junta.</p>
        <button type="button" className="mt-2 w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
          onClick={() => void (LocalNotifications as unknown as PluginPermissao).changeExactNotificationSetting()}>
          Permitir horário exato
        </button>
      </div>
    );
  }
  return (
    <div className="card border-wine-light mb-3">
      <p className="text-nude-warm text-sm">Os lembretes estão desligados.</p>
      <button type="button" className="mt-2 w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
        onClick={() => void ativarLembretes().then(setEstado)}>
        Ativar lembretes
      </button>
    </div>
  );
}
```

Em `src/pages/Today.tsx`: importar `AvisoLembretes` e renderizar `<AvisoLembretes />` como primeiro filho do container da página, acima do primeiro card.

Em `src/pages/Settings.tsx`:
- `toggleNotifs`: quando `isNativo()`, ao ligar, chamar `ativarLembretes()`; se voltar `"sem-notificacao"`, `setError("O Android bloqueou as notificações do Treino. Ative em Configurações > Apps > Treino > Notificações.")` e não ligar. Fora do APK, manter o código atual.
- Dentro do card "Notificações", acrescentar quatro campos `type="time"`, no mesmo padrão dos existentes: "Alongamento manhã" (`alongamentoManhaTime`), "Alongamento noite" (`alongamentoNoiteTime`), "Hora de desligar" (`dormirReminderTime`) e "Vitamina D (domingo)" (`vitaminaDTime`).
- No card "Sistema", quando `isNativo()`, trocar o parágrafo atual por:

```tsx
<p className="text-muted text-xs">No Poco/Xiaomi: Configurações → Apps → Treino → Economia de bateria: "Sem restrições", e ative "Início automático". Sem isso a HyperOS pode segurar os lembretes.</p>
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/components/AvisoLembretes.test.tsx tests/pages && npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lembretes/permissao.ts src/components/AvisoLembretes.tsx src/pages/Today.tsx src/pages/Settings.tsx tests/components/AvisoLembretes.test.tsx
git commit -m "feat(lembretes): aviso de permissão no Hoje e os horários novos em Configurações"
```

---

### Task 7: Restaurar no primeiro uso e exportar de dentro do APK

**Files:**
- Create: `src/components/RestaurarBackup.tsx`, `src/lib/exportar-arquivo.ts`
- Modify: `src/pages/Settings.tsx`, `src/pages/body/Onboarding.tsx`
- Test: `tests/components/RestaurarBackup.test.tsx`, `tests/lib/exportar-arquivo.test.ts`

**Interfaces:**
- Consumes: `restaurarBackup`, `BackupPayload` (`backup-io`), `decryptBackup` (`src/lib/backup`), `isNativo`.
- Produces: `<RestaurarBackup rotulo?: string onPronto?: () => void />`; `exportarArquivo(nome: string, conteudo: string, deps?): Promise<void>`. No APK usa Filesystem + Share; fora dele, o `<a download>` atual.

O `<a download>` não funciona dentro do WebView do Android: sem isso, depois de migrar ela não teria mais como fazer backup.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/exportar-arquivo.test.ts
import { describe, it, expect, vi } from "vitest";
import { exportarArquivo } from "../../src/lib/exportar-arquivo";

describe("exportarArquivo no APK", () => {
  it("grava no cache e abre o compartilhar do Android", async () => {
    const deps = {
      nativo: true,
      writeFile: vi.fn(async () => ({ uri: "file:///cache/trein.trein-backup" })),
      share: vi.fn(async () => ({})),
    };
    await exportarArquivo("trein.trein-backup", "conteudo", deps);
    expect(deps.writeFile).toHaveBeenCalledWith(expect.objectContaining({ path: "trein.trein-backup", data: "conteudo" }));
    expect(deps.share).toHaveBeenCalledWith(expect.objectContaining({ url: "file:///cache/trein.trein-backup" }));
  });
});
```

```tsx
// tests/components/RestaurarBackup.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const restaurar = vi.fn(async () => {});
vi.mock("../../src/lib/backup-io", () => ({ restaurarBackup: restaurar }));
vi.mock("../../src/lib/backup", () => ({ decryptBackup: vi.fn(async () => ({ measurements: [] })) }));
import { RestaurarBackup } from "../../src/components/RestaurarBackup";

describe("RestaurarBackup", () => {
  it("pede a senha, restaura e avisa quem chamou", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("senha");
    const onPronto = vi.fn();
    render(<RestaurarBackup rotulo="Veio do app do Chrome? Restaurar backup" onPronto={onPronto} />);
    const input = screen.getByLabelText(/restaurar backup/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "b.trein-backup")] } });
    await waitFor(() => expect(onPronto).toHaveBeenCalled());
    expect(restaurar).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/exportar-arquivo.test.ts tests/components/RestaurarBackup.test.tsx`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar**

```ts
// src/lib/exportar-arquivo.ts
// Dentro do APK o <a download> não faz nada (o WebView ignora downloads):
// grava no cache do app e abre o compartilhar do Android (Drive, Arquivos…).
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { isNativo } from "./plataforma";

interface Deps {
  nativo: boolean;
  writeFile: (o: { path: string; data: string; directory: Directory; encoding: Encoding }) => Promise<{ uri: string }>;
  share: (o: { title: string; url: string }) => Promise<unknown>;
}
const padrao = (): Deps => ({
  nativo: isNativo(),
  writeFile: (o) => Filesystem.writeFile(o),
  share: (o) => Share.share(o),
});

export async function exportarArquivo(nome: string, conteudo: string, deps: Deps = padrao()): Promise<void> {
  if (deps.nativo) {
    const { uri } = await deps.writeFile({ path: nome, data: conteudo, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await deps.share({ title: nome, url: uri });
    return;
  }
  const url = URL.createObjectURL(new Blob([conteudo], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}
```

```tsx
// src/components/RestaurarBackup.tsx
import { useState } from "react";
import { restaurarBackup, type BackupPayload } from "../lib/backup-io";
import { decryptBackup } from "../lib/backup";

export function RestaurarBackup({ rotulo = "Importar backup", onPronto }: { rotulo?: string; onPronto?: () => void }) {
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [ocupada, setOcupada] = useState(false);

  async function importar(file: File) {
    setErro(null);
    const senha = prompt("Senha do backup:");
    if (!senha) return;
    setOcupada(true);
    try {
      const payload = await decryptBackup<BackupPayload>(await file.text(), senha);
      await restaurarBackup(payload);
      setOk(true);
      onPronto?.();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na importação (senha errada ou arquivo corrompido?).");
    } finally {
      setOcupada(false);
    }
  }

  return (
    <div>
      <label className="block w-full bg-bg-deep border border-bg-border text-nude-warm text-center rounded-md py-2 text-sm cursor-pointer">
        {ocupada ? "Restaurando…" : rotulo}
        <input type="file" accept=".trein-backup" aria-label={rotulo} className="hidden" disabled={ocupada}
          onChange={(e) => e.target.files?.[0] && void importar(e.target.files[0])} />
      </label>
      {ok && <p className="text-nude text-sm mt-1">Backup importado.</p>}
      {erro && <p className="text-red-300 text-sm mt-1">{erro}</p>}
    </div>
  );
}
```

Em `src/pages/Settings.tsx`:
- Trocar o `<label>… Importar backup …</label>` do card Backup por `<RestaurarBackup />` e apagar a função `importBackup`, que ficou sem uso.
- Em `exportBackup`, trocar as linhas do Blob, `createObjectURL`, `<a>` e `revokeObjectURL` por `await exportarArquivo(\`trein-final-${hojeISO()}.trein-backup\`, encrypted);`.

Em `src/pages/body/Onboarding.tsx`, no topo da página (antes do primeiro passo), acrescentar:

```tsx
<div className="card mb-4">
  <p className="text-muted text-sm mb-2">Já usava o app no navegador? Restaure o backup e continue de onde parou.</p>
  <RestaurarBackup rotulo="Veio do app do Chrome? Restaurar backup" onPronto={() => navigate("/", { replace: true })} />
</div>
```

Se `Onboarding.tsx` ainda não tiver `navigate`, usar `const navigate = useNavigate();`. O backup traz `onboarded: true` nos settings, então o `OnboardingGate` deixa passar.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/exportar-arquivo.test.ts tests/components/RestaurarBackup.test.tsx tests/pages && npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/RestaurarBackup.tsx src/lib/exportar-arquivo.ts src/pages/Settings.tsx src/pages/body/Onboarding.tsx tests/components/RestaurarBackup.test.tsx tests/lib/exportar-arquivo.test.ts
git commit -m "feat(apk): restaurar backup no primeiro uso e exportar pelo compartilhar do Android"
```

---

### Task 8: Atualização automática do conteúdo

**Files:**
- Create: `src/lib/atualizacao.ts`, `src/components/AvisoApkNovo.tsx`
- Modify: `src/main.tsx` (chamar `iniciarAtualizacao()` quando `isNativo()`), `src/pages/Today.tsx`
- Test: `tests/lib/atualizacao.test.ts`

**Interfaces:**
- Consumes: `NATIVE_VERSION`, `BUNDLE_VERSION` (Task 4), `isNativo`.
- Produces:

```ts
export interface Pacote { version: string; url: string; checksum: string; nativeVersion: number }
export interface DepsAtualizacao {
  notifyAppReady(): Promise<unknown>;
  buscarManifesto(): Promise<Pacote>;
  baixar(p: Pacote): Promise<{ id: string }>;
  agendarProxima(id: string): Promise<unknown>;
  versaoNativaInstalada(): Promise<number>;
}
export async function verificarAtualizacao(deps: DepsAtualizacao, versaoAtual: string): Promise<{ apkNovo: boolean }>;
export function iniciarAtualizacao(): void;       // produção: deps reais + publica apkNovo
export function useApkNovo(): boolean;             // useSyncExternalStore
export const URL_MANIFESTO = "https://arthur-sac.github.io/Treino-TF/android/latest.json";
export const URL_RELEASES = "https://github.com/Arthur-SAC/Treino-TF/releases/latest";
```

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/atualizacao.test.ts
import { describe, it, expect, vi } from "vitest";
import { verificarAtualizacao, type DepsAtualizacao } from "../../src/lib/atualizacao";

const deps = (over: Partial<DepsAtualizacao> = {}) => {
  const d = {
    notifyAppReady: vi.fn(async () => ({})),
    buscarManifesto: vi.fn(async () => ({ version: "abc1234", url: "https://x/b.zip", checksum: "f00", nativeVersion: 1 })),
    baixar: vi.fn(async () => ({ id: "b1" })),
    agendarProxima: vi.fn(async () => ({})),
    versaoNativaInstalada: vi.fn(async () => 1),
    ...over,
  };
  return d;
};

describe("verificarAtualizacao", () => {
  it("avisa que abriu bem ANTES de qualquer coisa — é o que impede o rollback", async () => {
    const d = deps();
    await verificarAtualizacao(d, "old0000");
    expect(d.notifyAppReady.mock.invocationCallOrder[0]).toBeLessThan(d.buscarManifesto.mock.invocationCallOrder[0]);
  });
  it("versão nova: baixa com checksum e aplica na próxima abertura", async () => {
    const d = deps();
    expect(await verificarAtualizacao(d, "old0000")).toEqual({ apkNovo: false });
    expect(d.baixar).toHaveBeenCalledWith(expect.objectContaining({ version: "abc1234", checksum: "f00" }));
    expect(d.agendarProxima).toHaveBeenCalledWith("b1");
  });
  it("mesma versão: não baixa", async () => {
    const d = deps();
    await verificarAtualizacao(d, "abc1234");
    expect(d.baixar).not.toHaveBeenCalled();
  });
  it("pacote pede APK mais novo: NÃO baixa e avisa", async () => {
    const d = deps({ buscarManifesto: vi.fn(async () => ({ version: "n", url: "u", checksum: "c", nativeVersion: 2 })) });
    expect(await verificarAtualizacao(d, "old0000")).toEqual({ apkNovo: true });
    expect(d.baixar).not.toHaveBeenCalled();
  });
  it("sem internet: não quebra e o app abriu", async () => {
    const d = deps({ buscarManifesto: vi.fn(async () => { throw new Error("offline"); }) });
    await expect(verificarAtualizacao(d, "old0000")).resolves.toEqual({ apkNovo: false });
    expect(d.notifyAppReady).toHaveBeenCalled();
  });
  it("download falha: não quebra", async () => {
    const d = deps({ baixar: vi.fn(async () => { throw new Error("checksum"); }) });
    await expect(verificarAtualizacao(d, "old0000")).resolves.toEqual({ apkNovo: false });
    expect(d.agendarProxima).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/atualizacao.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```ts
// src/lib/atualizacao.ts
// Atualização do conteúdo do APK sem ela baixar nada (spec 2026-09-24). O
// deploy publica android/latest.json no Pages; o app compara com a própria
// versão, baixa o zip (com checksum) e aplica na próxima abertura. Se o
// pacote novo não chamar notifyAppReady, o plugin volta sozinho pro anterior.
import { useSyncExternalStore } from "react";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { App as CapApp } from "@capacitor/app";
import { BUNDLE_VERSION, NATIVE_VERSION } from "./versao-nativa";

export const URL_MANIFESTO = "https://arthur-sac.github.io/Treino-TF/android/latest.json";
export const URL_RELEASES = "https://github.com/Arthur-SAC/Treino-TF/releases/latest";

export interface Pacote { version: string; url: string; checksum: string; nativeVersion: number }
export interface DepsAtualizacao {
  notifyAppReady(): Promise<unknown>;
  buscarManifesto(): Promise<Pacote>;
  baixar(p: Pacote): Promise<{ id: string }>;
  agendarProxima(id: string): Promise<unknown>;
  versaoNativaInstalada(): Promise<number>;
}

export async function verificarAtualizacao(deps: DepsAtualizacao, versaoAtual: string): Promise<{ apkNovo: boolean }> {
  await deps.notifyAppReady().catch(() => {});
  try {
    const p = await deps.buscarManifesto();
    if (p.nativeVersion > (await deps.versaoNativaInstalada())) return { apkNovo: true };
    if (p.version === versaoAtual) return { apkNovo: false };
    const { id } = await deps.baixar(p);
    await deps.agendarProxima(id);
  } catch {
    // Sem internet ou pacote ruim: o app segue na versão que já roda.
  }
  return { apkNovo: false };
}

let apkNovo = false;
const ouvintes = new Set<() => void>();
export function useApkNovo(): boolean {
  return useSyncExternalStore((cb) => { ouvintes.add(cb); return () => ouvintes.delete(cb); }, () => apkNovo);
}

export function iniciarAtualizacao(): void {
  const deps: DepsAtualizacao = {
    notifyAppReady: () => CapacitorUpdater.notifyAppReady(),
    buscarManifesto: async () => (await fetch(`${URL_MANIFESTO}?t=${Date.now()}`, { cache: "no-store" })).json(),
    baixar: (p) => CapacitorUpdater.download({ url: p.url, version: p.version, checksum: p.checksum }),
    agendarProxima: (id) => CapacitorUpdater.next({ id }),
    versaoNativaInstalada: async () => Number((await CapApp.getInfo()).build) || NATIVE_VERSION,
  };
  void verificarAtualizacao(deps, BUNDLE_VERSION).then((r) => {
    apkNovo = r.apkNovo;
    ouvintes.forEach((f) => f());
  });
}
```

Confira a assinatura de `CapacitorUpdater.download` na versão instalada (`node_modules/@capgo/capacitor-updater/dist/esm/definitions.d.ts`): o campo pode se chamar `checksum`, e o algoritmo pode ser SHA-256 ou CRC32, conforme a versão. A Task 9 gera o checksum no mesmo algoritmo. Registre no ledger qual é.

```tsx
// src/components/AvisoApkNovo.tsx
import { useApkNovo, URL_RELEASES } from "../lib/atualizacao";

export function AvisoApkNovo() {
  if (!useApkNovo()) return null;
  return (
    <a href={URL_RELEASES} target="_blank" rel="noreferrer" className="card block border-wine-light mb-3">
      <p className="text-nude-warm text-sm">Tem versão nova do app para instalar.</p>
      <p className="text-muted text-xs mt-1">Baixe o APK e instale por cima — seus dados ficam.</p>
    </a>
  );
}
```

Em `src/main.tsx`, antes do `createRoot(...).render(...)`: `if (isNativo()) iniciarAtualizacao();`. Em `src/pages/Today.tsx`, `<AvisoApkNovo />` logo abaixo de `<AvisoLembretes />`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/atualizacao.test.ts && npx tsc -b && npx vitest run`
Expected: PASS; suíte verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/atualizacao.ts src/components/AvisoApkNovo.tsx src/main.tsx src/pages/Today.tsx tests/lib/atualizacao.test.ts
git commit -m "feat(apk): o conteúdo se atualiza sozinho; APK velho demais avisa em vez de quebrar"
```

---

### Task 9: CI (pacote de atualização e APK assinado) e chave de assinatura

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `.github/workflows/android.yml`
- Test: `tests/lib/ci-android.test.ts`

**Interfaces:**
- Consumes: `NATIVE_VERSION` (linha `export const NATIVE_VERSION = N;`), scripts `build`/`build:app`, `URL_MANIFESTO` (o caminho `android/latest.json` sob o Pages).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/ci-android.test.ts
import { describe, it, expect } from "vitest";

const raw = (g: Record<string, unknown>) => (Object.values(g)[0] as string | undefined) ?? "";
const DEPLOY = raw(import.meta.glob("../../.github/workflows/deploy.yml", { query: "?raw", import: "default", eager: true }));
const ANDROID = raw(import.meta.glob("../../.github/workflows/android.yml", { query: "?raw", import: "default", eager: true }));
const VERSAO = raw(import.meta.glob("../../src/lib/versao-nativa.ts", { query: "?raw", import: "default", eager: true }));

describe("CI do APK", () => {
  it("o deploy publica o pacote e o latest.json no caminho que o app busca", () => {
    expect(DEPLOY).toMatch(/build:app/);
    expect(DEPLOY).toMatch(/dist\/android\/latest\.json/);
    expect(DEPLOY).toMatch(/VITE_BUNDLE_VERSION/);
  });
  it("o CI lê a versão nativa do mesmo arquivo que o app", () => {
    expect(VERSAO).toMatch(/^export const NATIVE_VERSION = \d+;$/m);
    expect(DEPLOY).toMatch(/versao-nativa\.ts/);
    expect(ANDROID).toMatch(/versao-nativa\.ts/);
  });
  it("o APK é assinado pelos secrets, nunca por arquivo do repositório", () => {
    expect(ANDROID).toMatch(/secrets\.KEYSTORE_BASE64/);
    expect(ANDROID).toMatch(/assembleRelease/);
    expect(ANDROID).not.toMatch(/\.jks["']?\s*$/m);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/ci-android.test.ts`
Expected: FAIL (o deploy não tem `build:app` e o `android.yml` não existe).

- [ ] **Step 3: `deploy.yml`**

No job `build`, trocar `- run: npm run build` por o bloco abaixo. O app compara `latest.version` com `BUNDLE_VERSION`, então os dois lados usam o mesmo sha curto:

```yaml
      - run: echo "VITE_BUNDLE_VERSION=${GITHUB_SHA::7}" >> "$GITHUB_ENV"
      - run: npm run build
      - run: npm run build:app
      - name: Pacote de atualização do APK
        run: |
          NATIVA=$(grep -oP '^export const NATIVE_VERSION = \K\d+' src/lib/versao-nativa.ts)
          mkdir -p dist/android
          (cd dist-app && zip -qr "../dist/android/bundle-$VITE_BUNDLE_VERSION.zip" .)
          SOMA=$(sha256sum "dist/android/bundle-$VITE_BUNDLE_VERSION.zip" | cut -d' ' -f1)
          URL="https://arthur-sac.github.io/Treino-TF/android/bundle-$VITE_BUNDLE_VERSION.zip"
          printf '{"version":"%s","url":"%s","checksum":"%s","nativeVersion":%s}\n' "$VITE_BUNDLE_VERSION" "$URL" "$SOMA" "$NATIVA" > dist/android/latest.json
          cat dist/android/latest.json
```

Se a Task 8 registrou CRC32 como algoritmo do checksum, trocar `sha256sum` pelo cálculo correspondente.

- [ ] **Step 4: `android.yml`**

```yaml
name: APK Android

on:
  workflow_dispatch:
  push:
    branches: [main, feat/apk-android]
    paths:
      - "android/**"
      - "capacitor.config.ts"
      - "src/lib/versao-nativa.ts"
      - "package.json"
      - ".github/workflows/android.yml"

permissions:
  contents: write

jobs:
  apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - uses: android-actions/setup-android@v3
      - run: npm ci
      - run: echo "VITE_BUNDLE_VERSION=${GITHUB_SHA::7}" >> "$GITHUB_ENV"
      - run: npm run build:app
      - run: npx cap sync android
      - name: Chave de assinatura
        run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > "$RUNNER_TEMP/treino.keystore"
      - name: Gerar APK assinado
        working-directory: android
        env:
          KEYSTORE_PATH: ${{ runner.temp }}/treino.keystore
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: |
          NATIVA=$(grep -oP '^export const NATIVE_VERSION = \K\d+' ../src/lib/versao-nativa.ts)
          echo "NATIVA=$NATIVA" >> "$GITHUB_ENV"
          chmod +x gradlew
          ./gradlew assembleRelease -PnativeVersion="$NATIVA"
          cp app/build/outputs/apk/release/app-release.apk "$RUNNER_TEMP/Treino.apk"
      - uses: actions/upload-artifact@v4
        with:
          name: Treino-apk
          path: ${{ runner.temp }}/Treino.apk
      - name: Release (só da main)
        if: github.ref == 'refs/heads/main'
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          TAG="apk-v$NATIVA"
          gh release view "$TAG" >/dev/null 2>&1 && gh release upload "$TAG" "$RUNNER_TEMP/Treino.apk" --clobber \
            || gh release create "$TAG" "$RUNNER_TEMP/Treino.apk" --title "Treino (app) v$NATIVA" --notes "Instale por cima: os dados ficam."
```

Se a Task 4 registrou outra versão de JDK exigida, ajuste `java-version`.

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run tests/lib/ci-android.test.ts`
Expected: PASS.

- [ ] **Step 6: Gerar a chave de assinatura (fora do repositório)**

```bash
mkdir -p "/c/Users/ASCalderon/Documents/treino-chave-apk"
SENHA=$(python -c "import secrets; print(secrets.token_urlsafe(24))")
keytool -genkeypair -v -keystore "/c/Users/ASCalderon/Documents/treino-chave-apk/treino.keystore" \
  -alias treino -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12 \
  -storepass "$SENHA" -keypass "$SENHA" -dname "CN=Treino"
printf 'alias: treino\nsenha (loja e chave): %s\n\nGuarde esta pasta fora do GitHub (pen drive, Drive). Sem ela, o APK não atualiza por cima.\n' "$SENHA" \
  > "/c/Users/ASCalderon/Documents/treino-chave-apk/LEIA-ME.txt"
```

Expected: o arquivo `treino.keystore` e o `LEIA-ME.txt` existem na pasta. Nada disso entra no repositório: `git status` não mostra os arquivos.

- [ ] **Step 7: PARAR e pedir a ela** (ação externa)

Pedir o ok para:
1. cadastrar os 4 secrets no GitHub com `gh secret set`: `KEYSTORE_BASE64` (do `base64 -w0` do keystore), `KEYSTORE_PASSWORD`, `KEY_PASSWORD` (a mesma senha) e `KEY_ALIAS` (`treino`);
2. fazer push da branch `feat/apk-android`, para o `android.yml` gerar o APK de teste como artifact.

Só continuar com o ok dela.

- [ ] **Step 8: Commit**

```bash
git add .github/workflows/deploy.yml .github/workflows/android.yml tests/lib/ci-android.test.ts
git commit -m "ci(apk): o deploy publica o pacote de atualização; o android.yml gera o APK assinado"
```

---

### Task 10: Verificar o APK no CI e documentar a migração

**Files:**
- Create: `docs/APK.md`
- Modify: `docs/CONTINUAR-AQUI.md`

- [ ] **Step 1: Com o ok dela, push da branch e acompanhamento do CI**

```bash
git push -u origin feat/apk-android
gh run watch "$(gh run list --workflow android.yml --branch feat/apk-android --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
```

Expected: o job `apk` termina verde e o artifact `Treino-apk` existe. Se falhar, ler o log (`gh run view --log-failed`), corrigir e repetir. Erro comum: versão de JDK ou do Gradle diferente da exigida pelo Capacitor instalado.

- [ ] **Step 2: Escrever `docs/APK.md`** (para ela, em pt-BR, passo a passo)

Conteúdo:
1. **Antes de trocar:** no app do Chrome, Configurações → Exportar backup. Anote a senha.
2. **Baixar:** em `https://github.com/Arthur-SAC/Treino-TF/releases/latest`, o arquivo `Treino.apk`.
3. **Instalar no Poco:** ao abrir o APK, a HyperOS pede para permitir "instalar apps desconhecidos" para o navegador ou o gerenciador de arquivos. Permita só para esse app.
4. **Primeira abertura:** "Veio do app do Chrome? Restaurar backup". Escolha o arquivo e digite a senha.
5. **Lembretes:** no Hoje, "Ativar lembretes"; se aparecer, "Permitir horário exato". Depois, em Configurações → Apps → Treino: Economia de bateria "Sem restrições" e "Início automático" ligado.
6. **Teste:** feche o app. O próximo lembrete da tabela deve tocar.
7. **Atualizações:** chegam sozinhas ao abrir o app, e valem na abertura seguinte. Se aparecer "Tem versão nova do app para instalar", baixe o APK e instale por cima: os dados ficam.
8. **A chave:** a pasta `Documentos\treino-chave-apk` guarda a assinatura do app. Copie para um pen drive ou para o Drive.
9. **O app do Chrome** pode ser desinstalado depois que você conferir que está tudo no APK.

- [ ] **Step 3: Atualizar `docs/CONTINUAR-AQUI.md`**

Acrescentar uma linha na tabela de estado ("APK Android · lembretes nativos · atualização automática", apontando este plano) e registrar as regras novas:
- mudança nativa (plugin ou permissão) sobe `NATIVE_VERSION`;
- lembrete novo entra em `planejar.ts`, com teste de discrição;
- o keystore mora fora do repositório.

- [ ] **Step 4: Suíte, tipos e builds**

Run: `npx tsc -b && npx vitest run && npm run build && npm run build:app`
Expected: tudo verde.

- [ ] **Step 5: Commit**

```bash
git add docs/APK.md docs/CONTINUAR-AQUI.md
git commit -m "docs(apk): passo a passo da migração pro APK e as regras novas"
```

O merge na main publica o site com o pacote de atualização e cria a Release do APK. **Só com o ok dela** (CLAUDE.md: push na main publica no celular dela).

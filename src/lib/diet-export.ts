import type { Meal, MealPlan } from "./db";
import type { ShoppingItem } from "./shopping-list";

/** Termos que NUNCA podem aparecer no export compartilhável. */
export const FORBIDDEN_TERMS = [
  "transi", "mtf", "feminiz", "amazona", "trein-final", "trein final",
  "hormô", "hormo", "trh", "estrog", "glúteo", "gluteo", "cintura fina",
  "feminino", "mulher",
];

/**
 * Runtime privacy guard. Checks `text` against FORBIDDEN_TERMS (case-insensitive).
 * Throws if any term is found; otherwise returns the original text unchanged.
 */
export function assertNeutral(text: string): string {
  const lower = text.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      throw new Error(`diet export leaked a forbidden term: ${term}`);
    }
  }
  return text;
}

const PERIOD_LABEL: Record<Meal["mealType"], string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

const PERIOD_ORDER: Meal["mealType"][] = ["cafe", "almoco", "lanche", "jantar"];

const CATEGORY_LABEL: Record<string, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  hortifruti: "Hortifruti",
  laticinio: "Laticínios",
  gordura: "Gorduras",
  mercearia: "Mercearia",
};

/** Markdown neutro pronto pra colar no WhatsApp. Ignora `plan.name` de propósito. */
export function renderDietMarkdown(plan: MealPlan, shopping: ShoppingItem[]): string {
  const lines: string[] = [];
  lines.push(`# Plano alimentar — emagrecimento`);
  lines.push("");
  lines.push(`Meta diária: ${plan.kcalDaily} kcal · ${plan.proteinG}g proteína · ${plan.carbG}g carbo · ${plan.fatG}g gordura`);
  lines.push("");

  const slotByType = new Map(plan.slots.map((s) => [s.mealType, s]));
  for (const type of PERIOD_ORDER) {
    const slot = slotByType.get(type);
    if (!slot) continue;
    lines.push(`## ${PERIOD_LABEL[type]}`);
    for (const v of slot.variants) {
      lines.push(`### ${v.label}`);
      for (const f of v.foods) {
        lines.push(`- ${f.name} — ${f.kcal} kcal`);
        if (f.preparation) lines.push(`  - Preparo: ${f.preparation}`);
      }
      if (v.ingredients.length) {
        const ing = v.ingredients.map((i) => `${i.item} (${i.qty} ${i.unit})`).join(", ");
        lines.push(`  - Ingredientes: ${ing}`);
      }
      lines.push("");
    }
  }

  lines.push(`## Lista de compras`);
  let lastCat = "";
  for (const item of shopping) {
    if (item.category !== lastCat) {
      lines.push(`### ${CATEGORY_LABEL[item.category] ?? item.category}`);
      lastCat = item.category;
    }
    lines.push(`- ${item.item} — ${item.qty} ${item.unit}`);
  }

  return assertNeutral(lines.join("\n"));
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Versão HTML imprimível (print → salvar como PDF). Mesmo conteúdo neutro. */
export function renderDietHtml(plan: MealPlan, shopping: ShoppingItem[]): string {
  const md = renderDietMarkdown(plan, shopping);
  const body = md
    .split("\n")
    .map((l) => {
      if (l.startsWith("### ")) return `<h3>${escapeHtml(l.slice(4))}</h3>`;
      if (l.startsWith("## ")) return `<h2>${escapeHtml(l.slice(3))}</h2>`;
      if (l.startsWith("# ")) return `<h1>${escapeHtml(l.slice(2))}</h1>`;
      if (l.startsWith("  - ")) return `<p style="margin-left:1.5em">${escapeHtml(l.slice(4))}</p>`;
      if (l.startsWith("- ")) return `<p>${escapeHtml(l.slice(2))}</p>`;
      return l ? `<p>${escapeHtml(l)}</p>` : "";
    })
    .join("\n");
  return assertNeutral(`<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Plano alimentar — emagrecimento</title><style>body{font-family:system-ui,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem;color:#222}h1,h2,h3{margin:.6em 0 .2em}</style></head><body>${body}</body></html>`);
}

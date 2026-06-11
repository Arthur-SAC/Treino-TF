import Dexie, { type Table } from "dexie";

export interface Measurement {
  id?: number;
  date: string;
  weightKg?: number;
  neckCm?: number;
  shouldersCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  thighLeftCm?: number;
  thighRightCm?: number;
  armCm?: number;
  forearmCm?: number;
  calfCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id?: number;
  date: string;
  blob: Blob;
  tag: "front" | "side" | "back" | "custom";
  bodyPart?: string;
  category: "self" | "goal";
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  difficulty: "iniciante" | "intermediario" | "avancado";
  videoUrl?: string;
  gifPath?: string;
  description: string;
  commonMistakes: string[];
  easierVariation?: string;
  harderVariation?: string;
  exposureLevel: 1 | 2 | 3 | 4 | 5;
  startLoadKg?: number; // peso sugerido inicial (só exercícios com carga externa)
  proTips?: string[]; // dicas pra maximizar resultado
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  dayOfWeek: number;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repsTarget: string;
    restSec: number;
    notes?: string;
  }>;
  durationMin: number;
  cycle?: "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
}

export interface WorkoutSession {
  id?: number;
  date: string;
  templateId?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ reps: number; weight: number; rpe?: number }>;
    notes?: string;
  }>;
  durationMin?: number;
  difficultySelf?: "easy" | "medium" | "hard";
}

export interface Meal {
  id?: number;
  date: string;
  mealType: "cafe" | "almoco" | "lanche" | "jantar";
  foods: Array<{ name: string; qtyG: number; kcal: number; proteinG?: number; carbG?: number; fatG?: number; preparation?: string }>;
  notes?: string;
  checked: boolean;
}

export type IngredientCategory =
  | "proteina"
  | "carboidrato"
  | "hortifruti"
  | "laticinio"
  | "gordura"
  | "mercearia";

export interface Ingredient {
  item: string;        // "Ovos", "Peito de frango", "Arroz integral"
  qty: number;         // quantidade numérica
  unit: string;        // "un", "g", "ml", "colher de sopa"
  category: IngredientCategory;
}

export interface MealVariant {
  id: string;                 // "cafe-1", "cafe-2"...
  label: string;              // nome neutro: "Opção 1 · Ovos & pão integral"
  foods: Meal["foods"];       // mesmo shape atual (name, qtyG, kcal, macros, preparation)
  ingredients: Ingredient[];  // ingredientes crus pra lista de compras
}

export interface MealSlot {
  mealType: Meal["mealType"]; // "cafe" | "almoco" | "lanche" | "jantar"
  targetKcal: number;
  variants: MealVariant[];    // 3 opções por período
}

export interface MealPlan {
  id?: number;
  name: string;
  goal: "deficit" | "manutencao" | "superavit";
  kcalDaily: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  slots: MealSlot[];              // fonte de verdade
  defaultMeals: Meal["foods"][];  // derivado (variante 0 de cada slot) — retrocompat
}

export interface SkincareRoutine {
  id?: number;
  name: string;
  time: "morning" | "evening";
  target: "face" | "back" | "armpit" | "intimate" | "general";
  steps: Array<{ productName: string; technique: string; waitMin: number }>;
}

export interface SkincareLog {
  id?: number;
  date: string;
  routineId: number;
  completed: boolean;
}

export interface HaircareEntry {
  id?: number;
  date: string;
  type: "hidratacao" | "nutricao" | "reconstrucao";
  products: string[];
  completed: boolean;
}

export interface Product {
  id?: number;
  name: string;
  category: "skincare" | "haircare" | "supplements" | "makeup";
  boughtAt?: string;
  endDate?: string;
  notes?: string;
}

export interface MakeupRoutine {
  id?: number;
  name: string;
  occasion: "diario" | "trabalho" | "sensual" | "saida" | "festa";
  durationMin: number;
  steps: Array<{ productName: string; technique: string; areaOfFace?: string }>;
  notes?: string;
}

export interface StylePalette {
  id?: number;
  subtone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  favorableColors: string[];
  unfavorableColors: string[];
  reanalyzed: boolean;
}

export interface Garment {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "intimate";
  occasion: string[];
  whyItWorks: string;
  cautions?: string;
  imagePath?: string;
}

export interface Look {
  id?: number;
  date: string;
  blob: Blob;
  occasion: string;
  rating: "love" | "ok" | "no";
  notes?: string;
}

export interface WishlistItem {
  id?: number;
  name: string;
  category: string;
  url?: string;
  imagePath?: string;
  notes?: string;
}

export interface Milestone {
  id?: number;
  datePlanned: string;
  dateCompleted?: string;
  title: string;
  category: "medico" | "fisico" | "social" | "fertilidade";
  notes?: string;
}

export interface DailyLog {
  date: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  activeBreakCount: number;
  waterMl: number;
  walkMin?: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface DanceMove {
  name: string;
  description: string;
  durationSec: number;
  repeat?: number;
}

export interface DanceSequence {
  id: string;
  name: string;
  category: "mobilidade" | "danca" | "pelvic" | "sensual" | "flexibilidade" | "twerk" | "apresentacao";
  level: "iniciante" | "intermediario" | "avancado";
  durationMin: number;
  focus: string;
  videoUrl?: string;
  moves: DanceMove[];
}

export interface PracticeLog {
  id?: number;
  date: string;
  sequenceId: string;
  completed: boolean;
  durationMin?: number;
  notes?: string;
}

export interface VoiceExercise {
  id: string;
  name: string;
  category: "aquecimento" | "passing" | "sensual" | "articulacao";
  level: "iniciante" | "intermediario" | "avancado";
  durationMin: number;
  focus: string;
  description: string;
  steps: Array<{ instruction: string; durationSec: number; repeat?: number }>;
  videoUrl?: string;
}

export interface VoiceRecording {
  id?: number;
  date: string;
  blob: Blob;
  durationSec: number;
  exerciseId?: string;
  notes?: string;
  avgPitchHz?: number;
}

export interface VoicePracticeLog {
  id?: number;
  date: string;
  exerciseId: string;
  completed: boolean;
  durationMin?: number;
}

export interface HairRemovalSession {
  id?: number;
  date: string;
  area: "rosto" | "axila" | "pernas" | "intima" | "bracos" | "costas" | "buco" | "outra";
  method: "laser" | "luz-pulsada" | "cera" | "fio" | "navalha" | "creme" | "pinca" | "eletrolise";
  cost?: number;
  painLevel?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export class TreinFinalDB extends Dexie {
  measurements!: Table<Measurement, number>;
  photos!: Table<ProgressPhoto, number>;
  exercises!: Table<Exercise, string>;
  workoutTemplates!: Table<WorkoutTemplate, string>;
  workoutSessions!: Table<WorkoutSession, number>;
  meals!: Table<Meal, number>;
  mealPlans!: Table<MealPlan, number>;
  skincareRoutines!: Table<SkincareRoutine, number>;
  skincareLogs!: Table<SkincareLog, number>;
  haircare!: Table<HaircareEntry, number>;
  products!: Table<Product, number>;
  stylePalette!: Table<StylePalette, number>;
  garments!: Table<Garment, string>;
  looks!: Table<Look, number>;
  wishlist!: Table<WishlistItem, number>;
  milestones!: Table<Milestone, number>;
  dailyLog!: Table<DailyLog, string>;
  settings!: Table<Setting, string>;
  danceSequences!: Table<DanceSequence, string>;
  practiceLogs!: Table<PracticeLog, number>;
  makeupRoutines!: Table<MakeupRoutine, number>;
  voiceExercises!: Table<VoiceExercise, string>;
  voiceRecordings!: Table<VoiceRecording, number>;
  voicePracticeLogs!: Table<VoicePracticeLog, number>;
  hairRemovalSessions!: Table<HairRemovalSession, number>;

  constructor() {
    super("trein-final");
    this.version(1).stores({
      measurements: "++id, date",
      photos: "++id, date, category, tag, [category+tag]",
      exercises: "id, category, exposureLevel",
      workoutTemplates: "id, dayOfWeek",
      workoutSessions: "++id, date, templateId",
      meals: "++id, date, mealType",
      mealPlans: "++id",
      skincareRoutines: "++id, time, target",
      skincareLogs: "++id, date, routineId",
      haircare: "++id, date",
      products: "++id, category",
      stylePalette: "++id",
      garments: "id, category",
      looks: "++id, date, occasion",
      wishlist: "++id, category",
      milestones: "++id, datePlanned, category",
      dailyLog: "date",
      settings: "key",
    });
    this.version(2).stores({
      danceSequences: "id, category, level",
      practiceLogs: "++id, date, sequenceId",
    });
    this.version(3).stores({
      makeupRoutines: "++id, occasion",
    });
    this.version(5).stores({
      workoutTemplates: "id, dayOfWeek, cycle",
    });
    this.version(6).stores({
      voiceExercises: "id, category, level",
      voiceRecordings: "++id, date",
      voicePracticeLogs: "++id, date, exerciseId",
    });
    this.version(7).stores({
      hairRemovalSessions: "++id, date, area, method",
    });
  }
}

export const db = new TreinFinalDB();

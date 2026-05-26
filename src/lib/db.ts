import Dexie, { type Table } from "dexie";

export interface Measurement {
  id?: number;
  date: string;
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
  foods: Array<{ name: string; qtyG: number; kcal: number; proteinG?: number; carbG?: number; fatG?: number }>;
  notes?: string;
  checked: boolean;
}

export interface MealPlan {
  id?: number;
  name: string;
  kcalDaily: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  defaultMeals: Meal["foods"][];
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
  category: "skincare" | "haircare" | "supplements";
  boughtAt?: string;
  endDate?: string;
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
}

export interface Setting {
  key: string;
  value: unknown;
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
  }
}

export const db = new TreinFinalDB();

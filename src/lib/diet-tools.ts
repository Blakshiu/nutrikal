import type { TacoFood } from "@/lib/taco-data";

export interface Profile {
  sex: "f" | "m";
  age: number;
  weight: number;
  height: number;
  activity: number;
  objective: number; // ajuste em kcal sobre o gasto total
}
/** Meta diária: kcal e distribuição percentual dos macros. */
export interface DailyGoal {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export const GOAL_KEY = "nutrikal:goal";
export const PROFILE_KEY = "nutrikal:profile";
export const WATER_KEY = "nutrikal:water";

export const DEFAULT_PROFILE: Profile = {
  sex: "f",
  age: 30,
  weight: 65,
  height: 165,
  activity: 1.375,
  objective: 0,
};
export const DEFAULT_GOAL: DailyGoal = { kcal: 2000, p: 25, c: 45, f: 30 };
export interface MealSection {
  id: string;
  name: string;
  time?: string;
}

export const DEFAULT_SECTION_TIMES: Record<string, string> = {
  cafe: "08:00",
  almoco: "12:30",
  lanche: "16:00",
  jantar: "19:30",
};

export const DEFAULT_SECTIONS = [
  { id: "cafe", name: "Café da manhã", time: DEFAULT_SECTION_TIMES.cafe },
  { id: "almoco", name: "Almoço", time: DEFAULT_SECTION_TIMES.almoco },
  { id: "lanche", name: "Lanche da tarde", time: DEFAULT_SECTION_TIMES.lanche },
  { id: "jantar", name: "Jantar", time: DEFAULT_SECTION_TIMES.jantar },
];

/** Taxa metabólica basal — equação de Mifflin-St Jeor. */
export const calcTmb = (p: Profile): number =>
  10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "m" ? 5 : -161);

/** Converte a meta percentual em gramas (4 kcal/g prot e carbo, 9 kcal/g gordura). */
export const goalGrams = (g: DailyGoal) => ({
  proteinas: (g.kcal * g.p) / 100 / 4,
  carboidratos: (g.kcal * g.c) / 100 / 4,
  gorduras: (g.kcal * g.f) / 100 / 9,
});

export const escapeHtml = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

/** Entradas da base importada que vieram zeradas (exceto sal, que é zero de fato). */
export const hasNoMacroData = (f: TacoFood): boolean => {
  const m = f.por100g;
  return (
    m.kcal === 0 &&
    m.carboidratos === 0 &&
    m.proteinas === 0 &&
    m.gorduras === 0 &&
    !f.nome.toLowerCase().startsWith("sal")
  );
};

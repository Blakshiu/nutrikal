import { Droplets, Target } from "lucide-react";

import { usePersistedState } from "@/hooks/use-persisted-state";
import {
  DEFAULT_GOAL,
  DEFAULT_PROFILE,
  GOAL_KEY,
  PROFILE_KEY,
  WATER_KEY,
  calcTmb,
  goalGrams,
  type DailyGoal,
  type Profile,
} from "@/lib/diet-tools";

const fmt = (n: number, d = 0) => n.toLocaleString("pt-BR", { maximumFractionDigits: d });
const today = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD local

/* ---------- Progresso do dia em relação à meta ---------- */
export function GoalProgress({
  total,
}: {
  total: { kcal: number; proteinas: number; carboidratos: number; gorduras: number };
}) {
  const [goal] = usePersistedState<DailyGoal>(GOAL_KEY, DEFAULT_GOAL);
  const g = goalGrams(goal);
  const rows = [
    ["Calorias", total.kcal, goal.kcal, "kcal"],
    ["Proteínas", total.proteinas, g.proteinas, "g"],
    ["Carboidratos", total.carboidratos, g.carboidratos, "g"],
    ["Gorduras", total.gorduras, g.gorduras, "g"],
  ] as const;

  return (
    <div className="glass col-span-full p-4" style={{ gridColumn: "1 / -1" }}>
      <strong className="mb-3 block text-sm">Progresso da meta diária</strong>
      {rows.map(([label, value, target, unit]) => {
        const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
        const over = target > 0 && value > target;
        return (
          <div key={label} className="mb-2">
            <div className="flex justify-between text-xs">
              <span>{label}</span>
              <span>
                {fmt(value)} / {fmt(target)} {unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${over ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${pct}%`, transition: "width .4s" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Metas (TMB) e água ---------- */
export function GoalsAndWater() {
  const [profile, setProfile] = usePersistedState<Profile>(PROFILE_KEY, DEFAULT_PROFILE);
  const [goal, setGoal] = usePersistedState<DailyGoal>(GOAL_KEY, DEFAULT_GOAL);
  const [water, setWater] = usePersistedState<{ day: string; n: number }>(WATER_KEY, {
    day: "",
    n: 0,
  });

  const num = (v: string) => Math.max(0, parseFloat(v.replace(",", ".")) || 0);
  const setP = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const tmb = calcTmb(profile);
  const applyGoal = () => {
    const kcal = Math.max(1000, Math.round(tmb * profile.activity + profile.objective));
    const split =
      profile.objective < 0
        ? { p: 30, c: 40, f: 30 }
        : profile.objective > 0
          ? { p: 25, c: 50, f: 25 }
          : { p: 25, c: 45, f: 30 };
    setGoal({ kcal, ...split });
  };

  const sum = goal.p + goal.c + goal.f;
  const grams = goalGrams(goal);
  const waterTarget = Math.max(8, Math.round((profile.weight * 35) / 250)); // 35 ml/kg, copos de 250 ml
  const glasses = water.day === today() ? water.n : 0;
  const toggleGlass = (i: number) => setWater({ day: today(), n: i + 1 === glasses ? i : i + 1 });

  return (
    <section id="metas" className="section">
      <div className="container-x grid gap-6 md:grid-cols-2">
        <div className="glass p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Target size={20} /> Meta diária
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="field">
              Sexo
              <select
                className="input"
                value={profile.sex}
                onChange={(e) => setP("sex", e.target.value as Profile["sex"])}
              >
                <option value="f">Feminino</option>
                <option value="m">Masculino</option>
              </select>
            </label>
            <label className="field">
              Idade
              <input
                className="input"
                inputMode="numeric"
                value={profile.age}
                onChange={(e) => setP("age", num(e.target.value))}
              />
            </label>
            <label className="field">
              Peso (kg)
              <input
                className="input"
                inputMode="decimal"
                value={profile.weight}
                onChange={(e) => setP("weight", num(e.target.value))}
              />
            </label>
            <label className="field">
              Altura (cm)
              <input
                className="input"
                inputMode="numeric"
                value={profile.height}
                onChange={(e) => setP("height", num(e.target.value))}
              />
            </label>
            <label className="field col-span-2">
              Atividade física
              <select
                className="input"
                value={profile.activity}
                onChange={(e) => setP("activity", Number(e.target.value))}
              >
                <option value={1.2}>Sedentário</option>
                <option value={1.375}>Leve (1–3x/semana)</option>
                <option value={1.55}>Moderada (3–5x/semana)</option>
                <option value={1.725}>Intensa (6–7x/semana)</option>
              </select>
            </label>
            <label className="field col-span-2">
              Objetivo
              <select
                className="input"
                value={profile.objective}
                onChange={(e) => setP("objective", Number(e.target.value))}
              >
                <option value={-500}>Emagrecer (−500 kcal)</option>
                <option value={0}>Manter peso</option>
                <option value={300}>Ganhar massa (+300 kcal)</option>
              </select>
            </label>
          </div>
          <p className="my-3 text-xs text-muted-foreground">
            TMB estimada: {fmt(tmb)} kcal (Mifflin-St Jeor). A meta final deve ser definida pela sua
            nutricionista.
          </p>
          <button type="button" className="btn btn-primary" onClick={applyGoal}>
            Calcular e aplicar meta
          </button>

          <hr className="my-5 border-border" />
          <div className="grid grid-cols-4 gap-2 text-sm">
            <label className="field col-span-4 sm:col-span-1">
              kcal
              <input
                className="input"
                inputMode="numeric"
                value={goal.kcal}
                onChange={(e) => setGoal({ ...goal, kcal: num(e.target.value) })}
              />
            </label>
            {(
              [
                ["p", "Prot. %"],
                ["c", "Carbo %"],
                ["f", "Gord. %"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="field">
                {label}
                <input
                  className="input"
                  inputMode="numeric"
                  value={goal[k]}
                  onChange={(e) => setGoal({ ...goal, [k]: num(e.target.value) })}
                />
              </label>
            ))}
          </div>
          <p
            className={`mt-2 text-xs ${sum === 100 ? "text-muted-foreground" : "text-destructive"}`}
          >
            {sum === 100
              ? "Distribuição fechada em 100%."
              : `A soma está em ${sum}%: ajuste para 100%.`}{" "}
            Meta: {fmt(grams.proteinas)} g de proteína · {fmt(grams.carboidratos)} g de carboidrato
            · {fmt(grams.gorduras)} g de gordura.
          </p>
        </div>

        <div className="glass p-6">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <Droplets size={20} /> Água de hoje
          </h2>
          <p className="mb-4 text-3xl font-semibold">
            {fmt(glasses * 0.25, 2)} L{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {fmt(waterTarget * 0.25, 2)} L
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: waterTarget }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Copo ${i + 1} de ${waterTarget}`}
                aria-pressed={i < glasses}
                onClick={() => toggleGlass(i)}
                className={`rounded-lg p-2 ${i < glasses ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <Droplets size={20} />
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Cada copo equivale a 250 ml. A meta sugerida usa 35 ml por kg de peso (mínimo de 2 L);
            confirme o valor ideal com a sua nutricionista. O contador zera todo dia.
          </p>
        </div>
      </div>
    </section>
  );
}

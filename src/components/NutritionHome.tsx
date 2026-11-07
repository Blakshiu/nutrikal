import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Droplets,
  Flame,
  Leaf,
  Minus,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  Wheat,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import heroNutrition from "@/assets/hero-nutrition.jpg";
import { usePersistedState } from "@/hooks/use-persisted-state";
import {
  DEFAULT_GOAL,
  DEFAULT_SECTIONS,
  GOAL_KEY,
  WATER_KEY,
  goalGrams,
  type DailyGoal,
} from "@/lib/diet-tools";
import { TACO_FOODS, type TacoFood } from "@/lib/taco-data";

interface MealSection {
  id: string;
  name: string;
}

interface DietItem {
  id: string;
  sectionId: string;
  sectionName: string;
  quantidade: number;
  unidade: "g" | "u";
  nome: string;
  categoria: string;
  gramas: number;
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  fibras?: number;
  sodio?: number;
}

const format = (value: number, digits = 0) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: digits });

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const today = () => new Date().toLocaleDateString("sv-SE");

const POPULAR_FOODS = [
  "Arroz, tipo 1, cozido",
  "Feijão, carioca, cozido",
  "Frango, peito, sem pele, grelhado",
  "Banana, prata, crua",
  "Ovo, de galinha, inteiro, cozido/10minutos",
];
const SEARCH_STOP_WORDS = new Set(["de", "da", "do", "das", "dos", "e"]);
const TACO_FOODS_BY_ID = new Map(TACO_FOODS.map((food) => [food.id, food]));

const MEAL_TIMES: Record<string, string> = {
  cafe: "08:00",
  almoco: "12:30",
  lanche: "16:00",
  jantar: "19:30",
};

function PortionEditor({ grams, onChange }: { grams: number; onChange: (grams: number) => void }) {
  const [value, setValue] = useState(String(Math.round(grams)));

  useEffect(() => setValue(String(Math.round(grams))), [grams]);

  return (
    <label className="nutrition-food__portion">
      <span className="sr-only">Porção em gramas</span>
      <input
        aria-label="Porção em gramas"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          const parsed = Number(next.replace(",", "."));
          if (Number.isFinite(parsed) && parsed > 0) onChange(parsed);
        }}
        onBlur={() => setValue(String(Math.round(grams)))}
      />
      <span>g</span>
    </label>
  );
}

function MacroCard({
  label,
  value,
  target,
  unit,
  color,
  icon,
  featured = false,
  targetLabel = "da meta",
  digits = 0,
}: {
  label: string;
  value: number | undefined;
  target: number;
  unit: string;
  color: string;
  icon: typeof Flame;
  featured?: boolean;
  targetLabel?: string;
  digits?: number;
}) {
  const Icon = icon;
  const progress = value !== undefined && target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const remaining = value === undefined ? undefined : Math.max(0, target - value);

  return (
    <article
      className={`nutrition-macro-card${featured ? " nutrition-macro-card--featured" : ""}`}
      style={{ "--macro-color": color, "--macro-progress": `${progress}%` } as CSSProperties}
    >
      <div className="nutrition-macro-card__top">
        <span className="nutrition-macro-card__icon">
          <Icon size={18} />
        </span>
        <span className="nutrition-macro-card__label">{label}</span>
        {featured && (
          <span className="nutrition-macro-card__tag">
            <Target size={12} /> Meta diária
          </span>
        )}
      </div>
      <div className="nutrition-macro-card__value">
        {value === undefined ? "—" : format(value, digits)}
        <span>{unit}</span>
      </div>
      <div
        className="nutrition-progress"
        role="progressbar"
        aria-label={`${label} consumidos`}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span />
      </div>
      <div className="nutrition-macro-card__bottom">
        <span>{value === undefined ? "Sem dados" : `${format(progress)}% ${targetLabel}`}</span>
        <span>
          {remaining === undefined
            ? "Porção sem informação"
            : `${targetLabel === "do limite" ? "Limite" : "Restam"} ${format(remaining, digits)} ${unit}`}
        </span>
      </div>
    </article>
  );
}

export function NutritionHome() {
  const [diet, setDiet] = usePersistedState<DietItem[]>("nutrikal:diet", []);
  const [sections, setSections] = usePersistedState<MealSection[]>(
    "nutrikal:sections",
    DEFAULT_SECTIONS,
  );
  const [goal] = usePersistedState<DailyGoal>(GOAL_KEY, DEFAULT_GOAL);
  const [water, setWater] = usePersistedState<{ day: string; n: number }>(WATER_KEY, {
    day: "",
    n: 0,
  });
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<TacoFood | null>(null);
  const [grams, setGrams] = useState("100");
  const [activeSection, setActiveSection] = useState("cafe");
  const [newSectionName, setNewSectionName] = useState("");
  const [foodDrawerOpen, setFoodDrawerOpen] = useState(false);

  useEffect(() => {
    if (!sections.some((section) => section.id === activeSection)) {
      setActiveSection(sections[0]?.id ?? "");
    }
  }, [sections, activeSection]);

  const filteredFoods = useMemo(() => {
    const terms = normalize(query)
      .split(/[\s,]+/)
      .filter((term) => term && !SEARCH_STOP_WORDS.has(term));

    return TACO_FOODS.filter((food) => {
      if (terms.length === 0) return POPULAR_FOODS.some((name) => name === food.nome);
      const name = normalize(food.nome);
      return terms.every((term) =>
        term === "branco"
          ? name.includes("arroz") && (name.includes("tipo 1") || name.includes("tipo 2"))
          : name.includes(term),
      );
    }).slice(0, 5);
  }, [query]);

  const totals = useMemo(
    () =>
      diet.reduce(
        (sum, item) => {
          const food = TACO_FOODS_BY_ID.get(item.id);
          const factor = item.gramas / 100;
          const fibersPer100g = food?.por100g.fibras;
          const sodiumPer100g = food?.por100g.sodio;

          return {
            kcal: sum.kcal + item.kcal,
            proteinas: sum.proteinas + item.proteinas,
            carboidratos: sum.carboidratos + item.carboidratos,
            gorduras: sum.gorduras + item.gorduras,
            fibras: sum.fibras + (fibersPer100g === undefined ? 0 : fibersPer100g * factor),
            sodio: sum.sodio + (sodiumPer100g === undefined ? 0 : sodiumPer100g * factor),
            fibrasComDados: sum.fibrasComDados + (fibersPer100g === undefined ? 0 : 1),
            sodioComDados: sum.sodioComDados + (sodiumPer100g === undefined ? 0 : 1),
          };
        },
        {
          kcal: 0,
          proteinas: 0,
          carboidratos: 0,
          gorduras: 0,
          fibras: 0,
          sodio: 0,
          fibrasComDados: 0,
          sodioComDados: 0,
        },
      ),
    [diet],
  );

  const macroTargets = goalGrams(goal);
  const macroEnergy = totals.proteinas * 4 + totals.carboidratos * 4 + totals.gorduras * 9;
  const portionGrams = Math.max(0, Number(grams.replace(",", ".")) || 0);
  const portionFactor = portionGrams / 100;
  const todaysWater = water.day === today() ? water.n : 0;
  const waterTarget = 8;
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const addFood = (food: TacoFood) => {
    if (!activeSection || portionGrams <= 0) return;
    const section = sections.find((item) => item.id === activeSection);
    if (!section) return;

    const factor = portionGrams / 100;
    const newItem: DietItem = {
      id: food.id,
      sectionId: section.id,
      sectionName: section.name,
      quantidade: portionGrams,
      unidade: "g",
      nome: food.nome,
      categoria: food.categoria,
      gramas: portionGrams,
      kcal: food.por100g.kcal * factor,
      carboidratos: food.por100g.carboidratos * factor,
      proteinas: food.por100g.proteinas * factor,
      gorduras: food.por100g.gorduras * factor,
    };

    setDiet((current) => {
      const existing = current.find((item) => item.id === food.id && item.sectionId === section.id);
      if (!existing) return [...current, newItem];

      return current.map((item) =>
        item.id === food.id && item.sectionId === section.id
          ? {
              ...item,
              quantidade: item.quantidade + portionGrams,
              gramas: item.gramas + portionGrams,
              kcal: item.kcal + newItem.kcal,
              carboidratos: item.carboidratos + newItem.carboidratos,
              proteinas: item.proteinas + newItem.proteinas,
              gorduras: item.gorduras + newItem.gorduras,
            }
          : item,
      );
    });
    setSelectedFood(null);
    setQuery("");
  };

  const updatePortion = (item: DietItem, nextGrams: number) => {
    const food = TACO_FOODS.find((candidate) => candidate.id === item.id);
    const factor = nextGrams / 100;
    setDiet((current) =>
      current.map((entry) =>
        entry.id === item.id && entry.sectionId === item.sectionId
          ? {
              ...entry,
              quantidade: nextGrams,
              unidade: "g",
              gramas: nextGrams,
              kcal: food ? food.por100g.kcal * factor : (entry.kcal / entry.gramas) * nextGrams,
              carboidratos: food
                ? food.por100g.carboidratos * factor
                : (entry.carboidratos / entry.gramas) * nextGrams,
              proteinas: food
                ? food.por100g.proteinas * factor
                : (entry.proteinas / entry.gramas) * nextGrams,
              gorduras: food
                ? food.por100g.gorduras * factor
                : (entry.gorduras / entry.gramas) * nextGrams,
            }
          : entry,
      ),
    );
  };

  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    const section = { id: `${Date.now()}`, name };
    setSections((current) => [...current, section]);
    setActiveSection(section.id);
    setNewSectionName("");
  };

  const dayWater = (count: number) => setWater({ day: today(), n: count });
  const selectFood = (food: TacoFood) => {
    setSelectedFood(food);
    setQuery(food.nome);
    setFoodDrawerOpen(false);
  };

  useEffect(() => {
    if (!foodDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFoodDrawerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [foodDrawerOpen]);

  return (
    <div className="nutrition-home">
      <div className="nutrition-home__container">
        <header className="nutrition-welcome">
          <div>
            <span className="nutrition-eyebrow">
              <Leaf size={14} /> {dateLabel}
            </span>
            <h1>
              {greeting}, <span>vamos cuidar de você?</span>
            </h1>
            <p>Pequenas escolhas, um dia inteiro de bem-estar.</p>
          </div>
          <Link to="/metas" className="nutrition-goal-link">
            <span className="nutrition-goal-link__icon">
              <Target size={17} />
            </span>
            <span>
              <small>Sua meta de hoje</small>
              <strong>{format(goal.kcal)} kcal</strong>
            </span>
            <ArrowRight size={16} />
          </Link>
        </header>

        <section className="nutrition-hero">
          <div className="nutrition-hero__copy">
            <span className="nutrition-hero__pill">
              <Sparkles size={14} /> Seu espaço de bem-estar
            </span>
            <h2>Nutrição que acompanha o seu ritmo.</h2>
            <p>
              Planeje suas refeições com ingredientes de verdade e acompanhe seu progresso sem
              complicação.
            </p>
            <a className="nutrition-hero__button" href="#montar-refeicao">
              Montar minha refeição <ArrowRight size={16} />
            </a>
            <div className="nutrition-hero__note">
              <Check size={14} /> Valores calculados com a Tabela TACO
            </div>
          </div>
          <div className="nutrition-hero__visual" aria-hidden="true">
            <img src={heroNutrition} alt="" fetchPriority="high" />
            <div className="nutrition-hero__floating">
              <span className="nutrition-hero__floating-icon">
                <Flame size={17} />
              </span>
              <span>
                <small>Consumo de hoje</small>
                <strong>
                  {format(totals.kcal)} <small>kcal</small>
                </strong>
                <small>
                  {goal.kcal ? format((totals.kcal / goal.kcal) * 100) : 0}% da meta ·{" "}
                  {format(goal.kcal)} kcal
                </small>
              </span>
              <ArrowDownRight size={15} />
            </div>
            <span className="nutrition-hero__orb" />
          </div>
        </section>

        <section className="nutrition-macros" aria-label="Progresso nutricional de hoje">
          <div className="nutrition-section-heading">
            <div>
              <span className="nutrition-eyebrow">Seu resumo diário</span>
              <h2>Um olhar sobre o seu dia</h2>
            </div>
            <span className="nutrition-reference">
              <span /> Atualizado em tempo real
            </span>
          </div>
          <div className="nutrition-macro-grid">
            <MacroCard
              label="Calorias"
              value={totals.kcal}
              target={goal.kcal}
              unit="kcal"
              color="var(--nutrition-orange)"
              icon={Flame}
              featured
            />
            <MacroCard
              label="Proteínas"
              value={totals.proteinas}
              target={macroTargets.proteinas}
              unit="g"
              color="var(--nutrition-sky)"
              icon={Utensils}
              digits={1}
            />
            <MacroCard
              label="Carboidratos"
              value={totals.carboidratos}
              target={macroTargets.carboidratos}
              unit="g"
              color="var(--nutrition-orange)"
              icon={Wheat}
              digits={1}
            />
            <MacroCard
              label="Gorduras"
              value={totals.gorduras}
              target={macroTargets.gorduras}
              unit="g"
              color="var(--nutrition-pink)"
              icon={Droplets}
              digits={1}
            />
          </div>
          <div className="nutrition-micros">
            <MacroCard
              label="Fibras"
              value={totals.fibrasComDados ? totals.fibras : undefined}
              target={25}
              unit="g"
              color="var(--nutrition-green)"
              icon={Wheat}
              targetLabel="da referência"
              digits={1}
            />
            <MacroCard
              label="Sódio"
              value={totals.sodioComDados ? totals.sodio : undefined}
              target={2000}
              unit="mg"
              color="var(--nutrition-sky)"
              icon={Droplets}
              targetLabel="do limite"
            />
          </div>
          {diet.length > 0 &&
            (totals.fibrasComDados < diet.length || totals.sodioComDados < diet.length) && (
              <p className="nutrition-micros__note">
                Fibras disponíveis para {totals.fibrasComDados} de {diet.length} alimentos · sódio
                para {totals.sodioComDados} de {diet.length}. Os demais valores não constam na base
                carregada.
              </p>
            )}
        </section>

        <div className="nutrition-workspace">
          <section className="nutrition-card nutrition-builder" id="montar-refeicao">
            <div className="nutrition-card__heading">
              <span className="nutrition-card__heading-icon nutrition-card__heading-icon--green">
                <Plus size={19} />
              </span>
              <div>
                <span className="nutrition-eyebrow">Comece por aqui</span>
                <h2>Monte seu prato</h2>
              </div>
            </div>
            <p className="nutrition-card__description">
              Encontre um alimento e veja os valores da sua porção na hora.
            </p>

            <label className="nutrition-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedFood(null);
                }}
                placeholder="Buscar alimento na TACO..."
                aria-label="Buscar alimento na Tabela TACO"
              />
              <span className="nutrition-search__badge">TACO</span>
            </label>

            {!selectedFood && (
              <div className="nutrition-food-results">
                <span className="nutrition-field-label">
                  {query ? "Resultados da Tabela TACO" : "Sugestões para você"}
                </span>
                {filteredFoods.length ? (
                  filteredFoods.map((food) => (
                    <button
                      type="button"
                      key={food.id}
                      className="nutrition-food-option"
                      onClick={() => selectFood(food)}
                    >
                      <span className="nutrition-food-option__icon">
                        <Leaf size={15} />
                      </span>
                      <span className="nutrition-food-option__text">
                        <strong>{food.nome}</strong>
                        <small>{food.categoria}</small>
                      </span>
                      <span className="nutrition-food-option__kcal">
                        {format(food.por100g.kcal)} <small>kcal</small>
                      </span>
                      <Plus size={16} className="nutrition-food-option__add" />
                    </button>
                  ))
                ) : (
                  <p className="nutrition-no-results">
                    Nenhum alimento encontrado. Tente buscar por outro nome.
                  </p>
                )}
              </div>
            )}

            {selectedFood && (
              <div className="nutrition-selected-food">
                <div className="nutrition-selected-food__top">
                  <span className="nutrition-food-option__icon">
                    <Leaf size={15} />
                  </span>
                  <div>
                    <strong>{selectedFood.nome}</strong>
                    <small>Por 100 g · Tabela TACO</small>
                  </div>
                  <button
                    type="button"
                    className="nutrition-change-food"
                    onClick={() => {
                      setSelectedFood(null);
                      setQuery("");
                    }}
                  >
                    Trocar
                  </button>
                </div>
                <label className="nutrition-grams-field">
                  <span className="nutrition-field-label">Tamanho da porção</span>
                  <span>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={grams}
                      onChange={(event) => setGrams(event.target.value)}
                      aria-label="Peso da porção em gramas"
                    />
                    <b>gramas</b>
                  </span>
                </label>
                <div className="nutrition-preview">
                  <span>Esta porção contém</span>
                  <strong>{format(selectedFood.por100g.kcal * portionFactor)} kcal</strong>
                  <div>
                    <span>
                      Proteína <b>{format(selectedFood.por100g.proteinas * portionFactor, 1)} g</b>
                    </span>
                    <span>
                      Carboidrato{" "}
                      <b>{format(selectedFood.por100g.carboidratos * portionFactor, 1)} g</b>
                    </span>
                    <span>
                      Gordura <b>{format(selectedFood.por100g.gorduras * portionFactor, 1)} g</b>
                    </span>
                    <span>
                      Fibras{" "}
                      <b>
                        {selectedFood.por100g.fibras === undefined
                          ? "—"
                          : `${format(selectedFood.por100g.fibras * portionFactor, 1)} g`}
                      </b>
                    </span>
                    <span>
                      Sódio{" "}
                      <b>
                        {selectedFood.por100g.sodio === undefined
                          ? "—"
                          : `${format(selectedFood.por100g.sodio * portionFactor)} mg`}
                      </b>
                    </span>
                  </div>
                </div>
                <label className="nutrition-grams-field">
                  <span className="nutrition-field-label">Adicionar à refeição</span>
                  <span className="nutrition-select-wrap">
                    <select
                      value={activeSection}
                      onChange={(event) => setActiveSection(event.target.value)}
                      aria-label="Selecionar refeição"
                    >
                      {sections.map((section) => (
                        <option value={section.id} key={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </span>
                </label>
                <button
                  type="button"
                  className="nutrition-add-button"
                  onClick={() => addFood(selectedFood)}
                  disabled={!portionGrams || !activeSection}
                >
                  <Plus size={17} /> Adicionar à refeição
                </button>
              </div>
            )}

            {!selectedFood && (
              <div className="nutrition-taco-note">
                <span className="nutrition-taco-note__mark">T</span>
                <span>
                  <strong>Baseado na Tabela TACO</strong>
                  <small>{TACO_FOODS.length} alimentos · valores por 100 g</small>
                </span>
                <CircleHelp size={16} />
              </div>
            )}
          </section>

          <section className="nutrition-card nutrition-meals">
            <div className="nutrition-card__heading nutrition-meals__header">
              <div className="nutrition-card__heading-main">
                <span className="nutrition-card__heading-icon nutrition-card__heading-icon--peach">
                  <Clock3 size={18} />
                </span>
                <div>
                  <span className="nutrition-eyebrow">Seu ritmo, suas escolhas</span>
                  <h2>Suas refeições</h2>
                </div>
              </div>
              <span className="nutrition-meals__count">
                {diet.length} {diet.length === 1 ? "alimento" : "alimentos"}
              </span>
            </div>

            <div className="nutrition-meal-list">
              {sections.map((section, index) => {
                const items = diet.filter((item) => item.sectionId === section.id);
                const mealKcal = items.reduce((sum, item) => sum + item.kcal, 0);

                return (
                  <article className="nutrition-meal" key={section.id}>
                    <span className={`nutrition-meal__dot nutrition-meal__dot--${index % 4}`} />
                    <div className="nutrition-meal__content">
                      <div className="nutrition-meal__heading">
                        <div>
                          <h3>{section.name}</h3>
                          <span>
                            <Clock3 size={12} /> {MEAL_TIMES[section.id] ?? "—"}
                            {items.length > 0 && ` · ${format(mealKcal)} kcal`}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="nutrition-meal__add"
                          onClick={() => {
                            setActiveSection(section.id);
                            setQuery("");
                            setFoodDrawerOpen(true);
                          }}
                          aria-label={`Adicionar alimento a ${section.name}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {items.length ? (
                        <ul className="nutrition-food-list">
                          {items.map((item) => (
                            <li className="nutrition-food" key={`${item.sectionId}-${item.id}`}>
                              <span className="nutrition-food__mark">
                                <Leaf size={14} />
                              </span>
                              <span className="nutrition-food__name">
                                <strong>{item.nome}</strong>
                                <small>
                                  {format(item.kcal)} kcal · P {format(item.proteinas, 1)} g · C{" "}
                                  {format(item.carboidratos, 1)} g · G {format(item.gorduras, 1)} g
                                  {(() => {
                                    const food = TACO_FOODS_BY_ID.get(item.id);
                                    if (
                                      food?.por100g.fibras === undefined &&
                                      food?.por100g.sodio === undefined
                                    ) {
                                      return null;
                                    }
                                    return (
                                      <>
                                        {" "}
                                        · Fib{" "}
                                        {food.por100g.fibras === undefined
                                          ? "—"
                                          : `${format(food.por100g.fibras * (item.gramas / 100), 1)} g`}{" "}
                                        · Na{" "}
                                        {food.por100g.sodio === undefined
                                          ? "—"
                                          : `${format(food.por100g.sodio * (item.gramas / 100))} mg`}
                                      </>
                                    );
                                  })()}
                                </small>
                              </span>
                              <PortionEditor
                                grams={item.gramas}
                                onChange={(next) => updatePortion(item, next)}
                              />
                              <button
                                type="button"
                                className="nutrition-food__remove"
                                onClick={() =>
                                  setDiet((current) =>
                                    current.filter(
                                      (entry) =>
                                        entry.id !== item.id || entry.sectionId !== item.sectionId,
                                    ),
                                  )
                                }
                                aria-label={`Remover ${item.nome}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <button
                          type="button"
                          className="nutrition-meal__empty"
                          onClick={() => {
                            setActiveSection(section.id);
                            setQuery("");
                            setFoodDrawerOpen(true);
                          }}
                        >
                          <Plus size={14} /> Adicionar alimento
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <form
              className="nutrition-add-meal"
              onSubmit={(event) => {
                event.preventDefault();
                addSection();
              }}
            >
              <input
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                placeholder="Criar outra refeição"
                aria-label="Nome da nova refeição"
              />
              <button
                type="submit"
                disabled={!newSectionName.trim()}
                aria-label="Adicionar refeição"
              >
                <Plus size={16} />
              </button>
            </form>

            <div className="nutrition-meals__footer">
              <span>Total planejado hoje</span>
              <strong>
                {format(totals.kcal)} <small>kcal</small>
              </strong>
            </div>
          </section>
        </div>

        {foodDrawerOpen && (
          <div
            className="nutrition-drawer-backdrop"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setFoodDrawerOpen(false);
            }}
          >
            <section
              className="nutrition-food-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nutrition-drawer-title"
            >
              <div className="nutrition-food-drawer__heading">
                <div>
                  <span className="nutrition-eyebrow">
                    <Leaf size={14} />{" "}
                    {sections.find((section) => section.id === activeSection)?.name}
                  </span>
                  <h2 id="nutrition-drawer-title">Adicionar alimento</h2>
                  <p>Busque na Tabela TACO e escolha um alimento para sua refeição.</p>
                </div>
                <button
                  type="button"
                  className="nutrition-food-drawer__close"
                  onClick={() => setFoodDrawerOpen(false)}
                  aria-label="Fechar seletor de alimentos"
                >
                  <X size={18} />
                </button>
              </div>
              <label className="nutrition-search">
                <Search size={18} />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex.: arroz branco, feijão carioca..."
                  aria-label="Buscar alimento na Tabela TACO"
                />
                <span className="nutrition-search__badge">TACO</span>
              </label>
              <div className="nutrition-food-results">
                <span className="nutrition-field-label">
                  {query ? "Resultados da busca" : "Sugestões populares"}
                </span>
                {filteredFoods.length ? (
                  filteredFoods.map((food) => (
                    <button
                      type="button"
                      key={food.id}
                      className="nutrition-food-option"
                      onClick={() => selectFood(food)}
                    >
                      <span className="nutrition-food-option__icon">
                        <Leaf size={15} />
                      </span>
                      <span className="nutrition-food-option__text">
                        <strong>{food.nome}</strong>
                        <small>{food.categoria} · por 100 g</small>
                      </span>
                      <span className="nutrition-food-option__kcal">
                        {format(food.por100g.kcal)} <small>kcal</small>
                      </span>
                      <Plus size={16} className="nutrition-food-option__add" />
                    </button>
                  ))
                ) : (
                  <p className="nutrition-no-results">
                    Nenhum alimento encontrado. Tente buscar por outro nome.
                  </p>
                )}
              </div>
              <p className="nutrition-food-drawer__footnote">
                Os valores são proporcionais à porção e baseados na composição TACO por 100 g.
              </p>
            </section>
          </div>
        )}

        <section className="nutrition-lower-grid">
          <article className="nutrition-card nutrition-macro-breakdown">
            <div className="nutrition-card__heading">
              <span className="nutrition-card__heading-icon nutrition-card__heading-icon--lavender">
                <Wheat size={18} />
              </span>
              <div>
                <span className="nutrition-eyebrow">Equilíbrio no prato</span>
                <h2>Distribuição de macros</h2>
              </div>
            </div>
            <div className="nutrition-breakdown">
              <div
                className={`nutrition-donut${macroEnergy ? "" : " nutrition-donut--empty"}`}
                style={
                  {
                    "--protein-share": `${macroEnergy ? ((totals.proteinas * 4) / macroEnergy) * 100 : 0}%`,
                    "--carb-share": `${macroEnergy ? ((totals.carboidratos * 4) / macroEnergy) * 100 : 0}%`,
                    "--fat-share": `${macroEnergy ? ((totals.gorduras * 9) / macroEnergy) * 100 : 0}%`,
                  } as CSSProperties
                }
                role="img"
                aria-label={`Consumo de ${format(totals.proteinas)} gramas de proteína, ${format(totals.carboidratos)} gramas de carboidratos e ${format(totals.gorduras)} gramas de gorduras`}
              >
                <div>
                  <strong>{format(totals.kcal)}</strong>
                  <span>kcal hoje</span>
                </div>
              </div>
              <div className="nutrition-breakdown__legend">
                <div>
                  <span className="nutrition-legend-dot nutrition-legend-dot--protein" />
                  <span>Proteína</span>
                  <strong>{format(totals.proteinas, 1)} g</strong>
                </div>
                <div>
                  <span className="nutrition-legend-dot nutrition-legend-dot--carb" />
                  <span>Carboidratos</span>
                  <strong>{format(totals.carboidratos, 1)} g</strong>
                </div>
                <div>
                  <span className="nutrition-legend-dot nutrition-legend-dot--fat" />
                  <span>Gorduras</span>
                  <strong>{format(totals.gorduras, 1)} g</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="nutrition-card nutrition-water">
            <div className="nutrition-card__heading">
              <span className="nutrition-card__heading-icon nutrition-card__heading-icon--blue">
                <Droplets size={18} />
              </span>
              <div>
                <span className="nutrition-eyebrow">Um gole de cada vez</span>
                <h2>Hidratação</h2>
              </div>
              <Link
                to="/metas"
                className="nutrition-water__settings"
                aria-label="Ajustar meta de água"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="nutrition-water__summary">
              <strong>
                {todaysWater}
                <small> / {waterTarget} copos</small>
              </strong>
              <span>{Math.round((todaysWater / waterTarget) * 100)}% da meta diária</span>
            </div>
            <div className="nutrition-water__glasses" aria-label="Copos de água registrados">
              {Array.from({ length: waterTarget }, (_, index) => (
                <span
                  key={index}
                  className={index < todaysWater ? "is-filled" : ""}
                  aria-hidden="true"
                >
                  <Droplets size={17} />
                </span>
              ))}
            </div>
            <div className="nutrition-water__actions">
              <span>250 ml por copo</span>
              <div>
                <button
                  type="button"
                  onClick={() => dayWater(Math.max(0, todaysWater - 1))}
                  disabled={todaysWater === 0}
                  aria-label="Remover um copo de água"
                >
                  <Minus size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => dayWater(Math.min(waterTarget, todaysWater + 1))}
                  disabled={todaysWater >= waterTarget}
                  aria-label="Adicionar um copo de água"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="nutrition-tip">
          <span className="nutrition-tip__icon">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>Um passo de cada vez</strong>
            <p>Suas metas são pessoais. Ajuste calorias e hidratação ao seu perfil.</p>
          </div>
          <Link to="/metas">
            Ver minhas metas <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  );
}

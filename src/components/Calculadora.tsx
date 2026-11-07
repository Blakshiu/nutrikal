import { useEffect, useMemo, useState, useRef } from "react";
import { Calculator, Droplets, Dumbbell, Flame, Search, Wheat } from "lucide-react";
import { matchesTacoFoodQuery, TACO_FOODS, type TacoFood } from "@/lib/taco-data";
import { GoalProgress } from "@/components/GoalsAndWater";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { DEFAULT_SECTIONS, escapeHtml, hasNoMacroData, type MealSection } from "@/lib/diet-tools";
import { useGSAP, useEntranceAnimation, useScrollReveal } from "@/hooks/use-gsap-animations";

/** Formata número no padrão pt-BR com 1 casa decimal no máximo. */
const formatNumber = (n: number): string => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** Normaliza texto para busca sem acentos nem case. */
const normalize = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const getApproxUnitGrams = (food: TacoFood): number => {
  const name = normalize(food.nome);
  const approximations: Array<[string[], number]> = [
    [["ovo"], 50],
    [["banana"], 90],
    [["maca"], 130],
    [["pera"], 140],
    [["laranja"], 150],
    [["tangerina", "mexerica"], 100],
    [["limao"], 60],
    [["tomate"], 100],
    [["cebola"], 100],
    [["cenoura"], 80],
    [["batata"], 150],
    [["pao"], 50],
  ];

  return approximations.find(([terms]) => terms.some((term) => name.includes(term)))?.[1] ?? 100;
};

/* ------------------------------------------------------------------ */
/* Header fixo com navegação suave                                     */
/* ------------------------------------------------------------------ */
interface MacroTotals {
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

type DietGoal = "emagrecimento" | "manutencao" | "ganho";
type PortionUnit = "g" | "u";

interface DietItem {
  id: string;
  sectionId: string;
  sectionName: string;
  quantidade: number;
  unidade: PortionUnit;
  nome: string;
  categoria: string;
  gramas: number;
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

const GOAL_OPTIONS: Record<DietGoal, { label: string; description: string; emphasis: string }> = {
  emagrecimento: {
    label: "Emagrecimento",
    description: "Prioriza déficit calórico com maior saciedade e controle de porções.",
    emphasis: "Deficit calórico orientado para perda de gordura.",
  },
  manutencao: {
    label: "Manutenção",
    description: "Mantém energia e performance com equilíbrio de macros e porções estáveis.",
    emphasis: "Equilíbrio para sustentar treino, energia e composição corporal.",
  },
  ganho: {
    label: "Ganho",
    description: "Aumenta a ingestão total com foco em reforço de massa e recuperação.",
    emphasis: "Superávit calórico com foco em performance e ganho de massa.",
  },
};

/**
 * Lógica de cálculo proporcional (regra de três):
 *
 * A Tabela TACO informa a composição nutricional por 100 g do alimento.
 * Para uma gramagem qualquer `g`, cada nutriente é escalado linearmente:
 *
 *   nutrienteNaPorcao = (valorPor100g × g) / 100
 *
 * Ex.: 250 g de peito de frango (32 g de proteína/100 g)
 *      => (32 × 250) / 100 = 80 g de proteína.
 */
const calcularMacros = (food: TacoFood | null, gramas: number): MacroTotals => {
  if (!food || gramas <= 0) return { kcal: 0, carboidratos: 0, proteinas: 0, gorduras: 0 };

  const { por100g } = food;
  const fator = gramas / 100; // fator proporcional da regra de três

  return {
    kcal: por100g.kcal * fator,
    carboidratos: por100g.carboidratos * fator,
    proteinas: por100g.proteinas * fator,
    gorduras: por100g.gorduras * fator,
  };
};

function ResultCard({
  modifier,
  icon: Icon,
  label,
  value,
  unit,
}: {
  modifier: string;
  icon: typeof Flame;
  label: string;
  value: number;
  unit: string;
}) {
  const animated = useAnimatedValue(value);

  return (
    <div className={`result-card glass ${modifier}`}>
      <span className="result-card__label">
        <Icon size={15} />
        {label}
      </span>
      <div className="result-card__value">
        {formatNumber(animated)}
        <span className="result-card__unit">{unit}</span>
      </div>
    </div>
  );
}

export function Calculadora() {
  const sectionRef = useRef<HTMLSectionElement>(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TacoFood | null>(TACO_FOODS[0] ?? null);
  const [quantidade, setQuantidade] = useState("100");
  const [unidade, setUnidade] = useState<PortionUnit>("g");
  const [comboOpen, setComboOpen] = useState(false);
  const [activeFoodId, setActiveFoodId] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("Todos");
  const [diet, setDiet] = usePersistedState<DietItem[]>("nutrikal:diet", []);
  const [dietGoal, setDietGoal] = usePersistedState<DietGoal>("nutrikal:objective", "manutencao");
  const [mealSections, setMealSections] = usePersistedState<MealSection[]>(
    "nutrikal:sections",
    DEFAULT_SECTIONS,
  );
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [patientName, setPatientName] = usePersistedState("nutrikal:patient", "Paciente");
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString("sv-SE"));
  }, []);

  /* GSAP Animations */
  useEntranceAnimation(".calc__form .field", {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
    delay: 0.3,
  });
  useEntranceAnimation(".calc__results .result-card", {
    y: 40,
    opacity: 0,
    scale: 0.95,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(1.5)",
    delay: 0.4,
  });
  useEntranceAnimation(".macro-split", { y: 30, opacity: 0, duration: 0.6, delay: 0.5 });

  /* Mantém a seção selecionada válida (seções salvas, remoções, primeira carga). */
  useEffect(() => {
    if (!mealSections.some((s) => s.id === selectedSectionId))
      setSelectedSectionId(mealSections[0]?.id ?? "");
  }, [mealSections, selectedSectionId]);

  const categorias = useMemo(
    () =>
      ["Todos", ...new Set(TACO_FOODS.map((food) => food.categoria))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [],
  );

  /* Filtra a TACO pelo texto digitado e pela categoria selecionada. */
  const filtered = useMemo(() => {
    return [...TACO_FOODS]
      .filter((food) => matchesTacoFoodQuery(food.nome, query))
      .filter((f) => categoria === "Todos" || f.categoria === categoria)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [query, categoria]);

  const groupedFoods = useMemo(() => {
    const groups = new Map<string, TacoFood[]>();
    for (const food of filtered) {
      const key = food.categoria;
      const current = groups.get(key) ?? [];
      current.push(food);
      groups.set(key, current);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [filtered]);

  const comboFoods = useMemo(() => groupedFoods.flatMap(([, foods]) => foods), [groupedFoods]);

  useEffect(() => {
    if (!activeFoodId) return;
    document.getElementById(`food-option-${activeFoodId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeFoodId]);

  const dietaTotal = useMemo(
    () =>
      diet.reduce(
        (sum, item) => ({
          kcal: sum.kcal + item.kcal,
          carboidratos: sum.carboidratos + item.carboidratos,
          proteinas: sum.proteinas + item.proteinas,
          gorduras: sum.gorduras + item.gorduras,
        }),
        { kcal: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
      ),
    [diet],
  );

  const addFoodToDiet = () => {
    if (!selected || !selectedSectionId) return;

    const section = mealSections.find((item) => item.id === selectedSectionId);
    if (!section) return;

    const quantity = parseFloat(quantidade.replace(",", ".")) || 0;
    if (quantity <= 0) return;

    const grams = unidade === "g" ? quantity : quantity * getApproxUnitGrams(selected);

    const factor = grams / 100;
    const item: DietItem = {
      id: selected.id,
      sectionId: section.id,
      sectionName: section.name,
      quantidade: quantity,
      unidade,
      nome: selected.nome,
      categoria: selected.categoria,
      gramas: grams,
      kcal: selected.por100g.kcal * factor,
      carboidratos: selected.por100g.carboidratos * factor,
      proteinas: selected.por100g.proteinas * factor,
      gorduras: selected.por100g.gorduras * factor,
    };

    setDiet((prev) => {
      const existing = prev.find(
        (entry) => entry.id === selected.id && entry.sectionId === section.id,
      );
      if (!existing) return [...prev, item];

      return prev.map((entry) =>
        entry.id === selected.id && entry.sectionId === section.id
          ? {
              ...entry,
              quantidade: entry.quantidade + quantity,
              gramas: entry.gramas + grams,
              kcal: entry.kcal + item.kcal,
              carboidratos: entry.carboidratos + item.carboidratos,
              proteinas: entry.proteinas + item.proteinas,
              gorduras: entry.gorduras + item.gorduras,
            }
          : entry,
      );
    });
  };

  const removeFromDiet = (id: string, sectionId: string) => {
    setDiet((prev) => prev.filter((item) => item.id !== id || item.sectionId !== sectionId));
  };

  const addMealSection = () => {
    const name = newSectionName.trim();
    if (!name) return;

    const section: MealSection = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      time: "",
    };
    setMealSections((prev) => [...prev, section]);
    setSelectedSectionId(section.id);
    setNewSectionName("");
  };

  const removeMealSection = (section: MealSection) => {
    const sectionItems = diet.filter((item) => item.sectionId === section.id);
    const message = sectionItems.length
      ? `Remover "${section.name}" e os ${sectionItems.length} alimento(s) desta refeição?`
      : `Remover a refeição "${section.name}"?`;
    if (!window.confirm(message)) return;

    setMealSections((current) => current.filter((item) => item.id !== section.id));
    setDiet((current) => current.filter((item) => item.sectionId !== section.id));
  };

  const exportDiet = (format: "pdf" | "doc") => {
    if (diet.length === 0) return;

    const safePatientName = patientName.trim() || "Paciente";
    const reportDateLabel = reportDate
      ? new Date(`${reportDate}T12:00:00`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
    const goalLabel = GOAL_OPTIONS[dietGoal].label;
    const confirmed = window.confirm(
      format === "pdf"
        ? `O relatório de ${safePatientName} para ${goalLabel.toLowerCase()} está pronto para exportar em PDF?`
        : `O relatório de ${safePatientName} para ${goalLabel.toLowerCase()} está pronto para exportar em Word?`,
    );

    if (!confirmed) return;

    const rows = mealSections
      .map((section) => {
        const sectionItems = diet.filter((item) => item.sectionId === section.id);
        if (sectionItems.length === 0) return "";

        return `
          <tr class="section-row">
            <td colspan="6">${escapeHtml(section.name)}</td>
          </tr>
          ${sectionItems
            .map(
              (item) => `
          <tr>
            <td>${escapeHtml(item.nome)}</td>
            <td>${formatNumber(item.quantidade)} ${item.unidade} <small>(${formatNumber(item.gramas)} g)</small></td>
            <td>${formatNumber(item.kcal)} kcal</td>
            <td>${formatNumber(item.proteinas)} g</td>
            <td>${formatNumber(item.carboidratos)} g</td>
            <td>${formatNumber(item.gorduras)} g</td>
          </tr>`,
            )
            .join("")}`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>NUTRIKAL — Plano alimentar</title>
          <style>
            :root {
              --pink: #fbcfe8;
              --pink-strong: #db2777;
              --pink-dark: #831843;
              --cream: #fff7fb;
              --line: #f3d9e7;
              --text: #334155;
              --muted: #64748b;
            }

            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, Helvetica, sans-serif;
              color: var(--text);
              background: #fff;
            }
            .report {
              max-width: 1120px;
              margin: 0 auto;
              background: #fff;
              border: 1px solid var(--line);
              border-radius: 14px;
            }
            .header {
              padding: 22px 26px;
              background: linear-gradient(110deg, #fce7f3 0%, #fff7fb 68%, #fdf2f8 100%);
              border-bottom: 1px solid var(--line);
            }
            .brand {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 0.04em;
              color: var(--text);
            }
            .brand strong {
              color: var(--pink-strong);
            }
            .report-title {
              margin: 7px 0 0;
              color: var(--pink-dark);
              font-size: 24px;
              line-height: 1.2;
            }
            .report-subtitle {
              margin: 5px 0 0;
              color: var(--muted);
              font-size: 12px;
            }
            .content {
              padding: 22px 26px 26px;
            }
            .summary-table {
              width: 100%;
              margin: 0 0 18px;
              border-spacing: 8px 0;
              table-layout: fixed;
              border-collapse: separate;
            }
            .kpi {
              width: 25%;
              padding: 12px 14px;
              background: var(--cream);
              border: 1px solid var(--line);
              border-radius: 10px;
              vertical-align: top;
            }
            .kpi-label {
              display: block;
              margin-bottom: 5px;
              font-size: 10px;
              letter-spacing: 0.07em;
              text-transform: uppercase;
              color: var(--muted);
            }
            .kpi-value {
              font-size: 19px;
              font-weight: 700;
              color: var(--pink-dark);
            }
            .section-title {
              margin: 20px 0 8px;
              color: var(--pink-dark);
              font-size: 14px;
            }
            .goal {
              margin: 0 0 10px;
              padding: 11px 14px;
              border: 1px solid var(--line);
              border-left: 4px solid var(--pink-strong);
              background: var(--cream);
              color: var(--pink-dark);
              font-size: 12px;
              font-weight: 700;
            }
            .goal span { color: var(--muted); font-weight: 500; }
            .patient-meta {
              width: 100%;
              margin: 0 0 18px;
              border-collapse: collapse;
            }
            .patient-meta td {
              width: 50%;
              padding: 10px 12px;
              border: 1px solid var(--line);
              color: var(--text);
              font-size: 12px;
            }
            .patient-meta strong {
              color: var(--pink-dark);
            }
            .patient-meta .meta-label {
              color: var(--muted);
              font-weight: 500;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 11px;
            }
            th, td {
              border: 1px solid var(--line);
              padding: 9px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #fce7f3;
              color: var(--pink-dark);
              font-weight: 700;
            }
            .meal-table th:first-child, .meal-table td:first-child { width: 38%; }
            .meal-table th:nth-child(2), .meal-table td:nth-child(2) { width: 17%; }
            .meal-table th:nth-child(n+3), .meal-table td:nth-child(n+3) { width: 11.25%; }
            .meal-table td:not(:first-child) { white-space: nowrap; }
            .meal-table td small { color: var(--muted); }
            .section-row td {
              padding: 11px 8px 7px;
              border: 0;
              border-bottom: 2px solid var(--pink);
              background: #fff;
              color: var(--pink-strong);
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            tbody tr:not(.section-row):nth-child(even) { background: #fffafd; }
            tr { page-break-inside: avoid; }
            .footer-note {
              margin-top: 16px;
              padding-top: 10px;
              border-top: 1px solid var(--line);
              font-size: 10px;
              line-height: 1.5;
              color: var(--muted);
            }
            @page {
              size: A4 landscape;
              margin: 12mm;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .report {
                max-width: none;
                border: 0;
                border-radius: 0;
              }
              .header, .kpi, .goal, th {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div class="brand">
                NUTRI<strong>KAL</strong>
              </div>
              <h1 class="report-title">Plano alimentar</h1>
              <p class="report-subtitle">${escapeHtml(goalLabel)} · Relatório gerado em ${reportDateLabel}</p>
            </div>

            <div class="content">
              <table class="summary-table">
                <tbody><tr>
                  <td class="kpi"><span class="kpi-label">Calorias</span><span class="kpi-value">${formatNumber(dietaTotal.kcal)} kcal</span></td>
                  <td class="kpi"><span class="kpi-label">Proteínas</span><span class="kpi-value">${formatNumber(dietaTotal.proteinas)} g</span></td>
                  <td class="kpi"><span class="kpi-label">Carboidratos</span><span class="kpi-value">${formatNumber(dietaTotal.carboidratos)} g</span></td>
                  <td class="kpi"><span class="kpi-label">Gorduras</span><span class="kpi-value">${formatNumber(dietaTotal.gorduras)} g</span></td>
                </tr></tbody>
              </table>

              <h2 class="section-title">Dados do plano</h2>
              <table class="patient-meta">
                <tbody><tr>
                  <td><span class="meta-label">Paciente:</span> <strong>${escapeHtml(safePatientName)}</strong></td>
                  <td><span class="meta-label">Data:</span> <strong>${reportDateLabel}</strong></td>
                </tr></tbody>
              </table>

              <div class="goal">
                Objetivo: ${escapeHtml(goalLabel)} <span>· ${escapeHtml(GOAL_OPTIONS[dietGoal].emphasis)}</span>
              </div>

              <h2 class="section-title">Refeições e alimentos</h2>
              <table class="meal-table">
                <thead>
                  <tr>
                    <th>Alimento</th>
                    <th>Quantidade</th>
                    <th>Calorias</th>
                    <th>Proteína</th>
                    <th>Carboidratos</th>
                    <th>Gorduras</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <div class="footer-note">
                Documento gerado pela calculadora NUTRIKAL com base na Tabela TACO.
                Quantidades em unidades usam peso médio aproximado por alimento e devem ser conferidas quando necessário.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    if (format === "pdf") {
      const printWindow = window.open("", "_blank", "width=1100,height=900");
      if (!printWindow) return;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    const blob = new Blob([html], {
      type: "application/vnd.ms-word; charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nutrikal-dieta-${dietGoal}.doc`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  /* Recalcula em tempo real a cada input de alimento ou gramagem. */
  const quantidadeNum = parseFloat(quantidade.replace(",", ".")) || 0;
  const gramasNum =
    unidade === "g"
      ? quantidadeNum
      : quantidadeNum * (selected ? getApproxUnitGrams(selected) : 100);
  const totals = useMemo(() => calcularMacros(selected, gramasNum), [selected, gramasNum]);

  /* Distribuição calórica: proteína/carbo = 4 kcal/g, gordura = 9 kcal/g. */
  const kcalProt = totals.proteinas * 4;
  const kcalCarb = totals.carboidratos * 4;
  const kcalGord = totals.gorduras * 9;
  const kcalTotal = kcalProt + kcalCarb + kcalGord;
  const pct = (v: number) => (kcalTotal > 0 ? (v / kcalTotal) * 100 : 0);

  const selectFood = (food: TacoFood) => {
    setSelected(food);
    setQuery("");
    setComboOpen(false);
    setActiveFoodId(null);
  };

  const renderGroup = (label: string, items: TacoFood[]) =>
    items.length > 0 && (
      <div key={label}>
        <div className="combo__group">{label}</div>
        {items.map((food) => (
          <button
            key={food.id}
            type="button"
            id={`food-option-${food.id}`}
            className={`combo__item ${selected?.id === food.id ? "is-active" : ""} ${activeFoodId === food.id ? "is-highlighted" : ""}`}
            role="option"
            aria-selected={selected?.id === food.id}
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => selectFood(food)}
          >
            {food.nome}
            <small>{food.por100g.kcal} kcal/100g</small>
          </button>
        ))}
      </div>
    );

  return (
    <section id="calculadora" className="section calc">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <span className="eyebrow">
            <Calculator size={14} />
            Calculadora de Nutrientes
          </span>
          <h2>Sua porção, calculada ao grama</h2>
          <p>
            Escolha um alimento da Tabela TACO, informe a gramagem e veja os macronutrientes
            atualizarem em tempo real.
          </p>
        </div>

        <div className="calc__panel glass" data-reveal>
          {/* ---------- Inputs ---------- */}
          <div className="calc__form">
            <div className="field">
              <label htmlFor="food-search">Alimento</label>
              <div className="combo">
                <Search size={17} className="combo__icon" />
                <input
                  id="food-search"
                  className="input"
                  type="text"
                  placeholder={selected ? selected.nome : "Busque um alimento…"}
                  value={comboOpen || query ? query : (selected?.nome ?? "")}
                  role="combobox"
                  aria-expanded={comboOpen}
                  aria-controls="food-options"
                  aria-activedescendant={activeFoodId ? `food-option-${activeFoodId}` : undefined}
                  aria-autocomplete="list"
                  autoComplete="off"
                  onFocus={() => {
                    setComboOpen(true);
                    setActiveFoodId(selected?.id ?? comboFoods[0]?.id ?? null);
                  }}
                  onBlur={(event) => {
                    const nextTarget = event.relatedTarget;
                    if (
                      !(nextTarget instanceof Node) ||
                      !event.currentTarget.parentElement?.contains(nextTarget)
                    ) {
                      setComboOpen(false);
                      setActiveFoodId(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setComboOpen(false);
                      setActiveFoodId(null);
                      return;
                    }

                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      event.preventDefault();
                      setComboOpen(true);
                      if (comboFoods.length === 0) return;
                      const currentIndex = comboFoods.findIndex((food) => food.id === activeFoodId);
                      const nextIndex =
                        event.key === "ArrowDown"
                          ? (currentIndex + 1) % comboFoods.length
                          : currentIndex <= 0
                            ? comboFoods.length - 1
                            : currentIndex - 1;
                      setActiveFoodId(comboFoods[nextIndex]?.id ?? null);
                      return;
                    }

                    if (event.key === "Enter" && comboOpen) {
                      const food =
                        comboFoods.find((item) => item.id === activeFoodId) ?? comboFoods[0];
                      if (food) {
                        event.preventDefault();
                        selectFood(food);
                      }
                    }
                  }}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setComboOpen(true);
                    setActiveFoodId(null);
                  }}
                />
                {comboOpen && (
                  <div id="food-options" className="combo__list" role="listbox">
                    {filtered.length === 0 && (
                      <div className="combo__empty">Nenhum alimento encontrado para “{query}”.</div>
                    )}
                    {groupedFoods.map(([label, items]) => renderGroup(label, items))}
                  </div>
                )}
              </div>
              {selected && (
                <p className="field-hint">
                  Base: {selected.por100g.kcal} kcal · {formatNumber(selected.por100g.proteinas)} g
                  prot · {formatNumber(selected.por100g.carboidratos)} g carb ·{" "}
                  {formatNumber(selected.por100g.gorduras)} g gord — por 100 g
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="category-filter">Categoria</label>
              <select
                id="category-filter"
                className="input"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {categorias.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                Explore a base completa da TACO por categoria e encontre o alimento certo.
              </p>
            </div>

            <div className="field">
              <label htmlFor="diet-goal">Objetivo da dieta</label>
              <div className="goal-selector" id="diet-goal">
                {(Object.keys(GOAL_OPTIONS) as DietGoal[]).map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    className={`goal-option ${dietGoal === goal ? "is-selected" : ""}`}
                    onClick={() => setDietGoal(goal)}
                  >
                    {GOAL_OPTIONS[goal].label}
                  </button>
                ))}
              </div>
              <p className="field-hint">{GOAL_OPTIONS[dietGoal].description}</p>
            </div>

            <div className="field">
              <label htmlFor="quantity">Quantidade</label>
              <div className="portion-input">
                <input
                  id="quantity"
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder={unidade === "g" ? "Ex.: 150" : "Ex.: 2"}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
                <select
                  id="portion-unit"
                  className="input portion-unit"
                  aria-label="Unidade da quantidade"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value as PortionUnit)}
                >
                  <option value="g">gramas (g)</option>
                  <option value="u">unidades (u)</option>
                </select>
              </div>
              <p className="field-hint">
                {unidade === "g"
                  ? "O cálculo aplica regra de três sobre a base oficial de 100 g."
                  : `Estimativa: 1 unidade de ${selected?.nome ?? "alimento"} ≈ ${selected ? getApproxUnitGrams(selected) : 100} g.`}
              </p>
              {selected && hasNoMacroData(selected) && (
                <p className="field-hint" role="alert">
                  Atenção: este item está sem valores na base importada da TACO. Confirme na tabela
                  oficial antes de usar.
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="meal-section">Seção da refeição</label>
              {mealSections.length > 0 ? (
                <select
                  id="meal-section"
                  className="input"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                >
                  <option value="">Escolha uma seção</option>
                  {mealSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="field-hint field-hint--alert">
                  Crie uma seção abaixo antes de adicionar alimentos.
                </p>
              )}
              <p className="field-hint">
                O alimento será incluído na seção escolhida da sua dieta.
              </p>
            </div>

            <div className="field">
              <label htmlFor="new-meal-section">Criar nova seção</label>
              <div className="section-create">
                <input
                  id="new-meal-section"
                  className="input"
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addMealSection();
                  }}
                  placeholder="Ex.: Pré-treino"
                />
                <button type="button" className="btn btn-ghost" onClick={addMealSection}>
                  Adicionar seção
                </button>
              </div>
              {mealSections.length > 0 && (
                <ul className="section-manage-list" aria-label="Gerenciar seções de refeição">
                  {mealSections.map((section) => (
                    <li key={section.id}>
                      <span>{section.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMealSection(section)}
                        aria-label={`Remover refeição ${section.name}`}
                        title={`Remover refeição ${section.name}`}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="diet-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={addFoodToDiet}
                disabled={!selected || !selectedSectionId}
              >
                Adicionar alimento
              </button>
            </div>
          </div>

          {/* ---------- Outputs ---------- */}
          <div className="calc__results" aria-live="polite">
            <ResultCard
              modifier="result-card--kcal"
              icon={Flame}
              label="Calorias"
              value={totals.kcal}
              unit="kcal"
            />
            <ResultCard
              modifier="result-card--proteina"
              icon={Dumbbell}
              label="Proteínas"
              value={totals.proteinas}
              unit="g"
            />
            <ResultCard
              modifier="result-card--carbo"
              icon={Wheat}
              label="Carboidratos"
              value={totals.carboidratos}
              unit="g"
            />
            <ResultCard
              modifier="result-card--gordura"
              icon={Droplets}
              label="Gorduras"
              value={totals.gorduras}
              unit="g"
            />

            {/* Distribuição calórica dos macros */}
            <div className="macro-split glass">
              <div className="macro-split__header">
                <span>Distribuição calórica</span>
                <span>
                  {selected ? `${selected.nome} · ${quantidadeNum || 0} ${unidade}` : "—"}
                </span>
              </div>
              <div className="macro-split__track">
                <div
                  className="macro-split__seg macro-split__seg--proteina"
                  style={{ width: `${pct(kcalProt)}%` }}
                />
                <div
                  className="macro-split__seg macro-split__seg--carbo"
                  style={{ width: `${pct(kcalCarb)}%` }}
                />
                <div
                  className="macro-split__seg macro-split__seg--gordura"
                  style={{ width: `${pct(kcalGord)}%` }}
                />
              </div>
              <div className="macro-split__legend">
                <span>
                  <i className="legend-dot--proteina" />
                  Proteína {formatNumber(pct(kcalProt))}%
                </span>
                <span>
                  <i className="legend-dot--carbo" />
                  Carbo {formatNumber(pct(kcalCarb))}%
                </span>
                <span>
                  <i className="legend-dot--gordura" />
                  Gordura {formatNumber(pct(kcalGord))}%
                </span>
              </div>
            </div>
          </div>

          <div className="diet-panel glass" data-reveal>
            <div className="diet-panel__header">
              <div>
                <span className="eyebrow">Dieta montada</span>
                <h3>Minha refeição</h3>
              </div>
              <div className="diet-panel__summary">{formatNumber(dietaTotal.kcal)} kcal</div>
            </div>

            {diet.length === 0 ? (
              <p className="diet-empty">
                Nenhum alimento adicionado ainda. Escolha um alimento e clique em “Adicionar
                alimento”.
              </p>
            ) : (
              <div className="diet-sections">
                <GoalProgress total={dietaTotal} />
                {mealSections.map((section) => {
                  const sectionItems = diet.filter((item) => item.sectionId === section.id);
                  if (sectionItems.length === 0) return null;

                  return (
                    <section key={section.id} className="diet-section">
                      <h4>{section.name}</h4>
                      <ul className="diet-list">
                        {sectionItems.map((item) => (
                          <li key={`${item.sectionId}-${item.id}`} className="diet-item">
                            <div>
                              <strong>{item.nome}</strong>
                              <span>
                                {formatNumber(item.quantidade)} {item.unidade} ·{" "}
                                {formatNumber(item.kcal)} kcal
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromDiet(item.id, item.sectionId)}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}

            <div className="diet-panel__meta">
              <span>Objetivo: {GOAL_OPTIONS[dietGoal].label}</span>
              <span>Paciente: {patientName.trim() || "Paciente"}</span>
              <span>Proteína: {formatNumber(dietaTotal.proteinas)} g</span>
              <span>Carboidratos: {formatNumber(dietaTotal.carboidratos)} g</span>
              <span>Gorduras: {formatNumber(dietaTotal.gorduras)} g</span>
            </div>

            <div className="diet-report-fields">
              <div className="field">
                <label htmlFor="patient-name">Nome do paciente</label>
                <input
                  id="patient-name"
                  className="input"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ex.: Maria Souza"
                />
              </div>

              <div className="field">
                <label htmlFor="report-date">Data do relatório</label>
                <input
                  id="report-date"
                  className="input"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>
            </div>

            <div className="diet-export-actions">
              <button type="button" className="btn btn-primary" onClick={() => exportDiet("pdf")}>
                A dieta está pronta? Exportar PDF
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => exportDiet("doc")}>
                Exportar Word
              </button>
            </div>
          </div>
        </div>

        <p className="calc__footnote" data-reveal>
          Valores aproximados por 100 g conforme a Tabela TACO (4ª edição, UNICAMP). Suplementos
          incluídos apenas para demonstração.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

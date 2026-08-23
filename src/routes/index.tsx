import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Calculator,
  Droplets,
  Dumbbell,
  Flame,
  Leaf,
  Menu,
  Search,
  Wheat,
  X,
} from "lucide-react";

import heroImg from "@/assets/hero-nutrition.jpg";
import { TACO_FOODS, type TacoFood } from "@/lib/taco-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUTRIKAL — Calculadora de Macros com Tabela TACO" },
      {
        name: "description",
        content:
          "Calcule calorias, proteínas, carboidratos e gorduras dos seus alimentos em tempo real com base na Tabela TACO. Nutrição de precisão para performance e saúde.",
      },
      {
        property: "og:title",
        content: "NUTRIKAL — Calculadora de Macros com Tabela TACO",
      },
      {
        property: "og:description",
        content:
          "Calcule calorias, proteínas, carboidratos e gorduras em tempo real com base na Tabela TACO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ------------------------------------------------------------------ */
/* Hook: anima transições numéricas (count-up suave entre valores)     */
/* ------------------------------------------------------------------ */
function useAnimatedValue(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    if (from === target) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    previous.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/** Formata número no padrão pt-BR com 1 casa decimal no máximo. */
const formatNumber = (n: number): string =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** Normaliza texto para busca sem acentos nem case. */
const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/* ------------------------------------------------------------------ */
/* Header fixo com navegação suave                                     */
/* ------------------------------------------------------------------ */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#inicio", label: "Início" },
    { href: "#nutrientes", label: "Nutrientes" },
    { href: "#calculadora", label: "Calculadora" },
  ];

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container-x site-header__inner">
        <a href="#inicio" className="logo" aria-label="NUTRIKAL — início">
          <span className="logo__mark">
            <Leaf size={17} strokeWidth={2.5} />
          </span>
          <span className="logo__name">
            NUTRI<em>KAL</em>
          </span>
        </a>

        <nav className="main-nav" aria-label="Navegação principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav
        className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Navegação móvel"
      >
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="container-x hero__grid">
        <div>
          <span className="eyebrow" data-reveal>
            <Activity size={14} />
            Nutrição baseada em dados · Tabela TACO
          </span>

          <h1 className="hero__title" data-reveal>
            O que você come define{" "}
            <span className="grad">o que você conquista.</span>
          </h1>

          <p className="hero__lead" data-reveal>
            Cada grama importa. Entenda como proteínas, carboidratos e gorduras
            impactam sua energia, recuperação e composição corporal — e calcule
            seus macros com precisão científica, em tempo real.
          </p>

          <div className="hero__actions" data-reveal>
            <a href="#calculadora" className="btn btn-primary">
              <Calculator size={17} />
              Calcular Macros
            </a>
            <a href="#nutrientes" className="btn btn-ghost">
              Entenda os macros
            </a>
          </div>

          <div className="hero__stats" data-reveal>
            <div className="hero__stat">
              <strong>8+</strong>
              <span>alimentos TACO</span>
            </div>
            <div className="hero__stat">
              <strong>4</strong>
              <span>macros em tempo real</span>
            </div>
            <div className="hero__stat">
              <strong>100g</strong>
              <span>base de cálculo oficial</span>
            </div>
          </div>
        </div>

        <div className="hero__media" data-reveal>
          <img
            src={heroImg}
            alt="Refeição fitness vista de cima: frango grelhado, batata-doce, abacate, ovos e aveia sobre fundo escuro"
            width={1600}
            height={1024}
            fetchPriority="high"
          />
          <div className="hero__chip">
            <span className="hero__chip-icon">
              <Flame size={18} />
            </span>
            <div>
              <strong>Precisão TACO</strong>
              <span>Composição por 100 g do alimento</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Seção de informação — os 3 macronutrientes                          */
/* ------------------------------------------------------------------ */
const MACRO_CARDS = [
  {
    icon: Dumbbell,
    modifier: "macro-card--proteina",
    titulo: "Proteínas",
    descricao:
      "Os blocos de construção do corpo. Essenciais para síntese e reparo muscular, saciedade prolongada e manutenção da massa magra durante déficit calórico.",
    tag: "4 kcal por grama",
  },
  {
    icon: Wheat,
    modifier: "macro-card--carbo",
    titulo: "Carboidratos",
    descricao:
      "A principal fonte de energia do organismo. Abastecem o glicogênio muscular e o cérebro, sustentando treinos intensos e a performance cognitiva.",
    tag: "4 kcal por grama",
  },
  {
    icon: Droplets,
    modifier: "macro-card--gordura",
    titulo: "Gorduras",
    descricao:
      "Fundamentais para a produção hormonal, absorção de vitaminas lipossolúveis (A, D, E, K) e saúde celular. O equilíbrio certo sustenta o metabolismo.",
    tag: "9 kcal por grama",
  },
];

function MacroInfo() {
  return (
    <section id="nutrientes" className="section">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Fundamentos</span>
          <h2>Os três pilares da sua dieta</h2>
          <p>
            Nenhum macronutriente é vilão ou herói isolado. O resultado vem do
            equilíbrio calculado entre eles, ajustado ao seu objetivo.
          </p>
        </div>

        <div className="macro-grid">
          {MACRO_CARDS.map(({ icon: Icon, modifier, titulo, descricao, tag }) => (
            <article key={titulo} className={`macro-card glass ${modifier}`} data-reveal>
              <span className="macro-card__icon">
                <Icon size={22} />
              </span>
              <h3>{titulo}</h3>
              <p>{descricao}</p>
              <span className="macro-card__tag">{tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Calculadora de nutrientes — painel dashboard                        */
/* ------------------------------------------------------------------ */

interface MacroTotals {
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

type DietGoal = "emagrecimento" | "manutencao" | "ganho";

interface DietItem {
  id: string;
  nome: string;
  categoria: string;
  gramas: number;
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

const GOAL_OPTIONS: Record<
  DietGoal,
  { label: string; description: string; emphasis: string }
> = {
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
  if (!food || gramas <= 0)
    return { kcal: 0, carboidratos: 0, proteinas: 0, gorduras: 0 };

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

function Calculadora() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TacoFood | null>(
    TACO_FOODS[0] ?? null,
  );
  const [gramas, setGramas] = useState("100");
  const [comboOpen, setComboOpen] = useState(false);
  const [categoria, setCategoria] = useState("Todos");
  const [diet, setDiet] = useState<DietItem[]>([]);
  const [dietGoal, setDietGoal] = useState<DietGoal>("manutencao");
  const [patientName, setPatientName] = useState("Paciente");
  const [reportDate, setReportDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const categorias = useMemo(
    () =>
      ["Todos", ...new Set(TACO_FOODS.map((food) => food.categoria))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [],
  );

  /* Filtra a TACO pelo texto digitado e pela categoria selecionada. */
  const filtered = useMemo(() => {
    const q = normalize(query);
    return [...TACO_FOODS]
      .filter((f) => normalize(f.nome).includes(q))
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
    if (!selected) return;

    const grams = parseFloat(gramas.replace(",", ".")) || 0;
    if (grams <= 0) return;

    const factor = grams / 100;
    const item: DietItem = {
      id: selected.id,
      nome: selected.nome,
      categoria: selected.categoria,
      gramas: grams,
      kcal: selected.por100g.kcal * factor,
      carboidratos: selected.por100g.carboidratos * factor,
      proteinas: selected.por100g.proteinas * factor,
      gorduras: selected.por100g.gorduras * factor,
    };

    setDiet((prev) => {
      const existing = prev.find((entry) => entry.id === selected.id);
      if (!existing) return [...prev, item];

      return prev.map((entry) =>
        entry.id === selected.id
          ? {
              ...entry,
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

  const removeFromDiet = (id: string) => {
    setDiet((prev) => prev.filter((item) => item.id !== id));
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

    const rows = diet
      .map(
        (item) => `
          <tr>
            <td>${item.nome}</td>
            <td>${formatNumber(item.gramas)} g</td>
            <td>${formatNumber(item.kcal)} kcal</td>
            <td>${formatNumber(item.proteinas)} g</td>
            <td>${formatNumber(item.carboidratos)} g</td>
            <td>${formatNumber(item.gorduras)} g</td>
          </tr>`,
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>NUTRIKAL — Plano alimentar</title>
          <style>
            :root {
              --pink: #e7a6b0;
              --pink-strong: #c56b74;
              --brown: #5d3b35;
              --cream: #fff8f7;
              --line: #ebd5d9;
              --text: #3f2c2a;
              --muted: #7a5d5d;
            }

            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, sans-serif;
              color: var(--text);
              background: var(--cream);
            }
            .report {
              max-width: 980px;
              margin: 0 auto;
              background: #fff;
              border: 1px solid var(--line);
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 14px 40px rgba(93, 59, 53, 0.08);
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 24px 30px;
              background: linear-gradient(135deg, #fbe9ed 0%, #f5dfe3 100%);
              border-bottom: 1px solid var(--line);
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 0.05em;
              color: var(--brown);
            }
            .brand-mark {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, var(--pink) 0%, var(--pink-strong) 100%);
              color: white;
              font-weight: 700;
            }
            .header small {
              color: var(--muted);
              font-size: 12px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .content {
              padding: 28px 30px 32px;
            }
            .summary-bar {
              display: grid;
              grid-template-columns: repeat(4, minmax(140px, 1fr));
              gap: 12px;
              margin-bottom: 22px;
            }
            .kpi {
              background: #fff9f9;
              border: 1px solid var(--line);
              border-radius: 12px;
              padding: 14px 16px;
            }
            .kpi-label {
              display: block;
              font-size: 11px;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              color: var(--muted);
              margin-bottom: 6px;
            }
            .kpi-value {
              font-size: 22px;
              font-weight: 700;
              color: var(--brown);
            }
            .goal {
              margin-bottom: 20px;
              padding: 14px 16px;
              border-left: 4px solid var(--pink-strong);
              background: #fff6f7;
              border-radius: 10px;
              color: var(--brown);
              font-weight: 600;
            }
            .goal span { color: var(--muted); font-weight: 500; }
            .patient-meta {
              display: flex;
              gap: 18px;
              flex-wrap: wrap;
              padding: 14px 16px;
              background: #ffffff;
              border: 1px solid var(--line);
              border-radius: 10px;
              margin-bottom: 18px;
              color: var(--brown);
              font-weight: 600;
            }
            .patient-meta span {
              color: var(--muted);
              font-weight: 500;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              font-size: 14px;
            }
            th, td {
              border: 1px solid var(--line);
              padding: 11px 10px;
              text-align: left;
            }
            th {
              background: #f8edf0;
              color: var(--brown);
              font-weight: 700;
            }
            tbody tr:nth-child(even) { background: #fffaf9; }
            .footer-note {
              margin-top: 18px;
              font-size: 12px;
              color: var(--muted);
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div class="brand">
                <span class="brand-mark">N</span>
                NUTRIKAL
              </div>
              <small>Plano alimentar · ${goalLabel}</small>
            </div>

            <div class="content">
              <div class="summary-bar">
                <div class="kpi">
                  <span class="kpi-label">Calorias</span>
                  <span class="kpi-value">${formatNumber(dietaTotal.kcal)} kcal</span>
                </div>
                <div class="kpi">
                  <span class="kpi-label">Proteína</span>
                  <span class="kpi-value">${formatNumber(dietaTotal.proteinas)} g</span>
                </div>
                <div class="kpi">
                  <span class="kpi-label">Carboidratos</span>
                  <span class="kpi-value">${formatNumber(dietaTotal.carboidratos)} g</span>
                </div>
                <div class="kpi">
                  <span class="kpi-label">Gorduras</span>
                  <span class="kpi-value">${formatNumber(dietaTotal.gorduras)} g</span>
                </div>
              </div>

              <div class="patient-meta">
                <div>Paciente: <strong>${safePatientName}</strong></div>
                <div>Data: <span>${reportDateLabel}</span></div>
              </div>

              <div class="goal">
                Objetivo: ${goalLabel} <span>· ${GOAL_OPTIONS[dietGoal].emphasis}</span>
              </div>

              <table>
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
  const gramasNum = parseFloat(gramas.replace(",", ".")) || 0;
  const totals = useMemo(
    () => calcularMacros(selected, gramasNum),
    [selected, gramasNum],
  );

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
  };

  const renderGroup = (label: string, items: TacoFood[]) =>
    items.length > 0 && (
      <div key={label}>
        <div className="combo__group">{label}</div>
        {items.map((food) => (
          <button
            key={food.id}
            type="button"
            className={`combo__item ${selected?.id === food.id ? "is-active" : ""}`}
            /* onMouseDown + preventDefault: seleciona antes do blur fechar a lista */
            onMouseDown={(e) => {
              e.preventDefault();
              selectFood(food);
            }}
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
            Escolha um alimento da Tabela TACO, informe a gramagem e veja os
            macronutrientes atualizarem em tempo real.
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
                  placeholder={
                    selected ? selected.nome : "Busque um alimento…"
                  }
                  value={comboOpen || query ? query : (selected?.nome ?? "")}
                  autoComplete="off"
                  onFocus={() => setComboOpen(true)}
                  onBlur={() => setComboOpen(false)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setComboOpen(true);
                  }}
                />
                {comboOpen && (
                  <div className="combo__list" role="listbox">
                    {filtered.length === 0 && (
                      <div className="combo__empty">
                        Nenhum alimento encontrado para “{query}”.
                      </div>
                    )}
                    {groupedFoods.map(([label, items]) => renderGroup(label, items))}
                  </div>
                )}
              </div>
              {selected && (
                <p className="field-hint">
                  Base: {selected.por100g.kcal} kcal ·{" "}
                  {formatNumber(selected.por100g.proteinas)} g prot ·{" "}
                  {formatNumber(selected.por100g.carboidratos)} g carb ·{" "}
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
              <label htmlFor="grams">Quantidade (g)</label>
              <input
                id="grams"
                className="input"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                placeholder="Ex.: 150"
                value={gramas}
                onChange={(e) => setGramas(e.target.value)}
              />
              <p className="field-hint">
                O cálculo aplica regra de três sobre a base oficial de 100 g.
              </p>
            </div>

            <div className="diet-actions">
              <button type="button" className="btn btn-primary" onClick={addFoodToDiet}>
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
                  {selected ? `${selected.nome} · ${gramasNum || 0} g` : "—"}
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
              <div className="diet-panel__summary">
                {formatNumber(dietaTotal.kcal)} kcal
              </div>
            </div>

            {diet.length === 0 ? (
              <p className="diet-empty">
                Nenhum alimento adicionado ainda. Escolha um alimento e clique em
                “Adicionar alimento”.
              </p>
            ) : (
              <ul className="diet-list">
                {diet.map((item) => (
                  <li key={item.id} className="diet-item">
                    <div>
                      <strong>{item.nome}</strong>
                      <span>
                        {formatNumber(item.gramas)} g · {formatNumber(item.kcal)} kcal
                      </span>
                    </div>
                    <button type="button" onClick={() => removeFromDiet(item.id)}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
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
          Valores aproximados por 100 g conforme a Tabela TACO (4ª edição,
          UNICAMP). Suplementos incluídos apenas para demonstração.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
function Index() {
  /* Reveal on scroll: IntersectionObserver adiciona .is-visible */
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MacroInfo />
        <Calculadora />
      </main>
      <footer className="site-footer">
        <div className="container-x site-footer__inner">
          <a href="#inicio" className="logo">
            <span className="logo__mark">
              <Leaf size={15} strokeWidth={2.5} />
            </span>
            <span className="logo__name">
              NUTRI<em>KAL</em>
            </span>
          </a>
          <span>
            © 2026 NUTRIKAL · Dados de referência: Tabela TACO (UNICAMP)
          </span>
        </div>
      </footer>
    </>
  );
}

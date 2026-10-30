import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Calculator, CircleHelp, Target, Wheat } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { RevealOnScroll } from "@/components/PageParts";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import { TACO_FOODS, type TacoFood } from "@/lib/taco-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUTRIKAL — Calculadora de Macros com Tabela TACO" },
      {
        name: "description",
        content:
          "Calcule calorias, proteínas, carboidratos e gorduras da porção exata em gramas, com base na Tabela TACO.",
      },
      {
        property: "og:title",
        content: "NUTRIKAL — Calculadora de Macros com Tabela TACO",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const fmt = (n: number, d = 1) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

const FEATURES = [
  {
    to: "/calculadora",
    icon: Calculator,
    title: "Calculadora de porções",
    text: "Escolha o alimento, informe os gramas e monte a dieta por refeição, com relatório em PDF e Word.",
  },
  {
    to: "/metas",
    icon: Target,
    title: "Metas e água",
    text: "Calcule seu gasto energético, defina calorias e macros e acompanhe a hidratação do dia.",
  },
  {
    to: "/nutrientes",
    icon: Wheat,
    title: "Guia dos nutrientes",
    text: "Entenda o papel de proteínas, carboidratos e gorduras no seu objetivo.",
  },
  {
    to: "/duvidas",
    icon: CircleHelp,
    title: "Dúvidas frequentes",
    text: "Cru ou cozido? Posso trocar alimentos? Veja as respostas mais comuns.",
  },
] as const;

function Hero() {
  const [n, setN] = useState(0);
  useEffect(() => setN(TACO_FOODS.length), []);
  const count = useAnimatedValue(n, 1100);

  return (
    <section className="hero">
      <div className="container-x hero__grid">
        <div>
          <span className="eyebrow">
            <Activity size={14} />
            Tabela TACO · base oficial por 100 g
          </span>
          <h1 className="hero__title">
            Calcule os nutrientes da <span className="grad">porção exata</span> da dieta.
          </h1>
          <p className="hero__lead">
            Informe o alimento e o peso prescrito: a regra de três sobre a TACO entrega calorias e
            macros na hora.
          </p>
          <div className="hero__actions">
            <Link to="/calculadora" className="btn btn-primary">
              <Calculator size={17} />
              Calcular agora
            </Link>
            <Link to="/metas" className="btn btn-ghost">
              Definir minha meta
            </Link>
          </div>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>{Math.round(count)}</strong>
            <span>alimentos da TACO</span>
          </div>
          <div className="hero__stat">
            <strong>4</strong>
            <span>macros em tempo real</span>
          </div>
          <div className="hero__stat">
            <strong>100 g</strong>
            <span>base de cálculo oficial</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <h2>Tudo o que você precisa em um só lugar</h2>
          <p>Escolha por onde começar. Cada função tem a sua própria página.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Link
              key={f.to}
              to={f.to}
              className="feature-card glass"
              data-reveal
              style={{ "--i": i } as CSSProperties}
            >
              <span className="feature-card__icon">
                <f.icon size={20} />
              </span>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
              <span className="feature-card__go">
                Abrir <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Demonstração interativa da regra de três (62 g de banana-prata por padrão) */
function RuleOfThree() {
  const food = useMemo(
    () => TACO_FOODS.find((f) => f.nome.startsWith("Banana, prata")) ?? (TACO_FOODS[0] as TacoFood),
    [],
  );
  const [g, setG] = useState(62);
  const m = food.por100g;
  const kcal = useAnimatedValue((m.kcal * g) / 100, 300);

  return (
    <div className="demo glass" data-reveal>
      <strong className="demo__food">{food.nome}</strong>
      <label className="demo__slider">
        <span>Peso da porção</span>
        <b>{g} g</b>
        <input
          type="range"
          min={10}
          max={300}
          value={g}
          onChange={(e) => setG(Number(e.target.value))}
          aria-label="Peso da porção em gramas"
        />
      </label>
      <p className="demo__formula">
        {fmt(m.kcal, 2)} kcal ÷ 100 g × {g} g = <b>{fmt(kcal, 2)} kcal</b>
      </p>
      <div className="demo__chips">
        <span style={{ "--c": "var(--macro-proteina)" } as CSSProperties}>
          Proteínas <b>{fmt((m.proteinas * g) / 100)} g</b>
        </span>
        <span style={{ "--c": "var(--macro-carbo)" } as CSSProperties}>
          Carboidratos <b>{fmt((m.carboidratos * g) / 100)} g</b>
        </span>
        <span style={{ "--c": "var(--macro-gordura)" } as CSSProperties}>
          Gorduras <b>{fmt((m.gorduras * g) / 100)} g</b>
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    ["Escolha o alimento", "Busque na Tabela TACO pelo nome, como “banana prata”."],
    ["Informe o peso", "Use os gramas prescritos, não os 100 g da tabela."],
    ["Veja a porção", "O app aplica a regra de três e mostra calorias e macros."],
  ];
  return (
    <section className="section">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <h2>Como funciona</h2>
          <p>Arraste o controle e veja a regra de três em ação.</p>
        </div>
        <div className="how">
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <li key={t} data-reveal style={{ "--i": i } as CSSProperties}>
                <span className="steps__n">{i + 1}</span>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <RuleOfThree />
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <RevealOnScroll />
      <Hero />
      <Features />
      <HowItWorks />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <div className="next-step glass" data-reveal>
            <div>
              <strong>Pronto para montar a dieta?</strong>
              <p>Comece pela calculadora e exporte o relatório do paciente.</p>
            </div>
            <Link to="/calculadora" className="btn btn-primary">
              Abrir calculadora
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

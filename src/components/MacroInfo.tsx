import { Droplets, Dumbbell, Wheat } from "lucide-react";

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

export function MacroInfo() {
  return (
    <section id="nutrientes" className="section">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Fundamentos</span>
          <h2>Os três pilares da sua dieta</h2>
          <p>
            Nenhum macronutriente é vilão ou herói isolado. O resultado vem do equilíbrio calculado
            entre eles, ajustado ao seu objetivo.
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

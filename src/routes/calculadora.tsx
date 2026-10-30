import { createFileRoute } from "@tanstack/react-router";
import { Calculadora } from "@/components/Calculadora";
import { NextStep, RevealOnScroll } from "@/components/PageParts";

export const Route = createFileRoute("/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de porções — NUTRIKAL" },
      {
        name: "description",
        content:
          "Calcule calorias e macros da porção exata em gramas, monte a dieta por refeição e exporte o relatório.",
      },
      { property: "og:title", content: "Calculadora de porções — NUTRIKAL" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <RevealOnScroll />
      <Calculadora />
      <NextStep
        to="/metas"
        title="Defina sua meta diária"
        text="Calcule seu gasto energético e acompanhe o progresso da dieta."
        cta="Ir para metas"
      />
    </>
  );
}

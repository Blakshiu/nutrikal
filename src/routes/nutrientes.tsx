import { createFileRoute } from "@tanstack/react-router";
import { MacroInfo } from "@/components/MacroInfo";
import { NextStep, RevealOnScroll } from "@/components/PageParts";

export const Route = createFileRoute("/nutrientes")({
  head: () => ({
    meta: [
      { title: "Guia dos nutrientes — NUTRIKAL" },
      {
        name: "description",
        content: "Entenda o papel de proteínas, carboidratos e gorduras na dieta.",
      },
      { property: "og:title", content: "Guia dos nutrientes — NUTRIKAL" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <RevealOnScroll />
      <MacroInfo />
      <NextStep
        to="/calculadora"
        title="Coloque em prática"
        text="Calcule os macros de qualquer alimento da Tabela TACO."
        cta="Calcular agora"
      />
    </>
  );
}

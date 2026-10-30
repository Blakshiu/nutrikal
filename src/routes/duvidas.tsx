import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/Faq";
import { NextStep, RevealOnScroll } from "@/components/PageParts";

export const Route = createFileRoute("/duvidas")({
  head: () => ({
    meta: [
      { title: "Dúvidas frequentes — NUTRIKAL" },
      {
        name: "description",
        content: "Respostas sobre a regra de três, pesos cru e cozido, trocas e dados salvos.",
      },
      { property: "og:title", content: "Dúvidas frequentes — NUTRIKAL" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <RevealOnScroll />
      <Faq />
      <NextStep
        to="/calculadora"
        title="Pronto para começar?"
        text="Informe o alimento e o peso prescrito."
        cta="Abrir calculadora"
      />
    </>
  );
}

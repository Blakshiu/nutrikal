import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { GoalsAndWater } from "@/components/GoalsAndWater";
import { NextStep, PageHead, RevealOnScroll } from "@/components/PageParts";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas e água — NUTRIKAL" },
      {
        name: "description",
        content: "Calcule sua meta diária de calorias e macros e acompanhe a hidratação.",
      },
      { property: "og:title", content: "Metas e água — NUTRIKAL" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <RevealOnScroll />
      <PageHead
        icon={Target}
        eyebrow="Metas e hidratação"
        title="Defina sua meta e acompanhe o dia"
      >
        Calcule seu gasto energético, ajuste a distribuição de macros e registre os copos de água.
      </PageHead>
      <GoalsAndWater />
      <NextStep
        to="/calculadora"
        title="Monte a dieta do dia"
        text="Veja o progresso em relação à meta ao adicionar cada alimento."
        cta="Abrir calculadora"
      />
    </>
  );
}

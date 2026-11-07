import { createFileRoute } from "@tanstack/react-router";

import { NutritionHome } from "@/components/NutritionHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUTRIKAL — seu dia em equilíbrio" },
      {
        name: "description",
        content:
          "Organize suas refeições, acompanhe calorias e macros e calcule porções com a Tabela TACO.",
      },
      { property: "og:title", content: "NUTRIKAL — seu dia em equilíbrio" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NutritionHome,
});

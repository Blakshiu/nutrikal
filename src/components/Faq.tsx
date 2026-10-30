import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ: Array<[string, string]> = [
  [
    "Como o app calcula a quantidade que devo comer?",
    "A Tabela TACO informa os nutrientes para 100 g de cada alimento. O app aplica uma regra de três: valor × gramas ÷ 100. Exemplo: 62 g de banana-prata, que tem 98,25 kcal por 100 g, resultam em 98,25 × 62 ÷ 100 ≈ 60,9 kcal.",
  ],
  [
    "Devo pesar o alimento cru ou cozido?",
    "Siga exatamente o que a sua nutricionista prescreveu. Arroz cru e arroz cozido têm valores muito diferentes por 100 g, por isso o preparo aparece no nome de cada alimento.",
  ],
  [
    "Posso trocar um alimento por outro?",
    "Você pode comparar opções aqui, mas combine as trocas com a sua nutricionista, que considera seus exames, objetivos e restrições.",
  ],
  [
    "Como funcionam as unidades?",
    "A opção “unidades” usa um peso médio estimado (por exemplo, 1 ovo ≈ 50 g). É uma aproximação: a balança de cozinha é sempre mais precisa.",
  ],
  [
    "Os valores são exatos?",
    "São valores de referência da tabela. Variedade, maturação e modo de preparo alteram a composição real, então use como estimativa para o dia a dia.",
  ],
  [
    "Meus dados ficam salvos?",
    "Sim, apenas no seu navegador, neste dispositivo. Nada é enviado a um servidor.",
  ],
];

export function Faq() {
  return (
    <section id="duvidas" className="section">
      <div className="container-x" style={{ maxWidth: 820 }}>
        <h2 className="mb-6 text-2xl font-semibold">Dúvidas frequentes</h2>
        <Accordion type="single" collapsible className="glass px-5">
          {FAQ.map(([q, a], i) => (
            <AccordionItem key={q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

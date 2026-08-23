# Nutri Glow

Atue como um desenvolvedor Front-end Sênior e UI/UX Designer.

Quero que você crie o código completo (HTML, CSS e JavaScript) para uma Single Page Application (SPA) muito moderna sobre nutrição. O design deve ser minimalista, utilizar Dark Mode por padrão, fontes sem serifa (como Inter ou Roboto), e efeitos sutis de glassmorphism (fundo translúcido com desfoque) nos cards.

A página deve ter as seguintes seções:

1. Header & Hero Section:

Um cabeçalho fixo com o logotipo "NutriTech" e navegação suave.

Uma seção Hero com um título chamativo sobre o impacto da nutrição no desempenho e na saúde. Deve incluir um breve texto inspirador e um botão Call-to-Action "Calcular Macros".

2. Seção de Informação:

Três cards modernos lado a lado explicando brevemente a importância dos Macronutrientes: Proteínas (construção muscular), Carboidratos (energia) e Gorduras (função hormonal).

3. Calculadora de Nutrientes (Tabela TACO):

O design desta seção deve ser um painel (dashboard) limpo.

Input: Um campo de busca/seleção para o alimento (ex: Peito de Frango, Batata Doce, Arroz Branco, Ovos) e um campo numérico para a quantidade em gramas (g).

Lógica JS: Crie um mock de dados (JSON) no JavaScript simulando alguns alimentos da Tabela TACO (inclua pelo menos 5 alimentos comuns e, se possível, adicione suplementos como Creatina e Whey Protein apenas para demonstração). O script deve escutar o evento de input, calcular os valores proporcionais à gramagem inserida e atualizar a tela em tempo real.

Output: Quatro cards de resultados grandes e visuais para mostrar: Calorias (kcal), Carboidratos (g), Proteínas (g) e Gorduras (g). Use cores de destaque diferentes para cada macro (ex: Proteína em azul neon, Carbo em verde, Gordura em laranja).

Requisitos técnicos:

O layout deve ser totalmente responsivo (Flexbox/Grid).

Escreva o CSS puro (sem frameworks, mas organizado como se fosse Tailwind) no mesmo arquivo, ou separado claramente.

O JavaScript deve ser limpo, utilizando ES6+ (Arrow functions, destructuring, etc.).

Adicione comentários explicando a lógica de cálculo proporcional (regra de três baseada em 100g do alimento da tabela TACO).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d6fcf981-10b6-4503-932d-9bcf3ce06959).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

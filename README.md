# NutriKal 🥗

Uma Single Page Application (SPA) moderna e responsiva focada em nutrição, cálculo de macronutrientes e otimização de performance. O projeto utiliza um design minimalista com Dark Mode padrão e efeitos de *glassmorphism*, oferecendo uma experiência de usuário fluida e visualmente atraente.

## 🚀 Funcionalidades

- **Hero Section:** Introdução impactante com navegação suave, logotipo NutriTech e um Call-to-Action direto.
- **Guia de Macronutrientes:** Cards informativos explicando o papel fundamental das Proteínas (construção muscular), Carboidratos (energia) e Gorduras (função hormonal).
- **Calculadora Nutricional em Tempo Real:**
  - Baseada em dados estruturados simulando a **Tabela TACO**.
  - Cálculo instantâneo via regra de três a partir de uma base padronizada de 100g.
  - Dashboard interativo que suporta alimentos comuns (Peito de Frango, Batata Doce, Arroz Branco) e suplementos (Whey Protein, Creatina).
  - Resultados visuais com cores de destaque para cada macronutriente (Proteína em azul, Carbo em verde, Gordura em laranja).

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica de Single Page Application.
- **CSS3 (Puro):** Estilização moderna sem frameworks, utilizando CSS Grid, Flexbox e propriedades avançadas de desfoque (backdrop-filter) para o glassmorphism.
- **JavaScript (ES6+):** Lógica assíncrona/reativa, manipulação do DOM e processamento de dados via JSON.

## 🧠 Lógica e Estrutura de Dados

O motor da calculadora funciona através de um conjunto de dados JSON no JavaScript. Os alimentos possuem seus valores nutricionais mapeados para porções exatas de **100g**. 

Quando o usuário interage com o formulário, o script utiliza *event listeners* no input para calcular os valores proporcionais à gramagem inserida e atualizar o DOM em tempo real, sem necessidade de recarregar a página.

## 💻 Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev

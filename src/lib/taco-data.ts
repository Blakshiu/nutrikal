/**
 * Mock de dados nutricionais inspirado na Tabela TACO (Tabela Brasileira de
 * Composição de Alimentos — 4ª edição, UNICAMP).
 *
 * Todos os valores são expressos "por 100 g" do alimento — a calculadora
 * aplica uma regra de três simples sobre essa base.
 */

export interface MacroPer100g {
  kcal: number;
  carboidratos: number; // gramas
  proteinas: number; // gramas
  gorduras: number; // gramas
}

export interface TacoFood {
  id: string;
  nome: string;
  categoria: "taco" | "suplemento";
  por100g: MacroPer100g;
}

export const TACO_FOODS: TacoFood[] = [
  {
    id: "frango-peito",
    nome: "Peito de Frango Grelhado",
    categoria: "taco",
    por100g: { kcal: 159, carboidratos: 0, proteinas: 32, gorduras: 2.5 },
  },
  {
    id: "batata-doce",
    nome: "Batata Doce Cozida",
    categoria: "taco",
    por100g: { kcal: 77, carboidratos: 18.4, proteinas: 0.6, gorduras: 0.1 },
  },
  {
    id: "arroz-branco",
    nome: "Arroz Branco Cozido",
    categoria: "taco",
    por100g: { kcal: 128, carboidratos: 28.1, proteinas: 2.5, gorduras: 0.2 },
  },
  {
    id: "ovo-cozido",
    nome: "Ovo de Galinha Cozido",
    categoria: "taco",
    por100g: { kcal: 146, carboidratos: 0.6, proteinas: 13.3, gorduras: 9.5 },
  },
  {
    id: "aveia",
    nome: "Aveia em Flocos",
    categoria: "taco",
    por100g: { kcal: 394, carboidratos: 66.6, proteinas: 13.9, gorduras: 8.5 },
  },
  {
    id: "banana",
    nome: "Banana Prata",
    categoria: "taco",
    por100g: { kcal: 92, carboidratos: 23.8, proteinas: 1.4, gorduras: 0.1 },
  },
  {
    id: "whey",
    nome: "Whey Protein (Concentrado)",
    categoria: "suplemento",
    por100g: { kcal: 380, carboidratos: 8, proteinas: 75, gorduras: 6 },
  },
  {
    id: "creatina",
    nome: "Creatina Monohidratada",
    categoria: "suplemento",
    por100g: { kcal: 0, carboidratos: 0, proteinas: 0, gorduras: 0 },
  },
];

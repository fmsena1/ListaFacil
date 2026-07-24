export type GastronomicUnit = 'g' | 'kg' | 'ml' | 'litro' | 'un';

export interface BaseResource {
  id: string;
  nome: string;
  tipo: 'ingrediente' | 'embalagem';
  pesoOuQtdCompra: number; // Ex: 1000g, 395g, 1un
  unidadeCompra: GastronomicUnit;
  valorPagoCompra: number; // Ex: R$ 4,50
  dataCriacao?: string; // Data de cadastro do ingrediente/embalagem
}

export interface RecipeItem {
  id: string;
  resourceId: string;
  nome: string;
  quantidadeUtilizada: number; // Ex: 150 (g), 4 (un)
  unidadeUtilizada: GastronomicUnit;
}

export interface RecipeSheet {
  id: string;
  nomeProduto: string; // Ex: "Brigadeiro leite condensado barato"
  rendimentoUnidades: number; // Ex: 50 docinhos
  percentualCustosInvisiveis: number; // Padrão: 30%
  percentualMargemLucroEmpresa: number; // Padrão: 20%
  percentualLucroSalario: number; // Padrão: 40%
  percentualTaxasVenda: number; // Padrão: 0%
  itens: RecipeItem[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CalculatedRecipeItem extends RecipeItem {
  pesoEmGramasOuMl: number;
  custoCalculado: number;
}

export interface RecipePricingResult {
  custoIngredientesEEmbalagens: number;
  pesoTotalReceitaGramas: number;
  custosInvisiveis: number;
  custoTotalReceita: number;
  lucroEmpresa: number;
  lucroSalario: number;
  valorVendaSemTaxa: number;
  valorTaxas: number;
  valorVendaComTaxa: number;
  valorUnitarioPorItem: number;
}

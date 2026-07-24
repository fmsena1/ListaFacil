import { BaseResource, RecipeItem, RecipeSheet, CalculatedRecipeItem, RecipePricingResult, GastronomicUnit } from '../types/recipe';

export class RecipeCalculationService {
  /**
   * Converte uma quantidade e unidade para uma unidade base (g ou ml) para soma de pesos.
   */
  static normalizeToGramOrMl(amount: number, unit: GastronomicUnit): number {
    switch (unit) {
      case 'kg':
        return amount * 1000;
      case 'litro':
        return amount * 1000;
      case 'g':
      case 'ml':
      case 'un':
      default:
        return amount;
    }
  }

  /**
   * Calcula o custo por unidade de medida do recurso base (ex: custo por grama ou por unidade)
   */
  static getResourceUnitCost(resource: BaseResource): number {
    const normalizedQty = this.normalizeToGramOrMl(resource.pesoOuQtdCompra, resource.unidadeCompra);
    if (!normalizedQty || normalizedQty <= 0) return 0;
    return resource.valorPagoCompra / normalizedQty;
  }

  /**
   * Calcula o custo proporcional de um item dentro da receita
   */
  static calculateItemCost(item: RecipeItem, resource?: BaseResource): CalculatedRecipeItem {
    if (!resource) {
      return {
        ...item,
        pesoEmGramasOuMl: this.normalizeToGramOrMl(item.quantidadeUtilizada, item.unidadeUtilizada),
        custoCalculado: 0,
      };
    }

    const unitCost = this.getResourceUnitCost(resource);
    const itemNormalizedQty = this.normalizeToGramOrMl(item.quantidadeUtilizada, item.unidadeUtilizada);
    const custoCalculado = itemNormalizedQty * unitCost;

    return {
      ...item,
      pesoEmGramasOuMl: itemNormalizedQty,
      custoCalculado,
    };
  }

  /**
   * Realiza todos os cálculos financeiros e precificação da Ficha Técnica
   */
  static calculateRecipePricing(recipe: RecipeSheet, resources: BaseResource[]): {
    calculatedItems: CalculatedRecipeItem[];
    result: RecipePricingResult;
  } {
    const resourceMap = new Map<string, BaseResource>();
    resources.forEach(r => resourceMap.set(r.id, r));

    let custoIngredientesEEmbalagens = 0;
    let pesoTotalReceitaGramas = 0;

    const calculatedItems: CalculatedRecipeItem[] = recipe.itens.map(item => {
      const resource = resourceMap.get(item.resourceId);
      const calculated = this.calculateItemCost(item, resource);
      custoIngredientesEEmbalagens += calculated.custoCalculado;
      pesoTotalReceitaGramas += calculated.pesoEmGramasOuMl;
      return calculated;
    });

    const percentualInvisiveis = recipe.percentualCustosInvisiveis ?? 30;
    const percentualEmpresa = recipe.percentualMargemLucroEmpresa ?? 20;
    const percentualSalario = recipe.percentualLucroSalario ?? 40;
    const percentualTaxas = recipe.percentualTaxasVenda ?? 0;

    const custosInvisiveis = custoIngredientesEEmbalagens * (percentualInvisiveis / 100);
    const custoTotalReceita = custoIngredientesEEmbalagens + custosInvisiveis;

    const lucroEmpresa = custoTotalReceita * (percentualEmpresa / 100);
    const lucroSalario = custoTotalReceita * (percentualSalario / 100);
    const valorVendaSemTaxa = custoTotalReceita + lucroEmpresa + lucroSalario;

    const valorTaxas = valorVendaSemTaxa * (percentualTaxas / 100);
    const valorVendaComTaxa = valorVendaSemTaxa + valorTaxas;

    const rendimento = recipe.rendimentoUnidades && recipe.rendimentoUnidades > 0 ? recipe.rendimentoUnidades : 1;
    const valorUnitarioPorItem = valorVendaComTaxa / rendimento;

    const result: RecipePricingResult = {
      custoIngredientesEEmbalagens,
      pesoTotalReceitaGramas,
      custosInvisiveis,
      custoTotalReceita,
      lucroEmpresa,
      lucroSalario,
      valorVendaSemTaxa,
      valorTaxas,
      valorVendaComTaxa,
      valorUnitarioPorItem,
    };

    return { calculatedItems, result };
  }
}

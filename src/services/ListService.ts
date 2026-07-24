import { ShoppingList, ShoppingItem } from '../types/shopping';

export class ListService {
  /**
   * Obtém a quantidade de itens marcados como comprados
   */
  static getBoughtCount(list: ShoppingList): number {
    return list.itens.filter(item => item.comprado).length;
  }

  /**
   * Obtém o percentual de progresso (0 a 1)
   */
  static getProgressRatio(list: ShoppingList): number {
    if (!list.itens || list.itens.length === 0) return 0;
    return this.getBoughtCount(list) / list.itens.length;
  }

  /**
   * Calcula o valor total de um item específico (Quantidade x Preço Unitário)
   */
  static getItemTotal(item: ShoppingItem): number {
    const price = item.precoUnitario || 0;
    return item.quantidade * price;
  }

  /**
   * Calcula o valor total estimado da lista inteira
   */
  static getListTotalValue(list: ShoppingList): number {
    return list.itens.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  /**
   * Calcula o valor total acumulado dos itens comprados (no carrinho)
   */
  static getBoughtTotalValue(list: ShoppingList): number {
    return list.itens
      .filter(item => item.comprado)
      .reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  /**
   * Ordena os itens: Não comprados primeiro, Comprados por último.
   */
  static sortItems(items: ShoppingItem[]): ShoppingItem[] {
    return [...items].sort((a, b) => {
      if (a.comprado !== b.comprado) {
        return a.comprado ? 1 : -1;
      }
      return a.nome.localeCompare(b.nome);
    });
  }

  /**
   * Filtra itens por busca textual
   */
  static filterItems(items: ShoppingItem[], query: string): ShoppingItem[] {
    if (!query || query.trim() === '') return items;
    const lowerQuery = query.toLowerCase().trim();
    return items.filter(item => 
      item.nome.toLowerCase().includes(lowerQuery) ||
      (item.observacao && item.observacao.toLowerCase().includes(lowerQuery))
    );
  }
}

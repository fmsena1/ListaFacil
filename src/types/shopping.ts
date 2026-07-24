export interface ShoppingItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  comprado: boolean;
  observacao?: string;
  precoUnitario?: number;
  quantidadeEstoque?: number;
}

export interface ShoppingList {
  id: string;
  nome: string;
  dataCriacao: string;
  dataAtualizacao: string;
  favorito?: boolean;
  itens: ShoppingItem[];
}

export type UnitType = 'un' | 'kg' | 'g' | 'pacote' | 'caixa' | 'litro' | 'ml';

export interface ImportValidationResult {
  valid: boolean;
  list?: ShoppingList;
  error?: string;
}

export type ImportConflictResolution = 'duplicate' | 'replace' | 'cancel';

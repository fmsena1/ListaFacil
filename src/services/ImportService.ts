import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ShoppingList, ImportValidationResult } from '../types/shopping';

export class ImportService {
  /**
   * Abre o seletor de documentos e lê o arquivo JSON escolhido
   */
  static async pickAndReadJsonFile(): Promise<ImportValidationResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { valid: false, error: 'Seleção de arquivo cancelada.' };
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8
      });

      return this.validateListJson(fileContent);
    } catch (error) {
      console.error('Erro ao ler arquivo importado:', error);
      return { valid: false, error: 'Falha ao ler o arquivo selecionado.' };
    }
  }

  /**
   * Valida a estrutura do JSON e extrai precoUnitario e quantidadeEstoque
   */
  static validateListJson(jsonContent: string): ImportValidationResult {
    try {
      const parsed = JSON.parse(jsonContent);

      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Formato JSON inválido.' };
      }

      if (!parsed.nome || typeof parsed.nome !== 'string' || parsed.nome.trim() === '') {
        return { valid: false, error: 'Arquivo JSON não possui um nome de lista válido.' };
      }

      if (!Array.isArray(parsed.itens)) {
        return { valid: false, error: 'Arquivo JSON não possui uma lista de itens válida.' };
      }

      const validItems = parsed.itens.map((item: any, index: number) => ({
        id: item.id && typeof item.id === 'string' ? item.id : `imported_item_${Date.now()}_${index}`,
        nome: item.nome && typeof item.nome === 'string' ? item.nome : `Item ${index + 1}`,
        quantidade: typeof item.quantidade === 'number' && item.quantidade > 0 ? item.quantidade : 1,
        unidade: item.unidade && typeof item.unidade === 'string' ? item.unidade : 'un',
        comprado: Boolean(item.comprado),
        observacao: typeof item.observacao === 'string' ? item.observacao : '',
        precoUnitario: typeof item.precoUnitario === 'number' && item.precoUnitario >= 0 ? item.precoUnitario : 0,
        quantidadeEstoque: typeof item.quantidadeEstoque === 'number' && item.quantidadeEstoque >= 0 ? item.quantidadeEstoque : 0,
      }));

      const now = new Date().toISOString();
      const list: ShoppingList = {
        id: parsed.id && typeof parsed.id === 'string' ? parsed.id : `imported_list_${Date.now()}`,
        nome: parsed.nome.trim(),
        dataCriacao: parsed.dataCriacao || now,
        dataAtualizacao: now,
        itens: validItems
      };

      return { valid: true, list };
    } catch (error) {
      return { valid: false, error: 'O arquivo selecionado não é um JSON válido.' };
    }
  }
}

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { ShoppingList } from '../types/shopping';
import { ListService } from './ListService';
import { formatCurrency, formatQuantity } from '../utils/formatters';

export class ExportService {
  /**
   * Exporta a lista como arquivo JSON contendo os novos campos de preço e estoque.
   */
  static async exportListToJson(list: ShoppingList): Promise<boolean> {
    try {
      const payload = {
        nome: list.nome,
        dataCriacao: list.dataCriacao,
        itens: list.itens.map(item => ({
          id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: item.unidade,
          comprado: item.comprado,
          observacao: item.observacao || '',
          precoUnitario: item.precoUnitario || 0,
          quantidadeEstoque: item.quantidadeEstoque || 0,
        }))
      };

      const jsonString = JSON.stringify(payload, null, 2);
      const sanitizedName = list.nome.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${sanitizedName || 'Minha_Lista'}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: `Exportar lista: ${list.nome}`,
          UTI: 'public.json'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao exportar lista JSON:', error);
      return false;
    }
  }

  /**
   * Formata e compartilha a lista em texto simples com preços e totais.
   */
  static async shareAsPlainText(list: ShoppingList, unboughtOnly: boolean = false): Promise<boolean> {
    try {
      const itemsToShare = unboughtOnly
        ? list.itens.filter(item => !item.comprado)
        : list.itens;

      const totalValue = unboughtOnly
        ? itemsToShare.reduce((sum, i) => sum + ListService.getItemTotal(i), 0)
        : ListService.getListTotalValue(list);

      let text = `🛒 *${list.nome}*\n`;
      text += `📅 ${new Date(list.dataCriacao).toLocaleDateString('pt-BR')}\n`;
      text += `💰 *Total Estimado: ${formatCurrency(totalValue)}*\n\n`;

      if (itemsToShare.length === 0) {
        text += '_Nenhum item para exibir._';
      } else {
        itemsToShare.forEach(item => {
          const status = item.comprado ? '✔' : '▫';
          const qty = formatQuantity(item.quantidade, item.unidade);
          const itemTotal = ListService.getItemTotal(item);
          const priceStr = itemTotal > 0 ? ` - ${formatCurrency(itemTotal)}` : '';
          const stockStr = item.quantidadeEstoque ? ` (Em estoque: ${item.quantidadeEstoque})` : '';
          const obs = item.observacao ? ` [${item.observacao}]` : '';

          text += `${status} ${item.nome} (${qty})${priceStr}${stockStr}${obs}\n`;
        });
      }

      text += `\n_Gerado pelo Lista Fácil_`;

      await Share.share({
        message: text,
        title: list.nome
      });

      return true;
    } catch (error) {
      console.error('Erro ao compartilhar texto simples:', error);
      return false;
    }
  }
}

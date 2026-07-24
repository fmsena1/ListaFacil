import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Appbar,
  Searchbar,
  FAB,
  Snackbar,
  useTheme,
  Menu,
  IconButton,
  Text,
  Dialog,
  Portal,
  Button
} from 'react-native-paper';
import { ListDetailsScreenProps } from '../navigation/types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  addItemToList,
  updateItemInList,
  toggleItemBought,
  deleteItemFromList,
  deleteMultipleItemsFromList,
  clearBoughtItemsFromList
} from '../store/slices/listsSlice';
import { ListService } from '../services/ListService';
import { ExportService } from '../services/ExportService';
import { formatCurrency } from '../utils/formatters';
import { ShoppingItem } from '../types/shopping';
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { ProgressBar } from '../components/ProgressBar';
import { AddEditItemModal } from '../components/AddEditItemModal';
import { EmptyState } from '../components/EmptyState';

export const ListDetailsScreen: React.FC<ListDetailsScreenProps> = ({ route, navigation }) => {
  const { listId } = route.params;
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const list = useAppSelector(state => state.lists.lists.find(l => l.id === listId));

  const [searchQuery, setSearchQuery] = useState('');
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);

  // Modo de seleção múltipla
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Menu de opções do cabeçalho
  const [menuVisible, setMenuVisible] = useState(false);

  // Confirmação de exclusão
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [clearBoughtConfirm, setClearBoughtConfirm] = useState(false);
  const [deleteSelectedConfirm, setDeleteSelectedConfirm] = useState(false);

  // Feedback do Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Lista não encontrada" />
        </Appbar.Header>
        <EmptyState title="Lista removida ou inexistente." />
      </View>
    );
  }

  // Estatísticas e ordenação (Não comprados primeiro)
  const totalItems = list.itens.length;
  const boughtCount = ListService.getBoughtCount(list);
  const progressRatio = ListService.getProgressRatio(list);
  const totalListValue = ListService.getListTotalValue(list);
  const boughtListValue = ListService.getBoughtTotalValue(list);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = ListService.filterItems(list.itens, searchQuery);
    return ListService.sortItems(filtered);
  }, [list.itens, searchQuery]);

  // Ações de item
  const handleSaveItem = (itemData: Omit<ShoppingItem, 'id' | 'comprado'>) => {
    if (itemToEdit) {
      dispatch(updateItemInList({
        listId,
        item: { ...itemToEdit, ...itemData }
      }));
      showToast('Item atualizado com sucesso!');
    } else {
      dispatch(addItemToList({
        listId,
        item: itemData
      }));
      showToast('Item adicionado à lista!');
    }
    setItemToEdit(null);
  };

  const handleToggleBought = (itemId: string) => {
    dispatch(toggleItemBought({ listId, itemId }));
  };

  const handleDeleteSingleItem = (itemId: string) => {
    dispatch(deleteItemFromList({ listId, itemId }));
    setDeleteConfirmItemId(null);
    showToast('Item removido da lista.');
  };

  const handleToggleSelect = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItemIds.length > 0) {
      dispatch(deleteMultipleItemsFromList({ listId, itemIds: selectedItemIds }));
      showToast(`${selectedItemIds.length} itens removidos.`);
      setSelectedItemIds([]);
      setIsSelectionMode(false);
      setDeleteSelectedConfirm(false);
    }
  };

  const handleClearBought = () => {
    dispatch(clearBoughtItemsFromList(listId));
    setClearBoughtConfirm(false);
    showToast('Itens comprados removidos da lista.');
  };

  // Exportação e Compartilhamento
  const handleExportJson = async () => {
    const ok = await ExportService.exportListToJson(list);
    if (ok) showToast('Arquivo JSON exportado!');
  };

  const handleShareText = async (unboughtOnly: boolean = false) => {
    await ExportService.shareAsPlainText(list, unboughtOnly);
  };

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={list.nome} titleStyle={{ fontWeight: 'bold' }} />

        {isSelectionMode ? (
          <>
            <IconButton
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              onPress={() => setDeleteSelectedConfirm(true)}
              disabled={selectedItemIds.length === 0}
            />
            <IconButton icon="close" onPress={() => { setIsSelectionMode(false); setSelectedItemIds([]); }} />
          </>
        ) : (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />
            }
          >
            <Menu.Item
              leadingIcon="export-variant"
              onPress={() => { setMenuVisible(false); handleExportJson(); }}
              title="Exportar JSON"
            />
            <Menu.Item
              leadingIcon="share-variant-outline"
              onPress={() => { setMenuVisible(false); handleShareText(false); }}
              title="Compartilhar lista (Texto)"
            />
            <Menu.Item
              leadingIcon="share-off-outline"
              onPress={() => { setMenuVisible(false); handleShareText(true); }}
              title="Compartilhar pendentes (Texto)"
            />
            <Menu.Item
              leadingIcon="checkbox-multiple-marked-outline"
              onPress={() => { setMenuVisible(false); setIsSelectionMode(true); }}
              title="Selecionar vários"
            />
            <Menu.Item
              leadingIcon="broom"
              onPress={() => { setMenuVisible(false); setClearBoughtConfirm(true); }}
              title="Limpar comprados"
              disabled={boughtCount === 0}
            />
          </Menu>
        )}
      </Appbar.Header>

      {/* Painel de Resumo de Progresso e Financeiro */}
      <View style={[styles.headerInfo, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.progressTextRow}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
            Progresso da Compra
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
            {boughtCount} de {totalItems} itens comprados
          </Text>
        </View>

        <ProgressBar progress={progressRatio} showPercentage={true} height={10} />

        {totalListValue > 0 && (
          <View style={styles.financialSummaryRow}>
            <View style={styles.financialCol}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                No Carrinho:
              </Text>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                {formatCurrency(boughtListValue)}
              </Text>
            </View>

            <View style={styles.financialColRight}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                Total Estimado:
              </Text>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                {formatCurrency(totalListValue)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Searchbar
          placeholder="Pesquisar itens..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        />

        <FlatList
          data={filteredAndSortedItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ShoppingItemRow
              item={item}
              onToggleBought={() => handleToggleBought(item.id)}
              onEdit={() => {
                setItemToEdit(item);
                setItemModalVisible(true);
              }}
              onDelete={() => setDeleteConfirmItemId(item.id)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItemIds.includes(item.id)}
              onToggleSelect={() => handleToggleSelect(item.id)}
            />
          )}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <EmptyState
              title={searchQuery ? 'Nenhum item encontrado' : 'Lista vazia'}
              subtitle={searchQuery ? 'Tente buscar por outro termo.' : 'Adicione itens como arroz, leite, legumes e muito mais!'}
              actionLabel={searchQuery ? undefined : 'Adicionar Item'}
              onAction={() => {
                setItemToEdit(null);
                setItemModalVisible(true);
              }}
            />
          }
        />
      </View>

      {!isSelectionMode && (
        <FAB
          icon="plus"
          label="Adicionar Item"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#FFFFFF"
          onPress={() => {
            setItemToEdit(null);
            setItemModalVisible(true);
          }}
        />
      )}

      {/* Modal de Adicionar/Editar Item */}
      <AddEditItemModal
        visible={itemModalVisible}
        itemToEdit={itemToEdit}
        onDismiss={() => {
          setItemModalVisible(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
      />

      {/* Confirmação de Exclusão Única */}
      <Portal>
        <Dialog visible={!!deleteConfirmItemId} onDismiss={() => setDeleteConfirmItemId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Excluir Item</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Tem certeza que deseja excluir este item da lista?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmItemId(null)}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={() => deleteConfirmItemId && handleDeleteSingleItem(deleteConfirmItemId)}
              buttonColor={theme.colors.error}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Confirmação de Exclusão de Selecionados */}
      <Portal>
        <Dialog visible={deleteSelectedConfirm} onDismiss={() => setDeleteSelectedConfirm(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Excluir Selecionados</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja remover os {selectedItemIds.length} itens selecionados?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteSelectedConfirm(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleDeleteSelected} buttonColor={theme.colors.error}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Confirmação de Limpar Comprados */}
      <Portal>
        <Dialog visible={clearBoughtConfirm} onDismiss={() => setClearBoughtConfirm(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Limpar Itens Comprados</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Deseja remover todos os {boughtCount} itens já marcados como comprados nesta lista?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearBoughtConfirm(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleClearBought} buttonColor={theme.colors.error}>
              Limpar Comprados
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar de notificação */}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  financialSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  financialCol: {
    alignItems: 'flex-start',
  },
  financialColRight: {
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  listPadding: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

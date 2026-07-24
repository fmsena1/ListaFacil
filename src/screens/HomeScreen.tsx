import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Searchbar, Snackbar, useTheme, Appbar, Dialog, Portal, Text, Button } from 'react-native-paper';
import { HomeScreenProps } from '../navigation/types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  setLists,
  addList,
  renameList,
  deleteList,
  duplicateList,
  toggleFavoriteList,
  replaceList,
  importNewList
} from '../store/slices/listsSlice';
import { StorageService } from '../services/StorageService';
import { ImportService } from '../services/ImportService';
import { ExportService } from '../services/ExportService';
import { ShoppingList, ImportConflictResolution } from '../types/shopping';
import { ShoppingCard } from '../components/ShoppingCard';
import { AddListDialog } from '../components/AddListDialog';
import { ConflictDialog } from '../components/ConflictDialog';
import { EmptyState } from '../components/EmptyState';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { lists, loading } = useAppSelector(state => state.lists);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [renameListId, setRenameListId] = useState<string | null>(null);
  const [renameInitialName, setRenameInitialName] = useState('');
  
  // Confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Conflito de importação
  const [pendingImportList, setPendingImportList] = useState<ShoppingList | null>(null);
  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);

  // Feedback do Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastDeletedList, setLastDeletedList] = useState<ShoppingList | null>(null);

  // Carregar listas salvas ao inicializar
  const loadLists = useCallback(async () => {
    setRefreshing(true);
    const storedLists = await StorageService.getLists();
    dispatch(setLists(storedLists));
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // Filtro de busca por nome
  const filteredLists = useMemo(() => {
    let result = lists;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l => l.nome.toLowerCase().includes(q));
    }
    // Favoritos primeiro, depois por data de criação mais recente
    return [...result].sort((a, b) => {
      if (a.favorito !== b.favorito) {
        return a.favorito ? -1 : 1;
      }
      return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
    });
  }, [lists, searchQuery]);

  // Ações de gerenciamento de lista
  const handleCreateList = (name: string) => {
    dispatch(addList(name));
    setAddDialogVisible(false);
    showToast(`Lista "${name}" criada com sucesso!`);
  };

  const handleRenameList = (newName: string) => {
    if (renameListId) {
      dispatch(renameList({ id: renameListId, newName }));
      setRenameListId(null);
      showToast('Lista renomeada!');
    }
  };

  const handleDeleteList = (id: string) => {
    const listToDelete = lists.find(l => l.id === id);
    if (listToDelete) {
      setLastDeletedList(listToDelete);
      dispatch(deleteList(id));
      setDeleteConfirmId(null);
      showToast(`Lista "${listToDelete.nome}" removida.`, 'DESFAZER', () => {
        dispatch(setLists([listToDelete, ...lists]));
      });
    }
  };

  const handleExportList = async (list: ShoppingList) => {
    const success = await ExportService.exportListToJson(list);
    if (success) {
      showToast('Lista exportada com sucesso!');
    } else {
      showToast('Falha ao exportar arquivo.');
    }
  };

  // Importação de arquivo JSON
  const handleImportPress = async () => {
    const result = await ImportService.pickAndReadJsonFile();
    if (!result.valid || !result.list) {
      showToast(result.error || 'Falha ao importar o arquivo JSON.');
      return;
    }

    const imported = result.list;
    const existing = lists.find(l => l.nome.toLowerCase() === imported.nome.toLowerCase());

    if (existing) {
      setPendingImportList(imported);
      setConflictDialogVisible(true);
    } else {
      dispatch(importNewList({ list: imported }));
      showToast(`Lista "${imported.nome}" importada com sucesso!`);
    }
  };

  const handleResolveConflict = (resolution: ImportConflictResolution) => {
    setConflictDialogVisible(false);
    if (!pendingImportList) return;

    if (resolution === 'duplicate') {
      dispatch(importNewList({ list: pendingImportList, duplicateName: true }));
      showToast(`Lista "${pendingImportList.nome} (Importada)" criada.`);
    } else if (resolution === 'replace') {
      dispatch(replaceList(pendingImportList));
      showToast(`Lista "${pendingImportList.nome}" substituída com sucesso.`);
    }

    setPendingImportList(null);
  };

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderItem = ({ item }: { item: ShoppingList }) => (
    <ShoppingCard
      list={item}
      onPress={() => navigation.navigate('ListDetails', { listId: item.id, listName: item.nome })}
      onFavoriteToggle={() => dispatch(toggleFavoriteList(item.id))}
      onDuplicate={() => {
        dispatch(duplicateList(item.id));
        showToast('Cópia da lista criada!');
      }}
      onRename={() => {
        setRenameListId(item.id);
        setRenameInitialName(item.nome);
      }}
      onDelete={() => setDeleteConfirmId(item.id)}
      onExport={() => handleExportList(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Lista Fácil" titleStyle={{ fontWeight: 'bold' }} subtitle="Sua lista de compras sempre com você." />
        <Appbar.Action icon="file-import-outline" onPress={handleImportPress} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Pesquisar listas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        />

        <FlatList
          data={filteredLists}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLists} colors={[theme.colors.primary]} />}
          ListEmptyComponent={
            <EmptyState
              title={searchQuery ? 'Nenhuma lista encontrada' : 'Nenhuma lista cadastrada'}
              subtitle={searchQuery ? 'Tente buscar por outro nome.' : 'Toque no botão abaixo para criar sua primeira lista de compras!'}
              actionLabel={searchQuery ? undefined : 'Nova Lista'}
              onAction={() => setAddDialogVisible(true)}
            />
          }
        />
      </View>

      <FAB
        icon="plus"
        label="Nova Lista"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => setAddDialogVisible(true)}
      />

      {/* Dialog para Nova Lista */}
      <AddListDialog
        visible={addDialogVisible}
        onDismiss={() => setAddDialogVisible(false)}
        onConfirm={handleCreateList}
        title="Criar Nova Lista"
      />

      {/* Dialog para Renomear Lista */}
      <AddListDialog
        visible={!!renameListId}
        initialValue={renameInitialName}
        onDismiss={() => setRenameListId(null)}
        onConfirm={handleRenameList}
        title="Renomear Lista"
      />

      {/* Confirmação de exclusão */}
      <Portal>
        <Dialog visible={!!deleteConfirmId} onDismiss={() => setDeleteConfirmId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Excluir Lista</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Tem certeza que deseja excluir esta lista e todos os seus itens?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={() => deleteConfirmId && handleDeleteList(deleteConfirmId)}
              buttonColor={theme.colors.error}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Conflito de importação */}
      <ConflictDialog
        visible={conflictDialogVisible}
        listName={pendingImportList?.nome || ''}
        onResolve={handleResolveConflict}
      />

      {/* Snackbar de notificação e Undo */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

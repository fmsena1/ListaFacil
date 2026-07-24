import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Searchbar, FAB, SegmentedButtons, Text, IconButton, useTheme, Snackbar, Dialog, Portal, Button } from 'react-native-paper';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { addResource, updateResource, deleteResource } from '../store/slices/recipesSlice';
import { BaseResource } from '../types/recipe';
import { formatCurrency, formatQuantity } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { AddEditResourceModal } from '../components/AddEditResourceModal';
import { EmptyState } from '../components/EmptyState';

export const ResourcesScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { resources } = useAppSelector(state => state.recipes);

  const [activeTab, setActiveTab] = useState<'ingrediente' | 'embalagem'>('ingrediente');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<BaseResource | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const filteredResources = useMemo(() => {
    let result = resources.filter(r => r.tipo === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => r.nome.toLowerCase().includes(q));
    }
    return result.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [resources, activeTab, searchQuery]);

  const handleSave = (data: Omit<BaseResource, 'id' | 'dataCriacao'>) => {
    if (resourceToEdit) {
      dispatch(updateResource({ ...resourceToEdit, ...data }));
      showToast('Item atualizado com sucesso!');
    } else {
      dispatch(addResource(data));
      showToast('Item cadastrado com sucesso!');
    }
    setResourceToEdit(null);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteResource(id));
    setDeleteConfirmId(null);
    showToast('Item removido do cadastro.');
  };

  const showToast = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Ingredientes e Embalagens" titleStyle={{ fontWeight: 'bold' }} subtitle="Cadastre cada item uma única vez." />
      </Appbar.Header>

      <View style={styles.content}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'ingrediente' | 'embalagem')}
          buttons={[
            { value: 'ingrediente', label: 'Ingredientes' },
            { value: 'embalagem', label: 'Embalagens' },
          ]}
          style={styles.tabButtons}
        />

        <Searchbar
          placeholder={`Pesquisar ${activeTab === 'ingrediente' ? 'ingrediente' : 'embalagem'}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        />

        {/* Tabela de cadastro com exibição da data */}
        {filteredResources.length > 0 && (
          <View style={[styles.tableHeader, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
              {activeTab === 'ingrediente' ? 'INGREDIENTE' : 'EMBALAGEM'}
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>PESO / QTD</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>VALOR</Text>
            <Text style={[styles.tableHeaderCell, { width: 70, textAlign: 'center' }]}>AÇÕES</Text>
          </View>
        )}

        <FlatList
          data={filteredResources}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.tableRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.cellText, styles.bold]} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={styles.dateText}>
                  Cadastrado em: {formatDate(item.dataCriacao || new Date().toISOString())}
                </Text>
              </View>

              <Text style={[styles.cellText, { flex: 1, textAlign: 'center' }]}>
                {formatQuantity(item.pesoOuQtdCompra, item.unidadeCompra)}
              </Text>
              <Text style={[styles.cellText, styles.primaryText, { flex: 1, textAlign: 'right', color: theme.colors.primary }]}>
                {formatCurrency(item.valorPagoCompra)}
              </Text>
              <View style={styles.actionCell}>
                <IconButton
                  icon="pencil"
                  size={16}
                  onPress={() => {
                    setResourceToEdit(item);
                    setModalVisible(true);
                  }}
                />
                <IconButton
                  icon="trash-can-outline"
                  size={16}
                  iconColor={theme.colors.error}
                  onPress={() => setDeleteConfirmId(item.id)}
                />
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <EmptyState
              title={`Nenhum ${activeTab} cadastrado`}
              subtitle={`Cadastre seus ${activeTab}s base com peso de compra e valor pago para calcular receitas automaticamente.`}
              actionLabel={`Cadastrar ${activeTab}`}
              onAction={() => {
                setResourceToEdit(null);
                setModalVisible(true);
              }}
            />
          }
        />
      </View>

      <FAB
        icon="plus"
        label={`Novo ${activeTab === 'ingrediente' ? 'Ingrediente' : 'Embalagem'}`}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => {
          setResourceToEdit(null);
          setModalVisible(true);
        }}
      />

      <AddEditResourceModal
        visible={modalVisible}
        resourceToEdit={resourceToEdit}
        defaultType={activeTab}
        onDismiss={() => {
          setModalVisible(false);
          setResourceToEdit(null);
        }}
        onSave={handleSave}
      />

      <Portal>
        <Dialog visible={!!deleteConfirmId} onDismiss={() => setDeleteConfirmId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Excluir do Cadastro</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Deseja excluir este item da sua base de ingredientes?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button mode="contained" onPress={() => deleteConfirmId && handleDelete(deleteConfirmId)} buttonColor={theme.colors.error}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabButtons: {
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8C7A78',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 3,
    borderWidth: 1,
  },
  cellText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 10,
    color: '#8C7A78',
    marginTop: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  primaryText: {
    fontWeight: '700',
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

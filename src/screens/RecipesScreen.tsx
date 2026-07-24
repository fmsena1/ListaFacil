import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Searchbar, FAB, Card, Text, IconButton, useTheme, Snackbar, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { addRecipe, deleteRecipe } from '../store/slices/recipesSlice';
import { RecipeCalculationService } from '../services/RecipeCalculationService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { EmptyState } from '../components/EmptyState';

interface RecipesScreenProps {
  navigation: any;
}

export const RecipesScreen: React.FC<RecipesScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { recipes, resources } = useAppSelector(state => state.recipes);

  const [searchQuery, setSearchQuery] = useState('');
  const [newRecipeDialogVisible, setNewRecipeDialogVisible] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeYield, setNewRecipeYield] = useState('50');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const filteredRecipes = recipes.filter(r =>
    r.nomeProduto.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleCreateRecipe = () => {
    if (!newRecipeName.trim()) return;
    const yieldNum = parseInt(newRecipeYield, 10) || 1;
    dispatch(addRecipe({ nomeProduto: newRecipeName.trim(), rendimentoUnidades: yieldNum }));
    setNewRecipeDialogVisible(false);
    setNewRecipeName('');
    showToast('Ficha Técnica criada!');
  };

  const handleDeleteRecipe = (id: string) => {
    dispatch(deleteRecipe(id));
    setDeleteConfirmId(null);
    showToast('Ficha técnica excluída.');
  };

  const showToast = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Fichas Técnicas" titleStyle={{ fontWeight: 'bold' }} subtitle="Precificação de receitas e custos." />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Pesquisar ficha técnica..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        />

        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const { result } = RecipeCalculationService.calculateRecipePricing(item, resources);
            return (
              <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                        {item.nomeProduto}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline, fontSize: 11 }}>
                        Cadastrada em: {formatDate(item.dataCriacao)}
                      </Text>
                    </View>

                    <IconButton
                      icon="trash-can-outline"
                      size={18}
                      iconColor={theme.colors.error}
                      onPress={() => setDeleteConfirmId(item.id)}
                    />
                  </View>

                  <View style={styles.cardStats}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {item.itens.length} ingredientes/embalagens
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      Rendimento: {item.rendimentoUnidades} un.
                    </Text>
                  </View>

                  <View style={styles.cardPricesRow}>
                    <View style={styles.priceCol}>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Custo Total:</Text>
                      <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                        {formatCurrency(result.custoTotalReceita)}
                      </Text>
                    </View>

                    <View style={styles.priceColRight}>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Preço de Venda:</Text>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        {formatCurrency(result.valorVendaComTaxa)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.unitPill, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      Valor Unitário: {formatCurrency(result.valorUnitarioPorItem)} / un
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma Ficha Técnica criada"
              subtitle="Crie fichas técnicas para calcular com precisão o custo dos ingredientes, embalagens, custos invisíveis e preço de venda."
              actionLabel="Nova Ficha Técnica"
              onAction={() => setNewRecipeDialogVisible(true)}
            />
          }
        />
      </View>

      <FAB
        icon="plus"
        label="Nova Ficha Técnica"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => setNewRecipeDialogVisible(true)}
      />

      {/* Modal para Nova Receita */}
      <Portal>
        <Dialog visible={newRecipeDialogVisible} onDismiss={() => setNewRecipeDialogVisible(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Nova Ficha Técnica</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome do produto / receita"
              value={newRecipeName}
              onChangeText={setNewRecipeName}
              mode="outlined"
              placeholder="Ex: Brigadeiro Leite Condensado Barato"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Rendimento em Unidades"
              value={newRecipeYield}
              onChangeText={setNewRecipeYield}
              mode="outlined"
              keyboardType="number-pad"
              placeholder="Ex: 50"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewRecipeDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateRecipe}>Criar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={!!deleteConfirmId} onDismiss={() => setDeleteConfirmId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Excluir Ficha Técnica</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Tem certeza que deseja excluir esta ficha técnica?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button mode="contained" onPress={() => deleteConfirmId && handleDeleteRecipe(deleteConfirmId)} buttonColor={theme.colors.error}>
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
  searchBar: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  cardPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3D9DC',
  },
  priceCol: {
    alignItems: 'flex-start',
  },
  priceColRight: {
    alignItems: 'flex-end',
  },
  unitPill: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

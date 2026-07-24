import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, Button, IconButton, useTheme, Snackbar, Dialog, Portal, TextInput } from 'react-native-paper';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateRecipeSettings, addItemToRecipe, removeItemFromRecipe } from '../store/slices/recipesSlice';
import { RecipeCalculationService } from '../services/RecipeCalculationService';
import { formatCurrency, formatQuantity } from '../utils/formatters';
import { RecipeItem } from '../types/recipe';
import { AddRecipeItemModal } from '../components/AddRecipeItemModal';
import { EmptyState } from '../components/EmptyState';

interface RecipeDetailScreenProps {
  route: any;
  navigation: any;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const recipe = useAppSelector(state => state.recipes.recipes.find(r => r.id === recipeId));
  const resources = useAppSelector(state => state.recipes.resources);

  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);

  // Campos de ajuste de precificação
  const [editName, setEditName] = useState(recipe?.nomeProduto || '');
  const [editYield, setEditYield] = useState(recipe?.rendimentoUnidades.toString() || '1');
  const [editInvisibles, setEditInvisibles] = useState(recipe?.percentualCustosInvisiveis.toString() || '30');
  const [editCompanyProfit, setEditCompanyProfit] = useState(recipe?.percentualMargemLucroEmpresa.toString() || '20');
  const [editSalaryProfit, setEditSalaryProfit] = useState(recipe?.percentualLucroSalario.toString() || '40');
  const [editTax, setEditTax] = useState(recipe?.percentualTaxasVenda.toString() || '0');

  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Receita não encontrada" />
        </Appbar.Header>
        <EmptyState title="Ficha técnica não encontrada." />
      </View>
    );
  }

  // Realiza o cálculo completo com base na skill
  const { calculatedItems, result } = RecipeCalculationService.calculateRecipePricing(recipe, resources);

  const handleSaveSettings = () => {
    dispatch(updateRecipeSettings({
      recipeId,
      nomeProduto: editName,
      rendimentoUnidades: parseInt(editYield, 10) || 1,
      percentualCustosInvisiveis: parseFloat(editInvisibles) || 0,
      percentualMargemLucroEmpresa: parseFloat(editCompanyProfit) || 0,
      percentualLucroSalario: parseFloat(editSalaryProfit) || 0,
      percentualTaxasVenda: parseFloat(editTax) || 0,
    }));
    setSettingsDialogVisible(false);
    showToast('Configurações atualizadas!');
  };

  const handleAddItem = (itemData: Omit<RecipeItem, 'id'>) => {
    dispatch(addItemToRecipe({ recipeId, item: itemData }));
    showToast('Item adicionado à ficha técnica!');
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeItemFromRecipe({ recipeId, itemId }));
    setDeleteConfirmItemId(null);
    showToast('Item removido da ficha.');
  };

  const showToast = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={recipe.nomeProduto} titleStyle={{ fontWeight: 'bold' }} subtitle={`Rendimento: ${recipe.rendimentoUnidades} un.`} />
        <Appbar.Action icon="cog-outline" onPress={() => setSettingsDialogVisible(true)} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card 1: Ingredientes da Ficha Técnica (exatamente como a imagem de referência) */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeaderRow}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Ingredientes da ficha técnica
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setAddItemModalVisible(true)}
                style={styles.addButton}
                compact
              >
                Adicionar item
              </Button>
            </View>

            {/* Tabela de Ingredientes */}
            <View style={[styles.tableHeader, { backgroundColor: '#FDF2F2' }]}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>INGREDIENTE</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>QTD.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>UN.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>PESO</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>CUSTO</Text>
              <Text style={[styles.tableHeaderCell, { width: 30, textAlign: 'center' }]}> </Text>
            </View>

            {calculatedItems.length === 0 ? (
              <Text style={styles.emptyTableText}>
                Nenhum ingrediente adicionado. Toque em "+ Adicionar item".
              </Text>
            ) : (
              calculatedItems.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 2, fontWeight: '500' }]} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={[styles.cellText, { flex: 0.8, textAlign: 'center' }]}>
                    {item.quantidadeUtilizada}
                  </Text>
                  <Text style={[styles.cellText, { flex: 0.8, textAlign: 'center', color: '#6B7280' }]}>
                    {item.unidadeUtilizada}
                  </Text>
                  <Text style={[styles.cellText, { flex: 1, textAlign: 'right', color: '#6B7280' }]}>
                    {formatQuantity(item.pesoEmGramasOuMl, 'g')}
                  </Text>
                  <Text style={[styles.cellText, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>
                    {formatCurrency(item.custoCalculado)}
                  </Text>
                  <TouchableOpacity onPress={() => setDeleteConfirmItemId(item.id)} style={{ width: 30, alignItems: 'center' }}>
                    <IconButton icon="trash-can-outline" size={16} iconColor={theme.colors.error} style={{ margin: 0 }} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Rodapé da Tabela: Totais */}
            <View style={styles.tableFooterRow}>
              <Text style={styles.footerLabel}>Totais</Text>
              <View style={styles.footerValues}>
                <Text style={styles.footerText}>
                  {formatQuantity(result.pesoTotalReceitaGramas, 'g')}
                </Text>
                <Text style={[styles.footerText, styles.bold, { marginLeft: 12 }]}>
                  {formatCurrency(result.custoIngredientesEEmbalagens)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Card 2: Resultado financeiro (Ficha Técnica completa) */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { marginBottom: 16 }]}>
              Resultado
            </Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Custo dos ingredientes</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.custoIngredientesEEmbalagens)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Custos invisíveis ({recipe.percentualCustosInvisiveis}%)</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.custosInvisiveis)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, styles.bold]}>Custo total da receita</Text>
              <Text style={[styles.resultValue, styles.bold]}>{formatCurrency(result.custoTotalReceita)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Valor de venda</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.valorVendaSemTaxa)}</Text>
            </View>

            {/* Pill em Destaque no estilo da imagem de referência */}
            <View style={[styles.highlightPill, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.highlightPillLabel}>Valor de venda com taxa</Text>
              <Text style={styles.highlightPillValue}>{formatCurrency(result.valorVendaComTaxa)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Valor das taxas ({recipe.percentualTaxasVenda}%)</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.valorTaxas)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Lucro da empresa ({recipe.percentualMargemLucroEmpresa}%)</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.lucroEmpresa)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Lucro salário ({recipe.percentualLucroSalario}%)</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.lucroSalario)}</Text>
            </View>

            <View style={[styles.resultRow, { marginTop: 8 }]}>
              <Text style={[styles.resultLabel, styles.bold, { fontSize: 16 }]}>Valor unitário</Text>
              <Text style={[styles.resultValue, styles.bold, { fontSize: 16, color: theme.colors.primary }]}>
                {formatCurrency(result.valorUnitarioPorItem)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal para Inserir Item na Receita */}
      <AddRecipeItemModal
        visible={addItemModalVisible}
        resources={resources}
        onDismiss={() => setAddItemModalVisible(false)}
        onSave={handleAddItem}
      />

      {/* Dialog de Ajustes de Margem e Taxas */}
      <Portal>
        <Dialog visible={settingsDialogVisible} onDismiss={() => setSettingsDialogVisible(false)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Ajustes da Ficha Técnica</Dialog.Title>
          <Dialog.Content>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                label="Nome do Produto"
                value={editName}
                onChangeText={setEditName}
                mode="outlined"
                style={styles.dialogInput}
              />
              <TextInput
                label="Rendimento (Unidades)"
                value={editYield}
                onChangeText={setEditYield}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.dialogInput}
              />
              <TextInput
                label="% Custos Invisíveis (Gás, energia...)"
                value={editInvisibles}
                onChangeText={setEditInvisibles}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.dialogInput}
              />
              <TextInput
                label="% Lucro Empresa"
                value={editCompanyProfit}
                onChangeText={setEditCompanyProfit}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.dialogInput}
              />
              <TextInput
                label="% Lucro Salário / Mão de Obra"
                value={editSalaryProfit}
                onChangeText={setEditSalaryProfit}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.dialogInput}
              />
              <TextInput
                label="% Taxas de Venda (Cartão / iFood)"
                value={editTax}
                onChangeText={setEditTax}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.dialogInput}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSettingsDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleSaveSettings}>Salvar Ajustes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Confirmação de remoção */}
      <Portal>
        <Dialog visible={!!deleteConfirmItemId} onDismiss={() => setDeleteConfirmItemId(null)} style={{ borderRadius: 16 }}>
          <Dialog.Title>Remover Item</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Deseja remover este item da ficha técnica?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmItemId(null)}>Cancelar</Button>
            <Button mode="contained" onPress={() => deleteConfirmItemId && handleRemoveItem(deleteConfirmItemId)} buttonColor={theme.colors.error}>
              Remover
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  addButton: {
    borderRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854D0E',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cellText: {
    fontSize: 12,
  },
  emptyTableText: {
    padding: 16,
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  tableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  footerLabel: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  footerValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
  bold: {
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  resultLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  highlightPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 10,
  },
  highlightPillLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  highlightPillValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dialogInput: {
    marginBottom: 10,
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, Menu, useTheme } from 'react-native-paper';
import { ShoppingItem, UnitType } from '../types/shopping';
import { UNIT_OPTIONS } from '../constants/units';
import { formatCurrency } from '../utils/formatters';

interface AddEditItemModalProps {
  visible: boolean;
  itemToEdit?: ShoppingItem | null;
  onDismiss: () => void;
  onSave: (item: Omit<ShoppingItem, 'id' | 'comprado'>) => void;
}

export const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  visible,
  itemToEdit,
  onDismiss,
  onSave,
}) => {
  const theme = useTheme();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [unidade, setUnidade] = useState<UnitType>('un');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('0');
  const [observacao, setObservacao] = useState('');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [nomeError, setNomeError] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setNome(itemToEdit.nome);
      setQuantidade(itemToEdit.quantidade.toString());
      setUnidade((itemToEdit.unidade as UnitType) || 'un');
      setPrecoUnitario(itemToEdit.precoUnitario ? itemToEdit.precoUnitario.toString() : '');
      setQuantidadeEstoque(itemToEdit.quantidadeEstoque ? itemToEdit.quantidadeEstoque.toString() : '0');
      setObservacao(itemToEdit.observacao || '');
    } else {
      setNome('');
      setQuantidade('1');
      setUnidade('un');
      setPrecoUnitario('');
      setQuantidadeEstoque('0');
      setObservacao('');
    }
    setNomeError(false);
  }, [itemToEdit, visible]);

  const parseInputValue = (val: string, fallback: number): number => {
    if (!val) return fallback;
    const normalized = val.replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? fallback : parsed;
  };

  const handleSave = () => {
    if (!nome.trim()) {
      setNomeError(true);
      return;
    }

    const parsedQty = parseInputValue(quantidade, 1);
    const parsedPrice = parseInputValue(precoUnitario, 0);
    const parsedStock = parseInputValue(quantidadeEstoque, 0);

    onSave({
      nome: nome.trim(),
      quantidade: Math.max(parsedQty, 0.01),
      unidade,
      precoUnitario: Math.max(parsedPrice, 0),
      quantidadeEstoque: Math.max(parsedStock, 0),
      observacao: observacao.trim() || undefined,
    });

    onDismiss();
  };

  const selectedUnitLabel = UNIT_OPTIONS.find(u => u.value === unidade)?.label || unidade;
  const currentQtyNum = parseInputValue(quantidade, 0);
  const currentPriceNum = parseInputValue(precoUnitario, 0);
  const estimatedTotal = currentQtyNum * currentPriceNum;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {itemToEdit ? 'Editar Item' : 'Adicionar Item'}
          </Text>

          <TextInput
            label="Nome do item *"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (nomeError) setNomeError(false);
            }}
            mode="outlined"
            error={nomeError}
            placeholder="Ex: Arroz, Leite, Maçã"
            selectTextOnFocus
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Quantidade *"
              value={quantidade}
              onChangeText={setQuantidade}
              mode="outlined"
              keyboardType="decimal-pad"
              selectTextOnFocus
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />

            <Menu
              visible={unitMenuVisible}
              onDismiss={() => setUnitMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setUnitMenuVisible(true)}
                  style={styles.unitButton}
                  contentStyle={{ height: 48 }}
                >
                  {selectedUnitLabel}
                </Button>
              }
            >
              {UNIT_OPTIONS.map((opt) => (
                <Menu.Item
                  key={opt.value}
                  onPress={() => {
                    setUnidade(opt.value);
                    setUnitMenuVisible(false);
                  }}
                  title={opt.label}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Preço Unitário (R$)"
              value={precoUnitario}
              onChangeText={setPrecoUnitario}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="0,00"
              selectTextOnFocus
              left={<TextInput.Icon icon="currency-usd" />}
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />

            <TextInput
              label="Qtd em Estoque"
              value={quantidadeEstoque}
              onChangeText={setQuantidadeEstoque}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="0"
              selectTextOnFocus
              left={<TextInput.Icon icon="package-variant" />}
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          {currentPriceNum > 0 && (
            <View style={[styles.totalBadge, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                Subtotal Estimado: {formatCurrency(estimatedTotal)}
              </Text>
            </View>
          )}

          <TextInput
            label="Observação (opcional)"
            value={observacao}
            onChangeText={setObservacao}
            mode="outlined"
            placeholder="Ex: Marca específica, em promoção"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button onPress={onDismiss} style={styles.actionButton}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
              Salvar Item
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitButton: {
    marginTop: 6,
    justifyContent: 'center',
  },
  totalBadge: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    marginLeft: 8,
  },
});

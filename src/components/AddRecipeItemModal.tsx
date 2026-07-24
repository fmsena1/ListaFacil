import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, Menu, useTheme } from 'react-native-paper';
import { BaseResource, RecipeItem, GastronomicUnit } from '../types/recipe';
import { UNIT_OPTIONS } from '../constants/units';

interface AddRecipeItemModalProps {
  visible: boolean;
  resources: BaseResource[];
  itemToEdit?: RecipeItem | null;
  onDismiss: () => void;
  onSave: (item: Omit<RecipeItem, 'id'>) => void;
}

export const AddRecipeItemModal: React.FC<AddRecipeItemModalProps> = ({
  visible,
  resources,
  itemToEdit,
  onDismiss,
  onSave,
}) => {
  const theme = useTheme();
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [quantidadeUtilizada, setQuantidadeUtilizada] = useState('1');
  const [unidadeUtilizada, setUnidadeUtilizada] = useState<GastronomicUnit>('g');
  const [resourceMenuVisible, setResourceMenuVisible] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setSelectedResourceId(itemToEdit.resourceId);
      setQuantidadeUtilizada(itemToEdit.quantidadeUtilizada.toString());
      setUnidadeUtilizada(itemToEdit.unidadeUtilizada);
    } else {
      setSelectedResourceId(resources.length > 0 ? resources[0].id : '');
      setQuantidadeUtilizada('1');
      setUnidadeUtilizada('g');
    }
    setError(false);
  }, [itemToEdit, resources, visible]);

  const parseInputValue = (val: string, fallback: number): number => {
    if (!val) return fallback;
    const normalized = val.replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? fallback : parsed;
  };

  const handleSave = () => {
    if (!selectedResourceId) {
      setError(true);
      return;
    }

    const resource = resources.find(r => r.id === selectedResourceId);
    if (!resource) return;

    const parsedQty = parseInputValue(quantidadeUtilizada, 1);

    onSave({
      resourceId: resource.id,
      nome: resource.nome,
      quantidadeUtilizada: Math.max(parsedQty, 0.01),
      unidadeUtilizada,
    });

    onDismiss();
  };

  const selectedResource = resources.find(r => r.id === selectedResourceId);
  const selectedUnitLabel = UNIT_OPTIONS.find(u => u.value === unidadeUtilizada)?.label || unidadeUtilizada;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {itemToEdit ? 'Editar Item da Receita' : 'Adicionar Item na Receita'}
          </Text>

          <Text variant="labelLarge" style={{ marginBottom: 6, color: theme.colors.onSurface }}>
            Selecione o Ingrediente / Embalagem *
          </Text>

          <Menu
            visible={resourceMenuVisible}
            onDismiss={() => setResourceMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setResourceMenuVisible(true)}
                style={styles.selectButton}
                contentStyle={{ height: 48 }}
              >
                {selectedResource ? `${selectedResource.nome} (${selectedResource.tipo})` : 'Escolher item...'}
              </Button>
            }
          >
            {resources.map((res) => (
              <Menu.Item
                key={res.id}
                onPress={() => {
                  setSelectedResourceId(res.id);
                  setUnidadeUtilizada(res.unidadeCompra);
                  setResourceMenuVisible(false);
                }}
                title={`${res.nome} (${res.tipo === 'ingrediente' ? 'Ingrediente' : 'Embalagem'})`}
              />
            ))}
          </Menu>

          <View style={[styles.row, { marginTop: 16 }]}>
            <TextInput
              label="Qtd. Utilizada na Receita *"
              value={quantidadeUtilizada}
              onChangeText={setQuantidadeUtilizada}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="Ex: 4, 150, 300"
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
                    setUnidadeUtilizada(opt.value as GastronomicUnit);
                    setUnitMenuVisible(false);
                  }}
                  title={opt.label}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.actions}>
            <Button onPress={onDismiss} style={styles.actionButton}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.actionButton} disabled={!selectedResourceId}>
              Adicionar
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
  selectButton: {
    justifyContent: 'center',
    marginBottom: 12,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    marginLeft: 8,
  },
});

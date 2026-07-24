import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, Menu, SegmentedButtons, useTheme } from 'react-native-paper';
import { BaseResource, GastronomicUnit } from '../types/recipe';
import { UNIT_OPTIONS } from '../constants/units';

interface AddEditResourceModalProps {
  visible: boolean;
  resourceToEdit?: BaseResource | null;
  defaultType?: 'ingrediente' | 'embalagem';
  onDismiss: () => void;
  onSave: (resource: Omit<BaseResource, 'id'>) => void;
}

export const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({
  visible,
  resourceToEdit,
  defaultType = 'ingrediente',
  onDismiss,
  onSave,
}) => {
  const theme = useTheme();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'ingrediente' | 'embalagem'>(defaultType);
  const [pesoOuQtdCompra, setPesoOuQtdCompra] = useState('');
  const [unidadeCompra, setUnidadeCompra] = useState<GastronomicUnit>('g');
  const [valorPagoCompra, setValorPagoCompra] = useState('');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [nomeError, setNomeError] = useState(false);

  useEffect(() => {
    if (resourceToEdit) {
      setNome(resourceToEdit.nome);
      setTipo(resourceToEdit.tipo);
      setPesoOuQtdCompra(resourceToEdit.pesoOuQtdCompra.toString());
      setUnidadeCompra(resourceToEdit.unidadeCompra);
      setValorPagoCompra(resourceToEdit.valorPagoCompra.toString());
    } else {
      setNome('');
      setTipo(defaultType);
      setPesoOuQtdCompra('1000');
      setUnidadeCompra('g');
      setValorPagoCompra('');
    }
    setNomeError(false);
  }, [resourceToEdit, defaultType, visible]);

  const handleSave = () => {
    if (!nome.trim()) {
      setNomeError(true);
      return;
    }

    const parsedQty = parseFloat(pesoOuQtdCompra.replace(',', '.')) || 1;
    const parsedPrice = parseFloat(valorPagoCompra.replace(',', '.')) || 0;

    onSave({
      nome: nome.trim(),
      tipo,
      pesoOuQtdCompra: Math.max(parsedQty, 0.01),
      unidadeCompra,
      valorPagoCompra: Math.max(parsedPrice, 0),
    });

    onDismiss();
  };

  const selectedUnitLabel = UNIT_OPTIONS.find(u => u.value === unidadeCompra)?.label || unidadeCompra;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {resourceToEdit ? 'Editar Item Base' : 'Cadastrar Item Base'}
          </Text>

          <SegmentedButtons
            value={tipo}
            onValueChange={(val) => setTipo(val as 'ingrediente' | 'embalagem')}
            buttons={[
              { value: 'ingrediente', label: 'Ingrediente' },
              { value: 'embalagem', label: 'Embalagem' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Nome do ingrediente / embalagem *"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (nomeError) setNomeError(false);
            }}
            mode="outlined"
            error={nomeError}
            placeholder="Ex: Leite Condensado, Chocolate em pó, Caixa"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Peso / Qtd de Compra *"
              value={pesoOuQtdCompra}
              onChangeText={setPesoOuQtdCompra}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="Ex: 395, 1000, 1"
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
                    setUnidadeCompra(opt.value as GastronomicUnit);
                    setUnitMenuVisible(false);
                  }}
                  title={opt.label}
                />
              ))}
            </Menu>
          </View>

          <TextInput
            label="Valor Pago na Compra (R$) *"
            value={valorPagoCompra}
            onChangeText={setValorPagoCompra}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="Ex: 4.50"
            left={<TextInput.Icon icon="currency-usd" />}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button onPress={onDismiss} style={styles.actionButton}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
              Salvar
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
  segmented: {
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    marginLeft: 8,
  },
});

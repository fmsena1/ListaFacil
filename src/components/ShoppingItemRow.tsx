import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox, Text, IconButton, useTheme, Chip } from 'react-native-paper';
import { ShoppingItem } from '../types/shopping';
import { formatQuantity, formatCurrency } from '../utils/formatters';
import { ListService } from '../services/ListService';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggleBought: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = React.memo(({
  item,
  onToggleBought,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const theme = useTheme();

  const itemTotal = ListService.getItemTotal(item);
  const hasPrice = typeof item.precoUnitario === 'number' && item.precoUnitario > 0;
  const hasStock = typeof item.quantidadeEstoque === 'number' && item.quantidadeEstoque > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isSelectionMode ? onToggleSelect : onToggleBought}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? theme.colors.primaryContainer
            : item.comprado
            ? (theme.dark ? '#1A241E' : '#F0FDF4')
            : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.leftSection}>
        {isSelectionMode ? (
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={onToggleSelect}
            color={theme.colors.primary}
          />
        ) : (
          <Checkbox
            status={item.comprado ? 'checked' : 'unchecked'}
            onPress={onToggleBought}
            color={theme.colors.primary}
          />
        )}

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              variant="bodyLarge"
              style={[
                styles.name,
                {
                  color: item.comprado ? theme.colors.outline : theme.colors.onSurface,
                  textDecorationLine: item.comprado ? 'line-through' : 'none',
                },
              ]}
            >
              {item.nome}
            </Text>

            {hasPrice && (
              <Text
                variant="bodyMedium"
                style={[
                  styles.priceText,
                  {
                    color: item.comprado ? theme.colors.outline : theme.colors.primary,
                    textDecorationLine: item.comprado ? 'line-through' : 'none',
                  },
                ]}
              >
                {formatCurrency(itemTotal)}
              </Text>
            )}
          </View>

          <View style={styles.subInfoRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {formatQuantity(item.quantidade, item.unidade)}
            </Text>

            {hasPrice && (
              <Text variant="bodySmall" style={[styles.unitPrice, { color: theme.colors.outline }]}>
                ({formatCurrency(item.precoUnitario)}/{item.unidade})
              </Text>
            )}

            {hasStock && (
              <View style={[styles.stockBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}>
                  Estoque: {formatQuantity(item.quantidadeEstoque!, item.unidade)}
                </Text>
              </View>
            )}
          </View>

          {item.observacao ? (
            <Text variant="bodySmall" style={[styles.observation, { color: theme.colors.outline }]}>
              💬 {item.observacao}
            </Text>
          ) : null}
        </View>
      </View>

      {!isSelectionMode && (
        <View style={styles.actions}>
          <IconButton icon="pencil-outline" size={18} onPress={onEdit} />
          <IconButton
            icon="trash-can-outline"
            size={18}
            iconColor={theme.colors.error}
            onPress={onDelete}
          />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  name: {
    fontWeight: '600',
    flex: 1,
  },
  priceText: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  unitPrice: {
    marginLeft: 6,
  },
  stockBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  observation: {
    fontStyle: 'italic',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

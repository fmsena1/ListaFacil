import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Menu, useTheme } from 'react-native-paper';
import { ShoppingList } from '../types/shopping';
import { ListService } from '../services/ListService';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';
import { ProgressBar } from './ProgressBar';

interface ShoppingCardProps {
  list: ShoppingList;
  onPress: () => void;
  onFavoriteToggle: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export const ShoppingCard: React.FC<ShoppingCardProps> = React.memo(({
  list,
  onPress,
  onFavoriteToggle,
  onDuplicate,
  onRename,
  onDelete,
  onExport,
}) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const totalItems = list.itens.length;
  const boughtItems = ListService.getBoughtCount(list);
  const progressRatio = ListService.getProgressRatio(list);
  const totalValue = ListService.getListTotalValue(list);

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {list.nome}
            </Text>
            <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.outline }]}>
              Cadastrada em: {formatDate(list.dataCriacao)}
            </Text>
          </View>

          <View style={styles.actionsRight}>
            <IconButton
              icon={list.favorito ? 'heart' : 'heart-outline'}
              iconColor={list.favorito ? '#E53E3E' : theme.colors.outline}
              size={20}
              onPress={onFavoriteToggle}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                leadingIcon="export-variant"
                onPress={() => { setMenuVisible(false); onExport(); }}
                title="Exportar JSON"
              />
              <Menu.Item
                leadingIcon="content-copy"
                onPress={() => { setMenuVisible(false); onDuplicate(); }}
                title="Duplicar"
              />
              <Menu.Item
                leadingIcon="pencil"
                onPress={() => { setMenuVisible(false); onRename(); }}
                title="Renomear"
              />
              <Menu.Item
                leadingIcon="delete"
                onPress={() => { setMenuVisible(false); onDelete(); }}
                title="Excluir"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {boughtItems} de {totalItems} comprados
          </Text>
          {totalValue > 0 && (
            <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              Total: {formatCurrency(totalValue)}
            </Text>
          )}
        </View>

        <ProgressBar progress={progressRatio} showPercentage={false} />
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
});

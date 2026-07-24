import React from 'react';
import { Dialog, Portal, Button, Text } from 'react-native-paper';
import { ImportConflictResolution } from '../types/shopping';

interface ConflictDialogProps {
  visible: boolean;
  listName: string;
  onResolve: (resolution: ImportConflictResolution) => void;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  visible,
  listName,
  onResolve,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => onResolve('cancel')} style={{ borderRadius: 16 }}>
        <Dialog.Title>Lista Já Existente</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Já existe uma lista com o nome <Text style={{ fontWeight: 'bold' }}>"{listName}"</Text>.
            O que você gostaria de fazer?
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <Button mode="contained" onPress={() => onResolve('duplicate')} style={{ marginBottom: 6 }}>
            Duplicar (Criar cópia)
          </Button>
          <Button mode="outlined" onPress={() => onResolve('replace')} style={{ marginBottom: 6 }}>
            Substituir existente
          </Button>
          <Button onPress={() => onResolve('cancel')}>
            Cancelar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

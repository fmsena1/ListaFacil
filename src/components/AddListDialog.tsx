import React, { useState, useEffect } from 'react';
import { Dialog, Portal, TextInput, Button, useTheme } from 'react-native-paper';

interface AddListDialogProps {
  visible: boolean;
  initialValue?: string;
  title?: string;
  onDismiss: () => void;
  onConfirm: (name: string) => void;
}

export const AddListDialog: React.FC<AddListDialogProps> = ({
  visible,
  initialValue = '',
  title = 'Nova Lista',
  onDismiss,
  onConfirm,
}) => {
  const theme = useTheme();
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState(false);

  useEffect(() => {
    setName(initialValue);
    setError(false);
  }, [initialValue, visible]);

  const handleConfirm = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    onConfirm(name.trim());
    setName('');
    setError(false);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderRadius: 16 }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Nome da lista"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(false);
            }}
            mode="outlined"
            error={error}
            placeholder="Ex: Supermercado, Feira, Farmácia"
            autoFocus
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button mode="contained" onPress={handleConfirm}>
            Salvar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

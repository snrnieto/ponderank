import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  onRecalculate: () => void;
  onKeep: () => void;
  onCancel: () => void;
};

export function FilterRecalcModal({ visible, onRecalculate, onKeep, onCancel }: Props) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(15,14,23,0.45)' }]}>
        <Surface padded elevation="lg" style={{ margin: theme.spacing[5], gap: theme.spacing[3] }}>
          <Text variant="overline">Filtro</Text>
          <Text variant="subtitle">¿Recalcular ranking?</Text>
          <Text colorKey="textSecondary">
            Al filtrar puedes recalcular objetivos dinámicos (mín/máx/promedio) solo con los items
            visibles, o mantener los valores calculados sobre toda la lista.
          </Text>
          <Button title="Recalcular con visibles" pill onPress={onRecalculate} />
          <Button title="Mantener valores de toda la lista" variant="secondary" pill onPress={onKeep} />
          <Button title="Cancelar" variant="ghost" onPress={onCancel} />
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center' },
});

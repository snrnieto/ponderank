import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

export type ActionMenuItem = { label: string; onPress: () => void };

/**
 * Menú de acciones secundarias como hoja inferior (pensado para celular: queda al alcance del
 * pulgar). Cada acción ocupa una fila de 48 px.
 */
export function ActionMenu({ visible, items, onClose }: { visible: boolean; items: ActionMenuItem[]; onClose: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(20,22,43,0.45)' }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.common.close} style={StyleSheet.absoluteFill} onPress={onClose} />
        <Surface padded elevation="lg" style={{ margin: theme.spacing[3], gap: theme.spacing[1], width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={({ pressed, hovered }) => ({
                minHeight: 48,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing[3],
                borderRadius: theme.radius.sm,
                backgroundColor: pressed || hovered ? theme.colors.surfaceMuted : 'transparent',
              })}
            >
              <Text variant="label" style={{ fontSize: theme.typography.sizes.md }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing[1] }}
          >
            <Text variant="label" colorKey="primary">
              {t.common.cancel}
            </Text>
          </Pressable>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
});

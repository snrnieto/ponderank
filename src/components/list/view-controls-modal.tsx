import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PartialsToggle } from '@/components/list/partials-toggle';
import { SortControls } from '@/components/list/sort-controls';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import type { ComparisonListBundle } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { SortDir, SortKey } from '@/state/use-list-view';

type Props = {
  visible: boolean;
  bundle: ComparisonListBundle;
  showPartials: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onShowPartials: (value: boolean) => void;
  onSortKey: (key: SortKey) => void;
  onSortDir: (dir: SortDir) => void;
  onClose: () => void;
};

/** Hoja de «Ordenar y detalles» de la tabla. Los filtros viven en la propia pantalla. */
export function ViewControlsModal({
  visible,
  bundle,
  showPartials,
  sortKey,
  sortDir,
  onShowPartials,
  onSortKey,
  onSortDir,
  onClose,
}: Props) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(20,22,43,0.45)' }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.common.close} style={StyleSheet.absoluteFill} onPress={onClose} />
        <Surface padded elevation="lg" style={[styles.panel, { margin: theme.spacing[4], gap: theme.spacing[4] }]}>
          <ScrollView style={styles.scroll} contentContainerStyle={{ gap: theme.spacing[5] }} showsVerticalScrollIndicator={false}>
            <View style={styles.titleRow}>
              <Text variant="subtitle">{t.ranking.sortAndDetails}</Text>
              <Button title={t.common.close} size="sm" variant="ghost" onPress={onClose} />
            </View>
            <SortControls
              bundle={bundle}
              sortKey={sortKey}
              sortDir={sortDir}
              showPartials={showPartials}
              onSortKey={onSortKey}
              onSortDir={onSortDir}
            />
            <PartialsToggle value={showPartials} onChange={onShowPartials} />
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  panel: { width: '92%', maxWidth: 560, maxHeight: '85%' },
  scroll: { flexGrow: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});

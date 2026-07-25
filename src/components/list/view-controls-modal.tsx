import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PartialsToggle } from '@/components/list/partials-toggle';
import { SortControls } from '@/components/list/sort-controls';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import type { ComparisonListBundle } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import type { FilterState, RecalcMode, SortDir, SortKey } from '@/state/use-list-view';

type Props = {
  visible: boolean;
  bundle: ComparisonListBundle;
  categoryColumn: ComparisonListBundle['columns'][number] | undefined;
  showPartials: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  filter: FilterState;
  recalcMode: RecalcMode;
  visibleCount: number;
  onShowPartials: (value: boolean) => void;
  onSortKey: (key: SortKey) => void;
  onSortDir: (dir: SortDir) => void;
  onFilter: (filter: FilterState) => void;
  onClearFilter: () => void;
  onClose: () => void;
};

export function ViewControlsModal({
  visible,
  bundle,
  categoryColumn,
  showPartials,
  sortKey,
  sortDir,
  filter,
  recalcMode,
  visibleCount,
  onShowPartials,
  onSortKey,
  onSortDir,
  onFilter,
  onClearFilter,
  onClose,
}: Props) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(15,14,23,0.45)' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar opciones de vista"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Surface
          padded
          elevation="lg"
          style={[
            styles.panel,
            {
              margin: theme.spacing[4],
              gap: theme.spacing[4],
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ gap: theme.spacing[4] }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleRow}>
              <View style={{ gap: theme.spacing[1] }}>
                <Text variant="overline">Vista</Text>
                <Text variant="subtitle">Opciones de la tabla</Text>
              </View>
              <Button title="Cerrar" size="sm" variant="ghost" onPress={onClose} />
            </View>

            <PartialsToggle value={showPartials} onChange={onShowPartials} />

            <SortControls
              bundle={bundle}
              sortKey={sortKey}
              sortDir={sortDir}
              showPartials={showPartials}
              onSortKey={onSortKey}
              onSortDir={onSortDir}
            />

            {categoryColumn ? (
              <View style={{ gap: theme.spacing[2] }}>
                <Text variant="overline">Filtro: {categoryColumn.name}</Text>
                <View style={[styles.wrap, { gap: theme.spacing[2] }]}>
                  <Button
                    title="Todos"
                    size="sm"
                    pill
                    variant={!filter.categoryValue ? 'primary' : 'secondary'}
                    onPress={onClearFilter}
                  />
                  {(categoryColumn.options ?? []).map((option) => (
                    <Button
                      key={option}
                      title={option}
                      size="sm"
                      pill
                      variant={filter.categoryValue === option ? 'primary' : 'secondary'}
                      onPress={() =>
                        onFilter({
                          categoryColumnId: categoryColumn.id,
                          categoryValue: option,
                        })
                      }
                    />
                  ))}
                </View>
                <Text variant="caption" colorKey="textSecondary">
                  Modo de cálculo: {recalcMode === 'visible' ? 'solo visibles' : 'toda la lista'} ·{' '}
                  {visibleCount} items
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  panel: {
    width: '90%',
    maxWidth: 560,
    maxHeight: '85%',
  },
  scroll: {
    flexGrow: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

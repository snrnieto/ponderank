import { useLocalSearchParams, useNavigation, useRouter, type Href } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FilterRecalcModal } from '@/components/list/filter-recalc-modal';
import { PartialsToggle } from '@/components/list/partials-toggle';
import { RankingTable } from '@/components/list/ranking-table';
import { SortControls } from '@/components/list/sort-controls';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useLists } from '@/state/lists-context';
import { useListView } from '@/state/use-list-view';

export default function ListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { getBundle } = useLists();
  const bundle = getBundle(listId);
  const view = useListView(bundle);
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (bundle) navigation.setOptions({ title: bundle.list.name });
  }, [bundle, navigation]);

  const categoryColumn = useMemo(
    () => bundle?.columns.find((c) => c.kind === 'category'),
    [bundle],
  );

  if (!bundle) {
    return (
      <View style={[styles.center, { padding: theme.spacing[4] }]}>
        <Text>Lista no encontrada</Text>
        <Button title="Volver" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing[4], gap: theme.spacing[3] }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        <Button
          title="Esquema"
          variant="secondary"
          size="sm"
          onPress={() => router.push(`/lists/${listId}/schema` as Href)}
        />
        <Button
          title="Agregar item"
          size="sm"
          onPress={() => router.push(`/lists/${listId}/items/new` as Href)}
        />
      </View>

      <PartialsToggle value={view.showPartials} onChange={view.setShowPartials} />

      <SortControls
        bundle={bundle}
        sortKey={view.sortKey}
        sortDir={view.sortDir}
        showPartials={view.showPartials}
        onSortKey={view.setSortKey}
        onSortDir={view.setSortDir}
      />

      {categoryColumn ? (
        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="label">Filtro: {categoryColumn.name}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            <Button
              title="Todos"
              size="sm"
              variant={!view.filter.categoryValue ? 'primary' : 'secondary'}
              onPress={view.clearFilter}
            />
            {(categoryColumn.options ?? []).map((option) => (
              <Button
                key={option}
                title={option}
                size="sm"
                variant={view.filter.categoryValue === option ? 'primary' : 'secondary'}
                onPress={() =>
                  view.requestFilterChange({
                    categoryColumnId: categoryColumn.id,
                    categoryValue: option,
                  })
                }
              />
            ))}
          </View>
          <Text variant="caption" colorKey="textSecondary">
            Modo de cálculo: {view.recalcMode === 'visible' ? 'solo visibles' : 'toda la lista'} ·{' '}
            {view.visibleCount} items
          </Text>
        </View>
      ) : null}

      <RankingTable
        bundle={bundle}
        rows={view.rows}
        showPartials={view.showPartials}
        onEditItem={(id) => router.push(`/lists/${listId}/items/${id}` as Href)}
      />

      <FilterRecalcModal
        visible={view.pendingFilter != null}
        onRecalculate={() => view.applyPendingFilter('visible')}
        onKeep={() => view.applyPendingFilter('all')}
        onCancel={view.cancelPendingFilter}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: 12 },
});

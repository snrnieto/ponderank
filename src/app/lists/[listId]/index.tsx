import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useNavigation, useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FilterRecalcModal } from '@/components/list/filter-recalc-modal';
import { RankingTable } from '@/components/list/ranking-table';
import { ViewControlsModal } from '@/components/list/view-controls-modal';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { PageShell } from '@/components/ui/page-shell';
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
  const [controlsVisible, setControlsVisible] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    navigation.setOptions({
      title: bundle.list.name,
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir opciones de la tabla"
          hitSlop={theme.components.hitSlop}
          onPress={() => setControlsVisible(true)}
          style={styles.headerButton}
        >
          <SymbolView
            name={{
              ios: 'line.3.horizontal.decrease',
              android: 'tune',
              web: 'tune',
            }}
            size={23}
            tintColor={theme.colors.primary}
          />
        </Pressable>
      ),
    });
  }, [bundle, navigation, theme.colors.primary, theme.components.hitSlop]);

  const categoryColumn = useMemo(
    () => bundle?.columns.find((c) => c.kind === 'category'),
    [bundle],
  );

  const leader = view.rows[0];

  if (!bundle) {
    return (
      <View style={[styles.center, { padding: theme.spacing[4] }]}>
        <Text>Lista no encontrada</Text>
        <Button title="Volver" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ flexGrow: 1, width: '100%' }}
    >
      <PageShell>
        <GradientCard>
          <Text variant="overline" color={theme.colors.textInverse} style={{ opacity: 0.8 }}>
            Ranking
          </Text>
          <View style={{ height: theme.spacing[2] }} />
          <Text variant="title" color={theme.colors.textInverse}>
            {bundle.list.name}
          </Text>
          <View style={{ height: theme.spacing[3] }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text variant="caption" color={theme.colors.textInverse} style={{ opacity: 0.8 }}>
                Items
              </Text>
              <Text variant="display" color={theme.colors.textInverse}>
                {view.visibleCount}
              </Text>
            </View>
            {leader ? (
              <View style={{ alignItems: 'flex-end', maxWidth: '55%' }}>
                <Text variant="caption" color={theme.colors.textInverse} style={{ opacity: 0.8 }}>
                  Líder · {leader.name}
                </Text>
                <Text variant="display" color={theme.colors.textInverse}>
                  {leader.total.toFixed(1)}%
                </Text>
              </View>
            ) : null}
          </View>
        </GradientCard>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          <Button
            title="Esquema"
            variant="secondary"
            size="sm"
            pill
            onPress={() => router.push(`/lists/${listId}/schema` as Href)}
          />
          <Button
            title="Agregar item"
            size="sm"
            pill
            onPress={() => router.push(`/lists/${listId}/items/new` as Href)}
          />
          <Button
            title="Agregar masivo"
            variant="secondary"
            size="sm"
            pill
            onPress={() => router.push(`/lists/${listId}/items/import` as Href)}
          />
        </View>

        <RankingTable
          bundle={bundle}
          rows={view.rows}
          showPartials={view.showPartials}
          onEditItem={(id) => router.push(`/lists/${listId}/items/${id}` as Href)}
        />
      </PageShell>

      <ViewControlsModal
        visible={controlsVisible}
        bundle={bundle}
        categoryColumn={categoryColumn}
        showPartials={view.showPartials}
        sortKey={view.sortKey}
        sortDir={view.sortDir}
        filter={view.filter}
        recalcMode={view.recalcMode}
        visibleCount={view.visibleCount}
        onShowPartials={view.setShowPartials}
        onSortKey={view.setSortKey}
        onSortDir={view.setSortDir}
        onFilter={(filter) => {
          setControlsVisible(false);
          view.requestFilterChange(filter);
        }}
        onClearFilter={view.clearFilter}
        onClose={() => setControlsVisible(false)}
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
